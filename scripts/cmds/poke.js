const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Lokasi penyimpanan data pengguna
const pokedataPath = path.join(__dirname, 'pokedata.json');

// Fungsi untuk membaca data Pokemon dari file
const readPokeData = () => {
  if (!fs.existsSync(pokedataPath)) {
    fs.writeFileSync(pokedataPath, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(pokedataPath, 'utf8'));
};

// Fungsi untuk menulis data Pokemon ke file
const writePokeData = (data) => {
  fs.writeFileSync(pokedataPath, JSON.stringify(data, null, 2));
};

// Fungsi untuk memilih kartu secara acak berdasarkan rarity
const getRandomCard = (cards) => {
  const rarityWeight = {
    "Common": 50,
    "Uncommon": 30,
    "Rare": 15,
    "Rare Holo": 4,
    "Legendary": 1,
    "Mythic": 0.5
  };

  const weightedCards = [];
  for (const card of cards) {
    const weight = rarityWeight[card.rarity] || 1;
    for (let i = 0; i < weight; i++) {
      weightedCards.push(card);
    }
  }
  const randomIndex = Math.floor(Math.random() * weightedCards.length);
  return weightedCards[randomIndex];
};

module.exports = {
  config: {
    name: "poke",
    aliases: ["pokemon", "pk"],
    version: "1.0",
    author: "Edinst",
    countDown: 50,
    role: 0,
    description: {
      en: "Gacha Pokémon TCG."
    },
    category: "gacha",
    guide: {
      en: "coming soon"
    }
  },

  onStart: async function ({ message, usersData, event, args, getLang }) {
    const command = args[0];
    const userId = event.senderID;
    const userName = (usersData.get(userId) && usersData.get(userId).name) || "Unknown";
    const pokeData = readPokeData();
    const userPokeData = pokeData.filter(poke => poke.Uid === userId);

    try {
      const response = await axios.get('https://api.pokemontcg.io/v2/cards', {
        headers: {
          'X-Api-Key': 'ce5686bc-2b7e-4dcc-b92b-0819a72ec4bc'
        }
      });

      const cards = response.data.data;

      // Menangani perintah berdasarkan command
      if (command === "pull") {
        const currentBalance = await usersData.get(event.senderID);
        if (currentBalance.money < 10) {
          message.reply("Uang kamu tidak cukup untuk melakukan pull (biaya $10).");
          return;
        }

        usersData.addMoney(userId, -10);

        const randomCard = getRandomCard(cards);
        const cardName = randomCard.name;
        const cardRarity = randomCard.rarity;
        const cardImage = randomCard.images.large;

        const newEntry = {
          Nama: cardName,
          Rarity: cardRarity,
          Image: cardImage,
          Username: userName,
          Uid: userId,
          Page: userPokeData.length + 1
        };

        pokeData.push(newEntry);
        writePokeData(pokeData);
        
        message.reply({
          body: `Kamu mendapatkan ${cardName} (${cardRarity})`,
          attachment: await axios.get(cardImage, { responseType: 'stream' }).then(res => res.data)
        });

      } else if (command === "sell") {
        const pokemonName = args.slice(1).join(" ").toLowerCase();
        const pokemonIndex = userPokeData.findIndex(pokemon => pokemon.Nama.toLowerCase() === pokemonName);

        if (pokemonIndex === -1) {
          message.reply(`Kamu tidak memiliki Pokémon bernama: ${pokemonName}.`);
          return;
        }

        const soldPokemon = userPokeData[pokemonIndex];
        const pokeDataIndex = pokeData.findIndex(poke => poke.Uid === userId && poke.Nama.toLowerCase() === pokemonName);

        if (pokeDataIndex !== -1) {
          pokeData.splice(pokeDataIndex, 1);
        }

        let min, max;
        switch (soldPokemon.Rarity) {
          case "Common":
            min = 1;
            max = 5;
            break;
          case "Uncommon":
            min = 5;
            max = 10;
            break;
          case "Rare":
            min = 10;
            max = 15;
            break;
          case "Rare Holo":
            min = 15;
            max = 20;
            break;
          case "Legendary":
            min = 20;
            max = 25;
            break;
          case "Mythic":
            min = 25;
            max = 30;
            break;
          default:
            min = 1;
            max = 5;
        }

        const earnedMoney = Math.floor(Math.random() * (max - min + 1)) + min;
        usersData.addMoney(event.senderID, earnedMoney);
        writePokeData(pokeData);

        message.reply(`Kamu telah menjual ${soldPokemon.Nama} (${soldPokemon.Rarity}) dan mendapatkan: ${earnedMoney}$.`);

      } else if (command === "show") {
        const pokemonName = args.slice(1).join(" ");
        const pokemon = userPokeData.find(pokemon => pokemon.Nama.toLowerCase() === pokemonName.toLowerCase());

        if (!pokemon) {
          message.reply(`Kamu tidak memiliki Pokémon bernama "${pokemonName}".`);
          return;
        }

        // Fetching the card details again untuk mendapatkan info tambahan
        const cardDetails = cards.find(card => card.name.toLowerCase() === pokemon.Nama.toLowerCase());

        if (cardDetails) {
          const infoMessage = 
            `${cardDetails.name}\n\n• Rarity: ${cardDetails.rarity || "N/A"}\n• Tipe: ${cardDetails.types ? cardDetails.types.join(", ") : "N/A"}\n• Deskripsi: ${cardDetails.text || "N/A"}\n• Attack: ${cardDetails.attacks ? cardDetails.attacks.map(a => a.name).join(", ") : "N/A"}\n• Defense: ${cardDetails.weaknesses ? cardDetails.weaknesses.map(w => w.type).join(", ") : "N/A"}`;
          
          message.reply(infoMessage);
          message.reply({ body: '', attachment: `${cardDetails.images.large}` });
        } else {
          message.reply(`Informasi lengkap untuk Pokémon "${pokemonName}" tidak tersedia.`);
        }

      } else if (command === "info") {
        const currentBalance = await usersData.get(event.senderID);
        const totalPokemon = userPokeData.length;
        const totalCommon = userPokeData.filter(poke => poke.Rarity === "Common").length;
        const totalUncommon = userPokeData.filter(poke => poke.Rarity === "Uncommon").length;
        const totalRare = userPokeData.filter(poke => poke.Rarity === "Rare").length;
        const totalHolo = userPokeData.filter(poke => poke.Rarity === "Rare Holo").length;
        const totalLegendary = userPokeData.filter(poke => poke.Rarity === "Legendary").length;
        const totalMythic = userPokeData.filter(poke => poke.Rarity === "Mythic").length;

        const infoMessage = `
Informasi Pengguna:
Nama: ${userName}
Saldo: ${currentBalance.money}$
Total Pokémon: ${totalPokemon}
 - Common: ${totalCommon}
 - Uncommon: ${totalUncommon}
 - Rare: ${totalRare}
 - Rare Holo: ${totalHolo}
 - Legendary: ${totalLegendary}
 - Mythic: ${totalMythic}
        `;

        message.reply(infoMessage);

      } else if (command === "inv") {
        const page = parseInt(args[1]) || 1;
        const pageSize = 12; // Jumlah kartu per halaman (misalnya 4 kolom x 3 baris)
        const columns = 4; // Jumlah kolom
        const rows = 3; // Jumlah baris
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const pokemonOnPage = userPokeData.slice(start, end);

        if (pokemonOnPage.length === 0) {
          message.reply(`Tidak ada Pokémon di halaman ${page}.`);
          return;
        }

        // Mengatur ukuran kanvas berdasarkan jumlah kolom dan baris
        const cardWidth = 150;
        const cardHeight = 200;
        const margin = 25;
        const canvasWidth = columns * cardWidth + (columns + 1) * margin;
        const canvasHeight = rows * cardHeight + (rows + 7) * margin;

        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        // Mengatur background kanvas
        ctx.fillStyle = "#1c1c1c";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Menambahkan judul halaman
        ctx.fillStyle = "#ffffff";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`Inventaris Pokémon - Halaman ${page}`, canvas.width / 2, margin + 10);

        // Mengatur posisi awal
        let x = margin;
        let y = margin + 45; // Menambahkan offset untuk judul

        for (let i = 0; i < pokemonOnPage.length; i++) {
          const pokemon = pokemonOnPage[i];
          if (pokemon.Image) {
            try {
              const image = await loadImage(pokemon.Image);
              ctx.drawImage(image, x, y, cardWidth, cardHeight);

              // Menambahkan nama dan rarity di bawah kartu
              ctx.fillStyle = "#ffffff";
              ctx.font = "16px Arial";
              ctx.textAlign = "center";
              ctx.fillText(pokemon.Nama, x + cardWidth / 2, y + cardHeight + 15);
              ctx.fillText(pokemon.Rarity, x + cardWidth / 2, y + cardHeight + 30);
            } catch (err) {
              console.error("Gagal memuat gambar:", err);
              // Menambahkan placeholder jika gambar gagal dimuat
              ctx.fillStyle = "#ff0000";
              ctx.fillRect(x, y, cardWidth, cardHeight);
              ctx.fillStyle = "#ffffff";
              ctx.font = "20px Arial";
              ctx.textAlign = "center";
              ctx.fillText("Gagal", x + cardWidth / 2, y + cardHeight / 2);
            }
          }

          // Mengatur posisi untuk kartu berikutnya
          x += cardWidth + margin;
          if ((i + 1) % columns === 0) { 
            x = margin;
            y += cardHeight + margin + 40; // Menambahkan ruang untuk teks
          }
        }

        const buffer = canvas.toBuffer('image/png');
        const filePath = path.join(__dirname, `inventory_page_${page}.png`);
        fs.writeFileSync(filePath, buffer);
        message.reply({ body: `Inventaris Pokémon di halaman ${page}:`, attachment: fs.createReadStream(filePath) });

      } else if (command === "bulk") {
        const bulkCount = parseInt(args[1]) || 1;
        if (bulkCount > 10) {
          message.reply("Jumlah bulk tidak boleh lebih dari 10.");
          return;
        }

        const currentBalance = await usersData.get(event.senderID);
        const totalPrice = 10 * bulkCount;

        if (currentBalance.money < totalPrice) {
          message.reply(`Uang kamu tidak cukup. Kamu memerlukan ${totalPrice}$.`);
          return;
        }

        usersData.addMoney(userId, -totalPrice);

        let bulkResults = `Hasil penarikan ${bulkCount} Pokémon:\n`;
        for (let i = 0; i < bulkCount; i++) {
          const randomCard = getRandomCard(cards);
          const cardName = randomCard.name;
          const cardRarity = randomCard.rarity;
          const cardImage = randomCard.images.large;

          const newEntry = {
            Nama: cardName,
            Rarity: cardRarity,
            Image: cardImage,
            Username: userName,
            Uid: userId,
            Page: userPokeData.length + 1
          };

          pokeData.push(newEntry);
          writePokeData(pokeData);

          bulkResults += `${i + 1}. ${cardName} (${cardRarity})\n`;
        }

        message.reply(bulkResults);

      } else if (command === "sellc") {
        const pokemonNames = args.slice(1).join(" ").split(',').map(name => name.trim().toLowerCase());
        let totalMoneyEarned = 0;
        let soldList = "";

        for (const pokemonName of pokemonNames) {
          const pokemonIndex = userPokeData.findIndex(pokemon => pokemon.Nama.toLowerCase() === pokemonName);

          if (pokemonIndex === -1) {
            message.reply(`Kamu tidak memiliki Pokémon bernama: ${pokemonName}.`);
            return;
          }

          const soldPokemon = userPokeData[pokemonIndex];
          const pokeDataIndex = pokeData.findIndex(poke => poke.Uid === userId && poke.Nama.toLowerCase() === pokemonName);

          if (pokeDataIndex !== -1) {
            pokeData.splice(pokeDataIndex, 1);
          }

          let min, max;
          switch (soldPokemon.Rarity) {
            case "Common":
              min = 1;
              max = 5;
              break;
            case "Uncommon":
              min = 5;
              max = 10;
              break;
            case "Rare":
              min = 10;
              max = 15;
              break;
            case "Rare Holo":
              min = 15;
              max = 20;
              break;
            case "Legendary":
              min = 20;
              max = 25;
              break;
            case "Mythic":
              min = 25;
              max = 30;
              break;
            default:
              min = 1;
              max = 5;
          }

          const earnedMoney = Math.floor(Math.random() * (max - min + 1)) + min;
          totalMoneyEarned += earnedMoney;
          soldList += `${soldPokemon.Nama} (${soldPokemon.Rarity}) - ${earnedMoney}$\n`;

          writePokeData(pokeData);
        }

        usersData.addMoney(userId, totalMoneyEarned);
        message.reply(`Kamu telah menjual Pokémon berikut:\n${soldList}Total yang diperoleh: ${totalMoneyEarned}$`);

      } else {
        message.reply("Perintah tidak dikenali. Gunakan salah satu perintah berikut: \n\npull, sell, show, inv, bulk, sellc, info.");
      }

    } catch (error) {
      console.error(error);
      message.reply(`Terjadi masalah saat menjalankan cmd: ${error.message || error}`);
    }
  }
};