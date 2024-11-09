#!/bin/bash

# Navigate to the API directory
cd /var/www/api  # Adjust the path as needed

#pm2 stop "api"
# Start the API using pm2
/home/ec2-user/.nvm/versions/node/v22.11.0/bin/pm2 restart app.js --name "api"  # Replace 'server.js' with your API entry point file

# Save the PM2 process list to ensure it restarts on reboot
/home/ec2-user/.nvm/versions/node/v22.11.0/bin/pm2 save
