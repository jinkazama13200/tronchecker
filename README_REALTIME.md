# TRON Realtime Monitor - README

## Mô tả
Hệ thống theo dõi thời gian thực cho ví TRON, phát hiện và thông báo ngay lập tức khi có biến động số dư.

Có 2 phiên bản:
- **realtime_monitor.js**: Phiên bản cơ bản
- **realtime_monitor_optimized.js**: Phiên bản tối ưu hóa với thông báo Telegram (được sử dụng chính)

## Tính năng
- 🚀 **Theo dõi liên tục 24/7** - chế độ standby
- ⚡ **Phát hiện tức thì** - kiểm tra mỗi 5 giây
- 📱 **Thông báo Telegram** - khi có biến động (chỉ các token, không bao gồm TRX)
- 📍 **Hiển thị địa chỉ gửi đến** - khi số dư tăng
- 📤 **Hiển thị địa chỉ gửi đi** - khi số dư giảm
- 🔢 **Định dạng số nguyên bản** - hiển thị đúng con số nhận được (1, 1000, 1000000)
- 🔁 **Tự động khởi động lại** - nếu có lỗi
- 📊 **Hiển thị đầy đủ thông tin** - số dư, biến động, thời gian, địa chỉ liên quan

## Cài đặt

### Yêu cầu
- Node.js v14+
- PM2 (nếu dùng chế độ nền)

### Cài đặt PM2 (nếu chưa có)
```bash
npm install -g pm2
```

### Cài đặt dependencies
```bash
cd /home/codespace/clawd/tron_checker
npm install
```

## Cấu hình

### File `.env`
```env
TRON_API_KEY=your_tron_api_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here
```

## Cách sử dụng

### 1. Chạy trực tiếp
```bash
# Theo dõi 1 địa chỉ
node realtime_monitor_optimized.js [ĐỊA_CHỈ_VÍ]

# Ví dụ:
node realtime_monitor_optimized.js TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU
```

### 2. Chạy với PM2 (chế độ nền 24/7)
```bash
# Khởi động với PM2
pm2 start /home/codespace/clawd/tron_checker/ecosystem.config.js

# Hoặc dùng script
npm run pm2-start
```

### 3. Theo dõi nhiều địa chỉ (chạy trực tiếp)
```bash
node realtime_monitor_optimized.js [ĐỊA_CHỈ_1] [ĐỊA_CHỈ_2] [ĐỊA_CHỈ_3]
```

## Commands quản lý

### PM2 Commands
```bash
# Kiểm tra trạng thái
pm2 status

# Xem log hoạt động
pm2 logs tron-realtime-monitor

# Dừng theo dõi
pm2 stop tron-realtime-monitor

# Khởi động lại
pm2 restart tron-realtime-monitor

# Dừng tất cả tiến trình
pm2 delete all

# Tự động khởi động khi máy khởi động
pm2 startup
pm2 save
```

### Package Scripts
```bash
# Khởi động PM2
npm run pm2-start

# Dừng PM2
npm run pm2-stop

# Khởi động lại PM2
npm run pm2-restart

# Kiểm tra trạng thái PM2
npm run pm2-status

# Xem log PM2
npm run pm2-logs
```

## Format thông báo Telegram

### Khi số dư tăng (nhận tiền):
```
🚨 THÔNG BÁO BIẾN ĐỘNG SỐ DƯ

🟢 Số dư được cộng
💰 Số dư hiện tại: [số dư mới]
📊 Số dư biến động: +[số tiền tăng]
📥 Địa chỉ nhận: `[ví của bạn]`
📤 Địa chỉ chuyển: `[địa chỉ gửi đến]...`
⏰ Thời gian: [thời gian]
```

### Khi số dư giảm (gửi tiền):
```
🚨 THÔNG BÁO BIẾN ĐỘNG SỐ DƯ

🔴 Số dư bị giảm
💰 Số dư hiện tại: [số dư mới]
📊 Số dư biến động: -[số tiền giảm]
📥 Địa chỉ nhận: `[địa chỉ nhận]...`
📤 Địa chỉ chuyển: `[ví của bạn]`
⏰ Thời gian: [thời gian]
```

## Các loại biến động được theo dõi
- ✅ **Tăng số dư** (nhận tiền)
- ✅ **Giảm số dư** (gửi tiền)
- ✅ **Token mới** (xuất hiện token mới trong ví)
- ✅ **Token mất** (token biến mất khỏi ví)

## Tùy chỉnh
- **Thời gian kiểm tra**: 5000ms (5 giây) - có thể điều chỉnh trong file `realtime_monitor_optimized.js`
- **Số lượng giao dịch kiểm tra**: 10 giao dịch gần nhất
- **Khoảng thời gian tìm kiếm**: 2 giờ gần nhất

## Gỡ lỗi

### Nếu PM2 bị lỗi:
```bash
# Dừng tất cả
pm2 delete all

# Kiểm tra cấu hình
cat ecosystem.config.js

# Khởi động lại
pm2 start ecosystem.config.js
```

### Nếu không nhận được thông báo:
- Kiểm tra lại `TELEGRAM_BOT_TOKEN` và `TELEGRAM_CHAT_ID` trong `.env`
- Đảm bảo bot Telegram đã được thêm vào nhóm và có quyền gửi tin nhắn
- Kiểm tra xem chat ID có đúng không

## Bảo trì
- Hệ thống tự động lưu trạng thái vào file `realtime_monitor_state.json`
- Log hoạt động được lưu vào thư mục `logs/`
- Tự động khởi động lại nếu tiêu thụ quá 1GB RAM

## Tác giả
Mike
```