#!/bin/bash

docker run -d \
  -e LOG_LEVEL=info \
  -v $HOME/badminton-signup/log:/usr/src/app/log \
  badminton
