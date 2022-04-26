#!/bin/bash

docker run \
  --restart=always \
  --name badminton \
  -e LOG_LEVEL=debug \
  -e NODE_ENV=production \
  -e USERNAME=${USERNAME} \
  -e PASSWORD=${PASSWORD} \
  -v $HOME/repos/badminton-signup/log:/app/log \
  badminton:latest -f
  