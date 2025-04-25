# DCT Kubernets Deployment Guide

## Prerequisites

- Install HashiCorp Vault
- Create Vault access user and certificate
- Add ssl certificate
- Create gitlab access token

## Create namespace

```
kubectl create namespace del
```

## Add bitnami helm chart

```
helm repo add bitnami https://charts.bitnami.com/bitnami
```

## Deploy Postgresql Cluster

```
helm install del bitnami/postgresql-ha
```

## Deploy Redis Cluster

```
helm install dels bitnami/redis-cluster
```

## DCT Deployment

```
kubectl apply -f del-deploy.yaml
kubectl apply -f del-service.yaml
kubectl apply -f del-ingress.yaml
```

## mkdocs deployment

```
kubectl apply -f mkdocs-data1-pv.yaml
kubectl apply -f mkdocs-data2-pv.yaml
kubectl apply -f mkdocs-deploy.yaml
kubectl apply -f mkdocs-service.yaml
kubectl apply -f mkdocs-ingress.yaml
```

## Postgresql backup deployment

```
kubectl apply -f pg-backup-data-pv.yaml
kubectl apply -f pg-backup-deploy.yaml
```

## DCT High Availability

- more copies of the aplication can be added by running bellow command or change "replicas:" in dct-deploy.yaml

```
kubectl scale --replicas=3 deploy/del -n del
```
