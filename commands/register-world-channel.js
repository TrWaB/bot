const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { unserialize } = require('php-unserialize');
const domains = require('../utils/domains.js');
const { loadConfig, saveConfig } = require('../utils/config'); // Használjuk a közös modult

async function fetchServers(domain) {
  const url = `https://${domain}/backend/get_servers.php`;
  try {
    const res = await fetch(url);
    const text = await res.text();
    const servers = unserialize(text);
    if (typeof servers === 'object' && servers !== null) return Object.keys(servers);
    return [];
  } catch (err) {
    console.error(`Hiba a szerverek lekérésénél (${domain}):`, err.message);
    return [];
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register-world-channel')
    .setDescription('Állíts be egy világot a csatornához')
    .addStringOption(option =>
      option
        .setName('domain')
        .setDescription('Válassz egy szervert')
        .setRequired(true)
        .addChoices(...domains.map(domain => ({ name: domain, value: domain })))
    )
    .addStringOption(option =>
      option
        .setName('world')
        .setDescription('Válassz egy világot')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async execute(interaction) {
    const domain = interaction.options.getString('domain');
    const world = interaction.options.getString('world');
    const guildId = interaction.guildId;
    const channelId = interaction.channelId;

    const config = loadConfig(guildId);

    if (!config.channels[channelId]) config.channels[channelId] = {};
    if (!config.channels[channelId].serverSelection) config.channels[channelId].serverSelection = {};

    config.channels[channelId].serverSelection.server = world;

    saveConfig(guildId, config);

    await interaction.reply({
      content: `🌍 Kiválasztottad a világot: **${world}** a domain-en: **${domain}**`,
      ephemeral: true
    });
  },

  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    const domain = interaction.options.getString('domain');
    if (focusedOption.name === 'world' && domain) {
      const servers = await fetchServers(domain);
      const filtered = servers
        .filter(server => server.toLowerCase().includes(focusedOption.value.toLowerCase()))
        .slice(0, 25);

      await interaction.respond(filtered.map(server => ({ name: server, value: server })));
    }
  }
};
