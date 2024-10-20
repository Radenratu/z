const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

async function searchYoutube(query) {
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=AIzaSyC_CVzKGFtLAqxNdAZ_EyLbL0VRGJ-FaMU&type=video&maxResults=6`);
    return response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high.url
    }));
  } catch (error) {
    throw new Error(`Failed to search YouTube: ${error.message}`);
  }
}

async function downloadAndStreamVideo(videoUrl, message) {
  const apiUrl = `https://samirxpikachuiox.onrender.com/ytb?url=${encodeURIComponent(videoUrl)}`;

  try {
    const response = await axios.get(apiUrl);

    if (response.data && response.data.videos) {
      const videoURL = response.data.videos;
      const videoPath = path.join(__dirname, 'video.mp4');

      const videoResponse = await axios.get(videoURL, { responseType: 'stream' });
      const videoStream = fs.createWriteStream(videoPath);
      videoResponse.data.pipe(videoStream);

      await new Promise((resolve, reject) => {
        videoStream.on('finish', resolve);
        videoStream.on('error', reject);
      });

      await message.reply({
        body: response.data.title || "Here's your video",
        attachment: fs.createReadStream(videoPath)
      });

      fs.unlinkSync(videoPath);
    } else {
      throw new Error('No video data found');
    }
  } catch (error) {
    throw new Error(`Failed to download: ${error.message}`);
  }
}

async function downloadAndStreamAudio(videoUrl, message) {
  const apiUrl = `https://samirxpikachuiox.onrender.com/ytb?url=${encodeURIComponent(videoUrl)}`;

  try {
    const response = await axios.get(apiUrl);

    if (response.data && response.data.audios) {
      const audioURL = response.data.audios;
      const audioPath = path.join(__dirname, 'audio.mp3');

      const audioResponse = await axios.get(audioURL, { responseType: 'stream' });
      const audioStream = fs.createWriteStream(audioPath);
      audioResponse.data.pipe(audioStream);

      await new Promise((resolve, reject) => {
        audioStream.on('finish', resolve);
        audioStream.on('error', reject);
      });

      await message.reply({
        body: response.data.title || "Here's your audio",
        attachment: fs.createReadStream(audioPath)
      });

      fs.unlinkSync(audioPath);
    } else {
      throw new Error('No audio data found');
    }
  } catch (error) {
    throw new Error(`Failed to download: ${error.message}`);
  }
}

async function downloadThumbnail(url, index) {
  try {
    const thumbnailPath = path.join(__dirname, `thumb_${index}.jpg`);
    const response = await axios.get(url, { responseType: 'stream' });
    const writer = fs.createWriteStream(thumbnailPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    return thumbnailPath;
  } catch (error) {
    throw new Error(`Failed to download thumbnail: ${error.message}`);
  }
}
//inspired from ntkhangs ytb


module.exports = {
  config: {
    name: "ytb",
    version: "3.29",
    author: "Samir Œ",
    countDown: 5,
    role: 0,
    description: {
      vi: "Tải video, audio hoặc xem thông tin video trên YouTube",
      en: "Download video, audio or view video information on YouTube"
    },
    category: "media",
    guide: {
      en: "   {pn} [video|-v] [<video name>|<video link>]: download video\n   {pn} [audio|-a] [<video name>|<video link>]: download audio\n   {pn} [info|-i] [<video name>|<video link>]: view info"
    }
  },

  langs: {
    en: {
      error: "❌ An error occurred: %1",
      noResult: "⭕ No search results match the keyword %1",
      choose: "%1\n\nReply with a number to choose or any other text to cancel",
      searching: "🔎 Searching for your request...",
      downloading: "⬇️ Downloading your %1, please wait...",
      info: "💠 Title: %1\n🏪 Channel: %2\n⏱ Duration: %3\n🔠 ID: %4\n🔗 Link: %5"
    }
  },

  onStart: async function ({ args, message, event, commandName, getLang }) {
    let type;
    switch (args[0]) {
      case "-v":
      case "video":
        type = "video";
        break;
      case "-a":
      case "-s":
      case "audio":
      case "sing":
        type = "audio";
        break;
      case "-i":
      case "info":
        type = "info";
        break;
      default:
        return message.SyntaxError();
    }

    const input = args.slice(1).join(" ");
    if (!input) return message.SyntaxError();

    try {
    
      const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
      if (youtubeUrlPattern.test(input)) {
      
        await processYoutubeUrl(input, type, message, getLang);
      } else {
        
        await message.reply(getLang("searching"));
        const searchResults = await searchYoutube(input);
        if (searchResults.length === 0) {
          return message.reply(getLang("noResult", input));
        }

        let msg = "";
        for (let i = 0; i < searchResults.length; i++) {
          msg += `${i + 1}. ${searchResults[i].title} - ${searchResults[i].channel}\n\n`;
        }

      
        const thumbnailPaths = await Promise.all(
          searchResults.map((result, index) => downloadThumbnail(result.thumbnail, index))
        );

        const response = await message.reply({
          body: getLang("choose", msg),
          attachment: thumbnailPaths.map(path => fs.createReadStream(path))
        });

     
        thumbnailPaths.forEach(path => fs.unlinkSync(path));

        global.GoatBot.onReply.set(response.messageID, {
          commandName,
          messageID: response.messageID,
          author: event.senderID,
          type,
          searchResults
        });
      }
    } catch (error) {
      console.error(error);
      return message.reply(getLang("error", error.message));
    }
  },

  onReply: async function ({ message, event, getLang, Reply }) {
    const { type, searchResults, messageID } = Reply;
    const choice = parseInt(event.body);

    if (isNaN(choice) || choice < 1 || choice > searchResults.length) {
      return message.reply(getLang("error", "Invalid choice"));
    }

    await message.unsend(messageID);
    await message.reply(getLang("downloading", type));

    const selectedVideo = searchResults[choice - 1];
    const videoUrl = `https://youtu.be/${selectedVideo.id}`;

    try {
      await processYoutubeUrl(videoUrl, type, message, getLang);
    } catch (error) {
      console.error(error);
      return message.reply(getLang("error", error.message));
    }
  }
};

async function processYoutubeUrl(url, type, message, getLang) {
  try {
    if (type === "video") {
      await downloadAndStreamVideo(url, message);
    } else if (type === "audio") {
      await downloadAndStreamAudio(url, message);
    } else if (type === "info") {
      const apiUrl = `https://samirxpikachuiox.onrender.com/ytb?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl);
      const infoMsg = getLang("info", 
        response.data.title || "N/A",
        response.data.channel || "N/A",
        response.data.duration || "N/A",
        response.data.id || "N/A",
        url
      );
      await message.reply(infoMsg);
    }
  } catch (error) {
    throw new Error(`Failed to process YouTube URL: ${error.message}`);
  }
}