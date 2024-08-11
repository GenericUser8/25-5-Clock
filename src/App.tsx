import { useState, useEffect } from 'react'
import './App.scss'
import 'bootstrap/dist/css/bootstrap.min.css'
import beep from './assets/BeepSound.wav'

const DEFAULT_BREAK_TIME: number = 300 as const;
const DEFAULT_WORK_TIME: number = 1500 as const;

enum Mode {
  SESSION,
  BREAK
}

enum TimerState {
  RUNNING,
  PAUSED,
  STOPPED
}

let intervalId: number = 0;

export default function App() {
  const [breakTime, setBreakTime] = useState(DEFAULT_BREAK_TIME);
  const [sessionTime, setSessionTime] = useState(DEFAULT_WORK_TIME);
  const [mode, setMode] = useState(Mode.SESSION);
  const [timer, setTimer] = useState(DEFAULT_WORK_TIME);
  const [timerState, setTimerState] = useState(TimerState.STOPPED);

  useEffect(() => {
    if (timerState === TimerState.RUNNING) {
      intervalId = setTimeout(() => {handleTimerChange()}, 1000);
    } else {
      clearInterval(intervalId);
    }
  });

  function handleTimerStateChange(state: TimerState) {
    if (state === TimerState.RUNNING) {
      setTimerState(TimerState.RUNNING)
    } else if (state === TimerState.PAUSED) {
      setTimerState(TimerState.PAUSED)
    } else {
      const audio = document.getElementById('beep') as HTMLAudioElement;
      audio.pause();
      audio.currentTime = 0;
      clearInterval(intervalId);
      setTimer(DEFAULT_WORK_TIME);
      setMode(Mode.SESSION);
      setBreakTime(DEFAULT_BREAK_TIME);
      setSessionTime(DEFAULT_WORK_TIME);
      setTimerState(TimerState.STOPPED)
    }
  }

  function handleTimerChange() {
    setTimer(timer - 1);
    if (timer <= 0) {
      const audio = document.getElementById('beep') as HTMLAudioElement;
      audio.play();
      if (mode === Mode.SESSION) {
        setMode(Mode.BREAK);
        setTimer(breakTime);
      } else {
        setMode(Mode.SESSION);
        setTimer(sessionTime);
      }
    }
  }

  function handleStartStop() {
    if (timerState === TimerState.RUNNING) {
      handleTimerStateChange(TimerState.PAUSED);
    } else if (timerState === TimerState.PAUSED) {
      handleTimerStateChange(TimerState.RUNNING);
    } else {
      setTimer(sessionTime);
      handleTimerStateChange(TimerState.RUNNING);
    }
  }
  function handleReset() {
    handleTimerStateChange(TimerState.STOPPED);
  }

  return (
    <main>
      <h1>25 + 5 Clock</h1>
      <SessionControl get={sessionTime} set={setSessionTime} />
      <BreakControl get={breakTime} set={setBreakTime} />
      <Timer mode={mode} timer={(timerState === TimerState.STOPPED ? sessionTime : timer)}/>
      <div className="timer-controls">
        <button className="btn btn-primary" id="start_stop" onClick={handleStartStop}>Start/Stop</button>
        <button className="btn btn-warning" id="reset" onClick={handleReset}>Reset</button>
      </div>
      <audio id="beep" src={beep}></audio>
    </main>
  )
}

interface ControlProps {
  get: number,
  set: React.Dispatch<React.SetStateAction<number>>
}
function SessionControl({ get, set }: ControlProps) {

  function increment() {
    if (get < 3600) {
      set(get + 60);
    }
  }
  function decrement() {
    if (get >= 120) {
      set(get - 60);
    }
  }

  return (
    <div className="controls-container">
      <h2 id="session-label">Session Length</h2>
      <div className='controls'>
        <button className="btn btn-success" onClick={increment} id="session-increment">Increase</button>
        <p id="session-length">{get / 60}</p>
        <button className="btn btn-danger" onClick={decrement} id="session-decrement">Decrease</button>
      </div>
    </div>
  )
}
function BreakControl({ get, set }: ControlProps) {

  function increment() {
    if (get < 3600) {
      set(get + 60);
    }
  }
  function decrement() {
    if (get >= 120) {
      set(get - 60);
    }
  }

  return (
    <div className="controls-container">
      <h2 id="break-label">Break Length</h2>
      <div className='controls'>
        <button className="btn btn-success" onClick={increment} id="break-increment">Increase</button>
        <p id="break-length">{get / 60}</p>
        <button className="btn btn-danger" onClick={decrement} id="break-decrement">Decrease</button>
      </div>
    </div>
  )
}

interface TimerProps {
  mode: Mode,
  timer: number
}
function Timer({ mode, timer }: TimerProps) {
  const modeText = ( mode === Mode.SESSION ? "Session" : "Break");
  const minutes = Math.floor(timer / 60);
  const seconds = timer - (minutes * 60);
  return (
    <div className={`timer-container${timer < 60 ? " low-time" :""}`}>
      <h2 id="timer-label">{modeText}</h2>
      <h3 id="time-left">{minutes.toLocaleString('en-US', {minimumIntegerDigits: 2})}:{seconds.toLocaleString('en-US', {minimumIntegerDigits: 2})}</h3>
    </div>
  )
}
