const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "2.0",
    author: "Bhau",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Show help menu or command details"
    },
    longDescription: {
      en: "Display all available commands or detailed information about a specific command"
    },
    category: "info",
    guide: {
      en: "{pn} [command name] or {pn} [page number]"
    },
    priority: 1
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);
    const threadData = await threadsData.get(threadID);
    
    const allCommands = [];
    for (const [name, value] of commands) {
      if (value.config.role <= role) {
        allCommands.push(name);
      }
    }
    allCommands.sort();
    
    const totalCommands = allCommands.length;
    const commandsPerPage = 20;
    const totalPages = Math.ceil(totalCommands / commandsPerPage);

    if (args.length === 0 || !isNaN(args[0])) {
      let page = 1;
      if (args[0] && !isNaN(args[0])) {
        page = parseInt(args[0]);
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;
      }

      const startIndex = (page - 1) * commandsPerPage;
      const endIndex = Math.min(startIndex + commandsPerPage, totalCommands);
      const pageCommands = allCommands.slice(startIndex, endIndex);

      let msg = `┏━━[ 𝐁𝐎𝐓 𝐌𝐄𝐍𝐔 ]━━┓\n`;
      msg += `┃𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐋𝐢𝐬𝐭\n`;
      msg += `┣━━━━━━━━━━━━┫\n`;

      pageCommands.forEach((cmd, index) => {
        const num = startIndex + index + 1;
        msg += `┃ ${num}. ${cmd}\n`;
      });

      msg += `┣━━━━━━━━━━━━┫\n`;
      msg += `┃ 📘 Use: "${prefix}help <command>"\n`;
      msg += `┃ 📄 Use: "${prefix}help <page>"\n`;
      msg += `┃ 📖 Page ${page}/${totalPages}\n`;
      msg += `┃ 🦈 Total Commands: ${totalCommands}\n`;
      msg += `┗━━━━━━━━━━━━━┛`;

      return message.reply(msg);
    }

    const commandName = args[0].toLowerCase();
    const command = commands.get(commandName) || commands.get(aliases.get(commandName));
    if (!command) return message.reply(`⚠️ Command "${commandName}" not found.`);

    const config = command.config;
    const roleText = roleTextToString(config.role);
    const description = config.longDescription?.en || config.shortDescription?.en || "No description available.";
    const aliasesList = config.aliases ? config.aliases.join(", ") : "None";
    const usage = (config.guide?.en || "No usage info")
      .replace(/{p}/g, prefix)
      .replace(/{n}/g, config.name)
      .replace(/{pn}/g, prefix + config.name);

    const detail = `╭─────『 HELP - ${config.name} 』─────╮
│ 📝 Description: ${description}
│ 🧩 Aliases: ${aliasesList}
│ 👑 Author: ${config.author || "Unknown"}
│ 📦 Version: ${config.version || "1.0"}
│ 🎚️ Role Required: ${roleText}
│ ⏱️ Cooldown: ${config.countDown || 1}s
│ 💡 Usage: ${usage}
╰────────────────────────────────────╯`;

    return message.reply(detail);
  }
};

function roleTextToString(role) {
  switch (role) {
    case 0: return "0 - All Users";
    case 1: return "1 - Group Admins";
    case 2: return "2 - Bot Admins";
    case 3: return "3 - Admins";
    case 4: return "4 - Vip premium";
    case 5: return "5 - developer";
    default: return "Unknown Role";
  }
}
