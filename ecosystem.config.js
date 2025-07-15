module.exports = {
  apps: [
    {
      name: 'strapi-api',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/api',
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: 1337,
        APP_KEYS: 'fdsertyuijhgfrdtytrrdtfygu,frde46577t6rrdyfigouhdr764s',
        API_TOKEN_SALT: 'juyutrdftgyiuoljhgftr645e',
        ADMIN_JWT_SECRET: 'reswq21q3wesdrftyghvgcfdse',
        TRANSFER_TOKEN_SALT: '78909890okjhgfgytr3e',
        JWT_SECRET: 'hgfrew3456789oiuytrdfy'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/strapi-api.error.log',
      out_file: '/var/log/pm2/strapi-api.out.log',
      log_file: '/var/log/pm2/strapi-api.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
}; 