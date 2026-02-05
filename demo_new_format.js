#!/usr/bin/env node

// Demo thông báo mẫu với định dạng số mới (có dấu chấm từ 1 triệu trở lên)

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
      
      // Format integer part with thousand separators only if it has 7 or more digits (>= 1,000,000)
      let formattedInteger = integerPart;
      if (integerPart.length >= 7) {
        formattedInteger = '';
        for (let i = 0; i < integerPart.length; i++) {
          if (i > 0 && (integerPart.length - i) % 3 === 0) {
            formattedInteger += '.';
          }
          formattedInteger += integerPart[i];
        }
      }
      
      // Return integer part only if decimal part is empty after trimming
      if (trimmedDecimal === '') {
        return formattedInteger;
      } else {
        return `${formattedInteger}.${trimmedDecimal}`;
      }
    } else {
      // If no decimal point, format with thousand separators only if it has 7 or more digits (>= 1,000,000)
      let formattedInteger = str;
      if (str.length >= 7) {
        formattedInteger = '';
        for (let i = 0; i < str.length; i++) {
          if (i > 0 && (str.length - i) % 3 === 0) {
            formattedInteger += '.';
          }
          formattedInteger += str[i];
        }
      }
      return formattedInteger;
    }
  }
  
  formatNumberWithUnit(num, unit = 'USDT') {
    const formattedNum = this.formatNumber(num);
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

console.log("🚨 *THÔNG BÁO BIẾN ĐỘNG SỐ DƯ*\n");

console.log("🟢 *Số dư được cộng (dưới 1 triệu - không có dấu chấm)*");
console.log("💰 *Số dư hiện tại:*", demo.formatNumberWithUnit(999999));
console.log("📊 *Số dư biến động:* +", demo.formatNumberWithUnit(500000));
console.log("📥 *Địa chỉ nhận:* `TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU`");
console.log("📤 *Địa chỉ chuyển:* `TPRRSb55iHHhsSG55NS22og2Q45fJQ7BkZ...`");
console.log("⏰ *Thời gian:* 14:30 05/02/2026\n");
console.log("📍 *Địa chỉ ví:* `TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU`\n");

console.log("=".repeat(60) + "\n");

console.log("🟢 *Số dư được cộng (từ 1 triệu trở lên - có dấu chấm)*");
console.log("💰 *Số dư hiện tại:*", demo.formatNumberWithUnit(1000000));
console.log("📊 *Số dư biến động:* +", demo.formatNumberWithUnit(500000));
console.log("📥 *Địa chỉ nhận:* `TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU`");
console.log("📤 *Địa chỉ chuyển:* `TPRRSb55iHHhsSG55NS22og2Q45fJQ7BkZ...`");
console.log("⏰ *Thời gian:* 14:30 05/02/2026\n");
console.log("📍 *Địa chỉ ví:* `TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU`\n");

console.log("=".repeat(60) + "\n");

console.log("🟢 *Số dư được cộng (số lớn có dấu chấm)*");
console.log("💰 *Số dư hiện tại:*", demo.formatNumberWithUnit(125000000));
console.log("📊 *Số dư biến động:* +", demo.formatNumberWithUnit(25000000));
console.log("📥 *Địa chỉ nhận:* `TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU`");
console.log("📤 *Địa chỉ chuyển:* `TPRRSb55iHHhsSG55NS22og2Q45fJQ7BkZ...`");
console.log("⏰ *Thời gian:* 14:30 05/02/2026\n");
console.log("📍 *Địa chỉ ví:* `TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU`\n");

console.log("=".repeat(60) + "\n");

console.log("🟢 *Số dư được cộng (số thập phân từ 1 triệu có dấu chấm)*");
console.log("💰 *Số dư hiện tại:*", demo.formatNumberWithUnit(1500000.75));
console.log("📊 *Số dư biến động:* +", demo.formatNumberWithUnit(500000.25));
console.log("📥 *Địa chỉ nhận:* `TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU`");
console.log("📤 *Địa chỉ chuyển:* `TPRRSb55iHHhsSG55NS22og2Q45fJQ7BkZ...`");
console.log("⏰ *Thời gian:* 14:30 05/02/2026\n");
console.log("📍 *Địa chỉ ví:* `TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU`\n");

console.log("=".repeat(60) + "\n");

console.log("So sánh định dạng số:");
console.log("Dưới 1 triệu: 999999 USDT ->", demo.formatNumberWithUnit(999999));
console.log("Từ 1 triệu: 1000000 USDT ->", demo.formatNumberWithUnit(1000000));
console.log("Số lớn: 125000000 USDT ->", demo.formatNumberWithUnit(125000000));
console.log("Số thập phân: 1500000.75 USDT ->", demo.formatNumberWithUnit(1500000.75));