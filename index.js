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

  let FROM = translated.from.language.iso.toUpperCase();
  let TO = config.translation.to.toUpperCase();

  if (config.translation.ignoreSame && FROM == TO) return;

  let formatted = config.message.format
    .replace("{from}", FROM)
    .replace("{to}", TO)
    .replace("{text}", translated.text);

  client.reply(channel, formatted, user);
});

client.connect();