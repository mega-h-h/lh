const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    // Save client's IP address to ip.txt
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ipEntry = `New connection from: ${clientIp} at ${new Date().toISOString()}\n`;
    console.log(ipEntry)
    fs.appendFile(path.join(__dirname, 'ip.txt'), ipEntry, (err) => {
      if (err) {
        console.error('Failed to save IP address:', err);
      }
    });

    // Serve the HTML file
    const filePath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server error');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      }
    });
  }

  else if (req.method === 'POST' && req.url === '/location') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const location = JSON.parse(body);
        const logEntry = `Latitude: ${location.latitude}, Longitude: ${location.longitude}, Timestamp: ${new Date().toISOString()}\n`;
        console.log(logEntry);
        const logPath = path.join(__dirname, 'locations.txt');
        fs.appendFile(logPath, logEntry, (err) => {
          if (err) {
            res.writeHead(500);
            res.end('Failed to save location');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Location saved');
          }
        });
      } catch (err) {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });
  }

  else {
    const filePath = path.join(__dirname, 'public', req.url);
    
    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          '.html': 'text/html',
          '.css': 'text/css',
          '.js': 'application/javascript',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon'
        };
  
        const contentType = mimeTypes[ext] || 'application/octet-stream';
  
        fs.readFile(filePath, (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Server error');
          } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
          }
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
    });
  }
  
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
