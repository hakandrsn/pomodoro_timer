const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    startTimer: (settings) => ipcRenderer.invoke('start-timer', settings),
    pauseTimer: () => ipcRenderer.send('pause-timer'),
    resumeTimer: () => ipcRenderer.send('resume-timer'),
    resetTimer: () => ipcRenderer.send('reset-timer'),
    setAlwaysOnTop: (alwaysOnTop) => ipcRenderer.send('set-always-on-top', alwaysOnTop),
    lowerVolume: () => ipcRenderer.send('lower-volume'),
    onTimerUpdate: (callback) => ipcRenderer.on('timer-update', callback),
    onTimerComplete: (callback) => ipcRenderer.on('timer-complete', callback),
    onTimerPaused: (callback) => ipcRenderer.on('timer-paused', callback),
    onTimerResumed: (callback) => ipcRenderer.on('timer-resumed', callback),
    onSessionSwitch: (callback) => ipcRenderer.on('session-switch', callback),
    lowerSystemVolume: () => ipcRenderer.send('lower-system-volume'),
    restoreSystemVolume: () => ipcRenderer.send('restore-system-volume')
});