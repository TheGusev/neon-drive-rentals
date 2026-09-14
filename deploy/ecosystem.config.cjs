module.exports = {
  apps: [
    {
      name: 'nsk-rent',
      script: './dist/server/index.mjs',
      cwd: '/var/www/nsk-rent',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_file: '/var/www/nsk-rent/.env',
      max_memory_restart: '512M',
      restart_delay: 3000,
      min_uptime: '10s',
      max_restarts: 5,
      kill_timeout: 5000,
      listen_timeout: 10000,
      log_file: '/var/log/pm2/nsk-rent-combined.log',
      out_file: '/var/log/pm2/nsk-rent-out.log',
      error_file: '/var/log/pm2/nsk-rent-error.log',
      merge_logs: true,
      time: true,
    },
  ],
};
