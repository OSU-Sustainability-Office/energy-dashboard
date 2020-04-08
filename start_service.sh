#!/bin/bash
sudo systemctl start docker
cd backend
sam local start-api > /dev/null &
ED_SAM_SERVICE_PID=$!
cd ../
PATH=$PATH:./node_modules/.bin # npm install isn't adding this to my path so I'm adding it here. - Jack
vue-cli-service serve > /dev/null &
ED_VUE_SERVICE_PID=$!

trap 'kill -9 $ED_SAM_SERVICE_PID; kill -9 $ED_VUE_SERVICE_PID; echo "Servers Stopped"; exit' INT
echo 'Now Running servers'
while true; do
  sleep 1
done
