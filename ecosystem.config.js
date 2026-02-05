module.exports = {
  apps: [{
    name: 'tron-realtime-monitor',
    script: './realtime_monitor_optimized.js',
    cwd: '/home/codespace/clawd/tron_checker',
    args: 'TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU',  // Thay bằng địa chỉ ví của bạn
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      TRON_API_KEY: process.env.TRON_API_KEY,
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID
    },
    error_file: './logs/pm2-err.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true
  }]
};