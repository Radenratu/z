const axios = require('axios');

module.exports = {
  config: {
    name: "g",
    aliases: ["image", "gambar"],
    version: "1",
    author: "Edinst",
    countDown: 5,
    role: 0,
    description: { en: "Mencari gambar" },
    guide: { 
        en: "{pn} (nama gambar) - (jumlah gambar)"
    },
    category: "tools"
  },

  onStart: async function ({ message, api, event, args }) {
    const input = args.join(" ");
    const [queryPart, numberPart] = input.split("-").map(part => part.trim());
    const query = queryPart || "";
    let number = parseInt(numberPart) || 5;

    if (!query) {
      return api.sendMessage("Silakan masukkan query pencarian untuk gambar.\nContoh penggunaan: `.img sunset - 5`", event.threadID, event.messageID);
    }

    if (isNaN(number) || number < 1) number = 5;
    if (number > 10) number = 10;

    async function searchImages(query, limit = 5) {
      const url = 'https://api.openverse.engineering/v1/images/';
      const params = {
        q: query,
        page_size: limit,
      };

      try {
        const { data } = await axios.get(url, { params });
        const images = data.results.map(image => image.url);
        return images;
      } catch (error) {
        console.error('Error searching images:', error);
        return [];
      }
    }

    async function downloadImage(url) {
      try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary');
      } catch (error) {
        console.error(`Error downloading image from ${url}:`, error);
        return null;
      }
    }

    api.sendMessage(`🔍 Mencari gambar untuk "${query}" dengan jumlah ${number}...`, event.threadID, async (err, info) => {
      if (err) {
        console.error('Error sending initial message:', err);
        return;
      }

      const images = await searchImages(query, number);

      if (images.length === 0) {
        return api.sendMessage(`❌ Tidak ditemukan gambar untuk "${query}". Silakan coba kata kunci lain.`, event.threadID, info.messageID);
      }

      const attachments = [];
      for (const url of images) {
        const buffer = await downloadImage(url);
        if (buffer) {
          attachments.push(buffer);
        }
      }

      if (attachments.length === 0) {
        return api.sendMessage(`❌ Gagal mendownload gambar untuk "${query}".`, event.threadID, info.messageID);
      }

      const imageLinks = images.map((img, index) => `${index + 1}. ${img}`).join("\n");
      const replyMsg = `📸 **Hasil Pencarian untuk "${query}":**\n${imageLinks}`;

      return api.sendMessage({
        body: replyMsg,
        attachment: attachments
      }, event.threadID, info.messageID);
    });
  }
};