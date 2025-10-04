module.exports = {
  apps: [
    {
      name: 'meteor-madness',
      script: 'server.js',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
        UV_THREADPOOL_SIZE: 128,
        NODE_OPTIONS: '--max-old-space-size=4096',
        NEXT_TELEMETRY_DISABLED: 1,
      },
      // Node.js optimization settings
      node_args: '--max-old-space-size=4096',
      
      // Process management
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Health monitoring
      min_uptime: '10s',
      max_restarts: 10,
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 8000,
      
      // Advanced settings
      increment_var: 'PORT',
      merge_logs: true,
      
      // Environment variables
      env_file: '.env.production',
    },
  ],

  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/meteor-madness.git',
      path: '/var/www/meteor-madness',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
}
