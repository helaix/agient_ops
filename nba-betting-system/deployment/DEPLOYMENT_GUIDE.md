# NBA Betting System - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the AI-driven NBA playoff betting system to production environments.

## Prerequisites

### Required Tools
- Docker and Docker Compose
- Kubernetes CLI (kubectl)
- Terraform >= 1.0
- AWS CLI configured
- Helm 3.x
- Git

### Required Accounts
- AWS Account with appropriate permissions
- Container Registry access (ECR/Docker Hub)
- Domain name for production deployment
- SSL certificate for HTTPS

## Deployment Options

### 1. Local Development (Docker Compose)

```bash
# Clone the repository
git clone <repository-url>
cd nba-betting-system/deployment

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Start all services
docker-compose up -d

# Check service health
docker-compose ps
```

**Services Available:**
- API Gateway: http://localhost:8080
- UI Application: http://localhost:3000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

### 2. Production Deployment (AWS + Kubernetes)

#### Step 1: Infrastructure Setup

```bash
# Navigate to Terraform directory
cd terraform

# Initialize Terraform
terraform init

# Create terraform.tfvars
cat > terraform.tfvars << EOF
environment = "production"
aws_region = "us-east-1"
db_password = "your-secure-password"
allowed_cidr_blocks = ["your-office-ip/32"]
EOF

# Plan and apply infrastructure
terraform plan
terraform apply
```

#### Step 2: Configure Kubernetes

```bash
# Update kubeconfig
aws eks update-kubeconfig --region us-east-1 --name nba-betting-system-production

# Verify cluster access
kubectl get nodes

# Create namespace and apply configurations
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/
```

#### Step 3: Deploy Applications

```bash
# Build and push container images
./scripts/build-and-push.sh

# Deploy applications
kubectl apply -f kubernetes/data-service.yaml
kubectl apply -f kubernetes/feature-service.yaml
kubectl apply -f kubernetes/betting-service.yaml

# Verify deployments
kubectl get pods -n nba-betting
kubectl get services -n nba-betting
```

#### Step 4: Configure Monitoring

```bash
# Install Prometheus and Grafana
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --values monitoring/prometheus-values.yaml

# Install Grafana dashboards
kubectl apply -f monitoring/grafana/dashboards/
```

## Configuration

### Environment Variables

#### Data Service
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
NBA_API_KEY=your-nba-api-key
LOG_LEVEL=INFO
```

#### Feature Service
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
MODEL_STORAGE_PATH=/app/models
ML_MODEL_VERSION=v1.0.0
```

#### Betting Service
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
FEATURE_SERVICE_URL=http://feature-service:8001
RISK_THRESHOLD=0.1
MAX_STAKE_PERCENTAGE=0.05
```

### Database Setup

```sql
-- Create database and user
CREATE DATABASE nba_betting;
CREATE USER betting_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE nba_betting TO betting_user;

-- Run migrations
psql -h localhost -U betting_user -d nba_betting -f sql/migrations/001_initial_schema.sql
```

### SSL/TLS Configuration

```bash
# Generate SSL certificate (Let's Encrypt)
certbot certonly --dns-route53 -d api.yourdomain.com

# Update ALB with certificate
aws elbv2 modify-listener \
  --listener-arn arn:aws:elasticloadbalancing:... \
  --certificates CertificateArn=arn:aws:acm:...
```

## Scaling Configuration

### Horizontal Pod Autoscaling

```yaml
# Example HPA configuration
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: betting-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: betting-service
  minReplicas: 5
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 60
```

### Cluster Autoscaling

```bash
# Enable cluster autoscaler
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml

# Configure autoscaler
kubectl -n kube-system annotate deployment.apps/cluster-autoscaler \
  cluster-autoscaler.kubernetes.io/safe-to-evict="false"
```

## Monitoring and Alerting

### Key Metrics to Monitor

1. **Application Metrics**
   - Request rate and latency
   - Error rates
   - Business metrics (betting opportunities, ROI)

2. **Infrastructure Metrics**
   - CPU and memory usage
   - Database performance
   - Network latency

3. **Business Metrics**
   - Number of active betting opportunities
   - Model prediction accuracy
   - System ROI performance

### Alert Configuration

```yaml
# Example alert rules
groups:
  - name: nba-betting-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        annotations:
          summary: "High error rate detected"
      
      - alert: LowBettingOpportunities
        expr: betting_opportunities_count < 5
        for: 15m
        annotations:
          summary: "Low number of betting opportunities"
```

## Security Considerations

### Network Security
- VPC with private subnets for application components
- Security groups with minimal required access
- WAF protection for public endpoints
- VPN access for administrative tasks

### Data Security
- Encryption at rest for all databases
- Encryption in transit for all communications
- Secrets management using AWS Secrets Manager
- Regular security audits and penetration testing

### Access Control
- IAM roles with least privilege principle
- Multi-factor authentication for administrative access
- Regular access reviews and rotation of credentials
- Audit logging for all administrative actions

## Backup and Disaster Recovery

### Backup Strategy
```bash
# Database backups
aws rds create-db-snapshot \
  --db-instance-identifier nba-betting-production \
  --db-snapshot-identifier nba-betting-$(date +%Y%m%d)

# Application data backups
kubectl create job backup-$(date +%Y%m%d) \
  --from=cronjob/backup-job
```

### Disaster Recovery
1. **RTO (Recovery Time Objective)**: < 1 hour
2. **RPO (Recovery Point Objective)**: < 15 minutes
3. **Multi-region deployment** for critical components
4. **Automated failover** procedures
5. **Regular DR testing** and documentation

## Performance Optimization

### Database Optimization
- Connection pooling
- Query optimization and indexing
- Read replicas for analytics workloads
- Partitioning for large tables

### Caching Strategy
- Redis for session data and computed features
- CDN for static assets
- Application-level caching for expensive operations

### API Optimization
- Rate limiting and throttling
- Response compression
- Efficient serialization
- Connection keep-alive

## Troubleshooting

### Common Issues

1. **Service Discovery Issues**
   ```bash
   kubectl get endpoints -n nba-betting
   kubectl describe service <service-name> -n nba-betting
   ```

2. **Database Connection Issues**
   ```bash
   kubectl logs <pod-name> -n nba-betting
   kubectl exec -it <pod-name> -n nba-betting -- psql $DATABASE_URL
   ```

3. **High Memory Usage**
   ```bash
   kubectl top pods -n nba-betting
   kubectl describe pod <pod-name> -n nba-betting
   ```

### Log Analysis
```bash
# View application logs
kubectl logs -f deployment/betting-service -n nba-betting

# View system logs
kubectl logs -f -l app=prometheus -n monitoring

# Search logs with specific patterns
kubectl logs deployment/data-service -n nba-betting | grep ERROR
```

## Maintenance

### Regular Tasks
- **Daily**: Monitor system health and alerts
- **Weekly**: Review performance metrics and optimize
- **Monthly**: Security updates and patches
- **Quarterly**: Disaster recovery testing

### Update Procedures
1. Test updates in staging environment
2. Create backup before deployment
3. Deploy using blue-green strategy
4. Monitor system health post-deployment
5. Rollback if issues detected

## Support and Documentation

### Getting Help
- Check system logs and metrics first
- Review this deployment guide
- Contact the development team with specific error messages
- Use the troubleshooting section for common issues

### Additional Resources
- [API Documentation](./api/openapi.yaml)
- [Architecture Overview](./architecture.md)
- [Monitoring Runbook](./monitoring/runbook.md)
- [Security Guidelines](./security/guidelines.md)

