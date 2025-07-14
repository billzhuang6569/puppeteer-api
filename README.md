# Puppeteer API

A FastAPI-like service using Puppeteer to download images from URLs, acting as a proxy server to bypass non-browser access restrictions.

## Features

- 🚀 FastAPI-style Express server
- 🖼️ Download images from URLs using Puppeteer
- 🔄 Return binary image data directly
- 🛡️ Bypass anti-bot restrictions with real browser simulation
- 📁 Organized file storage in downloads folder
- 🔒 Security headers and CORS support
- 📝 Comprehensive logging with Winston
- 🔧 Ready for Ubuntu VPS deployment with systemd

## Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/billzhuang6569/puppeteer-api.git
cd puppeteer-api

# Install dependencies
npm install

# Start the server
npm start
```

The server will start on `http://localhost:8000`

### Development Mode

```bash
npm run dev
```

## API Usage

### Health Check

```bash
curl http://localhost:8000/health
```

### Download Image (POST)

```bash
curl -X POST http://localhost:8000/v1/download_pic_from_url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/image.jpg"}' \
  --output downloaded_image.jpg
```

### Download Image (GET)

```bash
curl "http://localhost:8000/v1/download_pic_from_url?url=https://example.com/image.jpg" \
  --output downloaded_image.jpg
```

### Example with JavaScript

```javascript
const axios = require('axios');
const fs = require('fs');

async function downloadImage(url) {
  try {
    const response = await axios.post('http://localhost:8000/v1/download_pic_from_url', {
      url: url
    }, {
      responseType: 'arraybuffer'
    });
    
    fs.writeFileSync('downloaded_image.jpg', response.data);
    console.log('Image downloaded successfully!');
  } catch (error) {
    console.error('Download failed:', error.message);
  }
}

downloadImage('https://example.com/image.jpg');
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |
| POST | `/v1/download_pic_from_url` | Download image from URL (JSON body) |
| GET | `/v1/download_pic_from_url` | Download image from URL (query parameter) |

### Request Format

**POST Request Body:**
```json
{
  "url": "https://example.com/image.jpg"
}
```

**GET Request Query:**
```
?url=https://example.com/image.jpg
```

### Response

- **Success**: Returns binary image data with appropriate `Content-Type` header
- **Error**: Returns JSON error message with appropriate HTTP status code

## Project Structure

```
puppeteer-api/
├── src/
│   └── app.js                 # Main application file
├── downloads/                 # Downloaded images storage
│   └── .gitkeep              # Keep directory in git
├── package.json              # Project dependencies and scripts
├── test.js                   # Test script
├── puppeteer-api.service     # systemd service configuration
├── DEPLOYMENT.md             # Deployment guide
└── README.md                 # This file
```

## Deployment

### Ubuntu VPS Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions including:

- System requirements
- Dependencies installation
- systemd service configuration
- Nginx reverse proxy setup
- Security considerations

### Quick Deployment Commands

```bash
# Install Node.js and dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Deploy application
sudo mkdir -p /opt/puppeteer-api
sudo chown ubuntu:ubuntu /opt/puppeteer-api
cd /opt/puppeteer-api
git clone https://github.com/billzhuang6569/puppeteer-api.git .
npm install --production

# Configure systemd service
sudo cp puppeteer-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable puppeteer-api
sudo systemctl start puppeteer-api
```

## Configuration

### Environment Variables

- `PORT`: Server port (default: 8000)
- `NODE_ENV`: Environment mode (production/development)

### Puppeteer Configuration

The application uses the following Puppeteer settings for optimal VPS performance:

```javascript
{
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu'
  ]
}
```

## Testing

Run the test script to verify functionality:

```bash
# Start the server first
npm start

# In another terminal, run tests
npm test
```

## Troubleshooting

### Common Issues

1. **Chrome/Chromium not found**: Install Chrome dependencies
2. **Permission denied**: Check file permissions and user privileges
3. **Port already in use**: Change the PORT environment variable
4. **Memory issues**: Ensure adequate RAM (minimum 1GB recommended)

### Logs

Application logs are stored in:
- `error.log` - Error logs only
- `combined.log` - All logs
- Console output in development mode

View systemd service logs:
```bash
sudo journalctl -u puppeteer-api -f
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- 🐛 Report issues: [GitHub Issues](https://github.com/billzhuang6569/puppeteer-api/issues)
- 📚 Documentation: [DEPLOYMENT.md](DEPLOYMENT.md)
- 💡 Feature requests: [GitHub Issues](https://github.com/billzhuang6569/puppeteer-api/issues)

## Acknowledgments

- Built with [Puppeteer](https://github.com/puppeteer/puppeteer)
- Inspired by FastAPI's simplicity and effectiveness
- Designed for seamless Ubuntu VPS deployment