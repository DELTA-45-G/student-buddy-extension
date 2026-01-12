// public/background.js

// Listen for the alarm to go off
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "studyTimer") {
    // Show the system notification
    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("icon.png"), 
      title: "Time's Up! 🎓",
      message: "Great job! Take a short break.",
      priority: 2,
      requireInteraction: true
    });

    // Clear the storage so the popup knows the timer finished
    chrome.storage.local.set({ timerState: { isRunning: false, remaining: 0 } });
  }
});