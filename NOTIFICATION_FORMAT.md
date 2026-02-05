# Định Dạng Thông Báo - Hệ Thống Theo Dõi USDT

## Mô Tả

Đây là định dạng thông báo sẽ được gửi đến Telegram khi có biến động số dư USDT trong ví được theo dõi.

## Định Dạng Thông Báo

### Biến Động Tăng (Nhận Tiền)
```
🚨 *THÔNG BÁO BIẾN ĐỘNG SỐ DƯ*

🟢 *Số dư được cộng*
💰 *Số dư hiện tại:* [số_dư_hiện_tại] USDT
📊 *Số dư biến động:* +[số_lượng_biến_động] USDT
📥 *Địa chỉ nhận:* `[địa_chỉ_ví_của_bạn]`
📤 *Địa chỉ chuyển:* `[địa_chỉ_người_gửi]...`
⏰ *Thời gian:* [thời_gian_giao_dịch]
📍 *Địa chỉ ví:* `[địa_chỉ_ví_của_bạn]`
```

### Biến Động Giảm (Gửi Tiền)
```
🚨 *THÔNG BÁO BIẾN ĐỘNG SỐ DƯ*

🔴 *Số dư bị giảm*
💰 *Số dư hiện tại:* [số_dư_hiện_tại] USDT
📊 *Số dư biến động:* -[số_lượng_biến_động] USDT
📥 *Địa chỉ nhận:* `[địa_chỉ_người_nhận]...`
📤 *Địa chỉ chuyển:* `[địa_chỉ_ví_của_bạn]`
⏰ *Thời gian:* [thời_gian_giao_dịch]
📍 *Địa chỉ ví:* `[địa_chỉ_ví_của_bạn]`
```

## Đặc Điểm Nổi Bật

1. **Chỉ Theo Dõi USDT**: Hệ thống chỉ gửi thông báo về biến động USDT, không bao gồm TRX và các token khác.

2. **Định Dạng Số Gọn Gàng**: 
   - Không có dấu chấm phân cách hàng nghìn
   - Loại bỏ hoàn toàn các số 0 không cần thiết ở phần thập phân
   - Ví dụ: `1000000.00000000` sẽ hiển thị là `1000000`

3. **Đơn Vị Rõ Ràng**: 
   - Luôn có chữ "USDT" đằng sau mỗi giá trị số
   - Giúp người dùng dễ dàng nhận biết đơn vị tiền tệ

4. **Thông Tin Giao Dịch Đầy Đủ**:
   - Hiển thị số dư hiện tại và số lượng biến động
   - Hiển thị địa chỉ gửi và nhận
   - Hiển thị thời gian giao dịch chính xác

## Ví Dụ Thực Tế

### Nhận USDT:
```
🚨 *THÔNG BÁO BIẾN ĐỘNG SỐ DƯ*

🟢 *Số dư được cộng*
💰 *Số dư hiện tại:* 1000000 USDT
📊 *Số dư biến động:* +500000 USDT
📥 *Địa chỉ nhận:* `TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU`
📤 *Địa chỉ chuyển:* `TPRRSb55iHHhsSG55NS22og2Q45fJQ7BkZ...`
⏰ *Thời gian:* 14:30 05/02/2026
📍 *Địa chỉ ví:* `TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU`
```

### Gửi USDT:
```
🚨 *THÔNG BÁO BIẾN ĐỘNG SỐ DƯ*

🔴 *Số dư bị giảm*
💰 *Số dư hiện tại:* 800000 USDT
📊 *Số dư biến động:* -200000 USDT
📥 *Địa chỉ nhận:* `TJZf2Y4r8D7g2H3j9K4m6N1p8Q5s7R2v4Y...`
📤 *Địa chỉ chuyển:* `TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU`
⏰ *Thời gian:* 15:45 05/02/2026
📍 *Địa chỉ ví:* `TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU`
```

## Mục Đích

- Cung cấp thông báo tức thì khi có biến động USDT
- Giúp người dùng theo dõi chính xác số dư ví
- Cung cấp đầy đủ thông tin giao dịch để kiểm tra
- Đơn giản, dễ hiểu và không gây rối loạn