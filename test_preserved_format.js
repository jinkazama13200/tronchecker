#!/usr/bin/env node

// Test the new number formatting with preservation of decimal places

class NumberFormatTester {
  formatNumber(num) {
    // Convert to string to preserve original format
    const numStr = typeof num === 'string' ? num : num.toString();
    
    // Check if the original input is extremely large (likely due to decimal place misinterpretation)
    // If it's greater than 1 trillion, it's probably a decimal misplacement
    const floatNum = parseFloat(num);
    if (floatNum >= 1000000000000) { // 1 trillion
      // This is likely a decimal misplacement, divide by 1,000,000 to get the correct value
      const correctedNum = floatNum / 1000000;
      // Convert to string and process to remove trailing zeros properly
      let str = correctedNum.toString();
      
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
      // For normal numbers, preserve the original decimal format
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
    // Always ensure USDT is added for consistency and comma after the decimal number
    return `${formattedNum}, ${unit}`;
  }
}

const tester = new NumberFormatTester();

console.log("=== ĐỊNH DẠNG SỐ MỚI (giữ nguyên số thập phân, sửa lỗi số lớn) ===\n");

console.log("Trường hợp cần sửa (giữ nguyên số thập phân):");
console.log("7000 ->", tester.formatNumberWithUnit(7000));
console.log("'7000.000000' ->", tester.formatNumberWithUnit('7000.000000'));
console.log("4000 ->", tester.formatNumberWithUnit(4000));
console.log("'4000.000000' ->", tester.formatNumberWithUnit('4000.000000'));

console.log("\nTrường hợp số lớn bị sai (trước đây sẽ hiển thị sai):");
console.log("7000000000000 (sai do nhân 1 tỷ) ->", tester.formatNumberWithUnit(7000000000000));
console.log("4000000000000 (sai do nhân 1 tỷ) ->", tester.formatNumberWithUnit(4000000000000));

console.log("\nCác trường hợp bình thường khác:");
console.log("1000000 ->", tester.formatNumberWithUnit(1000000));
console.log("'1000000.5' ->", tester.formatNumberWithUnit('1000000.5'));
console.log("125000000 ->", tester.formatNumberWithUnit(125000000));
console.log("'1500000.75' ->", tester.formatNumberWithUnit('1500000.75'));

console.log("\nLoại bỏ số 0 không cần thiết:");
console.log("'1000000.00000000' ->", tester.formatNumberWithUnit('1000000.00000000'));
console.log("'1500000.50000000' ->", tester.formatNumberWithUnit('1500000.50000000'));
console.log("'1.00000000' ->", tester.formatNumberWithUnit('1.00000000'));