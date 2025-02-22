const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const loudness = require('loudness');

let mainWindow;
let timer = null;
let currentState = {
    workTime: 0,
    breakTime: 0,
    repeatCount: 0,
    currentCycle: 0,
    isWorking: true,
    timeLeft: 0,
    isRunning: false,
    isPaused: false
};

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 500,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        },
        frame: false,
        titleBarStyle: 'hidden',
        alwaysOnTop: false // Başlangıçta her zaman üstte değil
    });

    mainWindow.loadFile('index.html');
    // mainWindow.webContents.openDevTools();
}

// Ses seviyesini ayarlama fonksiyonu
async function setSystemVolume(volume) {
    try {
        await loudness.setVolume(volume);
    } catch (error) {
        console.error('Ses seviyesi ayarlanırken hata:', error);
    }
}

let originalVolume = 100; // Sistem ses seviyesini saklamak için

async function lowerSystemVolume() {
    try {
        originalVolume = await loudness.getVolume(); // Mevcut ses seviyesini kaydet
        await loudness.setVolume(5); // Sistem sesini %5'e düşür
    } catch (error) {
        console.error('Ses seviyesi ayarlanırken hata:', error);
    }
}

async function restoreSystemVolume() {
    try {
        await loudness.setVolume(originalVolume); // Ses seviyesini eski haline getir
    } catch (error) {
        console.error('Ses seviyesi geri yüklenirken hata:', error);
    }
}

// Ses seviyesini azalt ve eski haline getir
// main.js (ses kontrol güncellemesi)
async function temporarilyLowerVolume() {
    try {
        const currentVolume = await loudness.getVolume();
        await setSystemVolume(5);

        // 3 saniye sonra eski ses seviyesine dön
        setTimeout(async () => {
            try {
                await setSystemVolume(currentVolume);
            } catch (error) {
                console.error('Ses geri yüklenirken hata:', error);
            }
        }, 5000);

    } catch (error) {
        console.error('Ses kontrol hatası:', error);
    }
}
ipcMain.handle('start-timer', (event, { work, break: breakTime, repeat }) => {
    if (timer) clearInterval(timer);

    currentState = {
        workTime: work * 60,
        breakTime: breakTime * 60,
        repeatCount: repeat,
        currentCycle: 1,
        isWorking: true,
        timeLeft: work * 60,
        isRunning: true,
        isPaused: false
    };

    startTimer();
    return formatTime(currentState.timeLeft);
});

ipcMain.on('pause-timer', () => {
    clearInterval(timer);
    currentState.isPaused = true;
    mainWindow.webContents.send('timer-paused');
});

ipcMain.on('timer-complete', () => {
    temporarilyLowerVolume(); // Ses seviyesini azalt
    mainWindow.webContents.send('timer-complete');
});

ipcMain.on('timer-paused', () => {
    temporarilyLowerVolume(); // Ses seviyesini azalt
    mainWindow.webContents.send('timer-paused');
});

ipcMain.on('resume-timer', () => {
    if (currentState.isPaused) {
        currentState.isPaused = false;
        startTimer();
        mainWindow.webContents.send('timer-resumed');
    }
});

ipcMain.on('reset-timer', () => {
    clearInterval(timer);
    timer = null;
    currentState.isRunning = false;
    currentState.isPaused = false;
    mainWindow.webContents.send('timer-stop');
});

function startTimer() {
    timer = setInterval(() => {
        if (!currentState.isPaused) {
            currentState.timeLeft--;

            if (currentState.timeLeft <= 0) {
                handleTimerEnd();
            }

            mainWindow.webContents.send('timer-update', {
                time: formatTime(currentState.timeLeft),
                mode: currentState.isWorking ? 'work' : 'break',
                cycle: currentState.currentCycle
            });
        }
    }, 1000);
}

function handleTimerEnd() {
    // Geçiş sesi için event gönder
    const newMode = currentState.isWorking ? 'break' : 'work';
    mainWindow.webContents.send('session-switch', newMode);

    if (currentState.isWorking) {
        currentState.isWorking = false;
        currentState.timeLeft = currentState.breakTime;
    } else {
        currentState.isWorking = true;
        currentState.timeLeft = currentState.workTime;
        currentState.currentCycle++;
    }

    if (currentState.currentCycle > currentState.repeatCount) {
        clearInterval(timer);
        mainWindow.webContents.send('timer-complete');
    }
}



function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Her Zaman Üstte Ayarı
ipcMain.on('set-always-on-top', (event, alwaysOnTop) => {
    mainWindow.setAlwaysOnTop(alwaysOnTop);
});

ipcMain.on('lower-system-volume', async () => {
    await lowerSystemVolume();
});

ipcMain.on('restore-system-volume', async () => {
    await restoreSystemVolume();
});
ipcMain.on('lower-volume', () => {
    temporarilyLowerVolume();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});