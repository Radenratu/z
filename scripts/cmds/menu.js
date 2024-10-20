module.exports = {
  config: {
    name: "list",
    aliases: ["menu"],
    version: "1",
    author: "Edinst",
    countDown: 5,
    role: 0,
    description: { en: "Melihat daftar command" },
    category: "info"
  },

  onStart: async function ({ message, api, event }) { 
    const msg = `╭« Commands List »
│⁃❯ (Game)
├───────
│› mine, spin
│› pokemon
├───────
│⁃❯ (Ekonomi)
├───────
│› status, pay
│› whois
├───────
│⁃❯ (Alat)
├───────
│› math, translate
│› setn
╰────────`;
    await message.reply(msg);
  }
};