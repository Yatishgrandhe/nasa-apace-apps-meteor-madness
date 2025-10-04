# Meteor Madness - Node.js Optimized

A professional space mission tracking and Near Earth Objects monitoring system with AI analysis, optimized for Node.js production environments.

## 🚀 Node.js Optimization Features

### Performance Optimizations
- **Standalone Output**: Optimized for containerized deployments
- **SWC Minification**: Faster builds and smaller bundles
- **Bundle Splitting**: Efficient code splitting for better caching
- **Image Optimization**: WebP/AVIF support with proper caching headers
- **Memory Management**: Optimized for Node.js memory usage

### Production Ready
- **PM2 Cluster Mode**: Multi-process deployment with load balancing
- **Docker Support**: Containerized deployment with multi-stage builds
- **Graceful Shutdown**: Proper process termination handling
- **Health Monitoring**: Built-in process monitoring and restart
- **Environment Configuration**: Production-ready environment setup

## 📋 Prerequisites

- **Node.js**: 18.17.0 or higher
- **npm**: 9.0.0 or higher
- **NASA API Key**: For asteroid and comet data
- **Gemini API Key**: For AI analysis features

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>
cd meteor-madness

# Install dependencies
npm install

# Copy environment configuration
cp env.example .env.local

# Add your API keys to .env.local
```

## 🔧 Development

```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

## 🚀 Production Deployment

### Option 1: Node.js Direct
```bash
# Build the application
npm run build

# Start with Node.js
npm run start:node
```

### Option 2: PM2 Cluster Mode (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
npm run start:pm2

# Monitor logs
npm run logs:pm2

# Restart application
npm run restart:pm2
```

### Option 3: Docker
```bash
# Build Docker image
docker build -t meteor-madness .

# Run container
docker run -p 3000:3000 meteor-madness
```

## ⚙️ Configuration

### Environment Variables
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3000)
- `HOSTNAME`: Server hostname (default: localhost)
- `NEXT_PUBLIC_NASA_API_KEY`: NASA API key for space data
- `NEXT_PUBLIC_GEMINI_API_KEY`: Gemini AI API key
- `UV_THREADPOOL_SIZE`: Node.js thread pool size (default: 128)
- `NODE_OPTIONS`: Node.js runtime options

### PM2 Configuration
The `ecosystem.config.js` file includes:
- Cluster mode with maximum CPU utilization
- Memory monitoring and restart
- Logging configuration
- Graceful shutdown handling
- Health monitoring

## 📊 Performance Monitoring

### Built-in Metrics
- Memory usage monitoring
- CPU utilization tracking
- Request/response metrics
- Error rate monitoring

### PM2 Monitoring
```bash
# View process status
pm2 status

# Monitor in real-time
pm2 monit

# View logs
pm2 logs meteor-madness

# Restart on file changes
pm2 start ecosystem.config.js --watch
```

## 🔒 Security Features

- **Content Security Policy**: Configured for SVG handling
- **Environment Variable Protection**: Sensitive data isolation
- **Docker Security**: Non-root user execution
- **HTTPS Ready**: SSL/TLS configuration support

## 📈 Scaling

### Horizontal Scaling
- PM2 cluster mode automatically scales across CPU cores
- Load balancer ready for multiple instances
- Stateless design for easy horizontal scaling

### Vertical Scaling
- Memory optimization with configurable limits
- CPU optimization with thread pool tuning
- Efficient garbage collection settings

## 🐳 Docker Deployment

### Multi-stage Build
- **deps**: Dependency installation
- **builder**: Application compilation
- **runner**: Production runtime

### Container Features
- Alpine Linux base image
- Non-root user execution
- Health check support
- Graceful shutdown handling

## 📝 API Endpoints

### NASA Data
- `/api/neo`: Near Earth Objects data
- `/api/comets`: Comet data

### Application
- `/dashboard`: Main dashboard
- `/missions`: Mission tracking
- `/neo`: Near Earth Objects page

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the documentation
- Review environment configuration
- Monitor application logs
- Verify API key configuration

## 🔄 Updates

To update the application:
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild and restart
npm run build
npm run restart:pm2
```