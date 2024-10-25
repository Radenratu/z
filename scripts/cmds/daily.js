const moment = require('moment-timezone');
const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");
module.exports = {
  config: {
    name: "daily",
    version: "1.7",
    author: "Edinst",
    countDown: 20,
    role: 0,
    description: "Mendapatkan hadiah harian",
    category: "ekonomi",
    guide: "{pn}",
  },
  langs: {
		vi: {
			added: "✅ | Đã thêm quyền admin cho %1 người dùng:\n%2",
			alreadyAdmin: "\n⚠ | %1 người dùng đã có quyền admin từ trước rồi:\n%2",
			missingIdAdd: "⚠ | Vui lòng nhập ID hoặc tag người dùng muốn thêm quyền admin",
			removed: "✅ | Đã xóa quyền admin của %1 người dùng:\n%2",
			notAdmin: "⚠ | %1 người dùng không có quyền admin:\n%2",
			missingIdRemove: "⚠ | Vui lòng nhập ID hoặc tag người dùng muốn xóa quyền admin",
			listAdmin: "👑 | Danh sách admin:\n%1"
		},
		en: {
			added: "✅ | Added admin role for %1 users:\n%2",
			alreadyAdmin: "\n⚠ | %1 users already have admin role:\n%2",
			missingIdAdd: "⚠ | Please enter ID or tag user to add admin role",
			removed: "✅ | Removed admin role of %1 users:\n%2",
			notAdmin: "⚠ | %1 users don't have admin role:\n%2",
			missingIdRemove: "⚠ | Please enter ID or tag user to remove admin role",
			listAdmin: "👑 | List of admins:\n%1"
		}
	},
  onStart: async function ({ args, message, event, usersData, api, getLang }) {
    switch (args[0]) {
      case "add":
			case "-a": {
				if (args[1]) {
					let uids = [];
					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions);
					else if (event.messageReply)
						uids.push(event.messageReply.senderID);
					else
						uids = args.filter(arg => !isNaN(arg));
					const notAdminIds = [];
					const adminIds = [];
					for (const uid of uids) {
						if (config.adminBot.includes(uid))
							adminIds.push(uid);
						else
							notAdminIds.push(uid);
					}

					config.adminBot.push(...notAdminIds);
					const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
					return message.reply(
						(notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
						+ (adminIds.length > 0 ? getLang("alreadyAdmin", adminIds.length, adminIds.map(uid => `• ${uid}`).join("\n")) : "")
					);
				}
				else
					return message.reply(getLang("missingIdAdd"));
			}
    }
    const udahLimit = moment.tz("Asia/Jakarta").format("DD/MM/YYYY");
    const date = new Date();
    const currentDay = date.getDay();

    const userData = await usersData.get(event.senderID);
    const user = await usersData.get(event.senderID);

    if (userData.data.Bansos === udahLimit) {
      return api.sendMessage("kamu sudah mengambil hadiah harian, kembali lagi besok", event.threadID);
    }

    await usersData.set(event.senderID, {
      ...user,
      data: { ...user.data, Bansos: udahLimit },
    });

    const uang = Math.floor(Math.random() * 10) + 1;
    const exp = Math.floor(Math.random() * 100) + 10;

    const currentMoney = userData.money || 0;
    const currentExp = userData.exp || 0;

    await usersData.set(event.senderID, {
      money: currentMoney + uang,
      exp: currentExp + exp,
    });

    api.sendMessage(`Kamu berhasil mengambil hadiah harian:

Uang: ${uang}$
Exp: ${exp}`, event.threadID);
  },
};