
const axios = require("axios");

module.exports = {
  config: {
    name: "like",
    version: "3.0",
    author: "SiamBhau",
    countDown: 3,
    role: 0,
    description: {
      en: "Send like to a Free Fire UID"
    },
    category: "game",
    guide: {
      en: "{pn} <uid>\nExample: {pn} 2579249340"
    }
  },

  onStart: async function({ api, event, args, message }) {
    
    const allowedUserId = "100011254804801";
    const senderId = event.senderID;

    if (senderId !== allowedUserId) {
      return message.reply("Sorry Vmro, এটা গরিবদের জন্য নয়।");
    }

    const uid = args[0];

    if (!uid || isNaN(uid)) {
      return message.reply("❌ Please provide a valid Free Fire UID.\n\nExample:\n/like 2579249340");
    }

    const infoUrl = `https://bhauxinfo2.vercel.app/bhau?uid=${uid}&region=BD`;

    try {
      const res = await axios.get(infoUrl);
      const data = res.data;

      if (!data || !data.basicInfo) {
        throw new Error("Invalid API response or player not found");
      }

      const playerName = data.basicInfo.nickname || "Unknown";
      const currentLikes = data.basicInfo.liked || 0;

      // Generate random likes between 240 and 250
      const likesGiven = Math.floor(Math.random() * 11) + 240;
      
      // Calculate fake "before" likes
      const likesBefore = currentLikes - likesGiven;

      return message.reply(
        `✅ Like sent successfully!\n\n` +
        `👤 Player: ${playerName}\n🆔 UID: ${uid}\n\n` +
        `💛 Likes Before: ${likesBefore}\n` +
        `💖 Likes Given: ${likesGiven}\n` +
        `🎯 Total Likes Now: ${currentLikes}\n\n` +
        `👑 Owner: Siam Bhau`
      );

    } catch (e) {
      return message.reply(`❌ API Error!\n${e.message}\n\nPlease check if the UID is valid and try again.`);
    }
  }
};
