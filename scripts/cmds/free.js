const moment = require("moment-timezone");
const fs = require("fs");

module.exports = {
  config: {
    name: "freegift",
    aliases: ["free", "gift"],
    version: "1.2",
    author: "Edinst",
    countDown: 5,
    role: 0,
    description: {
      en: "Mendapatkan hadiah"
    },
    category: "game",
    guide: {
      en: "{pn}"
    }
  },
  langs: {
    en: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
      alreadyReceived: "Kamu sudah menerima hadiah, kembali lagi besok",
      received: "Kamu mendapatkan %1$"
    }
  },
  onStart: async function ({ args, message, event, envCommands, commandName, getLang, usersData }) {
    const senderID = event.senderID;
    const dailyData = fs.existsSync("daily.json") ? JSON.parse(fs.readFileSync("daily.json", "utf8")) : {};
    const today = moment.tz("Asia/Jakarta").format("YYYY-MM-DD");

    if (!dailyData[senderID] || dailyData[senderID].lastDaily !== today) {
      const randomAmount = Math.floor(Math.random() * 11) + 10; 
      dailyData[senderID] = {
        lastDaily: today
      };
      fs.writeFileSync("daily.json", JSON.stringify(dailyData, null, 2));
      
usersData.addMoney(senderID, randomAmount);
      message.reply(getLang("received", randomAmount, 0));
    } else {
      message.reply(getLang("alreadyReceived"));
    }
  }
}