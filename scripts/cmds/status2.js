const fs = require('fs');
const { createCanvas } = require('canvas'); // Import modul canvas
const path = require('path'); // Import modul path untuk mengelola path file

let idData = [];

try {
  idData = JSON.parse(fs.readFileSync('./id.json', 'utf8'));
} catch (e) {
  fs.writeFileSync('./id.json', '[]');
}

module.exports = {
  config: {
    name: "status2",
    aliases: ["s"],
    version: "1",
    author: "Edinst",
    countDown: 5,
    role: 0,
    description: { en: "Check your profile status" },
    category: "Profile",
    guide: { en: {} },
  },

  langs: {
    en: {},
  },

  onStart: async function ({ message, usersData, api, event, args }) {
    try {
      // Retrieve ID and user data
      idData = JSON.parse(fs.readFileSync('./id.json', 'utf8'));
      const idDataEntry = idData.find(data => data.uid === event.senderID);
      if (!idDataEntry) {
        console.error(`No ID found for UID ${event.senderID}`);
        return;
      }

      const userData = await usersData.get(event.senderID);
      
      // Get nickname or default to username
      let nickData;
      try {
        const jsonContent = await fs.promises.readFile('./nick.json', 'utf8');
        nickData = JSON.parse(jsonContent);
      } catch (error) {
        console.error(`Error reading nick.json: ${error}`);
        nickData = [];
      }
      const userName = nickData.find(data => data.uid === event.senderID)?.Nickname || userData.name;

      // User financial and experience data
      const money = userData.money.toFixed(2);
      const exp = userData.exp;

      // Calculate level and progress bar
      let level = 1;
      let nextLevelExp = 100;
      let title = "";
      while (exp >= nextLevelExp) {
        level++;
        nextLevelExp += 100;
      }

      const levelProgress = exp % 100;
      const progressBar = `${'▮'.repeat(levelProgress / 10)}${'▯'.repeat(10 - levelProgress / 10)}`;

      if (level < 20) {
        title = "Newbie";
      } else if (level < 30) {
        title = "Player";
      } else if (level < 60) {
        title = "Regular";
      } else {
        title = "Veteran";
      }

      // Create canvas and draw user information
      const width = 700;
      const height = 400;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#2C2F33';
      ctx.fillRect(0, 0, width, height);

      // Draw border
      ctx.strokeStyle = '#7289DA';
      ctx.lineWidth = 10;
      ctx.strokeRect(0, 0, width, height);

      // Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px Sans';
      ctx.fillText('Profile Status', 20, 40);

      // Username
      ctx.font = '24px Sans';
      ctx.fillText(`Name: ${userName}`, 20, 100);

      // Money
      ctx.fillText(`Balance: $${money}`, 20, 140);

      // UID
      ctx.fillText(`UID: ${event.senderID}`, 20, 180);

      // Level and Title
      ctx.fillText(`Level: ${level} - ${title}`, 20, 220);

      // Experience Bar
      ctx.fillText(`EXP: ${exp}/${nextLevelExp}`, 20, 260);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(20, 280, 660, 30); // Background of progress bar
      ctx.fillStyle = '#7289DA';
      ctx.fillRect(20, 280, (660 * levelProgress) / 100, 30); // Fill progress based on EXP

      // Save the canvas image to a temporary location
      const tempFilePath = path.join(__dirname, 'status.png'); // Save to the current directory
      const buffer = canvas.toBuffer();
      fs.writeFileSync(tempFilePath, buffer);

      // Send the saved image
      api.sendMessage({ 
        body: 'Here is your profile status!',
        attachment: fs.createReadStream(tempFilePath)
      }, event.threadID, event.messageID);

    } catch (error) {
      console.error(error);
      api.sendMessage(`Error running command: ${error}`, event.threadID, event.messageID);
    }
  },
};