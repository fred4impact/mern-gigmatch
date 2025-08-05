#!/bin/bash
echo "=== GigMatch Kubernetes Health Check ==="
echo

echo "1. Checking namespace..."
kubectl get namespace gigmatch

echo
echo "2. Checking all resources..."
kubectl get all -n gigmatch

echo
echo "3. Checking pod status..."
kubectl get pods -n gigmatch

echo
echo "4. Checking services..."
kubectl get services -n gigmatch

echo
echo "5. Checking ingress..."
kubectl get ingress -n gigmatch

echo
echo "6. Recent events..."
kubectl get events -n gigmatch --sort-by='.lastTimestamp' | tail -10