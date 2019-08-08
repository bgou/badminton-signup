#!/bin/bash

docker build -t badminton .
docker tag badminton 052852330140.dkr.ecr.us-west-2.amazonaws.com/badminton:latest
