const axios = require('axios');
const fs = require('fs');
const path = require('path');

const pokedataPath = path.join(__dirname, 'pokedata.json');

const readPokeData = () => {
  if (!fs.existsSync(pokedataPath)) {
    fs.writeFileSync(pokedataPath, JSON.stringify([])); 
  }
  return JSON.parse(fs.readFileSync(pokedataPath, 'utf8'));
};
const writePokeData = (data) => {
  fs.writeFileSync(pokedataPath, JSON.stringify(data, null, 2));
};

const getRandomCard = (cards) => {
  const rarityWeight = {
    "Common": 50,
    "Uncommon": 30,
    "Rare": 15,
    "Rare Holo": 4,
    "Legendary": 0.9,
    "Mythic": 0.1
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

const translateToIndonesian = async (text) => {
  try {
    const response = await axios.post('https://libretranslate' + '.de/translate', {
      q: text,
      source: 'en',
      target: 'id',
      format: 'text'
    }, {
      headers: { 'accept': 'application/json' }
    });
    return response.data.translatedText;
  } catch (error) {
    console.error('Error translating text:', error);
    return "Deskripsi tidak tersedia.";
  }
};

module.exports = {
  config: {
    name: "poke",
    aliases: ["pokemon", "pk"],
    version: "1.0",
    author: "Edinst",
    countDown: 5,
    role: 0,
    description: {
      en: "Gacha Pokémon TCG."
    },
    category: "gacha",
    guide: {
      en: "coming soon may 2025"
    }
  },

  onStart: async function ({ message, usersData, event, args, getLang }) {
    const command = args[0];
    const userId = event.senderID;
    const userName = usersData.get(userId).name || "Unknown";

    const pokeData = readPokeData();
    const userPokeData = pokeData.filter(poke => poke.Uid === userId);
    
if (command === "pull") {
  try {
const c = await usersData.get(event.senderID);
    const currentBalance = usersData.getMoney(event.senderID);
    const cardPrice = 5;

    if (c.money < cardPrice) {
      message.reply(`Uang kamu kurang untuk mendapatkan Pokémon, kamu memerlukan 5$.`);
      return;
    }

    usersData.addMoney(userId, -cardPrice);

    const response = await axios.get('https://api.pokemontcg.io/v2/cards', {
      headers: {
        'X-Api-Key': 'ce5686bc-2b7e-4dcc-b92b-0819a72ec4bc'
      }
    });

    const cards = response.data.data;
    const randomCard = getRandomCard(cards);

    const cardName = randomCard.name;
    const cardRarity = randomCard.rarity;
    const cardImage = randomCard.images.large;

    const cardTypes = randomCard.types ? randomCard.types.join(", ") : "Tidak diketahui";

    let cardDescription = "Deskripsi tidak tersedia.";
    if (randomCard.text && randomCard.text.length > 0) {
      cardDescription = randomCard.text.join(" ");
      cardDescription = await translateToIndonesian(cardDescription);
    }

    let cardAttack = "Tidak mempunyai serangan.";
    if (randomCard.attacks && randomCard.attacks.length > 0) {
      cardAttack = randomCard.attacks.map(attack => `• ${attack.name}: ${attack.damage} damage`).join("\n");
    }

    const cardDefense = randomCard.hp ? `${randomCard.hp} HP` : "Tidak diketahui";

    const nextPage = userPokeData.length + 1;

    const newEntry = {
      Nama: cardName,
      Rarity: cardRarity,
      Type: cardTypes,
      Deskripsi: cardDescription,
      Attack: cardAttack,
      Defense: cardDefense,
      Username: userName,
      Uid: userId,
      Page: nextPage,
      Image: cardImage
    };

    pokeData.push(newEntry);
    writePokeData(pokeData);

    await message.reply(`Kamu mendapatkan:\n${cardName} (${cardRarity}).`);
    await message.reply({
      body: "",
      attachment: await global.utils.getStreamFromURL(cardImage)
    });
  } catch (error) {
    console.error(error);
    message.reply("Terjadi kesalahan saat menarik kartu. Silakan coba lagi.");
       }
    } else if (command === "inv") {
      const page = parseInt(args[1]) || 1;
      const pageSize = 10;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const userPokemon = userPokeData.slice(start, end);

      if (userPokemon.length === 0) {
        message.reply(`Tidak ada Pokémon di halaman ${page}.`);
        return;
      }

      let inventoryMessage = `Pokémon di halaman ${page}:\n`;
      userPokemon.forEach((pokemon, index) => {
        inventoryMessage += `${start + index + 1}. ${pokemon.Nama} (Rarity: ${pokemon.Rarity})\n`;
      });

      message.reply(inventoryMessage);

    } else if (command === "sell") {
      const pokemonName = args.slice(1).join(" ").toLowerCase();

      const pokemonIndex = userPokeData.findIndex(
        (pokemon) => pokemon.Nama.toLowerCase() === pokemonName
      );

      if (pokemonIndex === -1) {
        message.reply(`Kamu tidak memiliki Pokémon bernama: ${pokemonName}.`);
        return;
      }
      const soldPokemon = userPokeData[pokemonIndex];

      const pokeDataIndex = pokeData.findIndex(
        (poke) => poke.Uid === userId && poke.Nama.toLowerCase() === pokemonName
      );
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

      const getRandomMoney = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };

      const earnedMoney = getRandomMoney(min, max);

      usersData.addMoney(event.senderID, earnedMoney);

      const remainingUserPokeData = pokeData.filter((poke) => poke.Uid === userId);
      remainingUserPokeData.forEach((pokemon, index) => {
        pokemon.Page = index + 1;
      });

      writePokeData(pokeData);

      message.reply(
        `Kamu telah menjual ${soldPokemon.Nama} (${soldPokemon.Rarity})\nDan mendapatkan: ${earnedMoney}$.`
      );
    } else if (command === "info") {
  const pokemonName = args.slice(1).join(" ");
  const pokemon = userPokeData.find(pokemon => pokemon.Nama.toLowerCase() === pokemonName.toLowerCase());

  if (!pokemon) {
    message.reply(`Kamu tidak memiliki Pokémon bernama "${pokemonName}".`);
    return;
  }

  const infoMessage = 
`${pokemon.Nama}\n\n•Rarity:\n${pokemon.Rarity}\n•Tipe:\n${pokemon.Type}\n•Deskripsi:\n${pokemon.Deskripsi}\n•Attack:\n${pokemon.Attack}\n•Defense:\n${pokemon.Defense}`;

  await message.reply(infoMessage);

  if (pokemon.Image) {
    await message.reply({
      body: "",
      attachment: await global.utils.getStreamFromURL(pokemon.Image)
    });
  } else {
    message.reply("Gambar kartu tidak tersedia.");
  }
    } else {
      message.reply("Tutorial:\n\n`poke pull`\n`poke inv (page)`\n`poke sell (pokemon name)`\n`poke info (pokemon name).");
    }
  }
};