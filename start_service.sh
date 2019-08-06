#!/bin/bash

cd backend
sam local start-api > /dev/null &
ED_SAM_SERVICE_PID=$!
cd ../
vue-cli-service serve > /dev/null &
ED_VUE_SERVICE_PID=$!

trap 'kill -9 $ED_SAM_SERVICE_PID; kill -9 $ED_VUE_SERVICE_PID; echo "Servers Stopped"; exit' INT
echo 'Now Running servers'
while true; do
  sleep 1
done
