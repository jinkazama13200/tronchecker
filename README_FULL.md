# TRON Checker - Công cụ kiểm tra và theo dõi ví TRON

Công cụ kiểm tra số dư và theo dõi biến động cho ví TRON, đặc biệt là USDT TRC-20.

## Tính năng

- ✅ Kiểm tra số dư TRX và USDT (Tether USD) cho địa chỉ ví TRON
- ✅ Hiển thị các token TRC20 khác trong ví
- ✅ Kiểm tra lịch sử giao dịch (nếu có)
- ✅ Theo dõi biến động số dư liên tục
- ✅ Gửi thông báo qua Telegram khi có biến động
- ✅ So sánh số dư giữa các lần kiểm tra
- ✅ Hiển thị địa chỉ ví gửi/nhận trong giao dịch
- ✅ Định dạng số tiền với 8 chữ số thập phân
- ✅ Rút gọn USDT chỉ còn 5 chữ số đầu tiên
- ✅ Hiển thị thời gian theo múi giờ Việt Nam
- ✅ Định dạng thông báo Telegram rõ ràng
- ✅ Tối ưu hóa tốc độ phản hồi

## Yêu cầu

- Node.js >= 14.x
- npm

## Cài đặt

1. Clone hoặc tải về thư mục này
2. Chạy lệnh để cài đặt các thư viện cần thiết:

```bash
npm install
```

## Cấu hình

1. Cập nhật API key trong file `.env`:

```
TRON_API_KEY=your_api_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token (tùy chọn)
TELEGRAM_CHAT_ID=your_chat_id (tùy chọn)
```

## Các lệnh sử dụng

### 1. Kiểm tra số dư một lần

Kiểm tra số dư hiện tại của ví:

```bash
npm start
```

Hoặc chạy trực tiếp:

```bash
node check_usdt_new_api.js
```

### 2. Kiểm tra với địa chỉ ví cụ thể

```bash
node check_usdt_new_api.js
```

(Lưu ý: Địa chỉ ví được đặt cứng trong script, bạn cần chỉnh sửa trong file nếu muốn kiểm tra địa chỉ khác)

### 3. Theo dõi biến động (không thông báo Telegram)

Chỉ kiểm tra một lần:

```bash
node monitor.js TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU --once
```

Theo dõi liên tục mỗi 5 phút:

```bash
node monitor.js TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU --monitor
```

Theo dõi liên tục với интервал tùy chỉnh (ví dụ: mỗi 10 phút):

```bash
node monitor.js TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU 10 --monitor
```

### 4. Theo dõi biến động với thông báo Telegram

Chỉ kiểm tra một lần:

```bash
node monitor-telegram.js TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU --once
```

Theo dõi liên tục mỗi 5 phút:

```bash
node monitor-telegram.js TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU --monitor
```

Theo dõi liên tục với интервал tùy chỉnh:

```bash
node monitor-telegram.js TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU 10 --monitor
```

### 5. Kiểm tra đơn lẻ với thông báo khi có thay đổi

Chỉ gửi thông báo nếu có thay đổi thực sự:

```bash
node simple_check.js TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU
```

Hoặc dùng script npm:

```bash
npm run simple-check TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU
```

### 6. Kiểm tra nhanh (tối ưu hóa tốc độ)

Phiên bản tối ưu hóa để kiểm tra nhanh hơn:

```bash
node fast_check.js TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU
```

Hoặc dùng script npm:

```bash
npm run fast-check TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU
```

### 7. Sử dụng script npm

Chạy kiểm tra đơn giản:

```bash
npm start
```

Chạy theo dõi đơn giản:

```bash
npm run monitor -- TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU --monitor
```

Chạy theo dõi với Telegram:

```bash
npm run monitor-telegram -- TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU --monitor
```

Chạy kiểm tra đơn lẻ:

```bash
npm run simple-check -- TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU
```

Chạy kiểm tra nhanh:

```bash
npm run fast-check -- TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU
```

## Cấu trúc thư mục

- `check_usdt_new_api.js` - Script kiểm tra số dư đơn giản
- `monitor.js` - Script theo dõi biến động (không thông báo Telegram)
- `monitor-telegram.js` - Script theo dõi biến động với thông báo Telegram
- `simple_check.js` - Script kiểm tra và thông báo chỉ khi có thay đổi
- `fast_check.js` - Script kiểm tra nhanh (tối ưu hóa tốc độ)
- `.env` - Chứa API keys (đã được thêm vào .gitignore để bảo mật)
- `package.json` - Thông tin dự án và các thư viện phụ thuộc
- `monitor_state.json` - Lưu trữ trạng thái để so sánh biến động
- `README.md` - Tài liệu hướng dẫn

## Thiết lập theo dõi nền (dùng PM2)

Để chạy công cụ theo dõi như một dịch vụ nền:

1. Cài đặt PM2:

```bash
npm install -g pm2
```

2. Khởi động công cụ theo dõi:

```bash
pm2 start monitor-telegram.js --name "tron-monitor" -- TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU 5 --monitor
```

3. Thiết lập tự động chạy lại khi hệ thống khởi động:

```bash
pm2 startup
pm2 save
```

4. Kiểm tra trạng thái:

```bash
pm2 status
```

5. Xem log:

```bash
pm2 log tron-monitor
```

6. Dừng dịch vụ:

```bash
pm2 stop tron-monitor
```

## Định dạng thông báo Telegram

Khi có biến động số dư, thông báo Telegram sẽ có định dạng:

```
🚨 THÔNG BÁO BIẾN ĐỘNG SỐ DƯ

📥 Địa chỉ nhận: `TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU`
📤 Địa chỉ chuyển: `TXYZabc123...`
📈 Số dư biến động: +2.00000000
💰 Số dư hiện tại: 38936.00000000
⏰ Thời gian: 04/02/2026, 18:20:15

📍 Địa chỉ ví: `TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU`
```

## Cấu hình hiển thị

- **USDT**: Được rút gọn chỉ còn 5 chữ số đầu tiên (ví dụ: 38936312567.12345678 thành 38936.00000000)
- **Thời gian**: Hiển thị theo múi giờ Việt Nam (Asia/Ho_Chi_Minh)
- **Số thập phân**: 8 chữ số thập phân cho tất cả các token

## Lưu ý

- API key nên được giữ bí mật và không chia sẻ công khai
- Công cụ này sử dụng API của TRONSCAN để lấy thông tin ví
- Số dư có thể có độ trễ nhỏ do thời gian cập nhật của blockchain
- Để nhận thông báo Telegram, cần cấu hình BOT_TOKEN và CHAT_ID trong file `.env`
- Công cụ sẽ lưu trạng thái vào file `monitor_state.json` để so sánh trong các lần tới
- `simple_check.js` và `fast_check.js` chỉ gửi thông báo khi có thay đổi thực sự
- `fast_check.js` được tối ưu hóa để phản hồi nhanh hơn