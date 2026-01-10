import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // --- STATE ---
  const [timeLeft, setTimeLeft] = useState(30 * 60); 
  const [isActive, setIsActive] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  // --- 1. INITIAL LOAD (Check Storage) ---
  useEffect(() => {
    // Load Tasks
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['tasks'], (result) => {
        if (result.tasks) setTasks(result.tasks);
      });

      // Load Timer State
      chrome.storage.local.get(['timerState'], (result) => {
        const state = result.timerState;
        if (state) {
          if (state.isRunning) {
            // Calculate time left based on the saved 'endTime'
            const now = Date.now();
            const remaining = Math.ceil((state.endTime - now) / 1000);
            
            if (remaining > 0) {
              setTimeLeft(remaining);
              setIsActive(true);
            } else {
              // Timer finished while closed
              setTimeLeft(0);
              setIsActive(false);
              chrome.storage.local.remove('timerState');
            }
          } else {
            // It was paused, just load the saved remaining time
            setTimeLeft(state.remaining);
            setIsActive(false);
          }
        }
      });
    }
  }, []);

  // --- 2. THE TICKER (Runs only when open) ---
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        // We check storage to stay in sync
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time is up!
            chrome.storage.local.remove('timerState');
            setIsActive(false);
            // Optional: Send a notification here if we added permissions later
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // --- 3. TIMER CONTROLS ---
  const toggleTimer = () => {
    if (isActive) {
      // PAUSE: Save the specific remaining time
      const state = { isRunning: false, remaining: timeLeft, endTime: null };
      chrome.storage.local.set({ timerState: state });
      setIsActive(false);
    } else {
      // START: Calculate the specific End Time (Now + Remaining Seconds)
      const targetTime = Date.now() + (timeLeft * 1000);
      const state = { isRunning: true, remaining: timeLeft, endTime: targetTime };
      chrome.storage.local.set({ timerState: state });
      setIsActive(true);
    }
  };

  const resetTimer = () => {
    chrome.storage.local.remove('timerState');
    setIsActive(false);
    setTimeLeft(30 * 60); // Reset to default 30 mins
  };

  const handleTimeChange = (e) => {
    const minutes = parseInt(e.target.value);
    setTimeLeft(minutes * 60);
    setIsActive(false);
    chrome.storage.local.remove('timerState'); // Clear any saved timer
  };

  // --- TASK LOGIC (Same as before) ---
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
        
        <select 
          onChange={handleTimeChange} 
          disabled={isActive} 
          defaultValue="30"
          style={{marginBottom: '10px', padding: '5px'}}
        >
          <option value="5">5 Minutes</option>
          <option value="15">15 Minutes</option>
          <option value="25">25 Minutes</option>
          <option value="30">30 Minutes (Default)</option>
          <option value="45">45 Minutes</option>
          <option value="60">60 Minutes</option>
        </select>

        <div className="timer-display">{formatTime(timeLeft)}</div>
        
        <div className="button-group">
          {/* Changed logic to use toggleTimer */}
          <button onClick={toggleTimer}>
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button className="reset-btn" onClick={resetTimer}>
            Reset
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Tasks</h3>
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Add a new task..." 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
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