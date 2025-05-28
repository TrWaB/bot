const fs = require('fs').promises;
const { SlashCommandBuilder } = require('discord.js');
const { TextEncoder } = require('util');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('send-script')
    .setDescription('Elküldi a Google Apps Script kódot letölthető fájlként.'),

  async execute(interaction) {
    await interaction.deferReply();

    let webhook;
    try {
      const webhooks = await interaction.channel.fetchWebhooks();
      webhook = webhooks.find(wh => wh.owner?.id === interaction.client.user.id);

      if (!webhook) {
        webhook = await interaction.channel.createWebhook({
          name: 'TribalWarsBotWebhook',
          reason: 'Tribal Wars email figyelő script',
        });
      }
    } catch (error) {
      console.error('Webhook létrehozási hiba:', error);
      return interaction.editReply({
        content: '❌ Nem sikerült webhookot létrehozni. Ellenőrizd a jogosultságokat.',
        ephemeral: true,
      });
    }

    // --- Ide jön a fájl beolvasása ---
    let scriptTemplate;
    try {
      scriptTemplate = await fs.readFile('./utils/tw-bot-script.txt', 'utf-8');
    } catch (err) {
      console.error('Fájl beolvasási hiba:', err);
      return interaction.editReply({
        content: '❌ Nem sikerült beolvasni a script fájlt.',
        ephemeral: true,
      });
    }

    // 🛠️ A webhook URL beszúrása a sablonba
    const updatedScript = scriptTemplate.replace(
      /var webhookUrl = ['"].*?['"]/,
      `var webhookUrl = "${webhook.url}"`
    );

    // 📄 A fájlt Bufferként küldjük (nem írunk a fájlrendszerbe)
    const encoder = new TextEncoder();
    const buffer = Buffer.from(updatedScript, 'utf-8');

    // 📬 Fájl küldése a válaszban
    await interaction.editReply({
      content: '✅ Itt a Google Apps Script kódod letölthető fájlként:',
      files: [{ attachment: buffer, name: 'google-apps-script.js' }],
    });
  },
};
