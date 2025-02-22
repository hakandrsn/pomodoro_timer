const { ipcRenderer } = require('electron');
const path = require("node:path");

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
document.getElementById('timerForm').addEventListener('submit', (e) => {
    e.preventDefault(); // Sayfa yenilenmesini engelle
    console.log("Form submitted!");

    const workTime = parseInt(document.getElementById('workTime').value, 10) * 60;
    const breakTime = parseInt(document.getElementById('breakTime').value, 10) * 60;
    const repeatCount = parseInt(document.getElementById('repeatCount').value, 10);

    console.log("Sending timer data: ", { workTime, breakTime, repeatCount });
    ipcRenderer.send('start-timer', { workTime, breakTime, repeatCount });
});

function startTimer({ workTime, breakTime, repeatCount }) {
    const countdownElement = document.getElementById('countdown');
    let currentCycle = 1;
    let isWorking = true;
    let timer = null;

    function updateDisplay(time, type) {
        countdownElement.innerHTML = `
            <div class="text-4xl font-mono">${formatTime(time)}</div>
            <div class="text-lg mt-2">
                ${type === 'work' ? '🎯 Çalışma' : '☕ Mola'} 
                (${currentCycle}/${repeatCount})
            </div>
        `;
    }

    function startNextSession() {
        clearInterval(timer);

        if (currentCycle > repeatCount) {
            countdownElement.innerHTML = `<div class="text-green-500 text-xl">🏁 Tamamlandı!</div>`;
            return;
        }

        const isLastCycle = currentCycle === repeatCount;
        let timeLeft = isWorking ? workTime : breakTime;
        updateDisplay(timeLeft, isWorking ? 'work' : 'break');

        timer = setInterval(() => {
            timeLeft--;
            updateDisplay(timeLeft, isWorking ? 'work' : 'break');

            if (timeLeft <= 0) {
                if (!isWorking || isLastCycle) currentCycle++;
                isWorking = !isWorking;
                startNextSession();
            }
        }, 1000);
    }

    startNextSession();
}

ipcRenderer.on('start-countdown', (event, data) => {
    console.log('Timer verileri alındı:', data);
    const countdownElement = document.getElementById('countdown');
    countdownElement.classList.remove('hidden');
    countdownElement.style.minHeight = '100px'; // Layout stabilitesi için

    try {
        startTimer(data);
    } catch (error) {
        console.error('Timer hatası:', error);
        countdownElement.innerHTML = `<div class="text-red-500">Hata: ${error.message}</div>`;
    }
});

