const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-emojis')
        .setDescription('Emoji mappából feltölti a PNG fájlokat a szerverre')
        .addStringOption(option =>
            option.setName('kategoriak')
                .setDescription('Válaszd ki, melyik típusú emojikat töltsük fel')
                .setRequired(true)
                .addChoices(
                    { name: 'troops', value: 'troops' },
                    { name: 'buildings', value: 'buildings' },
                    { name: 'flags', value: 'flags' },
                    { name: 'other', value: 'other' }
                )
        ),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
        } catch (deferErr) {
            console.error('Defer hiba:', deferErr);
            return;
        }

        const selectedCategory = interaction.options.getString('kategoriak');
        const emojiFolder = path.join(__dirname, '../emoji', selectedCategory);

        let files;
        try {
            files = fs.readdirSync(emojiFolder).filter(f => f.endsWith('.png'));
            if (files.length === 0) {
                await interaction.editReply(`⚠️ Nincsenek PNG fájlok a \`${selectedCategory}\` mappában!`);
                return;
            }
        } catch (err) {
            console.error(`Mappa olvasási hiba (${selectedCategory}):`, err);
            await interaction.editReply(`❌ Nem tudtam beolvasni a \`${selectedCategory}\` mappát.`);
            return;
        }

        const guild = interaction.guild;
        if (!guild) {
            await interaction.editReply('❌ Ez a parancs csak szerveren működik!');
            return;
        }

        const maxEmojis = guild.premiumTier === 3 ? 250 :
                          guild.premiumTier === 2 ? 150 :
                          guild.premiumTier === 1 ? 100 : 50;

        let success = 0;
        let failed = 0;
        let skipped = 0;
        let alreadyExists = 0;

        await interaction.editReply(`⏳ Emojik feltöltése folyamatban... (${selectedCategory} - ${files.length} fájl)`);

        const emojiList = await guild.emojis.fetch();

        for (const [index, file] of files.entries()) {
            if (emojiList.size >= maxEmojis) {
                console.warn(`⚠️ Elértük az emoji limitet (${maxEmojis})`);
                skipped = files.length - index;
                break;
            }

            const emojiName = path.parse(file).name.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
            const filePath = path.join(emojiFolder, file);

            // Ellenőrizd, hogy létezik-e már ilyen nevű emoji
            const alreadyEmoji = emojiList.find(e => e.name === emojiName);
            if (alreadyEmoji) {
                alreadyExists++;
                console.log(`⚠️ Emoji már létezik: ${emojiName}`);
                continue;
            }

            try {
                const buffer = fs.readFileSync(filePath);
                await guild.emojis.create({ attachment: buffer, name: emojiName });
                success++;
                console.log(`✅ Emoji feltöltve: ${emojiName}`);
            } catch (err) {
                failed++;
                console.error(`❌ ${emojiName} hiba:`, err.message || err);
            }

            await interaction.editReply(
                `⏳ Emojik feltöltése folyamatban...\n📂 Kategória: \`${selectedCategory}\`\n✅ Sikeres: ${success} / ${files.length}\n❌ Sikertelen: ${failed}\n⚠️ Már létezett: ${alreadyExists}\n🔄 Hátralévő: ${files.length - index - 1}`
            );

            await new Promise(res => setTimeout(res, 2500));
        }

        let finalMessage = `✅ Emoji feltöltés kész! 📂 Kategória: \`${selectedCategory}\`\n`;
        finalMessage += `✅ Sikeres: ${success}\n❌ Sikertelen: ${failed}\n⚠️ Már létezett: ${alreadyExists}\n`;
        if (skipped > 0) {
            finalMessage += `🚫 Kimaradt: ${skipped} emoji, mert elértük a szerver emoji limitjét (${maxEmojis}).`;
        }

        try {
            await interaction.editReply(finalMessage);
        } catch (finalErr) {
            console.error("Nem sikerült a végső üzenet frissítése:", finalErr);
        }
    }
};
