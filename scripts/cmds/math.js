const axios = require('axios');

module.exports = {
  config: {
    name: "math",
    version: "1.1",
    countDown: 10,
    role: 0,
    category: "MEDIA",
    description: "hitung eksperesi matematik",
    author: "Hady Zen",
    guide: { id: "{pn} <soal>\n+: tambah, -: kurang, *: kali, /: bagi" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    try { 
      const { gender, name } = await usersData.get(event.senderID);
      const names = name.split(" ")[0];
      let kelamin = "";
      if (gender == 1) { 
        kelamin += "-chan";
      } else if (gender == 2) { 
        kelamin += "-kun";
      } 
      const soal = args.join(' ');
      if (!soal) {
        return message.reply('Apaan anj?.')
      }
      const jumlah = await axios.get(`http://api.mathjs.org/v4/?expr=${encodeURIComponent(soal)}`);
      const hasil = jumlah.data;
      if (hasil && jumlah.data) { 
        return message.reply(`${soal} = ${hasil}`);
      } else {
        message.reply('Udah otak tolol, tukang typo pula')
      }
    } catch (error) {
      message.reply('Error: ' + error);
    }
  }
};