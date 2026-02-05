#!/usr/bin/env node

// Test the new number formatting without comma

class NumberFormatTester {
  formatNumber(num) {
    // Handle the number based on TRON API format (where 7000 USDT might appear as 7000000000)
    // TRON USDT has 6 decimal places, so divide by 1,000,000 to get the actual value
    
    // Convert to number to handle both string and numeric inputs
    const floatNum = typeof num === 'string' ? parseFloat(num) : num;
    
    // If it's NaN, return the original value
    if (isNaN(floatNum)) {
      return typeof num === 'string' ? num : num.toString();
    }
    
    // Check if the number is in the typical TRON format (with 6 extra decimal places)
    // If it appears to be a typical USDT amount multiplied by 1,000,000
    if (floatNum >= 1000000 && floatNum % 1 === 0) { // Integer that's at least 1 million
      // Likely a TRON USDT value that needs to be divided by 1,000,000
      const actualValue = floatNum / 1000000;
      
      // Convert to string to process decimals
      let str = actualValue.toString();
      
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
    } else {
      // For normal numbers, preserve the original format
      const numStr = typeof num === 'string' ? num : num.toString();
      
      // If it contains a decimal point, process the decimal part
      if (numStr.includes('.')) {
        // Split into integer and decimal parts
        const [integerPart, decimalPart] = numStr.split('.');
        
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
        return numStr;
      }
    }
  }
  
  formatNumberWithUnit(num, unit = 'USDT') {
    const formattedNum = this.formatNumber(num);
    // Always ensure USDT is added for consistency without comma
    return `${formattedNum} ${unit}`;
  }
}

const tester = new NumberFormatTester();

console.log("=== ĐỊNH DẠNG SỐ MỚI (không có dấu phẩy) ===\n");

console.log("Trường hợp cần sửa (theo chuẩn TRON API):");
console.log("7000000000 (API trả về 7000 USDT) ->", tester.formatNumberWithUnit(7000000000));
console.log("4000000000 (API trả về 4000 USDT) ->", tester.formatNumberWithUnit(4000000000));
console.log("7000000 (API trả về 7 USDT) ->", tester.formatNumberWithUnit(7000000));

console.log("\nTrường hợp số thập phân từ API:");
console.log("7000500000 (API trả về 7000.5 USDT) ->", tester.formatNumberWithUnit(7000500000));
console.log("4000750000 (API trả về 4000.75 USDT) ->", tester.formatNumberWithUnit(4000750000));

console.log("\nCác trường hợp bình thường khác (số nhỏ không chia):");
console.log("1000 ->", tester.formatNumberWithUnit(1000));
console.log("5000 ->", tester.formatNumberWithUnit(5000));
console.log("1.5 ->", tester.formatNumberWithUnit(1.5));

console.log("\nTrường hợp số thập phân nhỏ:");
console.log("'1000.5' ->", tester.formatNumberWithUnit('1000.5'));
console.log("'5000.75' ->", tester.formatNumberWithUnit('5000.75'));

console.log("\nTrường hợp đặc biệt (giống ví dụ của anh):");
console.log("3500000000 (3500 USDT) ->", tester.formatNumberWithUnit(3500000000));
console.log("Ví dụ: +3500 USDT (sau khi trừ từ số lớn hơn) ->", `+${tester.formatNumber(3500000000)} USDT`);