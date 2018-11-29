#!/bin/bash
echo 'Setting up Buckets and environment for deploy'
aws configure set aws_access_key_id $S3_ACCESS_ID
aws configure set aws_secret_access_key $S3_ACCESS_KEY
aws configure set default.region us-west-2

REPO_NAME=$(basename `git rev-parse --show-toplevel`)
COMMIT=`echo $TRAVIS_COMMIT | cut -c8`
export BUCKET_NAME="$REPO_NAME-$TRAVIS_BRANCH-"

echo $BUCKET_NAME

echo '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Allow Public Access to All Objects",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::'$BUCKET_NAME'/*"
    }
  ]
}' > /tmp/policy.json

echo '{
  "IndexDocument": {
    "Suffix": "index.html"
  },
  "ErrorDocument": {
    "Key": "404.html"
  },
  "RoutingRules": [
    {
      "Redirect": {
        "ReplaceKeyWith": "index.html"
      },
      "Condition": {
        "KeyPrefixEquals": "/"
      }
    }
  ]
}' > /tmp/website.json

aws s3api create-bucket --bucket $BUCKET_NAME --region us-west-2 --create-bucket-configuration LocationConstraint=us-west-2
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file:///tmp/policy.json
aws s3api put-bucket-website --bucket $BUCKET_NAME --website-configuration file:///tmp/website.json
aws s3 cp dist s3://$BUCKET_NAME/ --recursive

echo 'ONID_ID=$ONID_ID\nONID_PASS=$ONID_PASS\nBROWSERSTACK_USER=$BROWSERSTACK_USER\nBROWSERSTACK_KEY=$BROWSERSTACK_KEY\nWEBSITE_ADDR=http://$BUCKET_NAME.s3-website-us-west-2.amazonaws.com/#/' > tests/.env
