#!/usr/bin/env node

// Script thử nghiệm định dạng thông báo với dữ liệu giả lập

class NotificationDemo {
  formatNumber(num) {
    // Convert to number if it's a string
    const number = typeof num === 'string' ? parseFloat(num) : num;
    
    // If it's NaN, return the original value
    if (isNaN(number)) {
      return num;
    }
    
    // Use toPrecision to get the shortest representation without trailing zeros
    // Convert to number first to eliminate floating point precision issues
    const floatNum = parseFloat(number);
    
    // Convert to string and process to remove trailing zeros properly
    let str = floatNum.toString();
    
    // If it contains a decimal point, process the decimal part
    if (str.includes('.')) {
      // Split into integer and decimal parts
      const [integerPart, decimalPart] = str.split('.');
      
      // Remove trailing zeros from decimal part
      const trimmedDecimal = decimalPart.replace(/0+$/, '');
      
      // Return integer part only if decimal part is empty after trimming
      if (trimmedDecimal === '') {
        return integerPart;
      } else {
        return `${integerPart}.${trimmedDecimal}`;
      }
    }
    
    // If no decimal point, return as is
    return str;
  }
  
  formatNumberWithUnit(num, unit = 'USDT') {
    const formattedNum = this.formatNumber(num);
    // Check if the unit is already included in the formatted number
    if (formattedNum.includes('USDT')) {
      return formattedNum; // Return as is if already has unit
    }
    return `${formattedNum} ${unit}`;
  }

  formatNotificationDemo(type, current, change, address, direction, relatedAddress, timestamp) {
    let message = `🚨 *THÔNG BÁO BIẾN ĐỘNG SỐ DƯ*\n\n`;
    
    if (direction === 'TĂNG') {
      message += `🟢 *Số dư được cộng*\n`;
      message += `💰 *Số dư hiện tại:* ${this.formatNumberWithUnit(current)}\n`;
      message += `📊 *Số dư biến động:* +${this.formatNumberWithUnit(change)}\n`;
      message += `📥 *Địa chỉ nhận:* \`${address}\`\n`;
      message += `📤 *Địa chỉ chuyển:* \`${relatedAddress.substring(0, 12)}...\`\n`;
      message += `⏰ *Thời gian:* ${timestamp}\n\n`;
    } else if (direction === 'GIẢM') {
      message += `🔴 *Số dư bị giảm*\n`;
      message += `💰 *Số dư hiện tại:* ${this.formatNumberWithUnit(current)}\n`;
      message += `📊 *Số dư biến động:* -${this.formatNumberWithUnit(change)}\n`;
      message += `📥 *Địa chỉ nhận:* \`${relatedAddress.substring(0, 12)}...\`\n`;
      message += `📤 *Địa chỉ chuyển:* \`${address}\`\n`;
      message += `⏰ *Thời gian:* ${timestamp}\n\n`;
    }
    
    message += `📍 *Địa chỉ ví:* \`${address}\``;
    
    return message;
  }
}

// Tạo đối tượng demo
const demo = new NotificationDemo();

// Ví dụ 1: Nhận USDT
console.log("VÍ DỤ 1: NHẬN USDT");
console.log(demo.formatNotificationDemo(
  'USDT',
  1000000.00000000, // số dư hiện tại
  500000.00000000,  // số dư biến động
  'TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU',
  'TĂNG',
  'TPRRSb55iHHhsSG55NS22og2Q45fJQ7BkZ',
  '14:30 05/02/2026'
));

console.log("\n" + "=".repeat(60) + "\n");

// Ví dụ 2: Gửi USDT
console.log("VÍ DỤ 2: GỬI USDT");
console.log(demo.formatNotificationDemo(
  'USDT',
  800000.50000000, // số dư hiện tại
  200000.50000000,  // số dư biến động
  'TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU',
  'GIẢM',
  'TJZf2Y4r8D7g2H3j9K4m6N1p8Q5s7R2v4Y',
  '15:45 05/02/2026'
));

console.log("\n" + "=".repeat(60) + "\n");

// Ví dụ 3: Số thập phân
console.log("VÍ DỤ 3: SỐ THẬP PHÂN");
console.log(demo.formatNotificationDemo(
  'USDT',
  1000.50000000, // số dư hiện tại
  0.50000000,    // số dư biến động
  'TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU',
  'TĂNG',
  'TPRRSb55iHHhsSG55NS22og2Q45fJQ7BkZ',
  '16:20 05/02/2026'
));

console.log("\n" + "=".repeat(60) + "\n");

// Ví dụ 4: Không có số 0 không cần thiết
console.log("VÍ DỤ 4: LOẠI BỎ SỐ 0 KHÔNG CẦN THIẾT");
console.log("So sánh:");
console.log("- Trước: 1000000.00000000 USDT");
console.log("- Sau:   " + demo.formatNumberWithUnit(1000000.00000000));
console.log("- Trước: 10.50000000 USDT");
console.log("- Sau:   " + demo.formatNumberWithUnit(10.50000000));
console.log("- Trước: 1.00000000 USDT");
console.log("- Sau:   " + demo.formatNumberWithUnit(1.00000000));