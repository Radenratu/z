const axios = require('axios');
const stream = require('stream');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);

module.exports = {
  config: {
    name: "img",
    aliases: ["gambar"],
    version: "1.0.0",
    author: "Edinst",
    countDown: 5,
    role: 0,
    description: {
      en: "Mencari dan mengambil gambar tanpa memerlukan API key."
    },
    category: "Image"
  },

  onStart: async function ({ message, api, event }) {
    const args = event.body.trim().split(/ +/).slice(1);
    if (args.length === 0) {
      return api.sendMessage("❗ Mohon berikan kata kunci pencarian.\n\nPenggunaan: `.img [nama gambar] -[jumlah gambar (max 5)]`", event.threadID, event.messageID);
    }

    let query = [];
    let number = 1;
    args.forEach(arg => {
      if (arg.startsWith('-')) {
        const num = parseInt(arg.slice(1));
        if (!isNaN(num) && num > 0 && num <= 5) {
          number = num;
        }
      } else {
        query.push(arg);
      }
    });

    const searchQuery = query.join(' ');
    if (!searchQuery) {
      return api.sendMessage("❗ Mohon berikan kata kunci pencarian yang valid.\n\nPenggunaan: `.img [nama gambar] -[jumlah gambar (max 5)]`", event.threadID, event.messageID);
    }

    api.sendMessage(`🔍 Mencari "${searchQuery}" dan mengambil ${number} gambar...`, event.threadID, event.messageID);

    try {
      const response = await axios.get('https://api.openverse.engineering/v1/images/', {
        params: {
          q: searchQuery,
          page_size: number
        },
        headers: {
          'Accept': 'application/json'
        }
      });

      const results = response.data.results;
      if (!results || results.length === 0) {
        return api.sendMessage("❗ Tidak ada gambar ditemukan untuk pencarian Anda.", event.threadID, event.messageID);
      }

      for (const img of results) {
        const imgUrl = img.url;
        if (imgUrl) {
          api.sendMessage({
            body: `📷 Gambar untuk "${searchQuery}"`,
            attachment: await downloadImage(imgUrl)
          }, event.threadID);
        }
      }

    } catch (error) {
      console.error(error);
      api.sendMessage(`❗ Terjadi kesalahan saat mencari gambar. Silakan coba lagi nanti: ${error}`, event.threadID, event.messageID);
    }
  }
};

async function downloadImage(url) {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  });
  const passThrough = new stream.PassThrough();
  pipeline(response.data, passThrough).catch(err => console.error(err));
  return passThrough;
}