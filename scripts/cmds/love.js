module.exports = {
	config: {
		name: "love",
		version: "1.0",
		author: "Bhau",
		countDown: 5,
		role: 0,
		shortDescription: {
			vi: "",
			en: "Calculate love compatibility"
		},
		longDescription: {
			vi: "",
			en: "Use this command to calculate love compatibility between two people."
		},
		category: "fun",
		guide: {
			vi: "",
			en: "Syntax: love [first person's name] - [second person's name]"
		}
	},

	onStart: async function ({ api, args, message, event }) {
		try {
			const text = args.join(" ");
			const [fname, sname] = text.split('-').map(name => name.trim());

			if (!fname || !sname) {
				return message.reply("❌ Please provide the names of both individuals.");
			}

			// Simulated love compatibility calculation (remove the API call and provide static or random results)
			const randomPercentage = Math.floor(Math.random() * 101); // Random percentage between 0 and 100
			const results = [
				"Just the beginning! Keep exploring your feelings.",
				"There's potential here. Keep nurturing your connection.",
				"A solid foundation! Your love is growing.",
				"Halfway there! Your relationship is blossoming.",
				"A balanced and promising connection! Cherish your love.",
				"Growing stronger! Your bond is becoming more profound.",
				"On the right track to a lasting love! Keep building.",
				"Wow! You're a perfect match! Your love is extraordinary.",
				"Almost there! Your flame is burning brightly.",
				"Congratulations on a perfect connection! You two are meant to be!"
			];

			const interval = Math.floor(randomPercentage / 10);
			const intervalMessage = results[interval];

			let loveMessage = `💖 Love Compatibility 💖\n\n${fname} ❤️ ${sname}\n\nPercentage: ${randomPercentage}%\n\n● ${intervalMessage}`;

			message.reply(loveMessage);
		} catch (error) {
			console.error(error);
			message.reply("❌ An error occurred while calculating love compatibility. Please try again later.");
		}
	}
};
