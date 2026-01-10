import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // --- TIMER STATE ---
  // CHANGE 1: Set default state to 30 * 60 (1800 seconds)
  const [timeLeft, setTimeLeft] = useState(30 * 60); 
  const [initialTime, setInitialTime] = useState(30 * 60); 
  const [isActive, setIsActive] = useState(false);

  // --- TASK STATE ---
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['tasks'], (result) => {
        if (result.tasks) setTasks(result.tasks);
      });
    }
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      alert("Time's up! Great work.");
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleTimeChange = (e) => {
    const minutes = parseInt(e.target.value);
    const seconds = minutes * 60;
    setInitialTime(seconds);
    setTimeLeft(seconds);
    setIsActive(false);
  };

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
        
        {/* CHANGE 2: Moved 'defaultValue' to 30 */}
        <select 
          onChange={handleTimeChange} 
          disabled={isActive} 
          defaultValue="30" 
          style={{marginBottom: '10px', padding: '5px'}}
        >
          <option value="5">5 Minutes</option>
          <option value="10">10 Minutes</option>
          <option value="15">15 Minutes</option>
          <option value="25">25 Minutes</option>
          <option value="30">30 Minutes (Default)</option>
          <option value="45">45 Minutes</option>
          <option value="60">60 Minutes (1 Hour)</option>
          <option value="90">90 Minutes (1.5 Hours)</option>
          <option value="120">120 Minutes (2 Hours)</option>
          <option value="150">150 Minutes (2.5 Hours)</option>
          <option value="180">180 Minutes (3 Hours)</option>
        </select>

        <div className="timer-display">{formatTime(timeLeft)}</div>
        
        <div className="button-group">
          <button onClick={() => setIsActive(!isActive)}>
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button className="reset-btn" onClick={() => { setIsActive(false); setTimeLeft(initialTime); }}>
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