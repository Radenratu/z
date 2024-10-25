const axios = require('axios');
const { retry } = require('axios-retry');
const Jimp = require("jimp")
axios.create({
  retry: 3,
  retryDelay: axios.exponentialDelay,
  shouldRetry: (error) => {
    return axios.isNetworkOrIdempotentRequestError(error) || error.response.status >= 500;
  },
});
module.exports = {
  config: {
    name: "emojimix",
    aliases: ["emojimix", "mixemoji"],
    version: "1.0",
    author: "Edinst",
    countDown: 5,
    role: 0,
    description: {
      en: "Menggabungkan dua emoji untuk menghasilkan gambar emoji baru."
    },
    category: "Emoji",
    guide: {
      en: "Usage: .emojimix (emoji1) (emoji2)"
    }
  },

  /**
   * Fungsi utama yang dijalankan saat command dipanggil.
   * @param {Object} param0 - Parameter yang diterima.
   * @param {Object} param0.message - Objek pesan.
   * @param {Array} param0.args - Argumen yang diberikan oleh pengguna.
   */
  onStart: async function ({ message, args }) {
    try {
      // Validasi jumlah argumen
      if (args.length < 2) {
        return message.reply("❌ **Cara Penggunaan:** `.emojimix (emoji1) (emoji2)`");
      }

      const [emoji1, emoji2] = args;

      /**
       * Fungsi untuk mendapatkan URL gambar emoji menggunakan CDN jsDelivr.
       * @param {string} emoji - Emoji yang ingin diproses.
       * @returns {string} - URL gambar emoji.
       */
      const getEmojiURL = (emoji) => {
        // Mengonversi emoji menjadi kode poin Unicode
        const codePoints = [...emoji]
          .map(c => c.codePointAt(0).toString(16))
          .join('-');
        // URL CDN jsDelivr untuk Twemoji
        return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${codePoints}.png`;
      };

      const url1 = getEmojiURL(emoji1);
      const url2 = getEmojiURL(emoji2);

      // Unduh gambar emoji dengan penanganan retry
      const [response1, response2] = await Promise.all([
        axios.get(url1, { responseType: 'arraybuffer' }),
        axios.get(url2, { responseType: 'arraybuffer' })
      ]);

      // Periksa apakah kedua gambar berhasil diunduh
      if (response1.status !== 200 || response2.status !== 200) {
        return message.reply("❌ Salah satu atau kedua emoji tidak valid atau tidak tersedia.");
      }

      // Baca gambar menggunakan Jimp
      const image1 = await new Jimp(response1.data);
      const image2 = await new Jimp(response2.data);

      // Tentukan ukuran kanvas berdasarkan ukuran emoji
      const width = Math.max(image1.bitmap.width, image2.bitmap.width);
      const height = image1.bitmap.height + image2.bitmap.height;

      // Buat kanvas baru dengan latar belakang putih
      const canvas = new Jimp(width, height, 0xFFFFFFFF);

      // Gabungkan gambar pertama dan kedua ke kanvas
      canvas.composite(image1, 0, 0);
      canvas.composite(image2, 0, image1.bitmap.height);

      // Konversi kanvas menjadi buffer PNG
      const buffer = await canvas.getBufferAsync(Jimp.MIME_PNG);

      // Kirim gambar hasil penggabungan
      message.reply({
        body: `✨ Hasil penggabungan ${emoji1} dan ${emoji2}`,
        attachment: buffer
      });

    } catch (error) {
      console.error(error);
      // Cek jenis error untuk memberikan pesan yang lebih spesifik
      if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
        message.reply("❌ Terjadi masalah jaringan saat mengakses CDN gambar emoji. Silakan coba lagi nanti.");
      } else {
        message.reply(`❌ Terjadi kesalahan saat memproses permintaan Anda: ${error}`);
      }
    }
  }
};