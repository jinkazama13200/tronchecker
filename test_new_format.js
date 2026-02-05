#!/usr/bin/env node

// Test the new number formatting with million separator

class NumberFormatTester {
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
}

const tester = new NumberFormatTester();

console.log("=== ĐỊNH DẠNG SỐ MỚI (chỉ áp dụng dấu chấm từ 1.000.000 trở lên) ===\n");

console.log("Số dưới 1 triệu (dưới 7 chữ số) - không có dấu chấm:");
console.log("100000 USDT ->", tester.formatNumberWithUnit(100000));
console.log("999999 USDT ->", tester.formatNumberWithUnit(999999));
console.log("10000 USDT ->", tester.formatNumberWithUnit(10000));
console.log("1000 USDT ->", tester.formatNumberWithUnit(1000));
console.log("500 USDT ->", tester.formatNumberWithUnit(500));
console.log("1 USDT ->", tester.formatNumberWithUnit(1));

console.log("\nSố từ 1 triệu trở lên (7 chữ số trở lên) - có dấu chấm:");
console.log("1000000 USDT ->", tester.formatNumberWithUnit(1000000));
console.log("10000000 USDT ->", tester.formatNumberWithUnit(10000000));
console.log("100000000 USDT ->", tester.formatNumberWithUnit(100000000));
console.log("336312567 USDT ->", tester.formatNumberWithUnit(336312567));

console.log("\nSố thập phân:");
console.log("1000000.5 USDT ->", tester.formatNumberWithUnit(1000000.5));
console.log("999999.5 USDT ->", tester.formatNumberWithUnit(999999.5));
console.log("1500000.75 USDT ->", tester.formatNumberWithUnit(1500000.75));

console.log("\nLoại bỏ số 0 không cần thiết:");
console.log("1000000.00000000 USDT ->", tester.formatNumberWithUnit(1000000.00000000));
console.log("1500000.50000000 USDT ->", tester.formatNumberWithUnit(1500000.50000000));