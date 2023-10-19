resource "aws_ecs_task_definition" "ello_api_task" {
  family                   = "ello-api-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn


  container_definitions = jsonencode([
    {
      name         = "ello-api"
      image        = "887705212414.dkr.ecr.me-south-1.amazonaws.com/ecr_repo:innocent-ello-api-0.1.0"
      portMappings = [
        {
          containerPort = 80
        }
      ]
      environment : [
        { name : "API_PORT", value : "80" },
      ]
      logDriver = "awslogs"
      options   = {
        "awslogs-group"         = "ecs-ello-api"
        "awslogs-region"        = "me-south-1"
        "awslogs-stream-prefix" = "ecs-ello-api"
      }
    }
  ])
}


resource "aws_iam_role" "ecs_execution_role" {
  name = "ecs_execution_role"

  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Action    = "sts:AssumeRole",
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        },
        Effect = "Allow",
      }
    ]
  })
}

resource "aws_iam_policy" "ecs_logging" {
  name        = "ECSLoggingPolicy"
  description = "Allows ECS tasks to push logs to CloudWatch"

  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ],
        Effect   = "Allow",
        Resource = "arn:aws:logs:*:*:*"  # Adjust this if you want to scope down permissions
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_logging_policy_attachment" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = aws_iam_policy.ecs_logging.arn
}

resource "aws_iam_policy" "ecr_pull_policy" {
  name        = "ECRPullPolicy"
  description = "Allows pulling images from ECR"

  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:GetAuthorizationToken",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability"
        ],
        Resource = "*"
      }
    ]
  })
}


resource "aws_iam_role_policy_attachment" "ecs_execution_role_ecr_policy_attachment" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = aws_iam_policy.ecr_pull_policy.arn
}

# Security group for the Load Balancer
resource "aws_security_group" "lb_sg" {
  name        = "load-balancer-sg"
  description = "Allow all inbound traffic"
  vpc_id      = aws_vpc.ello-vpc.id

  ingress {
    from_port   = 80
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}


# App Load Balancer
resource "aws_lb" "ello-api-lb" {
  name               = "api-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb_sg.id]
  subnets            = [aws_subnet.ello-subnet-1.id, aws_subnet.ello-subnet-2.id]

  enable_deletion_protection = false
}


# App Load Balancer Listener
resource "aws_lb_listener" "api-listener" {
  load_balancer_arn = aws_lb.ello-api-lb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = aws_acm_certificate.api-cert.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}


# App Load Balancer Target Group
resource "aws_lb_target_group" "api" {
  name        = "api"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.ello-vpc.id
}


# ECS Fargate Service
resource "aws_ecs_service" "ello-api-service" {
  name            = "ello-api-service"
  cluster         = aws_ecs_cluster.fargate_cluster.id
  task_definition = aws_ecs_task_definition.ello_api_task.arn
  desired_count   = 5
  launch_type     = "FARGATE"
  network_configuration {
    subnets          = [aws_subnet.ello-subnet-1.id, aws_subnet.ello-subnet-2.id]
    security_groups  = [aws_security_group.lb_sg.id]
    assign_public_ip = true
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "ello-api"
    container_port   = 80
  }
  depends_on = [aws_lb_listener.api-listener]
}


# Route 53

resource aws_acm_certificate "api-cert" {
  domain_name       = aws_route53_record.subdomain.name
  validation_method = "DNS"

  tags = {
    Name = "ello-api-cert"
  }


  lifecycle {
    create_before_destroy = true
  }

}

resource aws_route53_record "api-cert-validation" {
  for_each = {
    for dvo in aws_acm_certificate.api-cert.domain_validation_options : dvo.domain_name => {
      name    = dvo.resource_record_name
      type    = dvo.resource_record_type
      record   = dvo.resource_record_value
    }
  }
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  zone_id = "Z076596320E271PVHMEIJ"
  ttl     = 60
}

resource "aws_route53_record" "subdomain" {
  zone_id = "Z076596320E271PVHMEIJ"
  name    = "ello-api.ikithinji.com"
  type    = "A"

  alias {
    name                   = aws_lb.ello-api-lb.dns_name
    zone_id                = aws_lb.ello-api-lb.zone_id
    evaluate_target_health = true
  }
}