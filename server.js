const express = require('express');
const http = require('http');
const app = express();
const port = 5000;

// Increase Node.js HTTP server limits
http.globalAgent.maxHeaderSize = 80 * 1024 * 1024; // 80MB header size limit
process.env.NODE_OPTIONS = '--max-http-header-size=80000000'; // 80MB

// Increase header size limits for large URL parameters
app.use((req, res, next) => {
  // Set larger limits for headers
  req.connection.maxHeadersCount = 0; // Remove header count limit
  next();
});

// Increase payload limit and enable URL-encoded data with extended options
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({
  extended: true, 
  limit: '50mb',
  parameterLimit: 50000
}));

// Serve static files
app.use(express.static('.', {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Handle PDF content
app.post('/api/content', (req, res) => {
  try {
    const { content, filename } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    // Send back the content for rendering
    res.json({ 
      content: content,
      filename: filename || 'document'
    });
  } catch (error) {
    console.error('Error processing content:', error);
    res.status(500).json({ error: 'Failed to process content' });
  }
});

// Create HTTP server with custom limits
const server = http.createServer({
  maxHeaderSize: 80 * 1024 * 1024, // 80MB for headers
  requestTimeout: 300000, // 5 minutes timeout
  headersTimeout: 300000, // 5 minutes headers timeout
}, app);

// Set additional server limits
server.maxHeadersCount = 0; // No limit on header count

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});