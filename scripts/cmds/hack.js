
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "hack",
    version: "1.0.0",
    author: "SiamBhau",
    countDown: 5,
    role: 0,
    description: {
      en: "Funny hack image generator"
    },
    category: "fun",
    guide: {
      en: "{pn} [@mention or nothing]"
    }
  },

  onStart: async function({ api, event, args, message, usersData }) {
    try {
      let id = event.senderID;
      if (Object.keys(event.mentions || {}).length > 0) {
        id = Object.keys(event.mentions)[0];
      }

      const name = await usersData.getName(id);
      const pathImg = path.join(__dirname, "tmp", "hack_background.png");
      const pathAvt = path.join(__dirname, "tmp", "hack_avatar.png");

      const backgroundUrl = "https://drive.google.com/uc?id=1RwJnJTzUmwOmP3N_mZzxtp63wbvt9bLZ";

      const avatarResponse = await axios.get(
        `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      );
      fs.writeFileSync(pathAvt, Buffer.from(avatarResponse.data));

      const bgResponse = await axios.get(backgroundUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(pathImg, Buffer.from(bgResponse.data));

      const baseImage = await loadImage(pathImg);
      const baseAvt = await loadImage(pathAvt);

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      ctx.font = "400 23px Arial";
      ctx.fillStyle = "#1878F3";
      ctx.textAlign = "start";
      ctx.fillText(name, 200, 497);

      ctx.drawImage(baseAvt, 83, 437, 100, 101);

      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, imageBuffer);

      await message.reply({
        body: "",
        attachment: fs.createReadStream(pathImg)
      });

      fs.unlinkSync(pathImg);
      fs.unlinkSync(pathAvt);

    } catch (err) {
      console.error(err);
      return message.reply(`Error: ${err.message}`);
    }
  }
};