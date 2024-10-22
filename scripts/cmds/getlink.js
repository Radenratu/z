module.exports = {
  config: {
    name: "getlink",
    version: "1.0",
    author: "AceGun",
    countDown: 5,
    role: 0,
    shortDescription: "",
    longDescription: {
      en: ".",
    },
    category: "media",
    guide: {
      en: "{prefix} <reply with img or vid>",
    },
  },

  onStart: async function ({ api, event }) {
    const { messageReply } = event;
 api.sendMessage(messageReply.url, event.threadID, event.messageID);
  }
};