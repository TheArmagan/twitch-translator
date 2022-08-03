const tmi = require("tmi.js-reply-fork");
const config = require("./config.json");
const translate = require("@vitalets/google-translate-api");

const client = tmi.Client({
  identity: {
    username: config.account.username,
    password: config.account.oauth
  },
  channels: config.channels
});

const matchRegex = new RegExp(config.message.match.pattern, config.message.match.flags);
const replaceRegex = new RegExp(config.message.replace.pattern, config.message.replace.flags);
client.on("message", async (channel, user, message, self) => {
  if (!matchRegex.test(message)) return;
  message = message.replace(replaceRegex, "");

  let translated = await translate(message, {
    from: config.translation.from.toLowerCase(),
    to: config.translation.to.toLowerCase()
  });

  let formatted = config.message.format
    .replace("{from}", translated.from.language.iso.toUpperCase())
    .replace("{to}", config.translation.to.toUpperCase())
    .replace("{text}", translated.text);

  client.reply(channel, formatted, user);
});

client.connect();