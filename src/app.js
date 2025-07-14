const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 8000;

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Global browser instance
let browser = null;

// Initialize Puppeteer browser
async function initBrowser() {
  try {
    browser = await puppeteer.launch({
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
    });
    logger.info('Puppeteer browser initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Puppeteer browser:', error);
    process.exit(1);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Main image download endpoint
app.post('/v1/download_pic_from_url', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  logger.info(`Downloading image from URL: ${url}`);

  let page = null;
  try {
    page = await browser.newPage();
    
    // Set user agent to mimic a real browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to the URL
    const response = await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
    }

    // Get the image buffer
    const imageBuffer = await response.buffer();
    
    // Get content type from response headers
    const contentType = response.headers()['content-type'] || 'application/octet-stream';
    
    // Validate that it's an image
    if (!contentType.startsWith('image/')) {
      throw new Error('URL does not point to an image');
    }

    // Set response headers
    res.set({
      'Content-Type': contentType,
      'Content-Length': imageBuffer.length,
      'Cache-Control': 'public, max-age=3600'
    });

    logger.info(`Successfully downloaded image: ${url}, size: ${imageBuffer.length} bytes`);
    
    // Send binary data
    res.send(imageBuffer);
    
  } catch (error) {
    logger.error(`Error downloading image from ${url}:`, error);
    
    if (error.name === 'TimeoutError') {
      return res.status(408).json({ error: 'Request timeout' });
    }
    
    res.status(500).json({ 
      error: 'Failed to download image',
      details: error.message 
    });
  } finally {
    if (page) {
      await page.close();
    }
  }
});

// GET version for testing
app.get('/v1/download_pic_from_url', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  logger.info(`Downloading image from URL: ${url}`);

  let page = null;
  try {
    page = await browser.newPage();
    
    // Set user agent to mimic a real browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to the URL
    const response = await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
    }

    // Get the image buffer
    const imageBuffer = await response.buffer();
    
    // Get content type from response headers
    const contentType = response.headers()['content-type'] || 'application/octet-stream';
    
    // Validate that it's an image
    if (!contentType.startsWith('image/')) {
      throw new Error('URL does not point to an image');
    }

    // Set response headers
    res.set({
      'Content-Type': contentType,
      'Content-Length': imageBuffer.length,
      'Cache-Control': 'public, max-age=3600'
    });

    logger.info(`Successfully downloaded image: ${url}, size: ${imageBuffer.length} bytes`);
    
    // Send binary data
    res.send(imageBuffer);
    
  } catch (error) {
    logger.error(`Error downloading image from ${url}:`, error);
    
    if (error.name === 'TimeoutError') {
      return res.status(408).json({ error: 'Request timeout' });
    }
    
    res.status(500).json({ 
      error: 'Failed to download image',
      details: error.message 
    });
  } finally {
    if (page) {
      await page.close();
    }
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully');
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

// Start server
async function startServer() {
  await initBrowser();
  
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Puppeteer API server running on port ${PORT}`);
  });
}

startServer().catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});