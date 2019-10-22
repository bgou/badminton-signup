#!/bin/bash

$(aws ecr get-login --no-include-email --region us-west-2)

docker push 052852330140.dkr.ecr.us-west-2.amazonaws.com/badminton:latest

