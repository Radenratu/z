module.exports = {
  config: {
    name: "mine",
    aliases: ["mining"],
    version: "1",
    author: "Edinst",
    countDown: 5,
    role: 0,
    description: "Mine untuk item acak!",
    category: "economy",
    guide: {
      usage: "{p}mine"
    }
  },

  onStart: async function ({ message, api, event, usersData }) {
    const user = await usersData.get(event.senderID);
    if (user.money < 10) {
      api.sendMessage("Kamu tidak memiliki cukup uang untuk menambang! Kamu membutuhkan setidaknya $10.", event.threadID, event.messageID);
      return;
    }

    user.money -= 10;

    const items = [
      { name: "Tanah", value: 5, chance: 35 },
      { name: "Andesite", value: 5, chance: 30 },
      { name: "Granit", value: 5, chance: 35 },
      { name: "Batu", value: 5, chance: 30 },
      { name: "Coal", value: 10, chance: 15 },
      { name: "Coper", value: 15, chance: 10 },
      { name: "Berlian", value: 50, chance: 5 },
      { name: "Emerald", value: 20, chance: 7 },
      { name: "Emas", value: 40, chance: 6 },
      { name: "sulfur", value: 8, chance: 40 },
      { name: "quartz", value: 7, chance: 45 },
      { name: "obsidian", value: 30, chance: 4 },
      { name: "sapphire", value: 33, chance: 2 },
      { name: "topaz", value: 28, chance: 6 },
      { name: "amethyst", value: 22, chance: 5 },
      { name: "ancient coin", value: 100, chance: 0.1 },
      { name: "crystal shard", value: 18, chance: 35 },
      { name: "mystic stone", value: 45, chance: 1 },
      { name: "dragon scale", value: 65, chance: 0.3 },
      { name: "fossil", value: 30, chance: 4 },
      { name: "daun kering", value: 0, chance: 50 },
      { name: "makanan basi", value: 1, chance: 40 },
      { name: "tali", value: 5, chance: 35 },
      { name: "botol kosong", value: 1, chance: 50 },
      { name: "koin lama", value: 15, chance: 20 }
    ];

    const minedItems = [];
    const maxItems = Math.floor(Math.random() * 10) + 1;

    for (let i = 1; i <= maxItems; i++) {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      const chance = Math.random() * 150;
      if (chance <= randomItem.chance) {
        minedItems.push(randomItem.name);
        user.money += randomItem.value;
      } else {
        if (Math.random() * 500 <= 60) {
          const randomItem2 = items[Math.floor(Math.random() * items.length)];
          minedItems.push(randomItem2.name);
          user.money += randomItem2.value;
        }
      }
    }

    if (minedItems.length === 0) {
      api.sendMessage("Kamu tidak menemukan apa-apa.", event.threadID, event.messageID);
    } else {
      api.sendMessage(`Kamu mendapatkan: \n${minedItems.join(", ")}. \n\nTotal uang yang kamu dapat adalah: ${minedItems.reduce((acc, curr) => acc + items.find(item => item.name === curr).value, 0)}`, event.threadID, event.messageID);
    }

    await usersData.set(event.senderID, user);
  }
};