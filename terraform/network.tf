resource aws_vpc "ello-vpc" {
  cidr_block = "10.0.0.0/16"
  tags       = {
    Name = "ello-vpc"
  }
}


resource aws_subnet "ello-subnet-1" {
  vpc_id            = aws_vpc.ello-vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "me-south-1a"
  tags              = {
    Name = "ello-subnet-1"
  }
}

resource aws_subnet "ello-subnet-2" {
  vpc_id            = aws_vpc.ello-vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "me-south-1b"
  tags              = {
    Name = "ello-subnet-2"
  }
}

resource aws_internet_gateway "igw" {
  vpc_id = aws_vpc.ello-vpc.id
}

resource aws_route_table "public-route-table" {
  vpc_id = aws_vpc.ello-vpc.id

    route {
      cidr_block = "0.0.0.0/0"
      gateway_id = aws_internet_gateway.igw.id
    }
}

resource aws_route_table_association "public-route-table-association-1" {
  subnet_id      = aws_subnet.ello-subnet-1.id
  route_table_id = aws_route_table.public-route-table.id
}

resource aws_route_table_association "public-route-table-association-2" {
  subnet_id      = aws_subnet.ello-subnet-2.id
  route_table_id = aws_route_table.public-route-table.id
}