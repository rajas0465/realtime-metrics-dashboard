#!/bin/bash

# Navigate to the API directory
cd /var/www/api  # Adjust the path as needed

# Start the API using pm2
pm2 start app.js --name "api-server3"  # Replace 'server.js' with your API entry point file

# Save the PM2 process list to ensure it restarts on reboot
pm2 save
