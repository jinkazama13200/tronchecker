#!/usr/bin/env node

// Mô phỏng biến động số dư để kiểm tra định dạng thông báo thực tế

const fs = require('fs').promises;
require('dotenv').config();

class MockMonitor {
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

// Tạo đối tượng mock monitor
const mockMonitor = new MockMonitor();

// Mô phỏng các loại biến động
console.log("=".repeat(70));
console.log("MÔ PHỎNG CÁC LOẠI BIẾN ĐỘNG SỐ DƯ VỚI ĐỊNH DẠNG MỚI");
console.log("=".repeat(70));

// Biến động tăng dưới 1 triệu
console.log("\n🔴 BIẾN ĐỘNG TĂNG DƯỚI 1 TRIỆU (không có dấu chấm):");
const changeBelowMillion = [{
  direction: 'TĂNG',
  type: 'USDT',
  current: 999999,
  change: 500000,
  relatedAddresses: {
    receivedFrom: 'TPRRSb55iHHhsSG55NS22og2Q45fJQ7BkZ',
    timestamp: '14:30 05/02/2026'
  }
}];
console.log(mockMonitor.formatNotification(changeBelowMillion, 'TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU'));

console.log("\n" + "=".repeat(70));

// Biến động tăng từ 1 triệu trở lên
console.log("\n🔴 BIẾN ĐỘNG TĂNG TỪ 1 TRIỆU TRỞ LÊN (có dấu chấm):");
const changeAboveMillion = [{
  direction: 'TĂNG',
  type: 'USDT',
  current: 1500000,
  change: 500000,
  relatedAddresses: {
    receivedFrom: 'TPRRSb55iHHhsSG55NS22og2Q45fJQ7BkZ',
    timestamp: '15:00 05/02/2026'
  }
}];
console.log(mockMonitor.formatNotification(changeAboveMillion, 'TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU'));

console.log("\n" + "=".repeat(70));

// Biến động giảm số lớn
console.log("\n🔴 BIẾN ĐỘNG GIẢM SỐ LỚN (có dấu chấm):");
const changeLarge = [{
  direction: 'GIẢM',
  type: 'USDT',
  current: 125000000,
  change: 25000000,
  relatedAddresses: {
    sentTo: 'TJZf2Y4r8D7g2H3j9K4m6N1p8Q5s7R2v4Y',
    timestamp: '16:00 05/02/2026'
  }
}];
console.log(mockMonitor.formatNotification(changeLarge, 'TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU'));

console.log("\n" + "=".repeat(70));

// So sánh định dạng số
console.log("\n📋 SO SÁNH ĐỊNH DẠNG SỐ MỚI:");
console.log("- Dưới 1 triệu: 999999 USDT ->", mockMonitor.formatNumberWithUnit(999999));
console.log("- Từ 1 triệu: 1000000 USDT ->", mockMonitor.formatNumberWithUnit(1000000));
console.log("- Số lớn: 125000000 USDT ->", mockMonitor.formatNumberWithUnit(125000000));
console.log("- Số thập phân lớn: 1.500.000,75 USDT ->", mockMonitor.formatNumberWithUnit(1500000.75));
console.log("- Loại bỏ số 0: 1.000.000,00 USDT ->", mockMonitor.formatNumberWithUnit(1000000.00000000));

console.log("\n✅ SCRIPT ĐÃ CHẠY THÀNH CÔNG VỚI ĐỊNH DẠNG SỐ MỚI!");