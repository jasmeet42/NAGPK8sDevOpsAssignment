# Kubernetes Multi-Tier Application - Comprehensive Documentation

## Problem Statement

Design, containerize, and deploy a multi-tier architecture on Kubernetes involving one microservice and one database. The system simulates a simple real-world setup where the service tier fetches data from the database tier via an exposed API. The application must be built, containerized, and pushed to Docker Hub, with implementation of Kubernetes best practices and FinOps cost optimization strategies.

---

## 1. Requirement Understanding

### Project Objective
Design, containerize, and deploy a multi-tier application on Kubernetes demonstrating cloud-native architecture principles, operational best practices, and cost optimization strategies.

---

## 1.1 Requirements 

### Core Architecture Requirements
- **Multi-Tier Design**: One microservice (Service API Tier) + One database (Database Tier)
- **Real-World Simulation**: Service tier must fetch data from database tier via API
- **Containerization**: Application must be containerized and pushed to Docker Hub
- **Kubernetes Deployment**: Complete deployment on Kubernetes cluster

### Service API Tier Requirements
1. **Functional Requirements**
   - Must expose at least one REST API endpoint that returns data
   - Must be able to fetch data from the database tier on API invocation
   - Must be accessible from outside the cluster

2. **Operational Requirements**
   - Minimum 4 pods/replicas required
   - Must support zero-downtime deployments (rolling updates)
   - Must demonstrate self-healing capabilities(automatic restart on failure)
   - Must implement horizontal auto-scaling based on resource metrics
   - Must use ConfigMap for configuration management
   - Must use Secrets for sensitive credentials

### Database Tier Requirements
1. **Functional Requirements**
   - Must contain at least one table with 5-10 records
   - Must be accessible only from within the cluster (no external exposure)
   - Must return data when queried by the API tier

2. **Operational Requirements**
   - Exactly 1 pod/replica
   - Must persist data across pod restarts and deletions
   - Must automatically recover after pod deletion
   - Must use persistent storage (PVC)
   - Must use Secrets for sensitive credentials

### Kubernetes Infrastructure Requirements
| Feature | Service API Tier | Database Tier |
|---------|------------------|---------------|
| Exposed outside cluster | ✅ Required | ❌ Not Allowed |
| Number of pods | 4 minimum | 1 required |
| Rolling updates support | ✅ Required | ❌ N/A |
| Persistent storage | ❌ Not required | ✅ Required |
| Configurable via ConfigMap | ✅ Required | ✅ Allowed |
| Secrets Usage | ✅ Required | ✅ Required |

### Configuration & Security Requirements
1. **ConfigMap Requirements**
   - Database configuration must be externalized from pod definition
   - Configuration must not be hardcoded in application code
   - Must support changing configuration without rebuilding container

2. **Secrets Management**
   - Passwords must NOT be visible in any Kubernetes YAML files
   - Credentials must be base64-encoded
   - Sensitive data must be injected at runtime

3. **Network Communication**
   - Pod-to-pod communication must use Kubernetes Service DNS (not pod IPs)
   - Database must not be directly accessible from outside the cluster

4. **External Access**
   - API tier must be exposed via Ingress (not LoadBalancer service)
   - Must support external HTTP traffic routing

5. **Data Persistence**
   - Database data must persist across pod redeployment
   - Data must survive pod deletion and recreation

### Non-Functional Requirements
1. **Scalability**: Must automatically adjust resource allocation based on demand
2. **Reliability**: Must ensure service availability through health monitoring and auto-recovery
3. **Cost Efficiency**: Must implement cost optimization strategies
4. **Operational Excellence**: Must follow Kubernetes best practices

---

## 1.2 Technology Stack & Implementation Choices

### Service API Tier Technology Stack
| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Language/Runtime** | Node.js v18 | Fast, scalable, suitable for I/O-bound API services |
| **Framework** | Express.js | Lightweight, well-documented, ideal for REST APIs |
| **Database Driver** | mysql2 | Native Node.js driver with connection pooling support |
| **Connection Strategy** | Connection Pooling | Prevents resource exhaustion, improves performance |
| **Container Port** | 8080 | Standard for containerized applications |

### Database Tier Technology Stack
| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Database Engine** | MySQL 8 | Reliable RDBMS, wide adoption, single-node suitable for demo |
| **Storage** | Persistent Volume Claim (PVC) | Kubernetes-native storage abstraction |
| **Storage Size** | 1Gi | Sufficient for 5-10 records with metadata |
| **Access Pattern** | ReadWriteOnce | Single pod access pattern |

### Kubernetes Resources Implementation
| Kubernetes Object | Implementation | Rationale |
|------------------|-----------------|-----------|
| **Namespace** | k8s-namespace | Resource isolation and logical grouping |
| **ConfigMap** | app-config | Store database host, port, username, database name |
| **Secret** | db-secret | Store base64-encoded MySQL root password |
| **Service (API)** | ClusterIP | Internal service discovery, external access via Ingress |
| **Service (DB)** | ClusterIP | Internal-only service for database tier |
| **Ingress** | HTTP routing | Cost-efficient external access instead of LoadBalancer |
| **HPA** | Resource-based metrics | CPU (50%) and Memory (70%) thresholds |

### Applied Best Practices
- **Configuration Externalization**: Database credentials via ConfigMap/Secrets, not hardcoded
- **Connection Pooling**: mysql2 pool prevents connection exhaustion
- **Health Checks & Self-Healing**: Readiness (5s delay, 5s period) and Liveness (15s delay, 10s period) probes for reliability and automatic pod restart
- **Resource Limits**: CPU 50m/200m, Memory 64Mi/128Mi for API tier
- **Rolling Updates**: RollingUpdate strategy for zero-downtime deployments
- **Service Discovery**: Service DNS names instead of pod IPs
- **Storage Strategy**: Dynamic provisioning via StorageClass

### Implemented Application Details

#### Service API Tier Implementation
- **Framework**: Express.js for REST API routing
- **Database Driver**: mysql2 with connection pooling
- **Runtime**: Node.js v18 LTS
- **Server Port**: 8080 (configurable via ConfigMap `APP_PORT`)
- **Health Check Endpoint**: `GET /health` → returns "OK" with 200 status
- **API Endpoint**: `GET /users` → returns JSON array of user records
- **Connection Pool**: Configured with mysql2 for concurrent request handling
- **Environment Injection**: All config via `envFrom` (ConfigMap + Secrets)

#### Database Tier Implementation
- **Database Engine**: MySQL 8
- **Database Name**: devops_db (via ConfigMap)
- **Root User**: root (via ConfigMap)
- **Root Password**: my-secret-pw (via Secret, base64 encoded)
- **Data Table**: `users` table with 5-10 sample records
- **Port**: 3306 (MySQL standard)
- **Initialization**: Automatic via Docker image or pre-existing

#### Kubernetes Service Configuration
- **API Service Name**: api-service (used for inter-service communication)
- **API Service Type**: ClusterIP (internal routing only)
- **API Service Port**: 8080
- **Database Service Name**: mysql (used for database connectivity)
- **Database Service Type**: ClusterIP (internal-only, not externally exposed)
- **Database Service Port**: 3306
- **Service Discovery DNS**: 
  - API: `api-service.k8s-namespace.svc.cluster.local`
  - DB: `mysql.k8s-namespace.svc.cluster.local`

#### ConfigMap & Secret Implementation
- **ConfigMap Name**: app-config
- **ConfigMap Data**:
  ```
  APP_PORT=8080
  DB_HOST=mysql
  DB_USER=root
  DB_NAME=devops_db
  ```
- **Secret Name**: db-secret
- **Secret Data**:
  ```
  DB_PASSWORD=bXktc2VjcmV0LXB3 (base64: my-secret-pw)
  ```
- **Injection Method**: envFrom (entire ConfigMap/Secret mounted as env vars)

#### Health Check Implementation
- **Readiness Probe**:
  - Type: HTTP GET
  - Path: `/health`
  - Port: 8080
  - Initial Delay: 5 seconds (allow app startup)
  - Period: 5 seconds (check every 5s)
  - Purpose: Determine if pod should receive traffic
- **Liveness Probe**:
  - Type: HTTP GET
  - Path: `/health`
  - Port: 8080
  - Initial Delay: 15 seconds (allow JVM/node startup)
  - Period: 10 seconds (check every 10s)
  - Purpose: Restart pod if health check fails

### API Endpoint Specifications
- **Base URL**: http://8.232.9.138
- **Endpoint**: /users
- **Method**: GET
- **Response**: JSON array of user records from database
- **Health Check**: GET /health → returns "OK" with 200 status

---

## 2. Assumptions (Environment & Infrastructure)

### 2.1 Kubernetes Cluster Prerequisites
1. **Cluster Availability**
   - GKE (Google Kubernetes Engine) or equivalent managed Kubernetes cluster is available
   - Cluster is operational and accessible via kubectl

### 2.2 Storage Infrastructure Prerequisites
1. **PersistentVolume Support**
   - Default StorageClass is configured in the cluster
   - Underlying storage system, Google Cloud Persistent Disks, is available
   - StorageClass supports dynamic provisioning
   - PVC requests can be fulfilled (at least 1Gi available)

### 2.3 Container Registry Prerequisites
1. **Docker Hub Access**
   - Docker Hub account available and authenticated
   - Network access to push/pull images from Docker Hub
   - Public read access for image pulls (image is public)

### 2.4 Network Infrastructure Prerequisites
1. **External Access**
   - Ingress controller can assign external IP or hostname
   - External network routing is available
   - No blocking network policies between Ingress and cluster services

### 2.5 Operational Prerequisites
1. **kubectl Access**
   - kubectl CLI is installed and configured
   - User has necessary permissions to:
     - Create namespaces, deployments, services, PVCs, ConfigMaps, Secrets
     - Read pod logs and status

---

## 3. Solution Overview

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Internet / Users                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
        ┌────────────────────────┐
        │  Ingress Controller    │
        │  (Load Balancer)       │
        └────────────┬───────────┘
                     │
                     ↓
        ┌────────────────────────────────┐
        │   Kubernetes Service (ClusterIP)│
        │  api-service : 8080            │
        └────────────┬───────────────────┘
                     │
       ┌─────────────┼─────────────┐
       ↓             ↓             ↓
   ┌────────┐   ┌────────┐   ┌────────┐
   │node-api│   │node-api│   │node-api│  ... (4-6 replicas)
   │ Pod 1  │   │ Pod 2  │   │ Pod 3  │
   └────────┘   └────────┘   └────────┘
       │             │             │
       └─────────────┼─────────────┘
                     │
                     ↓
        ┌────────────────────────┐
        │ MySQL Service ClusterIP│
        │  mysql : 3306          │
        └────────────┬───────────┘
                     │
                     ↓
              ┌──────────────┐
              │  MySQL Pod   │
              │ (Stateful)   │
              └──────────────┘
                     │
                     ↓
            ┌────────────────────┐
            │ PersistentVolume   │
            │ (1Gi Storage)      │
            └────────────────────┘
```

### Kubernetes Objects Deployed

#### 1. **Namespace**
- `k8s-namespace` - Isolates resources for the application

#### 2. **ConfigMap** (`app-config`)
- Stores non-sensitive configuration:
  - `APP_PORT`: 8080
  - `DB_HOST`: mysql
  - `DB_USER`: root
  - `DB_NAME`: devops_db

#### 3. **Secret** (`db-secret`)
- Stores sensitive credentials:
  - `DB_PASSWORD`: MySQL root password (base64 encoded)

#### 4. **Deployment** (`node-api`)
- **Replicas**: 4 (minimum maintained by HPA)
- **Image**: jasmeetkaur42/k8sdevops-app:v2
- **Resources**:
  - Requests: CPU 50m, Memory 64Mi
  - Limits: CPU 200m, Memory 128Mi
- **Health Checks**:
  - Readiness Probe: HTTP GET /health (initial delay 5s, period 5s)
  - Liveness Probe: HTTP GET /health (initial delay 15s, period 10s)
- **Update Strategy**: Rolling Update

#### 5. **Deployment** (`mysql`)
- **Replicas**: 1 (stateful component)
- **Image**: mysql:8
- **Volume Mount**: `/var/lib/mysql` → `mysql-pvc`
- **Password**: Injected from Secret

#### 6. **Services**
- **api-service** (ClusterIP): Routes traffic to API pods on port 8080
- **mysql-service** (ClusterIP): Routes traffic to MySQL pod on port 3306

#### 7. **Ingress** (`api-ingress`)
- Routes external traffic from `/users` path to `api-service`
- Assigns external IP for public access

#### 8. **PersistentVolumeClaim** (`mysql-pvc`)
- Storage: 1Gi
- Access Mode: ReadWriteOnce
- Dynamic provisioning via default StorageClass

#### 9. **HorizontalPodAutoscaler** (`node-hpa`)
- **Min Replicas**: 4
- **Max Replicas**: 6
- **Scaling Metrics**:
  - Target CPU Utilization: 50%
  - Target Memory Utilization: 70%

### Data Flow

1. **User Request**: Client sends HTTP request to Ingress endpoint
2. **Traffic Routing**: Ingress controller routes to `api-service`
3. **Load Balancing**: Service distributes traffic among available pods
4. **API Processing**: Node.js application receives request
5. **Database Query**: Application connects to MySQL via `mysql` service DNS
6. **Response**: Query results returned as JSON to client

---

## 4. Justification for the Resources Utilized

### 4.1 API Deployment Resource Allocation

#### CPU Requests: 50m (millicores)
**Justification:**
- **Observed Baseline**: Actual monitoring shows ~2m CPU per pod under minimal load
- **Safety Margin**: 50m provides 25x headroom above observed usage
- **Prevents Eviction**: Ensures pods won't be evicted due to resource constraints
- **Cost Balance**: Sufficient for scheduling while avoiding over-provisioning

#### CPU Limits: 200m
**Justification:**
- **Burst Capacity**: Allows temporary spikes 4x above request limit
- **Traffic Surge Protection**: Can handle sudden traffic increase without throttling
- **Prevents Node Overcommit**: Protects cluster from runaway processes
- **Conservative Estimate**: Node.js typically uses <200m for API workloads

#### Memory Requests: 64Mi
**Justification:**
- **Observed Usage**: Actual memory usage is ~30Mi per pod
- **Node.js Overhead**: Base Node.js runtime requires ~20-30Mi
- **Buffer for Growth**: 64Mi provides 2x buffer for temporary allocations

#### Memory Limits: 128Mi
**Justification:**
- **OOM Prevention**: Prevents Out-Of-Memory kills while allowing growth
- **Request-to-Limit Ratio**: 2:1 ratio allows pod to use up to 2x requested memory
- **Data Caching**: Sufficient for query result caching and session data
- **Connection Pool**: Handles mysql2 connection pooling overhead

### 4.2 MySQL Deployment Resource Configuration

**Rationale for No Explicit Limits:**
- MySQL is the critical bottleneck; over-constraining it impacts the entire application
- Default node resources are sufficient for the 1Gi storage footprint
- Single replica means no resource sharing concerns
- Minimal dataset (5-10 records) doesn't require intensive resource allocation

### 4.3 Replica Configuration (Minimum 4 Replicas)

**Justification:**
- **High Availability**: 4 pods distributed across nodes provide redundancy
- **Rolling Updates**: Can perform updates while maintaining service continuity
- **Fault Tolerance**: 1-node failure doesn't cause complete outage
- **Assignment Requirement**: Explicitly required by project specification

### 4.4 HPA Configuration

#### Min Replicas: 4
**Justification:**
- **Assignment Constraint**: Requirement to maintain minimum 4 replicas
- **High Availability**: Ensures service resilience during low-traffic periods
- **Cost Floor**: Minimum operational cost baseline

#### Max Replicas: 6
**Justification:**
- **Scaling Headroom**: Additional 2 pods for traffic spikes
- **Measured Efficiency**: Current workload doesn't exceed 2% CPU even at baseline
- **Cost Control**: Prevents unbounded horizontal scaling
- **GKE Limits**: Reasonable limit for small clusters

#### CPU Threshold: 50%
**Justification:**
- **Trigger Latency**: At 50% utilization, there's still headroom before performance degrades
- **Early Scaling**: Scales up proactively before saturation
- **Stability**: Prevents rapid scaling oscillation
- **Benchmark**: Standard threshold used in production environments

#### Memory Threshold: 70%
**Justification:**
- **Flexible vs. CPU**: Memory is less elastic; higher threshold is appropriate
- **GC Pressure**: Allows adequate free memory for garbage collection
- **OOM Prevention**: Scaling before memory exhaustion
- **Dual Metrics**: Combined CPU + Memory scaling for comprehensive coverage

### 4.5 Storage Allocation (1Gi PVC)

**Justification:**
- **Dataset Size**: 5-10 user records require minimal storage
- **MySQL Overhead**: MySQL system tables and metadata: ~50-100Mi
- **Headroom**: 1Gi provides ~10x actual requirement
- **Cost Optimization**: Avoids default larger allocations (10Gi or more)
- **Growth Buffer**: Sufficient for minor data expansion during assignment
- **Dynamic Provisioning**: Uses StorageClass for flexibility

### 4.6 Network Configuration

#### ClusterIP Services
**Justification:**
- **MySQL**: No external access required; internal-only communication
- **API**: Uses Ingress for external traffic (more sophisticated routing)
- **Security**: ClusterIP prevents accidental external exposure
- **Cost**: No LoadBalancer charges for internal services

#### Ingress Controller
**Justification:**
- **Single Entry Point**: Consolidates external traffic routing
- **Cost Efficiency**: Cheaper than multiple LoadBalancers
- **Path-based Routing**: Enables future endpoint scaling
- **SSL/TLS Support**: Can be configured for HTTPS (future enhancement)

### 4.7 Health Check Configuration 
#### Readiness Probe (5s initial delay, 5s period)
**Justification:**
- **Quick Availability**: Pods become serving quickly after startup
- **Traffic Routing**: Ensures only ready pods receive traffic
- **Liveness Verification**: Detects application-level failures

#### Liveness Probe (15s initial delay, 10s period)
**Justification:**
- **Recovery Time**: Allows application startup before liveness checks
- **Restart Policy**: Automatically restarts failed pods
- **Downtime Prevention**: Removes hung/deadlocked pods from service

### 4.8 Environment Variables & Secrets

**Justification:**
- **ConfigMap** for non-sensitive config: Application reusability across environments
- **Secrets** for passwords: Prevents credentials from appearing in manifests or logs
- **Env Injection**: Simplifies application configuration without code changes
- **Best Practices Compliance**: Follows Kubernetes security guidelines

---

## 5. FinOps Optimization Summary

### Cost Optimization Strategies Implemented

1. **Right-Sized Resources**
   - CPU requests: 50m (vs. 100m+ default)
   - Memory requests: 64Mi (vs. 256Mi+ default)
   - Reduces cluster node utilization by 40-50%

2. **Horizontal Pod Autoscaling**
   - Scales down to 4 replicas during low traffic
   - Scales up to maximum 6 during demand spikes
   - Prevents unnecessary pod resource waste

3. **Cluster Autoscaling**
   - Removes underutilized nodes when demand drops
   - Adds nodes only when pods cannot be scheduled
   - Reduces infrastructure costs dynamically

4. **Persistent Storage Optimization**
   - 1Gi allocation (vs. 10Gi+ default)
   - Direct cost reduction in storage fees
   - On-demand provisioning via StorageClass

 For the full metrics, analysis, optimization strategies, images, and detailed recommendations, see [FINOPS.md](FINOPS.md).

---

## 6. Deployment Instructions


### Deployment Order
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/pvc.yaml
kubectl apply -f k8s/mysql-deployment.yaml
kubectl apply -f k8s/mysql-service.yaml
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/api-service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

### Verification
```bash
# Check deployments
kubectl get deployments -n k8s-namespace

# Check pods
kubectl get pods -n k8s-namespace

# Check services
kubectl get svc -n k8s-namespace

# Check HPA status
kubectl get hpa -n k8s-namespace

# Test API endpoint
curl http://8.232.9.138/users
```

---

## 7. Key Takeaways

- **Scalability**: HPA ensures the application scales between 4-6 replicas based on actual demand
- **Reliability**: Health checks and rolling updates provide high availability
- **Cost Efficiency**: Right-sized resources and autoscaling minimize cloud costs
- **Security**: Secrets management and namespace isolation follow Kubernetes best practices
- **Maintainability**: ConfigMap externalizes configuration for easy updates
- **Observability**: Resource metrics enable informed scaling decisions

---

## 8. Deliverables

### Source Code & Repository
- **GitHub Repository**: https://github.com/jasmeetkaur42/NAGPK8sDevOpsAssignment.git
- **Docker Image**: docker.io/jasmeetkaur42/k8sdevops-app:v2
- **Docker Hub Profile**: https://hub.docker.com/u/jasmeetkaur42

### Kubernetes YAML Files (included in k8s/ directory)
1. **namespace.yaml** - Resource isolation and multi-tenancy
2. **configmap.yaml** - Database configuration externalization
3. **secret.yaml** - Secure credential management (base64 encoded)
4. **pvc.yaml** - Persistent volume claim for MySQL data
5. **mysql-deployment.yaml** - Database tier with single replica
6. **mysql-service.yaml** - Internal ClusterIP service for database
7. **api-deployment.yaml** - API tier with 4+ replicas, health probes, rolling updates
8. **api-service.yaml** - Internal ClusterIP service for API
9. **ingress.yaml** - External access to API via Ingress
10. **hpa.yaml** - Horizontal Pod Autoscaler configuration

### Application Source Code
- **app.js** - Node.js Express application with:
  - `/users` endpoint that queries MySQL
  - `/health` endpoint for readiness/liveness probes
  - Connection pooling via mysql2
  - Environment variable configuration
- **Dockerfile** - Multi-tier compatible containerization
- **package.json** - Dependencies: express, mysql2

### Project Features Implemented
✅ Multi-tier architecture (API + Database)  
✅ REST API exposed externally via Ingress  
✅ Database tier accessible only internally  
✅ Exactly 4 API pods with HPA (4-6 dynamic)  
✅ Exactly 1 MySQL pod  
✅ Rolling update strategy for zero-downtime deployments  
✅ Self-healing enhanced via Liveness probes  
✅ Horizontal Pod Autoscaler based on CPU and Memory  
✅ Data persistence across pod deletion  
✅ ConfigMap for database configuration  
✅ Secrets for database passwords (base64 encoded)  
✅ Pod-to-pod communication via service DNS (not pod IPs)  
✅ Resource requests and limits defined  
✅ Three cost optimization strategies identified and implemented  
✅ Resource optimization using observed metrics  
✅ Docker image built and pushed to Docker Hub  
✅ Comprehensive documentation with justifications  

### Documentation Included
- **DOCUMENTATION.md** (this file) - Comprehensive requirements, assumptions, and justifications
- **FINOPS.md** - Detailed FinOps analysis with metrics and cost optimizations
- **README.md** - Quick start guide and deployment instructions
- **GitHub Repository** - Full source code version control

### Deployment Verification
To verify all requirements are met, run:

```bash
# Check all resources deployed
kubectl get all -n k8s-namespace

# Verify 4 API pods
kubectl get pods -l app=node-api -n k8s-namespace | grep Running

# Verify 1 MySQL pod
kubectl get pods -l app=mysql -n k8s-namespace

# Check HPA configuration
kubectl get hpa node-hpa -n k8s-namespace -o yaml

# Verify resource limits are applied
kubectl get deployment node-api -n k8s-namespace -o yaml | grep -A 5 resources

# Check persistent data
kubectl exec -it <mysql-pod-name> -n k8s-namespace -- mysql -u root -p -e "SELECT * FROM users;"

# Test API endpoint
curl http://8.232.9.138/users

# Test health check
curl http://8.232.9.138/health

# Verify ConfigMap usage
kubectl get configmap app-config -n k8s-namespace -o yaml

# Verify Secrets usage
kubectl get secret db-secret -n k8s-namespace -o yaml
```

### Key Metrics to Monitor
- **Pod Replicas**: Should maintain 4 minimum, scale to 6 under load
- **CPU Utilization**: Monitor scaling at 50% threshold
- **Memory Utilization**: Monitor scaling at 70% threshold
- **Data Persistence**: Verify data persists after pod deletion
- **Rolling Updates**: Confirm zero-downtime updates
- **Health Probes**: Monitor pod restart on health check failure

---

## 9. Compliance Matrix

| Requirement | Implemented | Evidence |
|------------|-----------|----------|
| Multi-tier architecture | ✅ | API + MySQL tiers separated |
| REST API endpoint | ✅ | `/users` endpoint in app.js |
| Database with 5-10 records | ✅ | MySQL users table initialized |
| API exposed externally | ✅ | Ingress configuration |
| Database internal only | ✅ | ClusterIP service (no external exposure) |
| 4 API pods | ✅ | Deployment replicas: 4 |
| 1 Database pod | ✅ | MySQL deployment replicas: 1 |
| Rolling updates | ✅ | RollingUpdate strategy in api-deployment.yaml |
| Self-healing | ✅ | Liveness probes configured |
| HPA with CPU/Memory | ✅ | HPA metrics: 50% CPU, 70% memory |
| ConfigMap usage | ✅ | app-config ConfigMap with DB settings |
| Secrets for passwords | ✅ | db-secret with base64-encoded password |
| Data persistence | ✅ | PVC mounted to MySQL |
| Resource limits defined | ✅ | CPU: 50m/200m, Memory: 64Mi/128Mi |
| 3 cost optimizations | ✅ | HPA, Cluster Autoscaling, Storage Optimization |
| Docker image on Hub | ✅ | jasmeetkaur42/k8sdevops-app:v2 |
| GitHub repository | ✅ | https://github.com/jasmeet42/NAGPK8sDevOpsAssignment.git |
| Connection pooling | ✅ | mysql2 pool configuration |
| Ingress for external access | ✅ | Ingress controller routing |
