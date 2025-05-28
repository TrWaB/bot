//register-world-reset.js
const { SlashCommandBuilder } = require('discord.js');
const { loadConfig, saveConfig } = require('../utils/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register-world-reset')
    .setDescription('Játék-szerver hozzárendelés törlése (csatorna vagy szerver szinten)'),

  async execute(interaction) {
    const config = loadConfig(interaction.guildId);
    const channelId = interaction.channelId;

    let message = '';

    if (config.channels?.[channelId]?.serverSelection) {
      delete config.channels[channelId].serverSelection;
      message += '🗑️ A csatornaszintű szerverbeállítás törölve.\n';
    }

    if (config.defaultServer) {
      delete config.defaultServer;
      message += '🗑️ Az alapértelmezett (globális) szerverbeállítás törölve.\n';
    }

    saveConfig(interaction.guildId, config);

    await interaction.reply({
      content: message || 'ℹ️ Nem volt mit törölni.',
      ephemeral: true
    });
  }
};
