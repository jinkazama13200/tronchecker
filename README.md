# TRON Checker

Công cụ kiểm tra số dư và giao dịch cho ví TRON, đặc biệt là USDT TRC-20.

## Tính năng

- Kiểm tra số dư TRX và USDT (Tether USD) cho địa chỉ ví TRON
- Hiển thị các token TRC20 khác trong ví
- Kiểm tra lịch sử giao dịch (nếu có)

## Yêu cầu

- Node.js >= 14.x
- npm

## Cài đặt

1. Clone hoặc tải về thư mục này
2. Chạy lệnh để cài đặt các thư viện cần thiết:

```bash
npm install
```

3. Cập nhật API key trong file `.env`:

```
TRON_API_KEY=your_api_key_here
```

## Sử dụng

Để kiểm tra số dư cho địa chỉ ví TRON:

```bash
npm start
```

## Cấu trúc thư mục

- `check_usdt_new_api.js` - Script chính để kiểm tra số dư
- `.env` - Chứa API key (đã được thêm vào .gitignore để bảo mật)
- `package.json` - Thông tin dự án và các thư viện phụ thuộc
- `README.md` - Tài liệu hướng dẫn

## Lưu ý

- API key nên được giữ bí mật và không chia sẻ công khai
- Công cụ này sử dụng API của TRONSCAN để lấy thông tin ví
- Số dư có thể có độ trễ nhỏ do thời gian cập nhật của blockchain