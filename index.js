const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const statusRotator = require('./status-rotator.js');
const registerCommands = require('./utils/register-commands');
require('dotenv').config();
const TOKEN = process.env.TOKEN;
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});
client.commands = new Collection();

client.on('rateLimit', (info) => {
  isRateLimited = true;
  rateLimitReset = Date.now() + info.timeout;
  console.log(`Rate limit alá kerültünk! Várakozás: ${info.timeout} ms, útvonal: ${info.path}`);
});

/*******Bot készen áll*******/
client.once('ready', async () => {
  console.log(`✅ Bejelentkezve: ${client.user.tag}`);
  statusRotator(client);
  await registerCommands(client);
});

/*******Üzenet figyelés (!ping teszt)*******/
client.on('messageCreate', message => {
  if (message.content === '!ping') {
    message.reply('pong!');
  }
});

/*******Rate limit figyelés*******/
client.on('rateLimit', async (info) => {
  console.warn(`Rate limit alá kerültünk! Várakozás: ${info.timeout} ms, útvonal: ${info.path}`);
});

/*******Parancsok betöltése*******/
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

/*******Események betöltése*******/
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

/*******Bot indítása*******/
client.login(TOKEN);