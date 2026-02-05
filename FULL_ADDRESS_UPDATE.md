# Hiển thị địa chỉ đầy đủ của người khác trong hệ thống theo dõi TRON

## Mô tả
Cập nhật để hiển thị địa chỉ đầy đủ của người khác (người gửi/người nhận) trong thông báo, giúp dễ dàng nhận biết ai chuyển hoặc ai nhận.

## Những thay đổi chính

1. **Cải thiện hàm `getRelatedAddresses`**:
   - Tăng giới hạn giao dịch được kiểm tra từ 20 lên 30
   - Mở rộng phạm vi tìm kiếm từ 4 tiếng lên 6 tiếng
   - Tăng thời gian chờ để đảm bảo nhận được dữ liệu
   - Trả về địa chỉ đầy đủ (không rút gọn) của người khác

2. **Cập nhật hàm `formatNotification`**:
   - Hiển thị địa chỉ đầy đủ của người gửi/người nhận
   - Loại bỏ việc rút gọn địa chỉ (trước đây chỉ hiển thị 12 ký tự đầu + ...)
   - Hiển thị rõ ràng ai là người gửi và ai là người nhận

## Ví dụ

### Trước đây:
- `📤 *Địa chỉ chuyển:* \`TPRRSb55iHHh...\``
- Chỉ hiển thị 12 ký tự đầu tiên + dấu ...

### Hiện tại:
- `📤 *Địa chỉ chuyển:* \`TPRRSb55iHHhsSG55NS22og2Q45fJQ7BkZ\``
- Hiển thị địa chỉ đầy đủ để dễ nhận biết

## Khi nhận USDT (số dư tăng):
- `📥 *Địa chỉ nhận:*` là địa chỉ ví chính
- `📤 *Địa chỉ chuyển:*` là địa chỉ người gửi (đầy đủ)

## Khi gửi USDT (số dư giảm):
- `📤 *Địa chỉ chuyển:*` là địa chỉ ví chính
- `📥 *Địa chỉ nhận:*` là địa chỉ người nhận (đầy đủ)

## Lợi ích
- Dễ dàng nhận biết ai là người gửi hoặc người nhận
- Có thể theo dõi các giao dịch cụ thể với từng địa chỉ
- Cải thiện khả năng giám sát và phân tích giao dịch