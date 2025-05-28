const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} = require('discord.js');
const { loadConfig } = require('../utils/config'); // Útvonalat igazítsd a tényleges helyhez

// Egyszerű késleltetés függvény
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const guildId = member.guild.id;
    const config = loadConfig(guildId);

    const channelId = config['welcome-message-channel-id'];
    if (!channelId) return;

    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    // Késleltetés a rate limit elkerüléséhez
    await wait(2000);

    const now = new Date();
    const formattedDate = now.toLocaleString('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    const embed = new EmbedBuilder()
      .setTitle('🎉 Üdvözlünk a szerveren!')
      .setDescription(
        `Szuper, hogy itt vagy, ${member.user.toString()}! ${formattedDate}\n\n👉 Köszönj neki integetéssel!`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setColor(0x5865F2);

    const button = new ButtonBuilder()
      .setCustomId('wave')
      .setLabel('👋 Integetek!')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await channel.send({ embeds: [embed], components: [row] });
  }
};