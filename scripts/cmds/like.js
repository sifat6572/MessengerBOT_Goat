
const axios = require("axios");

module.exports = {
  config: {
    name: "like",
    version: "3.0",
    author: "SiamBhau",
    countDown: 3,
    role: 0,
    description: {
      en: "Send a like to a Free Fire UID using API (Unlimited, No Limit)"
    },
    category: "game",
    guide: {
      en: "{pn} <uid>\nExample: {pn} 2579249340"
    }
  },

  onStart: async function({ api, event, args, message }) {
    const uid = args[0];

    if (!uid || isNaN(uid)) {
      return message.reply("❌ Please provide a valid Free Fire UID.\n\nExample:\n/like 2579249340");
    }

    const url = `https://bhauxlike3.vercel.app/like?uid=${uid}&key=SiamBhau`;

    try {
      const res = await axios.get(url);
      const info = res.data;

      if (!info || typeof info.status === "undefined") {
        throw new Error("Invalid API response");
      }

      const name = info.PlayerNickname || "Unknown";
      const id = info.UID || uid;

      if (info.status === 2) {
        return message.reply(
          `🚫 Player already received max likes today.\n\n👤 Player: ${name}\n🆔 UID: ${id}\n💛 Current Likes: ${info.LikesafterCommand || "?"}`
        );
      }

      if (info.status === 1) {
        return message.reply(
          `✅ Like sent successfully!\n\n` +
          `👤 Player: ${name}\n🆔 UID: ${id}\n\n` +
          `💛 Likes Before: ${info.LikesbeforeCommand ?? "?"}\n` +
          `💖 Likes Added: ${info.LikesGivenByAPI ?? "?"}\n` +
          `🎯 Total Likes Now: ${info.LikesafterCommand ?? "?"}\n\n` +
          `👑 Owner: Siam Bhau`
        );
      }

      return message.reply(`⚠️ Unknown response!\n\n${JSON.stringify(info, null, 2)}`);

    } catch (e) {
      return message.reply(`❌ API Error!\n${e.message}`);
    }
  }
};