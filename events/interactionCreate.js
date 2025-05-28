module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (interaction.isAutocomplete()) {
      if (command && typeof command.autocomplete === 'function') {
        try {
          await command.autocomplete(interaction);
        } catch (err) {
          console.error(`🔴 Autocomplete hiba: ${err.message}`);
        }
      }
      return;
    }

    if (interaction.isChatInputCommand()) {
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: '⚠️ Hiba történt a parancs futtatása közben.',
          ephemeral: true
        });
      }
      return;
    }

    // 👇 GOMB INTERAKCIÓ
    if (interaction.isButton()) {
      if (interaction.customId === 'wave') {
        try {
          await interaction.message.react('👋');
          await interaction.deferUpdate();
        } catch (error) {
          console.error('🔴 Gombinterakció hiba:', error);
        }
      }
    }
  }
};
