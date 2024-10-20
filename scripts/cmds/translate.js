const axios = require('axios');

module.exports = {
  config: {
    name: "translate",
    aliases: ["tr"],
    version: "1",
    author: "Edinst",
    countDown: 5,
    role: 0,
    description: { en: "Terjemahkan teks dari satu bahasa ke bahasa lain" },
    category: "utilitas",
    guide: {
      id: {
        usage: "{pn} (bahasa) (teks)",
        example: "{pn} id Halo, dunia!"
      }
    }
  },

  langs: {
    id: {}
  },

  onStart: async function ({ message, event }) {
    const args = event.body.split(" ");
    if (args.length < 3) {
      return message.reply("Penggunaan yang tidak valid! Silakan gunakan `tr (bahasa) (teks)`");
    }

    const lang = args[1];
    const text = args.slice(2).join(" ");

    try {
      const response = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`);
      const translation = response.data.sentences[0].trans;

      return message.reply(`Teks terjemahan: ${translation}`);
    } catch (error) {
      return message.reply("Error terjemahan teks!");
    }
  }
};