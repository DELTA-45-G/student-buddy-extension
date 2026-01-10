import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [timeLeft, setTimeLeft] = useState(30 * 60); 
  const [isActive, setIsActive] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  // --- 1. SYNC WITH BACKGROUND ---
  useEffect(() => {
    // Load Tasks
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['tasks'], (result) => {
        if (result.tasks) setTasks(result.tasks);
      });

      // Check if an alarm is already running
      chrome.storage.local.get(['timerState'], (result) => {
        const state = result.timerState;
        if (state && state.isRunning) {
          const now = Date.now();
          const remaining = Math.ceil((state.endTime - now) / 1000);
          
          if (remaining > 0) {
            setTimeLeft(remaining);
            setIsActive(true);
          } else {
            setIsActive(false);
            setTimeLeft(0);
          }
        }
      });
    }
  }, []);

  // --- 2. LIVE COUNTDOWN (Visual Only) ---
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
             setIsActive(false);
             return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // --- 3. CONTROLS ---
  const startTimer = () => {
    // 1. Calculate when the timer ends
    const targetTime = Date.now() + (timeLeft * 1000);
    
    // 2. Set the Chrome Alarm (this triggers the notification)
    // We convert seconds to minutes for the API
    chrome.alarms.create('studyTimer', { when: targetTime });

    // 3. Save state
    const state = { isRunning: true, endTime: targetTime };
    chrome.storage.local.set({ timerState: state });
    
    setIsActive(true);
  };

  const stopTimer = () => {
    chrome.alarms.clear('studyTimer'); // Kill the alarm
    chrome.storage.local.set({ timerState: { isRunning: false, remaining: timeLeft } }); // Save where we paused
    setIsActive(false);
  };

  const resetTimer = () => {
    chrome.alarms.clear('studyTimer');
    chrome.storage.local.remove('timerState');
    setIsActive(false);
    setTimeLeft(30 * 60);
  };

  const handleTimeChange = (e) => {
    const minutes = parseInt(e.target.value);
    setTimeLeft(minutes * 60);
    setIsActive(false);
    chrome.alarms.clear('studyTimer');
    chrome.storage.local.remove('timerState');
  };

  // --- TASKS (Unchanged) ---
  const saveTasksToStorage = (updatedTasks) => {
    setTasks(updatedTasks);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ tasks: updatedTasks });
    }
  };
  const addTask = () => {
    if (newTask.trim() === '') return;
    const updated = [...tasks, newTask];
    saveTasksToStorage(updated);
    setNewTask('');
  };
  const removeTask = (index) => {
    const updated = tasks.filter((_, i) => i !== index);
    saveTasksToStorage(updated);
  };
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="container">
      <h2>🎓 Student Buddy</h2>
      <div className="card">
        <h3>Focus Timer</h3>
        <select onChange={handleTimeChange} disabled={isActive} defaultValue="30" style={{marginBottom: '10px', padding: '5px'}}>
          <option value="1">1 Minute (Test)</option>
          <option value="5">5 Minutes</option>
          <option value="15">15 Minutes</option>
          <option value="30">30 Minutes (Default)</option>
          <option value="45">45 Minutes</option>
          <option value="60">60 Minutes</option>
        </select>
        <div className="timer-display">{formatTime(timeLeft)}</div>
        <div className="button-group">
          {isActive ? (
             <button onClick={stopTimer}>Pause</button>
          ) : (
             <button onClick={startTimer}>Start</button>
          )}
          <button className="reset-btn" onClick={resetTimer}>Reset</button>
        </div>
      </div>
      <div className="card">
        <h3>Tasks</h3>
        <div className="input-group">
          <input type="text" placeholder="Add a new task..." value={newTask} onChange={(e) => setNewTask(e.target.value)} />
          <button onClick={addTask}>+</button>
        </div>
        <ul>
          {tasks.map((task, index) => (
            <li key={index}>
              {task}
              <button className="delete-btn" onClick={() => removeTask(index)}>✕</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
export default App;