#!/usr/bin/env node

/**
 * Meteor Madness - Node.js Production Server
 * Optimized for Node.js runtime environments
 */

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

// Create Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Node.js performance optimizations
process.env.UV_THREADPOOL_SIZE = 128

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  process.exit(0)
})

// Unhandled promise rejection handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

// Uncaught exception handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  server.on('error', (err) => {
    console.error('Server error:', err)
  })

  server.listen(port, () => {
    console.log(`> Meteor Madness ready on http://${hostname}:${port}`)
    console.log(`> Environment: ${process.env.NODE_ENV}`)
    console.log(`> Node.js version: ${process.version}`)
  })
})
