#!/bin/bash

docker run \
  --restart=always \
  --name badminton \
  -e LOG_LEVEL=debug \
  -e NODE_ENV=production \
  -e SBC_USERNAME=${SBC_USERNAME} \
  -e SBC_PASSWORD=${SBC_PASSWORD} \
  -v $HOME/repos/badminton-signup/log:/app/log \
  badminton:latest -f
  