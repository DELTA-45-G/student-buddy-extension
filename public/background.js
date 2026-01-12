const motivationalMessages = [
  "Great job! Take a well-deserved break. ☕",
  "You crushed it! Time to recharge. 🔋",
  "Focus session complete. Proud of you! 🌟",
  "Stretch your legs and drink some water! 💧",
  "One step closer to your goals! 🚀",
  "Awesome focus! Go get a snack. 🍎",
  "Your brain needs a break. See you in 5! ⏱️"
];

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "studyTimer") {
    
    // 1. Clear the timer state
    chrome.storage.local.set({ timerState: { isRunning: false, remaining: 0 } });

    // 2. Pick a random message
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

    // 3. Show the notification
    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("icon.png"), // Make sure icon.png is in public!
      title: "Time's Up! 🎓",
      message: randomMessage,
      priority: 2,
      requireInteraction: true 
    });
  }
});