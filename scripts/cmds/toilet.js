const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
  config: {
    name: "toilet",
    aliases: ["toilet"],
    version: "1.1",
    author: "Bhau", // Upgraded author name
    countDown: 5,
    role: 0,
    shortDescription: "Put someone's face on a toilet 🤣",
    longDescription: "Tag someone to place their face on a toilet image. Fun only!",
    category: "fun",
    guide: "{pn} @mention"
  },

  onStart: async function ({ message, event, args }) {
    const mention = Object.keys(event.mentions);
    const adminUID = "100051869042398";

    // If no one is tagged
    if (mention.length === 0) {
      return message.reply("Please tag someone you want to flush 🚽");
    }

    // If mentioned admin UID, override message
    if (mention.includes(adminUID)) {
      return message.reply("😺 It's your place, baka!");
    }

    // If one person is tagged
    if (mention.length === 1) {
      const one = event.senderID;
      const two = mention[0];
      bal(one, two).then(ptth => {
        message.reply({
          body: "You Deserve This Place 🤣",
          attachment: fs.createReadStream(ptth)
        });
      });
    } else {
      // If two or more tagged, use first two
      const one = mention[1];
      const two = mention[0];
      bal(one, two).then(ptth => {
        message.reply({
          body: "You Deserve This Place 🤣",
          attachment: fs.createReadStream(ptth)
        });
      });
    }
  }
};

async function bal(one, two) {
  let avone = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  avone.circle();

  let avtwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  avtwo.circle();

  const pth = "toilet.png";
  const img = await jimp.read("https://i.imgur.com/sZW2vlz.png");

  img
    .resize(1080, 1350)
    .composite(avone.resize(360, 360), 8828282, 2828) // Coordinates placeholder, adjust if needed
    .composite(avtwo.resize(450, 450), 300, 660);

  await img.writeAsync(pth);
  return pth;
}