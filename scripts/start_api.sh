#!/bin/bash

# Load NVM to access Node and PM2
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # Loads NVM
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # Loads NVM bash_completion

# Navigate to the API directory
cd /var/www/api  # Adjust the path as needed

# Stop any running instance of the API with pm2 (optional)
/home/ec2-user/.nvm/versions/node/v22.11.0/bin/pm2 stop "api"

# Start the API using pm2
/home/ec2-user/.nvm/versions/node/v22.11.0/bin/pm2 start app.js --name "api"  # Adjust 'app.js' if needed

# Save the PM2 process list to ensure it restarts on reboot
/home/ec2-user/.nvm/versions/node/v22.11.0/bin/pm2 save
