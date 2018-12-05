#!/bin/bash

docker run -d \
  --name badminton \
  -e LOG_LEVEL=debug \
  -v $HOME/badminton-signup/log:/usr/src/app/log \
  badminton
