const axios = require('axios');

module.exports = {
  config: {
    name: "tcp",
    version: "1.0.0",
    author: "Bhau",
    countDown: 5,
    role: 0,
    description: {
      en: "Free Fire in-game bot commands for team join, emote and team creation"
    },
    category: "game",
    guide: {
      en: "{pn} join <team_code> - Join a team\n{pn} emote <uid>,<uid2>&<emote_id> - Send emote\n{pn} team <uid>&<team_size> - Create team\n{pn} leave - Leave squad\n{pn} lag <team_code> - Lag spam\n{pn} spam <uid> - Spam invites"
    }
  },

  onStart: async function({ api, event, args, message }) {
    const { threadID, messageID } = event;
    const prefix = global.GoatBot.config.prefix;

    if (args.length === 0) {
      const usage = `🎮 TCP COMMAND HELP

1️⃣ Team Join
   ${prefix}tcp join {team_code}
   Example: ${prefix}tcp join 9880126

2️⃣ Send Emote
   ${prefix}tcp emote {uid},{uid2}&{emote_id}
   Example: ${prefix}tcp emote 2579249340,12345678&909000081

3️⃣ Create Team
   ${prefix}tcp team {uid}&{team_size}
   Example: ${prefix}tcp team 2579249340&5
   Team size: 3, 4, 5, or 6

4️⃣ Leave Squad
   ${prefix}tcp leave
   Example: ${prefix}tcp leave

5️⃣ Lag Spam
   ${prefix}tcp lag {team_code}
   Example: ${prefix}tcp lag 12526

6️⃣ Spam Invites
   ${prefix}tcp spam {uid}
   Example: ${prefix}tcp spam 2579249340

📌 Note: ইমোট দেওয়ার জন্য প্রথমে টিমে বটকে নিতে হবে এর জন্য ${prefix}tcp join দিয়ে বটকে টিমে নিবেন। তারপর ইমোট দেওয়ার জন্য ${prefix}tcp emote কমান্ড ব্যাবহার করুন,কিভাবে ইমোট সেন্ড করবেন উপরে Example দিয়ে দেখানো হয়েছে।

Lag Feature টা ভালো মতো কাজ নাও করতে পারে, এর জন্য দুঃখিত!
`;

      return message.reply(usage);
    }

    const action = args[0].toLowerCase();

    try {
      if (action === "join") {
        if (args.length < 2) {
          return message.reply("❌ Please provide a team code\nExample: tcp join 9880126");
        }

        const teamCode = args[1];
        const apiUrl = `https://bhauxtcp.vercel.app/join?teamcode=${teamCode}&key=Bhau`;

        const response = await axios.get(apiUrl);
        const data = response.data;

        if (data.success) {
          return message.reply(`✅ ${data.message}`);
        } else {
          return message.reply(`❌ Failed to join team: ${data.message || 'Unknown error'}`);
        }

      } else if (action === "emote") {
        if (args.length < 2) {
          return message.reply("❌ Please provide UIDs and emote ID\nExample: tcp emote 2579249340,12345678&909000081");
        }

        const input = args.slice(1).join('');
        const parts = input.split('&');

        if (parts.length < 2) {
          return message.reply("❌ Invalid format. Use: tcp emote {uid},{uid2}&{emote_id}");
        }

        const uids = parts[0].split(',').filter(uid => uid.trim());
        const emoteId = parts[1].trim();

        if (uids.length === 0) {
          return message.reply("❌ Please provide at least one UID");
        }

        const uidParams = uids.map(uid => `uid=${uid.trim()}`).join('&');
        const apiUrl = `https://bhauxtcp.vercel.app/emote?${uidParams}&id=${emoteId}&key=Bhau`;

        const response = await axios.get(apiUrl);
        const data = response.data;

        if (data.success) {
          let msg = `✅ Emote sent successfully!\n📋 Emote ID: ${data.emote_id}\n\nResults:\n`;
          data.results.forEach((result, index) => {
            msg += `${index + 1}. UID ${result.uid}: ${result.status}\n`;
          });
          return message.reply(msg);
        } else {
          return message.reply(`❌ Failed to send emote: ${data.message || 'Unknown error'}`);
        }

      } else if (action === "team") {
        if (args.length < 2) {
          return message.reply("❌ Please provide UID and team size\nExample: tcp team 2579249340&5\nNote: Team size must be 3, 4, 5, or 6");
        }

        const input = args.slice(1).join('');
        const parts = input.split('&');

        if (parts.length < 2) {
          return message.reply("❌ Invalid format. Use: tcp team {uid}&{team_size}");
        }

        const uid = parts[0].trim();
        const teamSize = parts[1].trim();

        const validSizes = ['3', '4', '5', '6'];
        if (!validSizes.includes(teamSize)) {
          return message.reply("❌ Team size must be 3, 4, 5, or 6");
        }

        const apiUrl = `https://bhauxtcp.vercel.app/team?uid=${uid}&team=${teamSize}&key=Bhau`;

        const response = await axios.get(apiUrl);
        const data = response.data;

        if (data.success) {
          const successMessage = `✅ ${data.message}\n\n📌 Note: Accept Invite Quickly`;
          return message.reply(successMessage);
        } else {
          return message.reply(`❌ Failed to create team: ${data.error || data.message || 'Unknown error'}`);
        }

      } else if (action === "leave") {
        const apiUrl = `https://bhauxtcp.vercel.app/leave?key=Bhau`;

        const response = await axios.get(apiUrl);
        const data = response.data;

        if (data.success) {
          return message.reply(`✅ Successfully Left the squad`);
        } else {
          return message.reply(`❌ Failed to leave squad: ${data.message || 'Unknown error'}`);
        }

      } else if (action === "lag") {
        if (args.length < 2) {
          return message.reply("❌ Please provide a team code\nExample: tcp lag 12526");
        }

        const teamCode = args[1];
        const apiUrl = `https://bhauxtcp.vercel.app/lag?teamcode=${teamCode}&key=Bhau`;

        message.reply("⏳ Processing lag spam... Please wait");

        const response = await axios.get(apiUrl);
        const data = response.data;

        if (data.success || data.error) {
          return message.reply(`✅ Lag spam executed successfully on team ${teamCode}`);
        } else {
          return message.reply(`❌ Failed to execute lag spam: ${data.message || 'Unknown error'}`);
        }

      } else if (action === "spam") {
        if (args.length < 2) {
          return message.reply("❌ Please provide a UID\nExample: tcp spam 2579249340");
        }

        const uid = args[1];
        const apiUrl = `https://bhauxtcp.vercel.app/spam?uid=${uid}&key=Bhau`;

        message.reply("⏳ Sending spam invites... Please wait");

        const response = await axios.get(apiUrl);
        const data = response.data;

        if (data.success) {
          return message.reply(`✅ ${data.message}`);
        } else {
          return message.reply(`❌ Failed to send spam invites: ${data.message || 'Unknown error'}`);
        }

      } else {
        return message.reply("❌ Invalid action. Use 'join', 'emote', 'team', 'leave', 'lag' or 'spam'\nType /tcp to see usage");
      }

    } catch (error) {
      console.error("TCP Command Error:", error);
      return message.reply(`❌ Error: ${error.message}`);
    }
  }
};