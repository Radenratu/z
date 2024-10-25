const fs = require("fs").promises;
   const path = require("path");
   const moment = require("moment-timezone");

   module.exports = {
     config: {
       name: "free",
       version: "1.0.0",
       author: "Edi (Aslinya Luxion yang buat ini)",
       countDown: 20,
       role: 0,
       description: "Mendapatkan uang gratis bjir",
       category: "gratis rek",
       guide: "{pn}",
     },
     onStart: async function ({ args, message, event, usersData, api }) {
       const timezone = "Asia/Jakarta";
       const currentDate = moment.tz(timezone).format("DD/MM/YYYY");
       const freePath = path.resolve(__dirname, "free.json");

       let freeData = {};

       // Membaca data dari free.json
       try {
         const data = await fs.readFile(freePath, "utf-8");
         freeData = JSON.parse(data);
       } catch (error) {
         // Jika file tidak ada atau error parsing, inisialisasi dengan objek kosong
         freeData = {};
       }

       const userId = event.senderID;

       // Memeriksa apakah pengguna sudah mengambil hari ini
       if (freeData[userId] === currentDate) {
         return api.sendMessage(
           "Kamu sudah mengambil hadiah hari ini, kembali lagi besok.",
           event.threadID
         );
       }

       // Memberikan uang gratis
       const uang = Math.floor(Math.random() * 15) + 1; // Memberi minimal 1$
       const user = await usersData.get(userId);
       const dompet = user.money || 0;

       // Update uang pengguna
       await usersData.set(userId, {
         ...user,
         money: dompet + uang,
       });

       // Update tanggal penggunaan di freeData
       freeData[userId] = currentDate;

       // Menulis kembali ke free.json
       try {
         await fs.writeFile(freePath, JSON.stringify(freeData, null, 4), "utf-8");
       } catch (error) {
         console.error("Error writing to free.json:", error);
         return api.sendMessage(
           "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti.",
           event.threadID
         );
       }

       // Mengirim pesan sukses
       api.sendMessage(
         `Kamu berhasil mengambil uang gratis sebanyak ${uang}$.`,
         event.threadID
       );
     },
     onChat: async function ({ users, args, event, api }) {
       const freePath = path.resolve(__dirname, "free.json");
       const adminIDs = ["100078690213463", "61553115092826"]; // Tambahkan UID admin lainnya jika perlu

       // Mengecek apakah pengirim adalah admin
       if (adminIDs.includes(event.senderID)) {
         const command = event.body.toLowerCase();

         if (
           command === "reset" ||
           command === "reset bansos" ||
           command === "Reset" ||
           command === "Reset bansos"
         ) {
           let freeData = {};

           // Membaca data dari free.json
           try {
             const data = await fs.readFile(freePath, "utf-8");
             freeData = JSON.parse(data);
           } catch (error) {
             freeData = {};
           }

           // Menghapus semua data atau hanya untuk admin tertentu
           // Untuk reset global (semua pengguna), uncomment baris di bawah
           // freeData = {};

           // Untuk reset hanya pengirim perintah
           delete freeData[event.senderID];

           // Menulis kembali ke free.json
           try {
             await fs.writeFile(freePath, JSON.stringify(freeData, null, 4), "utf-8");
           } catch (error) {
             console.error("Error writing to free.json:", error);
             return api.sendMessage(
               "Terjadi kesalahan saat mereset data.",
               event.threadID
             );
           }

           // Mengirim pesan sukses
           return api.sendMessage(
             "Oke, Bansos telah direset. Sekarang Anda dapat meminta bansos dan makanan gratis kembali.",
             event.threadID
           );
         }
       }

       // Jika pesan bukan perintah reset atau bukan admin, tidak melakukan apa-apa
       return;
     },
   };