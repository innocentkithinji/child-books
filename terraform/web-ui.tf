resource aws_ecs_task_definition "ello_ui_task" {
  family                   = "ello-ui"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([
    {
      name         = "ello-ui"
      image        = "887705212414.dkr.ecr.me-south-1.amazonaws.com/ecr_repo:innocent-ello-ui-0.1.1"
      portMappings = [
        {
          containerPort = 80
        }
      ]
    }
  ])
}

resource aws_lb "ello-ui-lb" {
  name               = "ui-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb_sg.id]
  subnets            = [aws_subnet.ello-subnet-1.id, aws_subnet.ello-subnet-2.id]

  enable_deletion_protection = false
}


resource aws_lb_listener ello-ui-lb-listener {
  load_balancer_arn = aws_lb.ello-ui-lb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = aws_acm_certificate.ello-ui-cert.arn

  default_action {
    target_group_arn = aws_lb_target_group.ello-ui-tg.arn
    type             = "forward"
  }
}

resource aws_lb_target_group "ello-ui-tg" {
  name     = "ello-ui-tg"
  port     = 80
  protocol = "HTTP"
  target_type = "ip"
  vpc_id   = aws_vpc.ello-vpc.id

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 3
    interval            = 30
    path                = "/"
    port                = "traffic-port"
    protocol            = "HTTP"
  }
}

resource aws_ecs_service ello-ui-service {
  name    = "ello-ui-service"
  cluster = aws_ecs_cluster.fargate_cluster.id
    task_definition = aws_ecs_task_definition.ello_ui_task.arn
    desired_count   = 5
    launch_type     = "FARGATE"

    network_configuration {
      subnets          = [aws_subnet.ello-subnet-1.id, aws_subnet.ello-subnet-2.id]
      security_groups  = [aws_security_group.lb_sg.id]
      assign_public_ip = true
    }

    load_balancer {
      target_group_arn = aws_lb_target_group.ello-ui-tg.arn
      container_name   = "ello-ui"
      container_port   = 80
    }

  depends_on = [aws_lb_listener.ello-ui-lb-listener]
}


# Route 53
resource aws_acm_certificate "ello-ui-cert" {
  domain_name       = aws_route53_record.ello-ui-dns.name
  validation_method = "DNS"

  tags = {
    Name = "ello-ui-cert"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource aws_route53_record "ui-cert-validation" {
  for_each = {
    for dvo in aws_acm_certificate.ello-ui-cert.domain_validation_options : dvo.domain_name => {
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

resource aws_route53_record "ello-ui-dns" {
  name    = "ello-ui.ikithinji.com"
  type    = "A"
  zone_id = "Z076596320E271PVHMEIJ"
  alias {
    name                   = aws_lb.ello-ui-lb.dns_name
    zone_id                = aws_lb.ello-ui-lb.zone_id
    evaluate_target_health = false
  }
}