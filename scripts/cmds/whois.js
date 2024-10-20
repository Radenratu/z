const fs = require('fs');

module.exports = {
  config: {
    name: "whois",
    aliases: ["wi"],
    version: "1",
    author: "Edinst",
    countDown: 5,
    role: 0,
    description: { en: "Get user information" },
    category: "utility",
    guide: { en: {} },
  },

  langs: {
    en: {},
  },

  onStart: async function ({ message, usersData, api, event, args }) {
    try {
      const id = args[0];
      if (!id) {
        api.sendMessage("Please provide a user ID", event.threadID, event.messageID);
        return;
      }

      let idJson;
      try {
        const idJsonContent = await fs.promises.readFile('./id.json', 'utf8');
        idJson = JSON.parse(idJsonContent);
      } catch (error) {
        console.error(`Error reading id.json: ${error}`);
        api.sendMessage(`Error reading id.json: ${error}`, event.threadID, event.messageID);
        return;
      }

      const idDataEntry = idJson.find(data => data.id === parseInt(id));
      if (!idDataEntry) {
        api.sendMessage(`User not found: ${id}`, event.threadID, event.messageID);
        return;
      }

      const targetUid = idDataEntry.uid;

      const userData = await usersData.get(targetUid);
      if (!userData) {
        api.sendMessage(`User not found: ${targetUid}`, event.threadID, event.messageID);
        return;
      }

      let nickJson;
      try {
        const nickJsonContent = await fs.promises.readFile('./nick.json', 'utf8');
        nickJson = JSON.parse(nickJsonContent);
      } catch (error) {
        console.error(`Error reading nick.json: ${error}`);
        api.sendMessage(`Error reading nick.json: ${error}`, event.threadID, event.messageID);
        return;
      }

      const userName = nickJson.find(data => data.uid === targetUid)?.Nickname || userData.name;

      const money = userData.money;
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

      const messageToSend = `Ini status ${userName} tuan: \n\nuserName: ${userName}\nUang: ${money}\nExp: ${exp}\nUid: ${targetUid}\nId: ${id}\nLevel: ${level}\nTitle: ${title}`;
      api.sendMessage(messageToSend, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage(`terjadi masalah saat menjalankan cmd: ${error}`, event.threadID, event.messageID);
    }
  },
};