#!/bin/bash

# Navigate to the Expo project directory
cd /var/www/rmd  # Adjust the path as needed

sudo chmod +x /var/www/rmd/node_modules/.bin/expo

# Start the Expo app using pm2 with Expo CLI
pm2 start "npx expo start" --name "expo-app"

# Save the PM2 process list to ensure it restarts on reboot
pm2 save
