const { ActivityType } = require('discord.js');

module.exports = function (client) {
  const statusMessages = [
    "szerverbeállítások",
    "térképek",
    "scriptek",
    "nyulat fűben",
    "karón varjút",
    "csillagokat",
    "falon pókot"
  ];

  const intervalTime = 60000; // 1 óra

  function getRandomStatus() {
    const index = Math.floor(Math.random() * statusMessages.length);
    return statusMessages[index];
  }

  async function updateStatus() {
    try {
      const newStatus = getRandomStatus();
      console.log(`✅ Status updated to: Watching ${newStatus}`);
      await client.user.setPresence({
        activities: [{ name: newStatus, type: ActivityType.Watching }],
        status: "online"
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  updateStatus();
  const intervalId = setInterval(updateStatus, intervalTime);
  return intervalId;
};
