#!/bin/bash
# Script để khởi động công cụ theo dõi TRON liên tục

cd /home/codespace/clawd/tron_checker

# Cài đặt pm2 nếu chưa có
npm install -g pm2

# Khởi động công cụ theo dõi với pm2
pm2 start monitor.js --name "tron-monitor" -- \
  TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU \
  5 \
  --monitor

# Thiết lập tự động chạy lại khi hệ thống khởi động lại
pm2 startup
pm2 save

echo "Công cụ theo dõi TRON đã được thiết lập chạy nền!"
echo "Bạn có thể kiểm tra trạng thái bằng lệnh: pm2 status"
echo "Bạn có thể xem log bằng lệnh: pm2 log tron-monitor"