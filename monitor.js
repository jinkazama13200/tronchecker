require('dotenv').config();
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class TronBalanceMonitor {
  constructor() {
    this.apiKey = process.env.TRON_API_KEY || '938245e0-1ec6-486a-a4ea-6a1ff0e8170b';
    this.monitorFile = path.join(__dirname, 'monitor_state.json');
  }

  async getWalletData(address) {
    try {
      const url = `https://api.tronscan.org/api/account?address=${address}`;
      
      const response = await axios.get(url, {
        headers: {
          'TRON-PRO-API-KEY': this.apiKey,
          'User-Agent': 'Mozilla/5.0 (compatible; TRONMonitor/1.0)'
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
          balanceData.tokens[token.tokenAbbr] = {
            name: token.tokenName,
            balance: parseFloat(token.balance).toFixed(8),
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
      // Lấy lịch sử giao dịch gần đây cho token cụ thể
      const historyUrl = `https://api.tronscan.org/api/transfer/trc20?relatedAddress=${address}&limit=10&start=0&sort=-timestamp`;
      const historyResponse = await axios.get(historyUrl, {
        headers: {
          'TRON-PRO-API-KEY': this.apiKey,
          'User-Agent': 'Mozilla/5.0 (compatible; TRONMonitor/1.0)'
        },
        timeout: 10000
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
              timestamp: new Date(latestTransfer.block_ts).toLocaleString('vi-VN')
            };
          } else if (latestTransfer.from === address.toLowerCase()) {
            // Đây là giao dịch gửi
            return {
              receivedFrom: null,
              sentTo: latestTransfer.to,
              transactionId: latestTransfer.transaction_id,
              amount: latestTransfer.amount,
              timestamp: new Date(latestTransfer.block_ts).toLocaleString('vi-VN')
            };
          }
        }
      }

      return { receivedFrom: null, sentTo: null };
    } catch (error) {
      console.error('Lỗi khi lấy thông tin giao dịch liên quan:', error.message);
      return { receivedFrom: null, sentTo: null };
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
              const change = parseFloat(tokenData.balance) - parseFloat(prevToken.balance);
              
              // Lấy thông tin giao dịch gần đây để xác định địa chỉ liên quan
              const relatedAddresses = await this.getRelatedAddresses(address, tokenSymbol);
              
              changes.push({
                type: tokenSymbol,
                previous: parseFloat(prevToken.balance).toFixed(8),
                current: parseFloat(tokenData.balance).toFixed(8),
                change: parseFloat(change).toFixed(8),
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
      
      // Hiển thị các thay đổi nếu có
      if (changes.length > 0) {
        console.log('\n📢 CÓ BIẾN ĐỘNG:');
        for (const change of changes) {
          if (change.direction === 'TĂNG' || change.direction === 'GIẢM') {
            const changeSign = parseFloat(change.change) > 0 ? '+' : '';
            console.log(`   📈 ${change.type} ${change.direction}: ${change.previous} → ${change.current} (${changeSign}${change.change})`);
            
            if (change.relatedAddresses) {
              if (change.relatedAddresses.receivedFrom) {
                console.log(`      📥 Từ: ${change.relatedAddresses.receivedFrom.substring(0, 12)}...`);
                console.log(`         Thời gian: ${change.relatedAddresses.timestamp}`);
                console.log(`         Giao dịch: ${change.relatedAddresses.transactionId.substring(0, 12)}...`);
              } else if (change.relatedAddresses.sentTo) {
                console.log(`      📤 Tới: ${change.relatedAddresses.sentTo.substring(0, 12)}...`);
                console.log(`         Thời gian: ${change.relatedAddresses.timestamp}`);
                console.log(`         Giao dịch: ${change.relatedAddresses.transactionId.substring(0, 12)}...`);
              }
            }
          } else if (change.direction === 'MỚI') {
            console.log(`   🆕 ${change.type} MỚI: ${change.current}`);
          } else if (change.direction === 'MẤT') {
            console.log(`   ❌ ${change.type} MẤT: ${change.previous} → 0.00000000`);
          }
        }
        
        // Gửi thông báo (trong phiên bản này, chỉ in ra console)
        this.sendNotification(changes, address);
      } else {
        console.log('\n✅ Không có biến động số dư');
      }
      
      console.log('');
      
      return changes;
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra biến động:', error.message);
      return [];
    }
  }

  sendNotification(changes, address) {
    console.log(`🔔 THÔNG BÁO BIẾN ĐỘNG CHO ${address}:`);
    for (const change of changes) {
      if (change.direction === 'TĂNG' || change.direction === 'GIẢM') {
        console.log(`   • ${change.type} ${change.direction}: ${change.change > 0 ? '+' : ''}${change.change}`);
      } else if (change.direction === 'MỚI') {
        console.log(`   • ${change.type} MỚI: ${change.current}`);
      } else if (change.direction === 'MẤT') {
        console.log(`   • ${change.type} MẤT: ${change.previous} → 0`);
      }
    }
    console.log('');
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
  const monitor = new TronBalanceMonitor();
  
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
    console.log('   Thêm số phút để đặt интервал (mặc định 5): node monitor.js [địa chỉ] [phút] --monitor');
  }
}

// Chạy chương trình
main().catch(console.error);