# Kubernetes Multi-Tier App

This repository contains Kubernetes manifests to deploy a small Node.js API backed by a MySQL database.

## What’s included

- A Node.js API exposing a `/users` endpoint
- A MySQL database with persistent storage (PVC)
- ClusterIP service for MySQL and Ingress for the API
- `ConfigMap` and `Secret` usage for configuration and credentials
- A Horizontal Pod Autoscaler (HPA) for the API deployment

## Useful links

- GitHub repo: https://github.com/jasmeet42/NAGPK8sDevOpsAssignment.git
- Docker image: docker.io/jasmeetkaur42/k8sdevops-app:v2
- Ingress endpoint: http://8.232.9.138/users

## Architecture Overview

- Node.js microservice communicates with MySQL database internally  
- MySQL is **not exposed externally**  
- API is exposed using **Ingress**  

### Kubernetes Best Practices Used:
- ConfigMap  
- Secrets  
- Persistent Volume Claim (PVC)  
- Horizontal Pod Autoscaler (HPA)  
- Rolling Updates  

---

## Features Implemented

### Service API Tier
- Exposes REST API  
- Fetches records from MySQL  
- Uses **ConfigMap for DB configuration**  
- Uses **Secrets for DB password**  
- Supports **Rolling Updates**  
- Exposed externally via **Ingress**  
- Implements **Horizontal Pod Autoscaler (HPA)**  

---

### Database Tier
- MySQL with sample dataset (5–10 records)  
- Uses **Persistent Volume Claim (PVC)**  
- Data persists across pod restarts  
- Accessible only within the cluster  

---

## Kubernetes Objects Used

- Namespace  
- Deployment (API + MySQL)  
- Service (ClusterIP)  
- Ingress  
- ConfigMap  
- Secret  
- Persistent Volume Claim (PVC)  
- Horizontal Pod Autoscaler (HPA)  

---

## Deployment Steps

Apply the manifests in order from the `k8s/` directory. Run these commands from the repository root or change directory into `k8s` first.

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

Notes:
- The manifests in this repository live in the `k8s/` directory. Adjust paths if you run commands from inside that directory.

---

## FinOps Considerations

Brief summary: the cluster shows underutilized API pods (very low CPU and small memory use). The repository includes HPA and Cluster Autoscaler configurations to reduce cost and improve utilization. For the full metrics, analysis, optimization strategies, images, and detailed recommendations, see [FINOPS.md](FINOPS.md).

