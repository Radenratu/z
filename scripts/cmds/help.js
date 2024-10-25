const { commands, aliases } = global.GoatBot;
const { getPrefix } = global.utils;

function roleTextToString(roleText) {
    switch (roleText) {
        case 0:
            return "0 (semua pengguna)";
        case 1:
            return "1 (Admin group)";
        case 2:
            return "2 (Admin bot)";
        default:
            return "Tidak di ketahui";
    }
}

module.exports = {
    config: {
        name: "menu",
        aliases: ["list", "help"],
        version: "1",
        author: "Edinst",
        countDown: 5,
        role: 0,
        description: { en: "Melihat daftar command atau detail dari command tertentu" },
        category: "info"
    },

    onStart: async function ({ message, event, args }) {
        const prefix = getPrefix(event.threadID);

        if (!args[0]) {
            const msg = `╭« Commands List »
│⁃❯ (Game)
├───────
│› mine, spin
│› pokemon
│› fishing
├───────
│⁃❯ (Ekonomi)
├───────
│› status, pay
│› whois, freegift
├───────
│⁃❯ (Alat)
├───────
│› math, translate
│› setn
╰────────`;
            return await message.reply(msg);
        }

        const commandName = args[0].toLowerCase();
        const command = commands.get(commandName) || commands.get(aliases.get(commandName));

        if (!command) {
            return await message.reply(`Perintah "${commandName}" tidak ditemukan.`);
        }

        const c = command.config;
        const r = roleTextToString(c.role);
        
        let g = c.guide?.en || "Tidak ada";
        if (typeof g === 'string') {
            g = g.replace(/\{p\}/g, prefix).replace(/\{pn\}/g, `${prefix}${c.name}`);
        } else {
            g = "Tidak ada contoh penggunaan";
        }

        const msg = `${c.name}
============
Deskripsi: ${c.description.en || "Tidak ada"}

Nama Lain: ${c.aliases ? c.aliases.join(", ") : "Tidak ada"}

Pembuat: ${c.author || "Tidak di tampilkan"}

Izin: ${r}

Waktu Tunggu: ${c.countDown || 1} detik

Contoh Penggunaan:
============
${g}
============`;

        await message.reply(msg);
    }
};