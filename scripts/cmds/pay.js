const fs = require('fs');

let idJson = JSON.parse(fs.readFileSync('id.json', 'utf8'));

module.exports = {
  config: {
    name: "pay",
    aliases: ["p"],
    version: "1",
    author: "Edinst",
    countDown: 5,
    role: 0,
    description: { en: "Mengirim uang ke pengguna lain" },
    category: "economy",
    guide: { en: "Contoh penggunaan: `{p}pay (id) (jumlah uang)`" },
  },

  onStart: async function ({ message, api, args, event, usersData }) {
    const id = args[0];
    const amountString = args[1];

    if (id.length < 1) return message.reply("Format salah! Contoh penggunaan: `pay <id user> <jumlah uang>`");

    const foundId = idJson.find((item) => item.id === parseInt(id));
    if (!foundId) return message.reply("ID tidak ditemukan!");

    const uid = foundId.uid;
    const amount = parseFloat(amountString);

    if (isNaN(amount) || amount <= 0) return message.reply("Jumlah uang harus berupa angka positif!");

    if (uid === event.senderID) return message.reply("Tidak bisa mengirim uang ke diri sendiri!");

    const senderData = await usersData.get(event.senderID);
    if (senderData.money < amount) return message.reply("Saldo Anda tidak cukup!");

    const recipientData = await usersData.get(uid);
    if (!recipientData) return message.reply("Pengguna tidak ditemukan!");

    const tax = Math.floor(amount * 0.20);
    const netAmount = amount - tax;

    senderData.money = parseFloat((senderData.money - amount).toFixed(3));
    await usersData.set(event.senderID, senderData);

    recipientData.money = parseFloat((recipientData.money + netAmount).toFixed(3));
    await usersData.set(uid, recipientData);

    const senderName = (await usersData.get(event.senderID)).name;
    const uName = (await usersData.get(uid)).name;

    api.sendMessage(`Kamu telah menerima ${netAmount.toFixed(2)}$ dari ${senderName}!`, uid);
    message.reply(`Anda mengirim ${amount.toFixed(2)}$ ke ${uName}! (Pajak: ${tax.toFixed(2)}$)`);
  },
};