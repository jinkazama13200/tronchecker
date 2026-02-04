require('dotenv').config();
const axios = require('axios');

async function checkUSDTBalance() {
  const address = 'TQtRKmheCo6tSe725NtywzHiXqqs3LMdxU';
  const apiKey = process.env.TRON_API_KEY || '938245e0-1ec6-486a-a4ea-6a1ff0e8170b';
  
  console.log('🔍 Đang kiểm tra số dư USDT cho địa chỉ:', address);
  console.log('');
  
  try {
    // Sử dụng API của TronScan với API key
    const url = `https://api.tronscan.org/api/account?address=${address}`;
    
    const response = await axios.get(url, {
      headers: {
        'TRON-PRO-API-KEY': apiKey,
        'User-Agent': 'Mozilla/5.0 (compatible; USDTChecker/1.0)'
      },
      timeout: 15000
    });
    
    const data = response.data;
    
    if (data && data.code === 404) {
      console.log('❌ Địa chỉ ví không tồn tại hoặc chưa có hoạt động');
      return;
    }
    
    console.log('✅ Địa chỉ ví tồn tại');
    console.log('');
    
    // Hiển thị số dư TRX
    if (data.balance !== undefined) {
      const trxBalance = (data.balance / 1000000).toFixed(8);
      console.log(`💰 Số dư TRX: ${trxBalance} TRX`);
    }
    
    // Kiểm tra token TRC20
    if (data.trc20token_balances && data.trc20token_balances.length > 0) {
      console.log('');
      console.log('🪙 Số dư các token TRC20:');
      
      let hasUSDT = false;
      for (const token of data.trc20token_balances) {
        // Kiểm tra nếu là USDT (Tether USD)
        if (token.tokenName === 'Tether USD' || token.tokenAbbr === 'USDT') {
          console.log(`✅ USDT: ${parseFloat(token.balance).toFixed(8)} USDT (Token ID: ${token.tokenId})`);
          hasUSDT = true;
        } else {
          console.log(`🟨 ${token.tokenName} (${token.tokenAbbr}): ${parseFloat(token.balance).toFixed(8)}`);
        }
      }
      
      if (!hasUSDT) {
        console.log('❌ Không tìm thấy USDT trong ví');
      }
    } else {
      console.log('');
      console.log('❌ Không có token TRC20 nào trong ví');
    }
    
    // Kiểm tra lịch sử giao dịch USDT
    console.log('');
    console.log('🔄 Kiểm tra lịch sử giao dịch USDT...');
    
    const historyUrl = `https://api.tronscan.org/api/transfer/trc20?relatedAddress=${address}&limit=10&start=0`;
    const historyResponse = await axios.get(historyUrl, {
      headers: {
        'TRON-PRO-API-KEY': apiKey,
        'User-Agent': 'Mozilla/5.0 (compatible; USDTChecker/1.0)'
      },
      timeout: 15000
    });
    
    const historyData = historyResponse.data;
    
    if (historyData && historyData.transfers && historyData.transfers.length > 0) {
      let usdtTransfers = 0;
      for (const transfer of historyData.transfers) {
        if (transfer.tokenName === 'Tether USD' || transfer.tokenAbbr === 'USDT') {
          const direction = transfer.to === address.toLowerCase() ? '📥 Nhận' : '📤 Gửi';
          console.log(`${direction} ${transfer.amount} USDT vào ${new Date(transfer.block_ts).toLocaleString()}`);
          usdtTransfers++;
        }
      }
      
      if (usdtTransfers === 0) {
        console.log('Không có giao dịch USDT nào được ghi nhận');
      }
    } else {
      console.log('Không có giao dịch token nào được ghi nhận');
    }
    
  } catch (error) {
    console.log('❌ Lỗi khi kiểm tra số dư:', error.message);
    
    if (error.response) {
      console.log('Mã lỗi:', error.response.status);
      if (error.response.status === 401) {
        console.log('Nguyên nhân: API key không hợp lệ');
      } else if (error.response.status === 429) {
        console.log('Nguyên nhân: Quá nhiều yêu cầu (rate limit)');
      } else if (error.response.status === 404) {
        console.log('Nguyên nhân: Không tìm thấy dữ liệu');
      }
    }
  }
}

// Chạy hàm kiểm tra
checkUSDTBalance();