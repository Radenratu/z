const fs = require('fs');
const path = './bank.json';

function getBankData(userId) {
  if (!fs.existsSync(path)) fs.writeFileSync(path, '{}');
  const bankData = JSON.parse(fs.readFileSync(path, 'utf-8'));
  return bankData[userId] || { balance: 0, lastInterest: 0, username: null };
}

function updateBankData(userId, data) {
  const bankData = JSON.parse(fs.readFileSync(path, 'utf-8'));
  bankData[userId] = data;
  fs.writeFileSync(path, JSON.stringify(bankData, null, 2));
}

module.exports = {
  config: {
    name: "bank",
    aliases: [],
    version: "1",
    author: "Edinst",
    countDown: 5,
    role: 0,
    description: { en: "Bank system" },
    category: "finance"
  },

  onStart: async function ({ message, args, event, usersData }) {
    const userId = event.senderID;
    const bankData = getBankData(userId);
const c = await usersData.get(userId);
    const userBalance = c.money;
    const currentTime = Date.now();

    switch (args[0]) {
      case 'deposit': {
        const amount = parseInt(args[1]);
        if (!amount || amount <= 0) return message.reply("Jumlah deposit tidak valid.");
        if (userBalance < amount) return message.reply("Saldo tidak cukup untuk deposit.");

        await userData.addMoney(userId, -amount);
        bankData.balance += amount;
        updateBankData(userId, bankData);
        return message.reply(`Berhasil deposit ${amount}.\nSaldo bank sekarang: ${bankData.balance}`);
      }

      case 'tf': {
        const recipientName = args[1];
        const amount = parseInt(args[2]);
        if (!recipientName || !amount || amount <= 0) return message.reply("Format transfer salah. Gunakan:\nbank tf (nama user) (jumlah).");

        const recipientId = Object.keys(JSON.parse(fs.readFileSync(path, 'utf-8'))).find(id => getBankData(id).username === recipientName);
        if (!recipientId) return message.reply("Pengguna tidak ditemukan.");

        if (bankData.balance < amount) return message.reply("Saldo bank tidak cukup untuk transfer.");

        bankData.balance -= amount;
        const recipientData = getBankData(recipientId);
        recipientData.balance += amount;
        updateBankData(userId, bankData);
        updateBankData(recipientId, recipientData);
        return message.reply(`Berhasil mentransfer uang:

Jumlah: ${amount} 
Pengguna: ${recipientName}.`);
      }

      case 'bunga': {
        const oneDay = 24 * 60 * 60 * 1000;
        if (currentTime - bankData.lastInterest < oneDay) {
          return message.reply("Kamu hanya bisa mengambil bunga sekali dalam sehari.");
        }

        const interest = bankData.balance * 0.05;
        bankData.balance += interest;
        bankData.lastInterest = currentTime;
        updateBankData(userId, bankData);
        return message.reply(`Kamu telah menerima bunga sebesar ${interest}. Saldo bank sekarang: ${bankData.balance}`);
      }

      case 'cek': {
        return message.reply(`Saldo bankmu saat ini:\n${bankData.balance}`);
      }

      case 'create': {
        const username = args.slice(1).join(' ');
        if (!username || username.split(' ').length > 5) return message.reply("Masukkan nama pengguna yang valid (maksimal 5 kata).");
        if (bankData.username) return message.reply("Kamu sudah memiliki akun bank.");

        bankData.username = username;
        bankData.balance = 0;
        updateBankData(userId, bankData);
        return message.reply(`Akun bank berhasil dibuat dengan nama: \n${username}.`);
      }

      default: {
        return message.reply("Perintah tidak dikenal, Gunakan: \n\ndeposit, tf, bunga, cek, atau create.");
      }
    }
  }
};