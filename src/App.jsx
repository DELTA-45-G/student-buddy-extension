import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // --- TIMER STATE ---
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);

  // --- TASK STATE ---
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  // 1. Load tasks from Chrome Storage when the app starts
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['tasks'], (result) => {
        if (result.tasks) {
          setTasks(result.tasks);
        }
      });
    }
  }, []);

  // 2. Timer Logic (Counts down every second)
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      alert("Time to take a break!");
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // 3. Helper Functions
  const saveTasksToStorage = (updatedTasks) => {
    setTasks(updatedTasks);
    // Only save if we are in the extension environment
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
      
      {/* Timer Section */}
      <div className="card">
        <h3>Focus Timer</h3>
        <div className="timer-display">{formatTime(timeLeft)}</div>
        <div className="button-group">
          <button onClick={() => setIsActive(!isActive)}>
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button className="reset-btn" onClick={() => { setIsActive(false); setTimeLeft(25*60); }}>
            Reset
          </button>
        </div>
      </div>

      {/* Task Section */}
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