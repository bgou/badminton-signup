#!/bin/bash

docker run -d \
  --name badminton \
  -e LOG_LEVEL=debug \
  -v $HOME/badminton-signup/log:/usr/src/app/log \
  052852330140.dkr.ecr.us-west-2.amazonaws.com/badminton
