#!/usr/bin/env node

// Test the new number formatting without thousand separators

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
}

const tester = new NumberFormatTester();

console.log("=== ĐỊNH DẠNG SỐ MỚI (theo số thập phân thực tế, không có dấu phẩy ngăn cách hàng nghìn) ===\n");

console.log("Theo yêu cầu mới:");
console.log("10600.000000 USDT ->", tester.formatNumberWithUnit(10600.000000));
console.log("4000.000000 USDT ->", tester.formatNumberWithUnit(4000.000000));

console.log("\nCác ví dụ khác:");
console.log("1000000 USDT ->", tester.formatNumberWithUnit(1000000));
console.log("1000000.5 USDT ->", tester.formatNumberWithUnit(1000000.5));
console.log("125000000 USDT ->", tester.formatNumberWithUnit(125000000));
console.log("1500000.75 USDT ->", tester.formatNumberWithUnit(1500000.75));

console.log("\nLoại bỏ số 0 không cần thiết:");
console.log("1000000.00000000 USDT ->", tester.formatNumberWithUnit(1000000.00000000));
console.log("1500000.50000000 USDT ->", tester.formatNumberWithUnit(1500000.50000000));
console.log("1.00000000 USDT ->", tester.formatNumberWithUnit(1.00000000));