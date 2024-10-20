module.exports = {
  config: {
    name: "spin",
    aliases: ["s"],
    version: "1",
    author: "Edinst",
    countDown: 100,
    role: 0,
    description: { en: "Putar roda dan dapatkan uang dan exp secara acak!" },
    category: "game",
    guide: { en: "" },
  },

  onStart: async ({ message, api, event, usersData }) => {
    const userData = await usersData.get(event.senderID);
const j = await usersData.get(event.senderID);
const u = (j.money);

    if (j.money < 5) {
      message.reply(`kamu tidak memiliki cukup uang untuk memutar roda. Minimal uang yang dibutuhkan adalah 5$.`);
      return;
    }

    const uangAcak = Math.floor(Math.random() * 10) + 1;
    const expAcak = Math.floor(Math.random() * 40) + 10;

const b = await usersData.get(event.senderID);
b.money -= 5;
await usersData.set(event.senderID, b);
    const newExp = userData.exp + expAcak;
  
const c = await usersData.get(event.senderID);
c.money += uangAcak;
await usersData.set(event.senderID, c);
    await usersData.set(event.senderID, {
      exp: newExp,
      data: userData.data,
    });

    message.reply(`kamu dapat ${uangAcak}$ dan ${expAcak} exp!`);
  },
};