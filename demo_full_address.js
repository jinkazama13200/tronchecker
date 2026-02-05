#!/usr/bin/env node

// Demo thông báo mẫu với địa chỉ đầy đủ của người khác

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
    } else {
      // If no decimal point, return as is
      return str;
    }
  }
  
  formatNumberWithUnit(num, unit = 'USDT') {
    const formattedNum = this.formatNumber(num);
    // Always ensure USDT is added for consistency and comma after the decimal number
    return `${formattedNum}, ${unit}`;
  }

  formatNotificationDemo(type, current, change, address, direction, relatedAddress, timestamp) {
    let message = `🚨 *THÔNG BÁO BIẾN ĐỘNG SỐ DƯ*\n\n`;
    
    if (direction === 'TĂNG') {
      message += `🟢 *Số dư được cộng*\n`;
      message += `💰 *Số dư hiện tại:* ${this.formatNumberWithUnit(current)}\n`;
      message += `📊 *Số dư biến động:* +${this.formatNumberWithUnit(change)}\n`;
      message += `📥 *Địa chỉ nhận:* \`${address}\`\n`;
      message += `📤 *Địa chỉ chuyển:* \`${relatedAddress || 'N/A'}\`\n`;
      message += `⏰ *Thời gian:* ${timestamp}\n\n`;
    } else if (direction === 'GIẢM') {
      message += `🔴 *Số dư bị giảm*\n`;
      message += `💰 *Số dư hiện tại:* ${this.formatNumberWithUnit(current)}\n`;
      message += `📊 *Số dư biến động:* -${this.formatNumberWithUnit(change)}\n`;
      message += `📥 *Địa chỉ nhận:* \`${relatedAddress || 'N/A'}\`\n`;
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

console.log("🟢 *Số dư được cộng (hiển thị địa chỉ đầy đủ của người gửi)*");
console.log("💰 *Số dư hiện tại:*", demo.formatNumberWithUnit(10600));
console.log("📊 *Số dư biến động:* +", demo.formatNumberWithUnit(5000));
console.log("📥 *Địa chỉ nhận:* `TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU`");
console.log("📤 *Địa chỉ chuyển:* `TPRRSb55iHHhsSG55NS22og2Q45fJQ7BkZ`");
console.log("⏰ *Thời gian:* 14:30 05/02/2026\n");
console.log("📍 *Địa chỉ ví:* `TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU`\n");

console.log("=".repeat(60) + "\n");

console.log("🔴 *Số dư bị giảm (hiển thị địa chỉ đầy đủ của người nhận)*");
console.log("💰 *Số dư hiện tại:*", demo.formatNumberWithUnit(8000));
console.log("📊 *Số dư biến động:* -", demo.formatNumberWithUnit(2000));
console.log("📥 *Địa chỉ nhận:* `TJZf2Y4r8D7g2H3j9K4m6N1p8Q5s7R2v4Y`");
console.log("📤 *Địa chỉ chuyển:* `TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU`");
console.log("⏰ *Thời gian:* 15:00 05/02/2026\n");
console.log("📍 *Địa chỉ ví:* `TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU`\n");

console.log("=".repeat(60) + "\n");

console.log("So sánh định dạng số:");
console.log("10600.000000 USDT ->", demo.formatNumberWithUnit(10600.000000));
console.log("4000.000000 USDT ->", demo.formatNumberWithUnit(4000.000000));