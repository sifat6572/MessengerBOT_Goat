const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "animevideo",
    aliases: ["amv", "anivid"],
    version: "1.1",
    author: "Bhau",
    description: "✨ Sends a random anime clip from anime video api 😺!",
    category: "media",
    cooldown: 5
  },

  onStart: async function ({ api, event }) {
    const tempPath = path.join(__dirname, "anime.mp4");
    
    const loading = await api.sendMessage(
      "⛩️ Opening a portal to anime land... hang tight, Senpai! 🚀", 
      event.threadID
    );

    try {
      const response = await axios({
        method: "GET",
        url: "https://anime-video-api.onrender.com/anime",
        responseType: "stream"
      });

      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body:
            "🎬 Here’s your anime clip, Senpai!✨ Sit back and enjoy the vibes~ 🍿\n\n" +
            "🌐 API Source: Anime Video API\n" +
            "👨‍💻 Crafted with ❤️ by: Mueid Mursalin Rifat\n" +
            "🔁 Use again anytime to get more content~",
          attachment: fs.createReadStream(tempPath)
        }, event.threadID, () => {
          fs.unlinkSync(tempPath);
          api.unsendMessage(loading.messageID);
        });
      });

      writer.on("error", (err) => {
        console.error("❗ File write error:", err);
        api.sendMessage("🚫 Oops! Couldn't save the anime clip. Try again later!", event.threadID);
      });

    } catch (err) {
      console.error("❗ API fetch error:", err);
      api.sendMessage(
        "⚠️ Failed to deliver your anime magic. Either the API is resting 😴 or the file is too big (25MB+).", 
        event.threadID, 
        event.messageID
      );
    }
  }
};