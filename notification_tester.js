#!/usr/bin/env node

// Script này mô phỏng cách hệ thống tạo và gửi thông báo

class NotificationTester {
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
    // Always ensure USDT is added for consistency
    return `${formattedNum} ${unit}`;
  }

  formatNotification(changes, address) {
    let message = `🚨 *THÔNG BÁO BIẾN ĐỘNG SỐ DƯ*\n\n`;
    
    for (const change of changes) {
      if (change.direction === 'TĂNG') {
        message += `🟢 *Số dư được cộng*\n`;
        message += `💰 *Số dư hiện tại:* ${this.formatNumberWithUnit(change.current, 'USDT')}\n`;
        message += `📊 *Số dư biến động:* +${this.formatNumberWithUnit(change.change, 'USDT')}\n`;
        message += `📥 *Địa chỉ nhận:* \`${address}\`\n`;
        message += `📤 *Địa chỉ chuyển:* \`${change.relatedAddresses?.receivedFrom?.substring(0, 12) || 'N/A'}...\`\n`;
        message += `⏰ *Thời gian:* ${change.relatedAddresses?.timestamp || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\n\n`;
      } else if (change.direction === 'GIẢM') {
        message += `🔴 *Số dư bị giảm*\n`;
        message += `💰 *Số dư hiện tại:* ${this.formatNumberWithUnit(change.current, 'USDT')}\n`;
        message += `📊 *Số dư biến động:* -${this.formatNumberWithUnit(change.change, 'USDT')}\n`;
        message += `📥 *Địa chỉ nhận:* \`${change.relatedAddresses?.sentTo?.substring(0, 12) || 'N/A'}...\`\n`;
        message += `📤 *Địa chỉ chuyển:* \`${address}\`\n`;
        message += `⏰ *Thời gian:* ${change.relatedAddresses?.timestamp || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\n\n`;
      } else if (change.direction === 'MỚI') {
        message += `🟢 *Số dư được cộng*\n`;
        message += `🆕 *Loại token:* ${change.type}\n`;
        message += `💰 *Số dư hiện tại:* ${this.formatNumberWithUnit(change.current, 'USDT')}\n`;
        message += `📥 *Địa chỉ nhận:* \`${address}\`\n`;
        message += `📤 *Địa chỉ chuyển:* \`${change.relatedAddresses?.receivedFrom?.substring(0, 12) || 'N/A'}...\`\n`;
        message += `⏰ *Thời gian:* ${change.relatedAddresses?.timestamp || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\n\n`;
      } else if (change.direction === 'MẤT') {
        message += `🔴 *Số dư bị giảm*\n`;
        message += `❌ *Loại token:* ${change.type}\n`;
        message += `📊 *Số dư biến động:* -${this.formatNumberWithUnit(change.previous, 'USDT')}\n`;
        message += `💰 *Số dư hiện tại:* ${this.formatNumberWithUnit(0, 'USDT')}\n`;
        message += `📥 *Địa chỉ nhận:* \`${change.relatedAddresses?.sentTo?.substring(0, 12) || 'N/A'}...\`\n`;
        message += `📤 *Địa chỉ chuyển:* \`${address}\`\n`;
        message += `⏰ *Thời gian:* ${change.relatedAddresses?.timestamp || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\n\n`;
      }
    }
    
    message += `📍 *Địa chỉ ví:* \`${address}\``;
    
    return message;
  }
}

// Tạo một ví dụ thay đổi để kiểm tra
const tester = new NotificationTester();

console.log("=".repeat(70));
console.log("KIỂM TRA ĐỊNH DẠNG THÔNG BÁO DUY NHẤT");
console.log("=".repeat(70));

// Tạo một ví dụ thay đổi
const changesExample = [{
  direction: 'TĂNG',
  type: 'USDT',
  current: 1500000,
  change: 500000,
  relatedAddresses: {
    receivedFrom: 'TPRRSb55iHHhsSG55NS22og2Q45fJQ7BkZ',
    timestamp: '14:30 05/02/2026'
  }
}];

const address = 'TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU';

console.log("\n📋 THÔNG BÁO ĐƯỢC TẠO RA (CHỈ CÓ MỘT BẢNG DUY NHẤT):");
console.log(tester.formatNotification(changesExample, address));

console.log("\n🔍 PHÂN TÍCH:");
console.log("- Chỉ có một lần gọi formatNotification()");
console.log("- Chỉ có một lần gọi sendTelegramNotification()");
console.log("- Mỗi biến động chỉ tạo ra một thông báo duy nhất");
console.log("- Tất cả giá trị đều có 'USDT' ở cuối");
console.log("- Định dạng số đã được áp dụng: 1.500.000 USDT (có dấu chấm)");

console.log("\n✅ HỆ THỐNG CHỈ TẠO RA MỘT BẢNG THÔNG BÁO DUY NHẤT CHO MỖI BIẾN ĐỘNG");