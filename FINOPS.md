# FinOps Considerations

## 1. Define CPU and memory requests and limits for the Service/API tier

Defined resource requests and limits for the `node-api` container in `k8s/api-deployment.yaml` to ensure the API tier has a guaranteed baseline of compute and memory while also preventing runaway usage.

```yaml
requests:
  - cpu: 100m
    memory: 128Mi
limits:
  - cpu: 200m
    memory: 256Mi
```

---

## 2. Implement resource optimization using observed metrics

Current Observed State using actual metrics (`kubectl top`)

Node API Pods:
- CPU: approx. 2m per pod
- Memory: approx. 30Mi per pod  

MySQL Pod:
- CPU: approx. 10m  
- Memory: approx. 432Mi  

Application runs with **4 replicas as required**
- Observed CPU usage (approx. 2m) is extremely low (~1–2%)
- Indicates underutilization of compute resources
- Resources are not efficiently utilized during low traffic


![Current state](images/current_state.png)

Resource requests and limits were optimized:

```yaml
resources:
  requests:
    cpu: "50m"
    memory: "64Mi"
  limits:
    cpu: "200m"
    memory: "128Mi"
```

---

## 3. Identify at least three opportunities to optimize Kubernetes costs

- Fixed baseline replicas (minimum 4 required)
- Low CPU utilization
- Idle resources during non-peak load
- Potential over-provisioning of cluster nodes
- No automatic scaling in initial setup

---

#### 1. Horizontal Pod Autoscaler (HPA) 
HPA is configured to scale based on CPU utilization:

- Minimum Replicas: 4 (as per requirement)
- Maximum Replicas: 6
- Target CPU Utilization: 50%
- Target Memory Utilization: 70%

---

#### 2. Cluster Autoscaler

Cluster autoscaling is enabled to automatically adjust the number of nodes based on workload demand.

- Adds nodes when pods cannot be scheduled due to resource shortage  
- Removes underutilized nodes when demand decreases  

![Enabling node autoscaling and Google Cloud Platform node pool configuration showing autoscaling enabled with minNodeCount set to 1 and maxNodeCount set to 3, demonstrating active cluster auto-scaling setup](images/enabled-node-autoscaling.png)

---

#### 3. Persistent Storage Optimization (PVC & StorageClass)
- Right-sized storage allocation:
  The PVC is configured with **1Gi storage**, which is sufficient for the current workload (very minimal dataset with only a few records). This avoids over-provisioning and reduces unnecessary storage costs.

- Dynamic provisioning:
  StorageClass enables on-demand creation of PersistentVolumes, ensuring that storage is only allocated when required.

- Cost-aware storage usage:
  A minimal storage size is chosen instead of default larger sizes (e.g., 10Gi), demonstrating efficient resource utilization.

- Efficient persistence strategy:
  MySQL uses persistent storage to retain data across pod restarts, avoiding repeated initialization overhead and improving operational efficiency.

- Observation:
  Current database usage is extremely low, indicating that 1Gi allocation is appropriate and cost-optimized for this workload.

These practices ensure optimal storage utilization while minimizing cloud costs.

---

#### 4. Label Selectors & Service Routing

Strategic use of labels enables:
- Precise pod selection and identification for cost tracking
- Efficient traffic routing through service selectors
- Organized workload management

```yaml
labels:
  app: node-api
selector:
  matchLabels:
    app: node-api
```

**FinOps Impact:**
- Enables granular cost allocation per application component
- Improves visibility into which resources are consumed by which services
- Supports future chargeback and cost attribution models

---

## Indirect FinOps Cost Optimizations

While not direct cost optimization mechanisms, the following operational practices support and enhance FinOps efficiency:

### Namespace-based Resource Governance

All resources are deployed within a dedicated namespace: `k8s-namespace`

This enables:
- Logical isolation of application components
- Monitoring resource usage:
  ```bash
  kubectl top pods -n k8s-namespace
  ```

Supports future implementation of:
- `ResourceQuota`
- `LimitRange`

This foundation improves cost visibility and enforces resource governance.

---

### Health Checks (Readiness & Liveness Probes)

Health checks are configured to ensure only healthy pods receive traffic and failed pods are automatically restarted:

```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5

livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 10
```

**Cost Impact:**
- Prevents traffic routing to unhealthy pods, avoiding wasted compute resources
- Automatic restart of failing pods reduces manual intervention overhead
- Ensures efficient resource utilization by removing crashed containers quickly

---

### Rolling Updates Strategy

The deployment uses `RollingUpdate` strategy to ensure zero-downtime deployments:

```yaml
strategy:
  type: RollingUpdate
```

**Cost Impact:**
- Eliminates resource spikes caused by sudden pod termination and startup
- Prevents service disruption, avoiding retry overhead and wasted requests
- Maintains predictable resource consumption patterns during deployments

---

## Cost Optimization Impact

- Maintains required **baseline availability (4 pods)**
- Scales pods **only when needed (HPA)**
- Scales infrastructure **only when required (Cluster Autoscaler)**
- Optimizes storage and runtime configuration through PVC sizing
- Avoids over-provisioning of both pods and nodes
- Improves overall resource utilization
- Reduces cost during idle and low-traffic periods

---

## Scaling Behavior

| Scenario | Pod Scaling | Node Scaling |
|---------|-----------|-------------|
| Low load | 4 pods | Minimum nodes |
| Increasing load | 5 → 6 pods | Nodes increase if required |
| Load decreases | Back to 4 pods | Extra nodes removed |

---


---

## Conclusion

The system demonstrates a **complete FinOps-aware architecture** organized into two categories:

### Direct FinOps Optimizations

1. **CPU and Memory Requests and Limits**: Defined granular resource requests (`cpu: 50m`, `memory: 64Mi`) and limits (`cpu: 200m`, `memory: 128Mi`) for the API tier to ensure predictable scheduling and prevent resource contention.

2. **Resource Optimization Using Observed Metrics**: Analyzed actual cluster metrics (`kubectl top`) to right-size requests and limits, eliminating over-provisioning based on real workload patterns.

3. **Horizontal Pod Autoscaler (HPA)**: Scales API pods dynamically (4-6 replicas) based on CPU utilization at 50% threshold and memory utilization at 70%.

4. **Cluster Autoscaler**: Automatically adjusts node count based on workload demand, adding nodes when needed and removing underutilized ones.

5. **Persistent Storage Optimization**: Right-sized PVC to 1Gi for efficient storage utilization and cost reduction.

6. **Label Selectors & Service Routing**: Enables precise cost tracking, workload identification, and efficient traffic routing for better resource attribution.

### Indirect FinOps Optimizations

7. **Namespace-based Resource Governance**: Provides organizational foundation for cost visibility and enables future ResourceQuota and LimitRange implementations.

8. **Health Checks (Readiness & Liveness Probes)**: Ensures only healthy pods receive traffic, preventing wasted resources on unhealthy containers.

9. **Rolling Updates Strategy**: Zero-downtime deployments eliminate resource spikes and maintain predictable consumption patterns during updates.

---

This results in a scalable, resilient, and cost-efficient Kubernetes deployment that maintains baseline availability while optimizing costs across pod, infrastructure, storage, and operational layers.
