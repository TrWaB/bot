const { SlashCommandBuilder } = require('discord.js');
const { loadConfig, saveConfig } = require('../utils/config'); // vagy ahonnan importálod

module.exports = {
  data: new SlashCommandBuilder()
    .setName('udvozol')
    .setDescription('Beállítja azt a csatornát, ahová az új tagokat üdvözöljük.'),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const channelId = interaction.channel.id;

    // Konfiguráció betöltése (ha nem létezik, automatikusan létrejön)
    const config = loadConfig(guildId);

    // Üdvözlő csatorna beállítása a gyökérszintre
    config['welcome-message-channel-id'] = channelId;

    // Konfiguráció mentése
    try {
      saveConfig(guildId, config);
    } catch (err) {
      console.error(`❌ Hiba a konfiguráció mentésekor (${guildId}):`, err);
      return interaction.reply({
        content: '⚠️ Nem sikerült menteni a beállítást.',
        ephemeral: true
      });
    }

    await interaction.reply({
      content: `✅ Üdvözlő csatorna beállítva erre: <#${channelId}>`,
      ephemeral: true
    });
  }
};
