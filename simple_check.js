#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class SimpleMonitor {
  constructor() {
    this.apiKey = process.env.TRON_API_KEY || '938245e0-1ec6-486a-a4ea-6a1ff0e8170b';
    this.telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    this.telegramChatId = process.env.TELEGRAM_CHAT_ID;
    this.monitorFile = path.join(__dirname, 'monitor_state.json');
  }

  async sendTelegramNotification(message) {
    if (!this.telegramBotToken || !this.telegramChatId) {
      console.log('⚠️ Không có cấu hình Telegram, chỉ hiển thị trên terminal:');
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
        timeout: 10000
      });

      console.log('✅ Thông báo Telegram đã gửi thành công');
    } catch (error) {
      console.error('❌ Lỗi khi gửi thông báo Telegram:', error.message);
      // Fallback: hiển thị trên terminal
      console.log('FALLBACK - Nội dung thông báo:');
      console.log(message);
    }
  }

  async getWalletData(address) {
    try {
      const url = `https://api.tronscan.org/api/account?address=${address}`;
      
      const response = await axios.get(url, {
        headers: {
          'TRON-PRO-API-KEY': this.apiKey,
          'User-Agent': 'Mozilla/5.0 (compatible; SimpleMonitor/1.0)'
        },
        timeout: 15000
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
          
          // Nếu là USDT, định dạng lại chỉ với 5 chữ số đầu tiên
          if (token.tokenAbbr === 'USDT' || token.tokenName.includes('Tether USD')) {
            const strValue = token.balance.toString();
            const dotIndex = strValue.indexOf('.');
            const wholePartStr = dotIndex > 0 ? strValue.substring(0, dotIndex) : strValue;
            
            // Lấy 5 chữ số đầu tiên của phần nguyên
            const truncatedWhole = wholePartStr.length > 5 ? wholePartStr.substring(0, 5) : wholePartStr;
            formattedBalance = truncatedWhole + '.00000000';
          }
          
          balanceData.tokens[token.tokenAbbr] = {
            name: token.tokenName,
            balance: formattedBalance,
            tokenId: token.tokenId
          };
        }
      }
      
      return balanceData;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu ví:', error.message);
      throw error;
    }
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

  async checkForChanges(address) {
    try {
      console.log(`🔍 Đang kiểm tra số dư cho: ${address}`);
      
      // Lấy dữ liệu hiện tại
      const currentData = await this.getWalletData(address);
      
      // Tải trạng thái trước đó
      const prevState = await this.loadMonitorState();
      const prevData = prevState[address];
      
      const changes = [];
      
      // So sánh số dư TRX
      if (prevData) {
        if (prevData.trxBalance !== currentData.trxBalance) {
          changes.push({
            type: 'TRX',
            previous: prevData.trxBalance,
            current: currentData.trxBalance,
            direction: 'THAY ĐỔI'
          });
        }
        
        // So sánh các token
        for (const [tokenSymbol, tokenData] of Object.entries(currentData.tokens)) {
          const prevToken = prevData.tokens && prevData.tokens[tokenSymbol];
          
          if (prevToken) {
            if (prevToken.balance !== tokenData.balance) {
              changes.push({
                type: tokenSymbol,
                previous: prevToken.balance,
                current: tokenData.balance,
                direction: 'THAY ĐỔI',
                name: tokenData.name
              });
            }
          } else {
            // Token mới xuất hiện
            changes.push({
              type: tokenSymbol,
              previous: '0.00000000',
              current: tokenData.balance,
              direction: 'MỚI',
              name: tokenData.name
            });
          }
        }
        
        // Kiểm tra token bị mất
        if (prevData.tokens) {
          for (const [tokenSymbol, tokenData] of Object.entries(prevData.tokens)) {
            if (!currentData.tokens[tokenSymbol]) {
              changes.push({
                type: tokenSymbol,
                previous: tokenData.balance,
                current: '0.00000000',
                direction: 'MẤT',
                name: tokenData.name
              });
            }
          }
        }
      }
      
      // Cập nhật trạng thái mới
      prevState[address] = currentData;
      await fs.writeFile(this.monitorFile, JSON.stringify(prevState, null, 2));
      
      // Hiển thị kết quả
      console.log(`✅ Kiểm tra hoàn tất cho: ${address}`);
      console.log(`💰 TRX: ${currentData.trxBalance} TRX`);
      
      if (Object.keys(currentData.tokens).length > 0) {
        console.log('🪙 Các token:');
        for (const [symbol, token] of Object.entries(currentData.tokens)) {
          console.log(`   - ${symbol} (${token.name}): ${token.balance}`);
        }
      } else {
        console.log('   Không có token TRC20 nào');
      }
      
      // Gửi thông báo nếu có thay đổi
      if (changes.length > 0) {
        console.log('\n📢 CÓ BIẾN ĐỘNG:');
        for (const change of changes) {
          if (change.direction === 'THAY ĐỔI') {
            console.log(`   🔄 ${change.type} thay đổi: ${change.previous} → ${change.current}`);
          } else if (change.direction === 'MỚI') {
            console.log(`   🆕 ${change.type} MỚI: ${change.current}`);
          } else if (change.direction === 'MẤT') {
            console.log(`   ❌ ${change.type} MẤT: ${change.previous} → ${change.current}`);
          }
        }
        
        // Gửi thông báo Telegram
        await this.sendNotification(changes, address);
      } else {
        console.log('\n✅ Không có biến động số dư');
      }
      
      console.log('');
      
      return changes;
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra biến động:', error.message);
      
      // Gửi thông báo lỗi qua Telegram nếu có
      const errorMessage = `🚨 *LỖI KIỂM TRA BIẾN ĐỘNG*\n\n` +
        `📍 *Địa chỉ ví:* \`${address}\`\n` +
        `❌ *Lỗi:* ${error.message}\n` +
        `⏰ *Thời gian:* ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`;
      
      await this.sendTelegramNotification(errorMessage);
      return [];
    }
  }

  async sendNotification(changes, address) {
    let message = `┌─ 🚨 *CÓ BIẾN ĐỘNG SỐ DƯ*\n`;
    message += `├─ 📍 *Địa chỉ ví:* \`${address}\`\n`;
    message += `└─────────────────────────────────────\n\n`;
    
    for (const change of changes) {
      if (change.direction === 'THAY ĐỔI') {
        message += `┌─ 🔄 *${change.type}* thay đổi\n`;
        message += `├─ *Trước:* ${change.previous}\n`;
        message += `└─ *Hiện tại:* ${change.current}\n\n`;
      } else if (change.direction === 'MỚI') {
        message += `┌─ 🆕 *${change.type}* mới\n`;
        message += `└─ *Số lượng:* ${change.current}\n\n`;
      } else if (change.direction === 'MẤT') {
        message += `┌─ ❌ *${change.type}* mất\n`;
        message += `├─ *Trước:* ${change.previous}\n`;
        message += `└─ *Hiện tại:* ${change.current}\n\n`;
      }
    }
    
    message += `⏰ *Thời gian:* ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`;
    
    await this.sendTelegramNotification(message);
  }
}

// Main execution
async function main() {
  const monitor = new SimpleMonitor();
  
  // Lấy địa chỉ từ tham số dòng lệnh hoặc sử dụng mặc định
  const address = process.argv[2] || 'TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU';
  
  // Kiểm tra một lần và gửi thông báo nếu có thay đổi
  await monitor.checkForChanges(address);
}

// Chạy chương trình
main().catch(console.error);