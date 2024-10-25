const fs = require('fs');
const path = './rpg.json';

function getRpgData(userId) {
  if (!fs.existsSync(path)) fs.writeFileSync(path, '{}');
  const rpgData = JSON.parse(fs.readFileSync(path, 'utf-8'));
  return rpgData[userId] || { 
    username: null,
    coin: 0,
    hp: 100,
    inventory: {},
    armor: false 
  };
}

function updateRpgData(userId, data) {
  const rpgData = JSON.parse(fs.readFileSync(path, 'utf-8'));
  rpgData[userId] = data;
  fs.writeFileSync(path, JSON.stringify(rpgData, null, 2));
}

module.exports = {
    config: {
        name: "rpg",
        version: "1.2",
        author: "Bernando",
        countDown: 5,
        role: 0,
        description: "RPG game",
        category: "Game",
        guide: "Use `rpg` to see menu or `rpg <subcommand>` for specific actions."
    },
    
    onStart: async function({ api, args, message, usersData, event }) {
      const subcommand = args[0];
      c = await usersData.get(event.senderID);
      const name = c.name;
      let user = getRpgData( c, name );
      if (!user) {
            api.sendMessage("Terjadi kesalahan saat mengambil data pengguna.", event.threadID, event.messageID);
            return;
        }
        
        if (!subcommand) {
            return showMenu(api, event);
        }

        switch(subcommand.toLowerCase()) {
            case 'menu':
                return showMenu(api, event);
            case 'status':
                return status(api, event, usersData);
            case 'survival':
                return survival(api, event);
            case 'healing':
                return healing(api, event);
            case 'mining':
                return mining(api, event);
            case 'shop':
                return shop(api, event, args.slice(1));
            case 'dungeon':
                return dungeon(api, event);
            case 'use':
                return useItem(api, event, args.slice(1));
            default:
                return api.sendMessage("Subcommand tidak ditemukan! Gunakan `rpg menu` untuk melihat menu.", event.threadID, event.messageID);
        }
    }
};

async function showMenu(api, event) {
    const menu = `
🎮 𝗥𝗣𝗚 𝗠𝗲𝗻𝘂 -
1. 𝗿𝗽𝗴 𝘀𝘁𝗮𝘁𝘂𝘀 - Lihat statusmu
2. 𝗿𝗽𝗴 𝘀𝘂𝗿𝘃𝗶𝘃𝗮𝗹 - Aktifitas survival
3. 𝗿𝗽𝗴 𝗵𝗲𝗮𝗹𝗶𝗻𝗴 - Sembuhkan diri
4. 𝗿𝗽𝗴 𝗺𝗶𝗻𝗶𝗻𝗴 - Menambang
5. 𝗿𝗽𝗴 𝘀𝗵𝗼𝗽 - Buka toko
6. 𝗿𝗽𝗴 𝗱𝘂𝗻𝗴𝗲𝗼𝗻 - Masuk ke dungeon
7. 𝗿𝗽𝗽 𝘂𝘀𝗲 <item> - Gunakan item 

𝗞𝗲𝘁𝗶𝗸 𝗿𝗽𝗴 <𝘀𝘂𝗯𝗰𝗼𝗺𝗺𝗮𝗻𝗱> 𝘂𝗻𝘁𝘂𝗸 𝗺𝗲𝗺𝘂𝗹𝗮𝗶.
    `;
    return api.sendMessage(menu, event.threadID, event.messageID);
}

async function createData(api, event,usersData) {
  c = await usersData.get(event.senderID);
  const name = c.name;
  let user = getRpgData( c, name );
  rpgData.username = name;
  rpgData.coin = 0;
  rpgData.hp = 100;
  rpgData.inventory = {};
  rpgData.armor = false;
  updateRpgData(userId, rpgData);
}

async function status(api, event, usersData) {
  c = await usersData.get(event.senderID);
  let user = getRpgData(c);
  if(!rpgData.username) return createData(api, event,usersData);
  const statusMessage = `
📋 Status Kamu -

Username: ${user.username}
Coin: ¢${user.coin.toLocaleString()}
HP: ${user.hp}/100
Inventory: ${user.inventory}
Armor: ${user.armor ? 'Aktif 🛡' : 'Nonaktif'}
    `;
    return api.sendMessage(statusMessage, event.threadID, event.messageID);
}