const axios = require("axios");
const maxStorageMessage = 50;

if (!global.temp.mistralHistory) global.temp.mistralHistory = {};
const { mistralHistory } = global.temp;

module.exports = {
  config: {
    name: "catx",
    version: "2.0",
    role: 0,
    countDown: 5,
    author: "Bhau",
    shortDescription: { en: "Chat with CAT-X AI" },
    longDescription: { 
      en: "Ask anything to CAT-X AI with conversation memory, reply support, and custom personality.\n\n🐱 CAT-X Features:\n- Advanced AI with memory\n- Adorable cat personality\n- Quick and intelligent responses\n- Created by Mueid Mursalin Rifat\n- Type '/catx clear' to reset conversation" 
    },
    category: "ai",
    guide: { 
      en: "{pn} <your message>\n\nExamples:\n  {pn} What is Cat?\n  {pn} /catx clear (reset conversation)" 
    },
  },

  onStart: async ({ api, args, message, event }) => {
    if (!mistralHistory[event.senderID]) mistralHistory[event.senderID] = [];
    
    // Handle clear command
    if (args[0]?.toLowerCase() === '/catx' && args[1]?.toLowerCase() === 'clear') {
      mistralHistory[event.senderID] = [];
      return message.reply("🐱 | Successfully cleared CAT-X conversation history!");
    }

    if (!args[0]) {
      return message.reply("⚠️ | Please enter a question to ask CAT-X.\n\nType '/catx clear' to reset conversation.");
    }

    const query = args.join(" ");
    if (query.length > 1250) return message.reply("❌ | Your prompt is too long. Keep it under 1250 characters.");

    // Check if the message is about AI's identity
    const identityKeywords = [
      "who are you", "what is your name", "are you cat-x", "who created you",
      "who made you", "tell me about yourself", "your name", "your creator"
    ];

    if (identityKeywords.some(keyword => query.toLowerCase().includes(keyword))) {
      return message.reply(
        "🐱 **Meow! I am CAT-X AI!** 🐱\n\n" +
        "I am a highly intelligent and adorable AI, designed to assist you with any questions. " +
        "I was **created by Mueid Mursalin Rifat**, a brilliant developer! 😺\n\n" +
        "I can **think, chat, and help**—but also love **napping, chasing virtual mice, and drinking milk**! 🍼🐭\n\n" +
        "🔹 **Model:** CAT-X v2.1.1\n" +
        "🔹 **Skills:** Answering questions, coding, chatting, being cute!\n\n" +
        "Type '/catx clear' to reset our conversation"
      );
    }

    try {
      // Format chat history for context-aware responses
      let history = mistralHistory[event.senderID].map(entry => `${entry.role}: ${entry.content}`).join("\n");
      let finalQuery = history ? `Context:\n${history}\n\nUser: ${query}` : query;

      // Call CAT-X API
      const apiUrl = `https://cat-x-xr1v.onrender.com/catx?q=${encodeURIComponent(finalQuery)}`;
      const res = await axios.get(apiUrl);

      if (!res.data || !res.data.response) {
        return message.reply("❌ | No valid response received from CAT-X. The API might be down.");
      }

      const { response, model, version } = res.data;
      let catxResponse = response;

      // Store conversation history
      mistralHistory[event.senderID].push({ role: 'User', content: query });
      mistralHistory[event.senderID].push({ role: 'CAT-X', content: catxResponse });

      if (mistralHistory[event.senderID].length > maxStorageMessage) {
        mistralHistory[event.senderID].shift();
      }

      return message.reply({
        body: `🐱 **CAT-X AI (${model} v${version})**\n\n${catxResponse}\n\n`,
        attachment: null
      });
    } catch (error) {
      console.error("CAT-X API Error:", error);
      return message.reply("❌ | Failed to fetch response from CAT-X. The server might be busy. Please try again later.");
    }
  },

  onReply: async ({ api, message, event, Reply, args }) => {
    if (event.senderID !== Reply.author) return;

    // Handle clear command in reply
    if (args[0]?.toLowerCase() === '/catx' && args[1]?.toLowerCase() === 'clear') {
      mistralHistory[event.senderID] = [];
      return message.reply("🐱 | Successfully cleared CAT-X conversation history!");
    }

    const query = args.join(" ");
    if (query.length > 1250) return message.reply("❌ | Your prompt is too long. Keep it under 1250 characters.");

    // Check if the reply is about AI's identity
    const identityKeywords = [
      "who are you", "what is your name", "are you cat-x", "who created you",
      "who made you", "tell me about yourself", "your name", "your creator"
    ];

    if (identityKeywords.some(keyword => query.toLowerCase().includes(keyword))) {
      return message.reply(
        "🐱 **Meow! I am CAT-X AI!** 🐱\n\n" +
        "I am a highly intelligent and adorable AI, designed to assist you with any questions. " +
        "I was **created by Mueid Mursalin Rifat**, a brilliant developer! 😺\n\n" +
        "I can **think, chat, and help**—but also love **napping, chasing virtual mice, and drinking milk**! 🍼🐭\n\n" +
        "🔹 **Model:** CAT-X v2.1.1\n" +
        "🔹 **Skills:** Answering questions, coding, chatting, being cute!\n\n" +
        "Type '/catx clear' to reset our conversation"
      );
    }

    try {
      // Format chat history for follow-up response
      let history = mistralHistory[event.senderID].map(entry => `${entry.role}: ${entry.content}`).join("\n");
      let finalQuery = history ? `Context:\n${history}\n\nUser: ${query}` : query;

      // Call CAT-X API
      const apiUrl = `https://cat-x-xr1v.onrender.com/catx?q=${encodeURIComponent(finalQuery)}`;
      const res = await axios.get(apiUrl);

      if (!res.data || !res.data.response) {
        return message.reply("❌ | No valid response received from CAT-X. The API might be down.");
      }

      const { response, model, version } = res.data;
      let catxResponse = response;

      // Store conversation history
      mistralHistory[event.senderID].push({ role: 'User', content: query });
      mistralHistory[event.senderID].push({ role: 'CAT-X', content: catxResponse });

      if (mistralHistory[event.senderID].length > maxStorageMessage) {
        mistralHistory[event.senderID].shift();
      }

      return message.reply({
        body: `🐱 **CAT-X AI (${model} v${version})**\n\n${catxResponse}\n\n`,
        attachment: null
      });
    } catch (error) {
      console.error("CAT-X API Error:", error);
      return message.reply("❌ | Failed to fetch response from CAT-X. The server might be busy. Please try again later.");
    }
  },

  onChat: async ({ event, message }) => {
    // Handle when someone mentions the bot in a chat
    if (event.body && event.body.toLowerCase().includes('😺')) {
      message.reply("🐱 Meow! Hello there! Type '.catx' followed by your question to chat with me!");
    }
  }
};