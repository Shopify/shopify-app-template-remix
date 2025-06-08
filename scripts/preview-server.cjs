#!/usr/bin/env node

/**
 * Preview Server Script
 * 
 * Starts a development server for previewing components.
 * Serves the preview directory and handles component loading.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bright}${colors.cyan}${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.magenta}→ ${msg}${colors.reset}`),
};

const PORT = process.env.PREVIEW_PORT || 3002;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

async function startPreviewServer() {
  try {
    log.header('🚀 Starting Preview Server\n');

    const server = http.createServer(async (req, res) => {
      try {
        // Parse URL
        const url = new URL(req.url, `http://${req.headers.host}`);
        let filePath = path.join('preview', url.pathname);

        // Handle root path
        if (filePath === 'preview/') {
          filePath = 'preview/index.html';
        }

        // Check if file exists
        if (!fs.existsSync(filePath)) {
          res.writeHead(404);
          res.end('File not found');
          return;
        }

        // Get file extension
        const extname = path.extname(filePath);
        const contentType = MIME_TYPES[extname] || 'application/octet-stream';

        // Read and serve file
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);

      } catch (error) {
        log.error(`Error serving request: ${error.message}`);
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    });

    server.listen(PORT, () => {
      log.success(`Preview server running at http://localhost:${PORT}`);
      log.info('\nAvailable routes:');
      log.info(`- http://localhost:${PORT}/ (Main preview)`);
      log.info(`- http://localhost:${PORT}/admin (Admin components)`);
      log.info(`- http://localhost:${PORT}/storefront (Storefront components)`);
      log.info('\nPress Ctrl+C to stop the server');
    });

  } catch (error) {
    log.error(`Failed to start preview server: ${error.message}`);
    process.exit(1);
  }
}

startPreviewServer(); 