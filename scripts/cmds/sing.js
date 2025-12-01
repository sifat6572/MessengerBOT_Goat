const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "sing",
    aliases: ["song", "music"],
    version: "2.2",
    author: "Bhau",
    countDown: 5,
    role: 0,
    shortDescription: "Download music from YouTube",
    longDescription: "Search and download audio from YouTube",
    category: "media",
    guide: {
      en: "{pn} <song name>\nReply with 1-5 to download"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    const query = args.join(" ");
    if (!query) return message.reply("Please enter a song name");

    try {
      const res = await yts(query);
      const videos = res.videos.slice(0, 5);
      if (videos.length === 0) return message.reply("No songs found");

      let body = `🎵 Search Results: "${query}"\nReply with 1-5 to download\n\n`;
      for (let i = 0; i < videos.length; i++) {
        body += `${i + 1}. ${videos[i].title}\nDuration: ${videos[i].timestamp} | By: ${videos[i].author.name}\n\n`;
      }

      const attachments = [];
      for (let i = 0; i < videos.length; i++) {
        try {
          const img = await axios.get(videos[i].thumbnail, { responseType: "stream" });
          const tempPath = path.join(__dirname, "cache", `thumb-${i}-${Date.now()}.jpg`);
          const writer = fs.createWriteStream(tempPath);
          img.data.pipe(writer);
          await new Promise(resolve => writer.on("finish", resolve));
          attachments.push(fs.createReadStream(tempPath));
        } catch (e) {
          console.error("Error downloading thumbnail:", e);
        }
      }

      api.sendMessage({
        body: body,
        attachment: attachments
      }, event.threadID, (err, info) => {
        // Clean up temp files after sending
        attachments.forEach(file => {
          try { 
            fs.unlinkSync(file.path); 
          } catch (e) {}
        });

        if (err) return;

        const sentMsgID = info.messageID;
        
        // Auto delete search result after 30 seconds
        setTimeout(() => {
          try {
            api.unsendMessage(sentMsgID);
          } catch (e) {}
        }, 30000);

        global.GoatBot.onReply.set(sentMsgID, {
          commandName: "sing",
          messageID: sentMsgID,
          author: event.senderID,
          data: videos
        });
      });

    } catch (e) {
      console.error("Search error:", e);
      message.reply("Failed to search songs");
    }
  },

  onReply: async function ({ event, message, Reply, api }) {
    const { author, data, messageID } = Reply;
    if (event.senderID !== author) return;

    const index = parseInt(event.body);
    if (isNaN(index) || index < 1 || index > data.length)
      return message.reply("Please reply with a number from 1 to 5");

    const selected = data[index - 1];

    // Remove search message
    try {
      api.unsendMessage(messageID);
    } catch (e) {}

    const wait = await message.reply("⏳ Downloading your song...");
    await handleDownload(selected.url, message, wait.messageID);
  }
};

// Download Handler
async function handleDownload(url, message, waitMsgID) {
  try {
    const apiURL = `https://koja-api.web-server.xyz/ytmp3?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiURL);
    const dlURL = data.download?.url;

    if (!data.success || !dlURL) return message.reply("Failed to download song");

    const fileName = `${Date.now()}.mp3`;
    const filePath = path.join(__dirname, "cache", fileName);

    const res = await axios.get(dlURL, { responseType: "stream" });
    const writer = fs.createWriteStream(filePath);
    res.data.pipe(writer);
    await new Promise(resolve => writer.on("finish", resolve));

    // Remove "Downloading..." message
    try {
      await message.unsend(waitMsgID);
    } catch (e) {}

    await message.reply({
      body: `🎵 ${data.metadata.title}\n🎤 Artist: ${data.metadata.author.name}\n⏱ Duration: ${data.metadata.duration.timestamp}\n\nAPI by Mueid Mursalin Rifat`,
      attachment: fs.createReadStream(filePath)
    });

    fs.unlinkSync(filePath);

  } catch (err) {
    console.error("Download failed:", err);
    message.reply("Error downloading song");
  }
}