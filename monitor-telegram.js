require('dotenv').config();
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class TronBalanceMonitorWithTelegram {
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
          'User-Agent': 'Mozilla/5.0 (compatible; SuperFastTRONMonitor/1.0)'
        },
        timeout: 8000  // Giảm timeout để tăng tốc
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

  async saveMonitorState(state) {
    try {
      await fs.writeFile(this.monitorFile, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Lỗi khi lưu trạng thái theo dõi:', error.message);
    }
  }

  async getRelatedAddresses(address, tokenSymbol) {
    try {
      // Lấy lịch sử giao dịch gần đây cho token cụ thể (siêu nhanh)
      const historyUrl = `https://api.tronscan.org/api/transfer/trc20?relatedAddress=${address}&limit=3&start=0&sort=-timestamp`;
      const historyResponse = await axios.get(historyUrl, {
        headers: {
          'TRON-PRO-API-KEY': this.apiKey,
          'User-Agent': 'Mozilla/5.0 (compatible; SuperFastTRONMonitor/1.0)'
        },
        timeout: 3000  // Siêu giảm timeout để tăng tốc
      });

      const historyData = historyResponse.data;

      if (historyData && historyData.transfers) {
        // Lọc các giao dịch cho token cụ thể
        const tokenTransfers = historyData.transfers.filter(transfer => 
          transfer.tokenAbbr === tokenSymbol || transfer.tokenName.includes('Tether USD')
        );

        if (tokenTransfers.length > 0) {
          const latestTransfer = tokenTransfers[0]; // Giao dịch gần nhất
          
          if (latestTransfer.to === address.toLowerCase()) {
            // Đây là giao dịch nhận
            return {
              receivedFrom: latestTransfer.from,
              sentTo: null,
              transactionId: latestTransfer.transaction_id,
              amount: latestTransfer.amount,
              timestamp: new Date(latestTransfer.block_ts).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
            };
          } else if (latestTransfer.from === address.toLowerCase()) {
            // Đây là giao dịch gửi
            return {
              receivedFrom: null,
              sentTo: latestTransfer.to,
              transactionId: latestTransfer.transaction_id,
              amount: latestTransfer.amount,
              timestamp: new Date(latestTransfer.block_ts).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
            };
          }
        }
      }

      return { receivedFrom: null, sentTo: null };
    } catch (error) {
      // Không in lỗi để tăng tốc, chỉ trả về giá trị mặc định
      return { receivedFrom: null, sentTo: null };
    }
  }

  formatNotification(changes, address) {
    let message = `🚨 *THÔNG BÁO BIẾN ĐỘNG SỐ DƯ*\n\n`;
    
    for (const change of changes) {
      if (change.direction === 'TĂNG') {
        message += `📥 *Địa chỉ nhận:* \`${address}\`\n`;
        message += `📤 *Địa chỉ chuyển:* \`${change.relatedAddresses?.receivedFrom.substring(0, 12) || 'N/A'}...\`\n`;
        message += `📊 *Số dư biến động:* +${change.change}\n`;
        message += `💰 *Số dư hiện tại:* ${change.current}\n`;
        message += `⏰ *Thời gian:* ${change.relatedAddresses?.timestamp || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\n\n`;
      } else if (change.direction === 'GIẢM') {
        message += `📤 *Địa chỉ nhận:* \`${change.relatedAddresses?.sentTo.substring(0, 12) || 'N/A'}...\`\n`;
        message += `📥 *Địa chỉ chuyển:* \`${address}\`\n`;
        message += `📊 *Số dư biến động:* -${change.change}\n`;
        message += `💰 *Số dư hiện tại:* ${change.current}\n`;
        message += `⏰ *Thời gian:* ${change.relatedAddresses?.timestamp || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\n\n`;
      } else if (change.direction === 'MỚI') {
        message += `🆕 *Loại token:* ${change.type}\n`;
        message += `💰 *Số dư hiện tại:* ${change.current}\n`;
        message += `⏰ *Thời gian:* ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\n\n`;
      } else if (change.direction === 'MẤT') {
        message += `❌ *Loại token:* ${change.type}\n`;
        message += `📊 *Số dư biến động:* -${change.previous}\n`;
        message += `💰 *Số dư hiện tại:* 0.00000000\n`;
        message += `⏰ *Thời gian:* ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\n\n`;
      }
    }
    
    message += `📍 *Địa chỉ ví:* \`${address}\``;
    
    return message;
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
        const prevTrxBalance = parseFloat(prevData.trxBalance);
        const currentTrxBalance = parseFloat(currentData.trxBalance);
        
        if (prevTrxBalance !== currentTrxBalance) {
          const change = currentTrxBalance - prevTrxBalance;
          changes.push({
            type: 'TRX',
            previous: parseFloat(prevTrxBalance).toFixed(8),
            current: parseFloat(currentTrxBalance).toFixed(8),
            change: parseFloat(change).toFixed(8),
            direction: change > 0 ? 'TĂNG' : 'GIẢM'
          });
        }
        
        // So sánh các token
        for (const [tokenSymbol, tokenData] of Object.entries(currentData.tokens)) {
          const prevToken = prevData.tokens && prevData.tokens[tokenSymbol];
          
          if (prevToken) {
            if (parseFloat(prevToken.balance) !== parseFloat(tokenData.balance)) {
              const prevValue = parseFloat(prevToken.balance);
              const currValue = parseFloat(tokenData.balance);
              const change = currValue - prevValue;
              
              // Định dạng lại giá trị nếu là USDT
              let formattedPrevious = parseFloat(prevToken.balance).toFixed(8);
              let formattedCurrent = parseFloat(tokenData.balance).toFixed(8);
              let formattedChange = Math.abs(change).toFixed(8); // Luôn lấy giá trị tuyệt đối để hiển thị
              
              if (tokenSymbol === 'USDT' || tokenData.name.includes('Tether USD')) {
                // Định dạng lại chỉ với 5 chữ số đầu tiên
                const prevStr = prevToken.balance.toString();
                const prevDotIndex = prevStr.indexOf('.');
                const prevWholePartStr = prevDotIndex > 0 ? prevStr.substring(0, prevDotIndex) : prevStr;
                const prevTruncated = prevWholePartStr.length > 5 ? prevWholePartStr.substring(0, 5) : prevWholePartStr;
                
                const currStr = tokenData.balance.toString();
                const currDotIndex = currStr.indexOf('.');
                const currWholePartStr = currDotIndex > 0 ? currStr.substring(0, currDotIndex) : currStr;
                const currTruncated = currWholePartStr.length > 5 ? currWholePartStr.substring(0, 5) : currWholePartStr;
                
                const changeStr = Math.abs(change).toString(); // Luôn dùng giá trị tuyệt đối
                const changeDotIndex = changeStr.indexOf('.');
                const changeWholePartStr = changeDotIndex > 0 ? changeStr.substring(0, changeDotIndex) : changeStr;
                const changeTruncated = changeWholePartStr.length > 5 ? changeWholePartStr.substring(0, 5) : changeWholePartStr;
                
                formattedPrevious = prevTruncated + '.00000000';
                formattedCurrent = currTruncated + '.00000000';
                formattedChange = changeTruncated + '.00000000';
              }
              
              // Lấy thông tin giao dịch gần đây để xác định địa chỉ liên quan
              const relatedAddresses = await this.getRelatedAddresses(address, tokenSymbol);
              
              changes.push({
                type: tokenSymbol,
                previous: formattedPrevious,
                current: formattedCurrent,
                change: formattedChange,
                direction: change > 0 ? 'TĂNG' : 'GIẢM',
                name: tokenData.name,
                relatedAddresses: relatedAddresses
              });
            }
          } else {
            // Token mới xuất hiện
            changes.push({
              type: tokenSymbol,
              previous: '0.00000000',
              current: parseFloat(tokenData.balance).toFixed(8),
              change: parseFloat(tokenData.balance).toFixed(8),
              direction: 'MỚI',
              name: tokenData.name,
              relatedAddresses: { receivedFrom: null, sentTo: null }
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
                current: 0,
                change: -tokenData.balance,
                direction: 'MẤT',
                name: tokenData.name
              });
            }
          }
        }
      }
      
      // Cập nhật trạng thái mới
      prevState[address] = currentData;
      await this.saveMonitorState(prevState);
      
      // Hiển thị kết quả
      console.log(`✅ Kiểm tra hoàn tất cho: ${address}`);
      console.log(`💰 TRX: ${parseFloat(currentData.trxBalance).toFixed(8)} TRX`);
      
      if (Object.keys(currentData.tokens).length > 0) {
        console.log('🪙 Các token:');
        for (const [symbol, token] of Object.entries(currentData.tokens)) {
          console.log(`   - ${symbol} (${token.name}): ${token.balance}`);
        }
      } else {
        console.log('   Không có token TRC20 nào');
      }
      
      // Hiển thị và gửi thông báo nếu có thay đổi
      if (changes.length > 0) {
        console.log('\n📢 CÓ BIẾN ĐỘNG:');
        for (const change of changes) {
          if (change.direction === 'TĂNG' || change.direction === 'GIẢM') {
            const changeSign = parseFloat(change.change) > 0 ? '+' : '';
            console.log(`   📈 ${change.type} ${change.direction}: ${change.previous} → ${change.current} (${changeSign}${change.change})`);
          } else if (change.direction === 'MỚI') {
            console.log(`   🆕 ${change.type} MỚI: ${change.current}`);
          } else if (change.direction === 'MẤT') {
            console.log(`   ❌ ${change.type} MẤT: ${change.previous} → 0.00000000`);
          }
        }
        
        // Gửi thông báo Telegram
        const notificationMessage = this.formatNotification(changes, address);
        await this.sendTelegramNotification(notificationMessage);
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

  async startMonitoring(address, intervalMinutes = 5) {
    console.log(`🚀 Bắt đầu theo dõi biến động cho: ${address}`);
    console.log(`⏱️  Интервал: ${intervalMinutes} phút`);
    console.log('Ấn Ctrl+C để dừng theo dõi\n');
    
    // Kiểm tra ngay lập tức
    await this.checkForChanges(address);
    
    // Sau đó kiểm tra định kỳ
    const interval = setInterval(async () => {
      await this.checkForChanges(address);
    }, intervalMinutes * 60 * 1000);
    
    // Dừng khi nhận tín hiệu SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      console.log('\n🛑 Dừng theo dõi...');
      clearInterval(interval);
      process.exit(0);
    });
  }
}

// Main execution
async function main() {
  const monitor = new TronBalanceMonitorWithTelegram();
  
  // Lấy địa chỉ từ tham số dòng lệnh hoặc sử dụng mặc định
  const address = process.argv[2] || 'TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU';
  const interval = parseInt(process.argv[3]) || 5; // Mặc định 5 phút
  
  if (process.argv.includes('--once') || process.argv.includes('-o')) {
    // Chỉ kiểm tra một lần
    await monitor.checkForChanges(address);
  } else if (process.argv.includes('--monitor') || process.argv.includes('-m')) {
    // Chế độ theo dõi liên tục
    await monitor.startMonitoring(address, interval);
  } else {
    // Kiểm tra một lần và hiển thị cách sử dụng
    await monitor.checkForChanges(address);
    console.log('💡 Gợi ý:');
    console.log('   --once, -o: Kiểm tra một lần');
    console.log('   --monitor, -m: Theo dõi liên tục');
    console.log('   Thêm số phút để đặt интервал (mặc định 5): node monitor-telegram.js [địa chỉ] [phút] --monitor');
    console.log('');
    console.log('🔐 Để nhận thông báo Telegram:');
    console.log('   1. Thêm BOT_TOKEN và CHAT_ID vào file .env');
    console.log('   2. BOT_TOKEN: Token từ @BotFather');
    console.log('   3. CHAT_ID: ID cuộc trò chuyện Telegram của bạn');
  }
}

// Chạy chương trình
main().catch(console.error);