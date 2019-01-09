#!/bin/bash

docker run -d \
  --restart=always \
  --name badminton \
  -e LOG_LEVEL=debug \
  -e NODE_ENV=production \
  -v $HOME/badminton-signup/log:/app/log \
  badminton
  