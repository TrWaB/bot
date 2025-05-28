const fs = require('fs');
const path = require('path');

const getConfigPath = (guildId) => path.join(__dirname, '../data', `${guildId}.json`);

function loadConfig(guildId) {
  const filePath = getConfigPath(guildId);

  // Ha a fájl nem létezik, létrehozzuk alapértelmezett adatokkal
  if (!fs.existsSync(filePath)) {
    const defaultConfig = {
      channels: {},
      defaultServer: '',
      'welcome-message-channel-id': ''
    };

    const dataDir = path.dirname(filePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }

  // Egyébként visszaolvassuk a meglévőt
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveConfig(guildId, config) {
  const filePath = getConfigPath(guildId);
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
}

module.exports = { loadConfig, saveConfig };
