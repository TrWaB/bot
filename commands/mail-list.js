// commands/createMailList.js
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

function loadConfig(guildId) {
  const filePath = path.join(__dirname, '../data', `${guildId}.json`);
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create-mail-list')
    .setDescription('Lekérdezi a beállított játék-szerver levelezési listáját')
    .addStringOption(option =>
      option.setName('tribes')
        .setDescription('Add meg a klánneveket pontosvesszővel elválasztva (pl. KLN;ABC;XYZ)')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (
      !interaction.member.permissions.has('Administrator') &&
      !interaction.member.roles.cache.some(role => role.name === 'TribalWars Bot Admin')
    ) {
      return interaction.reply({
        content: '❌ Ehhez a parancshoz "TribalWars Bot Admin" szerep vagy admin jogosultság szükséges.',
        ephemeral: true
      });
    }

    const config = loadConfig(interaction.guildId);
    const domain =
      config.channels?.[interaction.channelId]?.serverSelection?.server ||
      config.defaultServer;

    if (!domain) {
      return interaction.reply({
        content: '⚠️ Nincs beállított szerver ehhez a csatornához vagy szerverhez.\nHasználj előbb `/register-world` parancsot!',
        ephemeral: true
      });
    }

    const tribeInput = interaction.options.getString('tribes');
    const tribes = tribeInput.split(';').map(t => t.trim()).filter(Boolean);

    if (tribes.length === 0) {
      return interaction.reply({
        content: '⚠️ Legalább egy klánnevet meg kell adnod.',
        ephemeral: true
      });
    }

    // Később ezeket lehet menteni, lekérdezni, stb.
    await interaction.reply({
      content: `✅ A beállított szerver: **${domain}**\n📜 Klánok: \`${tribes.join(', ')}\``,
      ephemeral: true
    });
  }
};