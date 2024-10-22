const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Function to upload MP3 to anonfiles and get the shareable link
const uploadToAnonFiles = async (filePath) => {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const response = await axios.post('https://api.anonfiles.com/upload', form, {
      headers: form.getHeaders(),
    });

    if (response.data.status) {
      return response.data.data.file.url.full;
    } else {
      throw new Error('Upload failed');
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Error uploading file.');
  }
};

module.exports = {
  config: {
    name: "mp3link",
    aliases: ["m2l"],
    version: "1.0",
    author: "Edinst",
    countDown: 5,
    role: 0,
    description: {
      en: "Upload MP3 and generate a shareable link using anonfiles."
    },
    category: "utility",
    guide: {
      en: "mp3link <file>"
    }
  },

  onStart: async function ({ message, event, args }) {
    if (event.attachments.length === 0 || event.attachments[0].type !== 'audio') {
      message.reply("Silakan kirim file MP3 yang ingin diubah menjadi link.");
      return;
    }

    const audioAttachment = event.attachments[0];
    const filePath = path.join(__dirname, 'temp', `${audioAttachment.name}`);

    // Download the MP3 file locally
    const stream = await global.utils.getStreamFromURL(audioAttachment.url);
    stream.pipe(fs.createWriteStream(filePath));

    stream.on('finish', async () => {
      try {
        const link = await uploadToAnonFiles(filePath);
        message.reply(`Berikut link MP3 kamu: ${link}`);
        fs.unlinkSync(filePath); // Delete the local file after upload
      } catch (error) {
        message.reply('Terjadi kesalahan saat mengunggah MP3.');
      }
    });

    stream.on('error', (error) => {
      console.error('Error downloading MP3:', error);
      message.reply('Gagal mendownload file MP3.');
    });
  }
};