const fs = require('fs');

module.exports = {
  config: {
    name: "setn",
    aliases: ["setnick"],
    version: "1",
    author: "Edinst",
    countDown: 100,
    role: 0,
    description: { en: "Set nickname" },
    category: "tester cmd",
    guide: { en: {} },
  },

  langs: {
    en: {},
  },

  onStart: async function ({ message, usersData, api, event, args }) {
    try {
      if (args.length < 1) {
        api.sendMessage("Cara penggunaannya: setn (nickname)", event.threadID, event.messageID);
        return;
      }

      const uid = event.senderID;
      const nick = args.join(" ");

      if (nick.length > 15) {
api.sendMessage("Nickname maksimal 15 karakter!", event.threadID, event.messageID);
        return;
      }

      const balance = await usersData.get(event.senderID);
      if (balance.money < 5) {
        api.sendMessage("Uang anda tidak cukup, kumpulkan 5$ dulu.", event.threadID, event.messageID);
        return;
      }

      balance.money -= 5;
      await usersData.set(event.senderID, balance);

      let nickData;
      try {
        const jsonContent = await fs.promises.readFile('./nick.json', 'utf8');
        nickData = JSON.parse(jsonContent);
      } catch (error) {
        console.error(`Error reading nick.json: ${error}`);
        nickData = [];
      }

      const existingEntry = nickData.find(data => data.uid === uid);
      if (existingEntry) {
        existingEntry.Nickname = nick;
      } else {
        nickData.push({ uid, Nickname: nick });
      }

      fs.writeFileSync('./nick.json', JSON.stringify(nickData, null, 2));

      api.sendMessage(`Nickname berhasil di set menjadi ${nick}!.`, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage(`Terjadi masalah saat menjalankan cmd: ${error}`, event.threadID, event.messageID);
    }
  },
};