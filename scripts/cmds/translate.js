const axios = require('axios');

module.exports = {
  config: {
    name: "translate",
    aliases: ["tr", "trans"],
    version: "1",
    author: "Edinst",
    countDown: 5,
    role: 0,
    description: { en: "Terjemahkan teks dari satu bahasa ke bahasa lain" },
    category: "utilitas",
    guide: {
      en: {
        usage: "{pn} (bahasa) (teks)",
        example: "{pn} id Halo, dunia!"
      }
    }
  },

  onStart: async function ({ message, event }) {
    const args = event.body.split(" ");
    if (args.length < 3) {
      return message.reply("Penggunaan yang tidak valid! Silakan gunakan `tr (bahasa) (teks)`");
    }

    const lang = args[1];
    const text = args.slice(2).join(" ");

    try {
     const c = await global.utils.translateAPI(text, lang);
const axios = require('axios');
const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${text}`);
    const l = res.data[2];

      return message.reply(`Teks terjemahan:\n${c}\n\n(${l} > ${lang})`);
    } catch (error) {
      return message.reply("Error terjemahan teks!");
    }
  }
};