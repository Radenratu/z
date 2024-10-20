const fs = require('fs');

let idData = [];

try {
  idData = JSON.parse(fs.readFileSync('./id.json', 'utf8'));
} catch (e) {
  fs.writeFileSync('./id.json', '[]');
}

module.exports = {
  config: {
    name: "uid",
    aliases: [],
    version: "1",
    author: "Edinst",
    countDown: 5,
    role: 0,
    description: {
      en: "Dapatkan ID pengguna"
    },
    category: "utility",
    guide: {
      en: {
        examples: ["{pn} atau balas ke pesan"]
      }
    }
  },
  onStart: async function ({ args, api, event }) {
    if (!args[0]) {
      if (event.messageReply) {
        const userData = idData.find(data => data.uid === event.messageReply.senderID);
        api.sendMessage(`Uid dia adalah: ${event.messageReply.senderID}\nId dia: ${userData ? userData.id : 'Tidak ditemukan'}`, event.threadID, event.messageID);
      } else {
        const userData = idData.find(data => data.uid === event.senderID);
        api.sendMessage(`Uid Anda adalah: ${event.senderID}\nId anda: ${userData ? userData.id : 'Tidak ditemukan'}`, event.threadID, event.messageID);
      }
    } else {
      api.sendMessage("Penggunaan tidak valid!", event.threadID, event.messageID);
    }
  },
  onChat: async function ({ args, api, event }) {
    const uid = event.senderID;
    let idData = JSON.parse(fs.readFileSync('./id.json', 'utf8'));
    const existingUser = idData.find(data => data.uid === uid);
    if (!existingUser) {
      const newId = idData.length + 1;
      idData.push({ uid, id: newId });
      fs.writeFileSync('./id.json', JSON.stringify(idData, null, 2));
    }
  }
};