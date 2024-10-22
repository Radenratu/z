const axios = require('axios');
const regCheckURL = /^(https?|ftp):\/\/[^\s]+$/;

module.exports = {
  config: {
    name: "imgbb",
    aliases: ["img"],
    version: "1",
    author: "Edinst",
    countDown: 5,
    role: 0,
    description: { en: "upload image to imgbb" },
    category: "utility",
    guide: {
      en: {
        usage: "{pn} (reply to image)"
      }
    }
  },

  onStart: async function ({ api, event }) {
    const linkanh = event.messageReply?.attachments[0]?.url;
    if (!linkanh) {
      return api.sendMessage('Please reply to an image.', event.threadID, event.messageID);
    }

    let type = "file";
  let file = await global.utils.getStreamFromURL(linkanh);

    if (!file)
      throw new Error('The first argument (file) must be a stream or a image url');
    if (regCheckURL.test(file) == true)
      type = "url";
    if (
      (type != "url" && (!(typeof file._read === 'function' && typeof file._readableState === 'object')))
      || (type == "url" && !regCheckURL.test(file))
    )
      throw new Error('The first argument (file) must be a stream or an image URL');

    axios({
      method: 'GET',
      url: 'https://imgbb.com'
    })
    .then(res => {
      const auth_token = res.data.match(/auth_token="([^"]+)"/)[1];
      const timestamp = Date.now();

      axios({
        method: 'POST',
        url: 'https://imgbb.com/json',
        headers: {
          "content-type": "multipart/form-data"
        },
        data: {
          source: file,
          type: type,
          action: 'upload',
          timestamp: timestamp,
          auth_token: auth_token
        }
      })
      .then(res => {
        const imageUrl = res.data.image.url;
        return api.sendMessage({ body: imageUrl }, event.threadID, event.messageID);
      })
      .catch(err => {
        throw new Error(err.response ? err.response.data : err);
      });
    })
    .catch(err => {
      throw new Error(err.response ? err.response.data : err);
    });
  }
};