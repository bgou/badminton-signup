#!/bin/bash

docker run \
  --restart=always \
  --name badminton \
  -e LOG_LEVEL=debug \
  -e NODE_ENV=production \
  -v $HOME/badminton-signup/log:/app/log \
  badminton:latest -f
  