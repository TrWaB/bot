const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tw-grant-admin')
    .setDescription('Ad egy felhasználónak "TribalWars Bot Admin" szerepet')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('A felhasználó, akinek adni szeretnéd a rangot')
        .setRequired(true)
    ),

  async execute(interaction) {
    const executor = interaction.member;
    const targetUser = interaction.options.getMember('user');
    const guild = interaction.guild;

    // ❗ Csak szerveradmin engedélyezett
    const isAdmin = executor.permissions.has(PermissionFlagsBits.Administrator);
    if (!isAdmin) {
      return interaction.reply({
        content: '❌ Ehhez a parancshoz szerveradminisztrátori jogosultság szükséges.',
        ephemeral: true
      });
    }

    // Szerep keresése vagy létrehozása
    let role = guild.roles.cache.find(r => r.name === 'TribalWars Bot Admin');
    if (!role) {
      try {
        role = await guild.roles.create({
          name: 'TribalWars Bot Admin',
          reason: 'TW admin parancshoz szükséges szerep',
          permissions: [],       // ⛔️ semmilyen jogosultság
          color: null,           // ⛔️ ne legyen színe (vagy hagyd ki)
          hoist: false,          // ⛔️ ne emelje ki taglistában
          mentionable: true      // ⛔️ ne legyen megemlíthető nyilvánosan
        });
      } catch (err) {
        return interaction.reply({
          content: `❌ Nem sikerült létrehozni a szerepet: ${err.message}`,
          ephemeral: true
        });
      }
    }

    // Szerep hozzárendelése a célfelhasználóhoz
    try {
      await targetUser.roles.add(role);
      await interaction.reply({
        content: `✅ ${targetUser.user.tag} megkapta a "TribalWars Bot Admin" szerepet.`,
        ephemeral: true
      });
    } catch (err) {
      return interaction.reply({
        content: `❌ Nem sikerült hozzáadni a szerepet: ${err.message}`,
        ephemeral: true
      });
    }
  }
};