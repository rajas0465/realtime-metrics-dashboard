#!/bin/bash

yum install -y httpd
# Navigate to the API directory
cd /var/www/api

# Install npm dependencies
npm install
npm install axios
