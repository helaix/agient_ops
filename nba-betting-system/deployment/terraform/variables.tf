# General Configuration
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "nba-betting-system"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production."
  }
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

# Networking
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access the EKS cluster"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# EKS Configuration
variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.28"
}

variable "node_instance_types" {
  description = "EC2 instance types for EKS nodes"
  type        = list(string)
  default     = ["t3.medium", "t3.large"]
}

variable "node_desired_capacity" {
  description = "Desired number of nodes"
  type        = number
  default     = 3
}

variable "node_max_capacity" {
  description = "Maximum number of nodes"
  type        = number
  default     = 10
}

variable "node_min_capacity" {
  description = "Minimum number of nodes"
  type        = number
  default     = 2
}

# Database Configuration
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Initial allocated storage for RDS"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Maximum allocated storage for RDS"
  type        = number
  default     = 100
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "nba_betting"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "betting_user"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# Redis Configuration
variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_cache_nodes" {
  description = "Number of cache nodes"
  type        = number
  default     = 2
}

# Monitoring Configuration
variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

variable "enable_monitoring" {
  description = "Enable enhanced monitoring"
  type        = bool
  default     = true
}

# Security Configuration
variable "enable_encryption" {
  description = "Enable encryption at rest"
  type        = bool
  default     = true
}

variable "ssl_certificate_arn" {
  description = "ARN of SSL certificate for ALB"
  type        = string
  default     = ""
}

# Application Configuration
variable "container_insights_enabled" {
  description = "Enable Container Insights"
  type        = bool
  default     = true
}

variable "backup_retention_period" {
  description = "Database backup retention period in days"
  type        = number
  default     = 7
}

# Scaling Configuration
variable "enable_cluster_autoscaler" {
  description = "Enable cluster autoscaler"
  type        = bool
  default     = true
}

variable "enable_horizontal_pod_autoscaler" {
  description = "Enable horizontal pod autoscaler"
  type        = bool
  default     = true
}

# Cost Optimization
variable "use_spot_instances" {
  description = "Use spot instances for cost optimization"
  type        = bool
  default     = false
}

variable "spot_instance_types" {
  description = "EC2 spot instance types"
  type        = list(string)
  default     = ["t3.medium", "t3.large", "c5.large"]
}

# Environment-specific overrides
variable "environment_config" {
  description = "Environment-specific configuration overrides"
  type = object({
    node_desired_capacity = optional(number)
    node_max_capacity     = optional(number)
    db_instance_class     = optional(string)
    redis_node_type       = optional(string)
    log_retention_days    = optional(number)
  })
  default = {}
}

# Feature Flags
variable "enable_waf" {
  description = "Enable AWS WAF"
  type        = bool
  default     = true
}

variable "enable_cloudfront" {
  description = "Enable CloudFront CDN"
  type        = bool
  default     = true
}

variable "enable_secrets_manager" {
  description = "Enable AWS Secrets Manager"
  type        = bool
  default     = true
}

# API Configuration
variable "api_rate_limit" {
  description = "API rate limit per minute"
  type        = number
  default     = 1000
}

variable "api_burst_limit" {
  description = "API burst limit"
  type        = number
  default     = 2000
}

# Data Configuration
variable "data_retention_days" {
  description = "Data retention period in days"
  type        = number
  default     = 365
}

variable "enable_data_lake" {
  description = "Enable S3 data lake"
  type        = bool
  default     = true
}

# ML Configuration
variable "model_storage_size" {
  description = "Model storage size in GB"
  type        = number
  default     = 50
}

variable "enable_gpu_nodes" {
  description = "Enable GPU nodes for ML workloads"
  type        = bool
  default     = false
}

variable "gpu_instance_types" {
  description = "GPU instance types"
  type        = list(string)
  default     = ["p3.2xlarge", "g4dn.xlarge"]
}

