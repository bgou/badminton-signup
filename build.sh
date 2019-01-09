#!/bin/bash

docker build --no-cache -t badminton .
docker tag badminton 052852330140.dkr.ecr.us-west-2.amazonaws.com/badminton:latest
