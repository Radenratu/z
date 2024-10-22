const fs = require('fs');

module.exports = {
    config: {
        name: "fishing",
        aliases: ["fish"],
        version: "1.3",
        author: "Edinst",
        countDown: 45,
        role: 0,
        description: { en: "Game memancing" },
        category: "game"
    },

    onStart: async function ({ message, event, usersData }) {
        const userID = event.senderID;
        const userData = await usersData.get(userID);

        if (userData.money < 10) {
            return message.reply("Kamu tidak memiliki cukup balance untuk memancing. Dibutuhkan 10 balance.");
        }

        await usersData.addMoney(userID, -10);

        const fishData = JSON.parse(fs.readFileSync('fish.json'));

        function getRandomFish() {
            const randomNum = Math.random() * 100;
            let cumulativeChance = 0;

            for (const fish of fishData) {
                cumulativeChance += fish.chance;
                if (randomNum <= cumulativeChance) {
                    return fish;
                }
            }
        }

        const randomFish = getRandomFish();

        const randomWeight = (
            Math.random() * (randomFish.weightRange[1] - randomFish.weightRange[0]) + randomFish.weightRange[0]
        ).toFixed(2);

        const fishPrice = (randomFish.pricePerKg * randomWeight).toFixed(2);

        await usersData.addMoney(userID, parseFloat(fishPrice));

        const msg = randomFish.name === "Sepatu Bekas"
            ? `🎣 Kamu memancing dan mendapatkan... sepatu bekas! Sayangnya tidak ada reward.`
            : `🎣 Kamu memancing, ini hasilnya:

Nama ikan: ${randomFish.name}
Berat ikan: ${randomWeight} kg! 
Dan Kamu mendapatkan:
${fishPrice}$.`;

        await message.reply(msg);
    }
};