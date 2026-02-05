#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class RealTimeMonitor {
  constructor() {
    this.apiKey = process.env.TRON_API_KEY || '938245e0-1ec6-486a-a4ea-6a1ff0e8170b';
    this.telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    this.telegramChatId = process.env.TELEGRAM_CHAT_ID;
    this.monitorFile = path.join(__dirname, 'realtime_monitor_state.json');
    this.checkInterval = 5000; // Tăng thời gian kiểm tra lên 5 giây để tiết kiệm tài nguyên
    this.intervals = new Map(); // Lưu các interval theo địa chỉ
  }

  async sendTelegramNotification(message, address) {
    if (!this.telegramBotToken || !this.telegramChatId) {
      console.log(`[${address}] ⚠️ Không có cấu hình Telegram, chỉ hiển thị trên terminal:`);
      console.log(message);
      return;
    }

    try {
      const url = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;
      const response = await axios.post(url, {
        chat_id: this.telegramChatId,
        text: message,
        parse_mode: 'Markdown'
      }, {
        timeout: 3000
      });

      console.log(`[${address}] ✅ Thông báo Telegram đã gửi thành công`);
    } catch (error) {
      console.error(`[${address}] ❌ Lỗi khi gửi thông báo Telegram:`, error.message);
      // Fallback: hiển thị trên terminal
      console.log(`[${address}] FALLBACK - Nội dung thông báo:`);
      console.log(message);
    }
  }

  async getWalletData(address) {
    try {
      const url = `https://api.tronscan.org/api/account?address=${address}`;
      
      const response = await axios.get(url, {
        headers: {
          'TRON-PRO-API-KEY': this.apiKey,
          'User-Agent': 'Mozilla/5.0 (compatible; RealTimeMonitor/1.0)'
        },
        timeout: 5000
      });
      
      const data = response.data;
      
      if (data && data.code === 404) {
        throw new Error('Địa chỉ ví không tồn tại');
      }
      
      // Trích xuất số dư
      const balanceData = {
        address: address,
        trxBalance: data.balance ? (data.balance / 1000000).toFixed(8) : '0.00000000',
        tokens: {},
        lastChecked: new Date().toISOString()
      };
      
      // Trích xuất các token TRC20
      if (data.trc20token_balances && data.trc20token_balances.length > 0) {
        for (const token of data.trc20token_balances) {
          let formattedBalance = parseFloat(token.balance).toFixed(8);
          
          balanceData.tokens[token.tokenAbbr] = {
            name: token.tokenName,
            balance: formattedBalance,
            tokenId: token.tokenId
          };
        }
      }
      
      return balanceData;
    } catch (error) {
      console.error(`[${address}] Lỗi khi lấy dữ liệu ví:`, error.message);
      throw error;
    }
  }

  async getRelatedAddresses(address, tokenSymbol) {
    try {
      // Lấy lịch sử giao dịch gần đây cho token cụ thể
      const historyUrl = `https://api.tronscan.org/api/transfer/trc20?relatedAddress=${address}&limit=20&start=0&sort=-timestamp`;
      const historyResponse = await axios.get(historyUrl, {
        headers: {
          'TRON-PRO-API-KEY': this.apiKey,
          'User-Agent': 'Mozilla/5.0 (compatible; RealTimeMonitor/1.0)'
        },
        timeout: 5000
      });

      const historyData = historyResponse.data;

      if (historyData && historyData.transfers) {
        // Lọc các giao dịch cho token cụ thể
        const tokenTransfers = historyData.transfers.filter(transfer => 
          transfer.tokenAbbr === tokenSymbol || transfer.tokenName.includes('Tether USD')
        );

        if (tokenTransfers.length > 0) {
          // Tìm giao dịch gần nhất phù hợp với thời điểm thay đổi số dư
          const now = Date.now();
          const fourHoursAgo = now - (4 * 60 * 60 * 1000); // 4 tiếng trước để mở rộng phạm vi tìm kiếm
          
          for (const transfer of tokenTransfers) {
            // Chuyển địa chỉ về dạng lowercase để so sánh chính xác
            const transferTo = transfer.to ? transfer.to.toLowerCase() : '';
            const transferFrom = transfer.from ? transfer.from.toLowerCase() : '';
            const addressLower = address.toLowerCase();
            
            const transferTime = transfer.block_ts;
            
            // Kiểm tra xem giao dịch có trong khoảng thời gian gần đây không
            if (transferTime >= fourHoursAgo) {
              if (transferTo === addressLower) {
                // Đây là giao dịch nhận
                return {
                  receivedFrom: transferFrom,
                  sentTo: null,
                  transactionId: transfer.transaction_id,
                  amount: transfer.amount,
                  timestamp: new Date(transfer.block_ts).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
                };
              } else if (transferFrom === addressLower) {
                // Đây là giao dịch gửi
                return {
                  receivedFrom: null,
                  sentTo: transferTo,
                  transactionId: transfer.transaction_id,
                  amount: transfer.amount,
                  timestamp: new Date(transfer.block_ts).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
                };
              }
            }
          }
          
          // Nếu không tìm thấy trong 4 tiếng gần nhất, chọn giao dịch gần nhất
          const latestTransfer = tokenTransfers[0];
          if (latestTransfer) {
            const transferTo = latestTransfer.to ? latestTransfer.to.toLowerCase() : '';
            const transferFrom = latestTransfer.from ? latestTransfer.from.toLowerCase() : '';
            const addressLower = address.toLowerCase();
            
            if (transferTo === addressLower) {
              // Đây là giao dịch nhận
              return {
                receivedFrom: transferFrom,
                sentTo: null,
                transactionId: latestTransfer.transaction_id,
                amount: latestTransfer.amount,
                timestamp: new Date(latestTransfer.block_ts).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
              };
            } else if (transferFrom === addressLower) {
              // Đây là giao dịch gửi
              return {
                receivedFrom: null,
                sentTo: transferTo,
                transactionId: latestTransfer.transaction_id,
                amount: latestTransfer.amount,
                timestamp: new Date(latestTransfer.block_ts).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
              };
            }
          }
        }
      }

      return { receivedFrom: null, sentTo: null };
    } catch (error) {
      // Không in lỗi để tăng tốc, chỉ trả về giá trị mặc định
      return { receivedFrom: null, sentTo: null };
    }
  }

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

  async loadMonitorState() {
    try {
      const data = await fs.readFile(this.monitorFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // Nếu file không tồn tại, trả về trạng thái mặc định
      return {};
    }
  }

  async saveMonitorState(state) {
    try {
      await fs.writeFile(this.monitorFile, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Lỗi khi lưu trạng thái theo dõi:', error.message);
    }
  }

  async checkForChanges(address) {
    try {
      // Lấy dữ liệu hiện tại
      const currentData = await this.getWalletData(address);
      
      // Tải trạng thái trước đó
      const prevState = await this.loadMonitorState();
      const prevData = prevState[address];
      
      const changes = [];
      
      // Chỉ so sánh USDT (bỏ qua TRX và các token khác)
      if (prevData) {
        // Kiểm tra xem có USDT trong ví hiện tại không
        const currentUsdtData = currentData.tokens['USDT'];
        
        if (currentUsdtData) {
          // Lấy dữ liệu USDT trước đó nếu có
          const prevUsdt = prevData.tokens && prevData.tokens['USDT'];
          
          if (prevUsdt) {
            // So sánh số dư USDT hiện tại với trước đó
            if (parseFloat(prevUsdt.balance) !== parseFloat(currentUsdtData.balance)) {
              const prevValue = parseFloat(prevUsdt.balance);
              const currValue = parseFloat(currentUsdtData.balance);
              const change = currValue - prevValue;
              
              // Lấy thông tin giao dịch gần đây để xác định địa chỉ liên quan
              const relatedAddresses = await this.getRelatedAddresses(address, 'USDT');
              
              changes.push({
                type: 'USDT',
                previous: parseFloat(prevUsdt.balance).toFixed(8),
                current: parseFloat(currentUsdtData.balance).toFixed(8),
                change: parseFloat(change).toFixed(8),
                direction: change > 0 ? 'TĂNG' : 'GIẢM',
                name: currentUsdtData.name,
                relatedAddresses: relatedAddresses
              });
            }
          } else {
            // USDT mới xuất hiện trong ví
            changes.push({
              type: 'USDT',
              previous: '0.00000000',
              current: parseFloat(currentUsdtData.balance).toFixed(8),
              change: parseFloat(currentUsdtData.balance).toFixed(8),
              direction: 'MỚI',
              name: currentUsdtData.name,
              relatedAddresses: { receivedFrom: null, sentTo: null }
            });
          }
        }
        
        // Kiểm tra xem USDT có bị mất không (trước có, giờ không có)
        const prevUsdtCheck = prevData.tokens && prevData.tokens['USDT'];
        if (prevUsdtCheck && !currentData.tokens['USDT']) {
          changes.push({
            type: 'USDT',
            previous: parseFloat(prevUsdtCheck.balance).toFixed(8),
            current: '0.00000000',
            change: parseFloat(prevUsdtCheck.balance).toFixed(8),
            direction: 'MẤT',
            name: prevUsdtCheck.name
          });
        }
      }
      
      // Cập nhật trạng thái mới
      prevState[address] = currentData;
      await this.saveMonitorState(prevState);
      
      // Gửi thông báo nếu có thay đổi
      if (changes.length > 0) {
        console.log(`[${address}] 📢 CÓ BIẾN ĐỘNG NGAY LẬP TỨC!`);
        
        // Gửi thông báo Telegram
        const notificationMessage = this.formatNotification(changes, address);
        await this.sendTelegramNotification(notificationMessage, address);
      }
      
      return changes;
    } catch (error) {
      console.error(`[${address}] ❌ Lỗi khi kiểm tra biến động:`, error.message);
    }
  }

  async startRealTimeMonitoring(address) {
    console.log(`[${address}] 🚀 BẮT ĐẦU CHẾ ĐỘ THEO DÕI THỜI GIAN THỰC`);
    console.log(`[${address}] ⏱️  Kiểm tra mỗi ${this.checkInterval}ms`);
    console.log(`[${address}] 🛑 Nhấn Ctrl+C để dừng theo dõi\n`);
    
    // Kiểm tra ngay lập tức
    await this.checkForChanges(address);
    
    // Thiết lập interval kiểm tra liên tục
    const interval = setInterval(async () => {
      await this.checkForChanges(address);
    }, this.checkInterval);
    
    // Lưu interval để có thể dừng lại sau
    this.intervals.set(address, interval);
    
    console.log(`[${address}] ✅ Đang chạy ở chế độ standby, theo dõi liên tục...`);
    
    return interval;
  }

  async stopMonitoring(address) {
    const interval = this.intervals.get(address);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(address);
      console.log(`[${address}] 🛑 Dừng theo dõi thành công`);
    }
  }

  async startMultipleAddresses(addresses) {
    console.log(`🚀 BẮT ĐẦU THEO DÕI ${addresses.length} ĐỊA CHỈ Ở CHẾ ĐỘ THỜI GIAN THỰC`);
    console.log(`⏱️  Kiểm tra mỗi ${this.checkInterval}ms cho mỗi địa chỉ`);
    console.log(`🛑 Nhấn Ctrl+C để dừng tất cả theo dõi\n`);
    
    const intervals = [];
    
    for (const address of addresses) {
      console.log(`\n[${address}] Đang khởi động...`);
      
      // Kiểm tra ngay lập tức
      await this.checkForChanges(address);
      
      // Thiết lập interval kiểm tra liên tục
      const interval = setInterval(async () => {
        await this.checkForChanges(address);
      }, this.checkInterval);
      
      // Lưu interval
      this.intervals.set(address, interval);
      intervals.push(interval);
      
      console.log(`[${address}] ✅ Đang chạy ở chế độ standby, theo dõi liên tục...`);
    }
    
    // Dừng khi nhận tín hiệu SIGINT (Ctrl+C)
    process.on('SIGINT', async () => {
      console.log('\n🛑 ĐANG DỪNG TẤT CẢ CÁC CHẾ ĐỘ THEO DÕI...');
      
      for (const [addr, interval] of this.intervals) {
        clearInterval(interval);
        console.log(`[${addr}] ✅ Dừng theo dõi`);
      }
      
      this.intervals.clear();
      process.exit(0);
    });
    
    return intervals;
  }
}

// Main execution
async function main() {
  const monitor = new RealTimeMonitor();
  
  // Lấy địa chỉ từ tham số dòng lệnh
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🎯 Usage:');
    console.log('  node realtime_monitor_optimized.js <address>                    # Theo dõi 1 địa chỉ');
    console.log('  node realtime_monitor_optimized.js <address1> <address2> ...   # Theo dõi nhiều địa chỉ');
    console.log('\n🔐 Để nhận thông báo Telegram:');
    console.log('  1. Thêm BOT_TOKEN và CHAT_ID vào file .env');
    console.log('  2. BOT_TOKEN: Token từ @BotFather');
    console.log('  3. CHAT_ID: ID cuộc trò chuyện Telegram của bạn');
    process.exit(1);
  }
  
  const addresses = args;
  
  if (addresses.length === 1) {
    // Theo dõi 1 địa chỉ
    await monitor.startRealTimeMonitoring(addresses[0]);
  } else {
    // Theo dõi nhiều địa chỉ
    await monitor.startMultipleAddresses(addresses);
  }
}

// Chạy chương trình
main().catch(console.error);