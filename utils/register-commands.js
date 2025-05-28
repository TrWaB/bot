require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

async function registerCommands(client) {
    const commands = [];
    const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        if (command.data) {
            commands.push(command.data.toJSON());
            client.commands.set(command.data.name, command);
        }
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        console.log('📥 Parancsok regisztrálása...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('✅ Slash parancsok sikeresen regisztrálva!');
    } catch (error) {
        console.error('❌ Hiba a parancsregisztráció során:', error);
    }
}

module.exports = registerCommands;