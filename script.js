const wheelCanvas = document.getElementById('wheelCanvas');
const spinButton = document.getElementById('spinButton');
const ctx = wheelCanvas.getContext('2d');

const segments = [
    { text: 'Prize 1', color: '#FFD700' },
    { text: 'Prize 2', color: '#FF6347' },
    { text: 'Prize 3', color: '#6A5ACD' },
    { text: 'Prize 4', color: '#3CB371' },
    { text: 'Prize 5', color: '#FF4500' },
    { text: 'Prize 6', color: '#1E90FF' },
    { text: 'Prize 7', color: '#DA70D6' },
    { text: 'Prize 8', color: '#FFD700' },
];

const numSegments = segments.length;
const arc = Math.PI / (numSegments / 2);
let spinTimeout = null;
let spinAngleStart = 10;
let spinTime = 0;
let spinTimeTotal = 0;

// Sound effects
const spinSound = new Audio('spin_sound.mp3');
const winSound = new Audio('win_sound.mp3');

function drawWheel() {
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10; // Adjust radius to fit pointer

    ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;

    for (let i = 0; i < numSegments; i++) {
        const angle = spinAngleStart + i * arc;
        ctx.fillStyle = segments[i].color;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, angle, angle + arc, false);
        ctx.lineTo(centerX, centerY);
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(segments[i].text, 0, -radius + 30);
        ctx.restore();
    }
}

function rotateWheel() {
    spinTime += 30;
    if (spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
    }
    const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    wheelCanvas.style.transform = `rotate(\${spinAngle}deg)`;
    spinTimeout = setTimeout(rotateWheel, 30);
}

function stopRotateWheel() {
    clearTimeout(spinTimeout);
    const degrees = (spinAngleStart % 360 + 360) % 360; // Ensure positive degrees
    const winningSegmentIndex = Math.floor(numSegments - (degrees / 360 * numSegments)) % numSegments;
    const winningSegment = segments[winningSegmentIndex];

    // Play win sound
    winSound.play();

    showResultPopup(winningSegment.text);
    spinButton.disabled = false;
}

function easeOut(t, b, c, d) {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
}

function showResultPopup(result) {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerHTML = `
        <h2>Congratulations!</h2>
        <p>You won: \${result}</p>
        <button id="closePopup">Spin Again</button>
    `;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.classList.add('show');
    }, 10);

    document.getElementById('closePopup').addEventListener('click', () => {
        popup.classList.remove('show');
        popup.addEventListener('transitionend', () => {
            popup.remove();
        }, { once: true });
    });
}

spinButton.addEventListener('click', () => {
    spinButton.disabled = true;
    spinSound.play();
    spinTime = 0;
    spinTimeTotal = Math.random() * 3000 + 4000; // Spin for 4-7 seconds
    spinAngleStart = Math.random() * 10 + 360 * 5; // Spin at least 5 full rotations
    rotateWheel();
});

// Initialize wheel size and draw
wheelCanvas.width = 400;
wheelCanvas.height = 400;
drawWheel();