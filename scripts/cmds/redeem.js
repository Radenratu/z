const moment = require("moment-timezone");

   module.exports = {
     config: {
       name: "redeem",
       version: "1.0.0",
       author: "Luxion",
       countDown: 5,
       role: 0,
       description: "redeem use this code",
       category: "users",
       guide: "{pn}",
     },
     onStart: async function({api, args, event, usersData, message}) {
       if (!event.isGroup) {
         api.sendMessage("Perintah ini tidak dapat digunakan dalam pesan pribadi", event.threadID);
         return;
       }
       if (!args[0]) {
         return api.sendMessage("Masukan kode redeem", event.threadID);
       }
       const user = await usersData.get(event.senderID);
       const redeem = args[0];
       const db = await usersData.get(61553115092826)
       const code = db.data.redeem
       if (redeem.includes(user.data.redeemedCode)) {
         return api.sendMessage("Kamu telah menggunakan Redeem tersebut sebelumnya.", event.threadID)
       }
       
       
       const found = code.filter(item => item.code === redeem.code);
       
       if (found.length < 0) {
         return api.sendMessage("Kode yang kamu masukan tidak dapat ditemukan.", event.threadID)
       }
       await usersData.set(event.senderID, { 
  ...user, 
  data: { 
    ...user.data, 
    redeemedCode: [...(user.data.redeemedCode || []), args[0]] 
  } 
});

api.sendMessage(`${user.name}, Selamat, kamu berhasil melakukan redeem dan mendapat ${found.M}`, event.threadID)
     },
     onChat: async function({api, args, event, usersData, message}) {
       const user = await usersData.get(event.senderID)
       if (!user.data.redeemedCode) {
          const user = await usersData.get(event.senderID);
await usersData.set(event.senderID, { 
...user, 
data: { ...user.data, redeemedCode: ["Data.getProcessYourRedeem"] }
});
return;
       }
       
     }
   };