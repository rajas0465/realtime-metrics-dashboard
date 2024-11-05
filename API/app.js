const http = require('http');
const axios = require('axios');  // Install axios if you haven't: npm install axios

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.end('Hello, World!');
});

server.listen(PORT, '0.0.0.0', async () => {
  try {
    // Fetch the public IP of the EC2 instance
    const response = await axios.get('http://169.254.169.254/latest/meta-data/public-ipv4');
    const publicIP = response.data;

    console.log(`Server is running on http://${publicIP}:${PORT}`);
  } catch (error) {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.error('Could not fetch public IP:', error.message);
  }
});
