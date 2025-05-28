// clear-commands.js
const { REST } = require('discord.js');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const TOKEN = process.env.TOKEN;

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('🔴 Törlés folyamatban...');
    await rest.put(
      `/applications/${CLIENT_ID}/guilds/${GUILD_ID}/commands`,
      { body: [] }
    );
    console.log('✅ Slash parancsok törölve!');
  } catch (error) {
    console.error('❌ Hiba történt:', error);
  }
})();
