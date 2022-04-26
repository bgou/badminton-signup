#!/bin/bash

# To find existing images
# REPOSITORY=badminton
# REGION=us-west-2
# aws ecr list-images --repository-name $REPOSITORY --region $REGION

aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 052852330140.dkr.ecr.us-west-2.amazonaws.com

docker push 052852330140.dkr.ecr.us-west-2.amazonaws.com/badminton:latest
