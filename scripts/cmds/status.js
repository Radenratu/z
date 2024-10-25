const fs = require('fs');

let idData = [];

try {
  idData = JSON.parse(fs.readFileSync('./id.json', 'utf8'));
} catch (e) {
  fs.writeFileSync('./id.json', '[]');
}

module.exports = {
  config: {
    name: "status",
    aliases: ["s"],
    version: "1",
    author: "Edinst",
    countDown: 5,
    role: 0,
    description: { en: "Cmd percobaan" },
    category: "tester cmd",
    guide: { en: {} },
  },

  langs: {
    en: {},
  },

  onStart: async function ({ message, usersData, api, event, args }) {
    let idDataEntry;
    try {
      idData = JSON.parse(fs.readFileSync('./id.json', 'utf8'));
      idDataEntry = idData.find(data => data.uid === event.senderID);
      if (!idDataEntry) {
        console.error(`No ID found for UID ${event.senderID}`);
        return;
      }
      const userData = await usersData.get(event.senderID);
      let nickData;
      try {
        const jsonContent = await fs.promises.readFile('./nick.json', 'utf8');
        nickData = JSON.parse(jsonContent);
      } catch (error) {
        if (error instanceof SyntaxError) {
          console.error(`Error parsing nick.json: ${error}`);
          nickData = [];
        } else {
          console.error(`Error reading nick.json: ${error}`);
          nickData = [];
        }
      }

      const userName = nickData.find(data => data.uid === event.senderID)?.Nickname || userData.name;

      const money = userData.money.toFixed(2);
      const exp = userData.exp;
      let level = 1;
      let nextLevelExp = 100;
      let title = "";

      while (exp >= nextLevelExp) {
        level++;
        nextLevelExp += 100;
      }

      if (level < 20) {
        title = "Pemula";
      } else if (level < 30) {
        title = "Pemain";
      } else if (level < 60) {
        title = "pemain tetap";
      } else {
        title = "Veteran";
      }

      const messageToSend = `Ini status mu tuan: \n\nuserName: ${userName}\nUang: ${money}\nExp: ${exp}\nUid: ${event.senderID}\nId: ${idDataEntry.id}\nLevel: ${level}\nTitle: ${title}`;
      api.sendMessage(messageToSend, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage(`terjadi masalah saat menjalankan cmd: ${error}`, event.threadID, event.messageID);
    }
  },
};