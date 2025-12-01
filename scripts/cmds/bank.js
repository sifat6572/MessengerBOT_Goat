const fs = require("fs");

module.exports = {
  config: {
    name: "bank",
    version: "2.0",
    author: "Bhau", // Dont Remove author credit 
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Virtual bank system"
    },
    longDescription: {
      en: "A bank system with deposit, withdrawal, balance check, interest, transfer, and loan functionalities."
    },
    category: "utility",
    guide: {
      en: "{pn} [deposit | withdraw | show | interest | transfer | richest | loan | payloan]\n\n" +
          "bank deposit (amount) - Deposit money into your bank account.\n" +
          "bank withdraw (amount) - Withdraw money from your bank account.\n" +
          "bank show - Show your bank account balance.\n" +
          "bank interest - Collect earned interest on your balance.\n" +
          "bank transfer (amount) (recipient UID) - Transfer money to another user.\n" +
          "bank richest - Show top 10 richest users.\n" +
          "bank loan (amount) - Take a loan from the bank.\n" +
          "bank payloan (amount) - Repay a loan to the bank."
    }
  },

  onStart: async function ({ args, message, event, usersData }) {
    const userMoney = await usersData.get(event.senderID, "money");
    const user = parseInt(event.senderID);
    const bankData = JSON.parse(fs.readFileSync("bank.json", "utf8"));

    // Ensure the user exists in the bank data
    if (!bankData[user]) {
      bankData[user] = { bank: 0, lastInterestClaimed: Date.now(), loan: 0 };
      fs.writeFileSync("bank.json", JSON.stringify(bankData));
    }

    const command = args[0];
    const amount = parseInt(args[1]);
    const recipientUID = parseInt(args[2]);

    if (command === "deposit") {
      if (isNaN(amount) || amount <= 0) {
        return message.reply("Please enter a valid amount to deposit.");
      }
      if (userMoney < amount) {
        return message.reply("You don't have enough real money to deposit.");
      }

      bankData[user].bank += amount;
      await usersData.set(event.senderID, { money: userMoney - amount });
      fs.writeFileSync("bank.json", JSON.stringify(bankData));

      return message.reply(`${amount} $ has been deposited into your bank account.`);
    } else if (command === "withdraw") {
      const balance = bankData[user].bank || 0;

      if (isNaN(amount) || amount <= 0) {
        return message.reply("Please enter a valid amount to withdraw.");
      }

      if (amount > balance) {
        return message.reply("You don't have enough money in your bank account.");
      }

      bankData[user].bank -= amount;
      await usersData.set(event.senderID, { money: userMoney + amount });
      fs.writeFileSync("bank.json", JSON.stringify(bankData));

      return message.reply(`${amount} $ has been withdrawn from your bank account.`);
    } else if (command === "show") {
      const balance = bankData[user].bank || 0;
      return message.reply(`Your current bank account balance is ${balance} $.`);
    } else if (command === "interest") {
      const interestRate = 0.001; // 0.1% daily interest rate

      const lastInterestClaimed = bankData[user].lastInterestClaimed || Date.now();
      const currentTime = Date.now();
      const timeDiffInSeconds = (currentTime - lastInterestClaimed) / 1000;
      const interestEarned = bankData[user].bank * (interestRate / 365) * timeDiffInSeconds;

      bankData[user].lastInterestClaimed = currentTime;
      bankData[user].bank += interestEarned;

      fs.writeFileSync("bank.json", JSON.stringify(bankData));

      return message.reply(`Interest has been added to your bank balance. You earned ${interestEarned.toFixed(2)} $.`);
    } else if (command === "transfer") {
      const balance = bankData[user].bank || 0;

      if (isNaN(amount) || amount <= 0) {
        return message.reply("Please enter a valid amount to transfer.");
      }

      if (balance < amount) {
        return message.reply("You don't have enough money in your bank account to make this transfer.");
      }

      if (isNaN(recipientUID) || !recipientUID) {
        return message.reply("Please provide a valid recipient ID.");
      }

      if (!bankData[recipientUID]) {
        bankData[recipientUID] = { bank: 0, lastInterestClaimed: Date.now(), loan: 0 };
        fs.writeFileSync("bank.json", JSON.stringify(bankData));
      }

      bankData[user].bank -= amount;
      bankData[recipientUID].bank += amount;
      fs.writeFileSync("bank.json", JSON.stringify(bankData));

      return message.reply(`${amount} $ has been transferred to user ${recipientUID}.`);
    } else if (command === "richest") {
      const sortedUsers = Object.entries(bankData)
        .map(([uid, data]) => ({ uid, balance: data.bank }))
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 10);

      const richestList = sortedUsers.map((user, index) => `${index + 1}. User ${user.uid}: ${user.balance} $`).join("\n");

      return message.reply(`Top 10 richest users:\n${richestList}`);
    } else if (command === "loan") {
      const maxLoanAmount = 5000; // Maximum loan amount the user can take

      if (isNaN(amount) || amount <= 0) {
        return message.reply("Please enter a valid loan amount.");
      }

      if (amount > maxLoanAmount) {
        return message.reply(`You can only take a loan up to ${maxLoanAmount} $.`);
      }

      bankData[user].loan += amount;
      await usersData.set(event.senderID, { money: userMoney + amount });
      fs.writeFileSync("bank.json", JSON.stringify(bankData));

      return message.reply(`${amount} $ loan has been granted to you.`);
    } else if (command === "payloan") {
      const loanBalance = bankData[user].loan || 0;

      if (isNaN(amount) || amount <= 0) {
        return message.reply("Please enter a valid amount to repay.");
      }

      if (amount > loanBalance) {
        return message.reply("You don't have enough loan balance to repay this amount.");
      }

      bankData[user].loan -= amount;
      await usersData.set(event.senderID, { money: userMoney - amount });
      fs.writeFileSync("bank.json", JSON.stringify(bankData));

      return message.reply(`${amount} $ has been paid towards your loan.`);
    } else {
      return message.reply(`==========[Bank System]==========\n` +
        `Available Commands:\n` +
        `❏ deposit: Deposit money into your bank account.\n` +
        `❏ withdraw: Withdraw money from your bank account.\n` +
        `❏ show: Show your bank account balance.\n` +
        `❏ interest: Collect earned interest.\n` +
        `❏ transfer: Transfer money to another user's bank account.\n` +
        `❏ richest: Show top 10 richest users.\n` +
        `❏ loan: Take a loan from the bank.\n` +
        `❏ payloan: Repay a loan.\n` +
        `Use "bank [command]" to execute a command.\n==============================`);
    }
  }
};
