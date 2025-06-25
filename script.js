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
    { text: 'Prize 8', color: '#00FFFF' },
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
    // Add spinning animation classes
    wheelCanvas.classList.add('wheel-spinning');
    
    // Calculate a random final rotation between 2 and 10 full rotations
    const finalRotation = 720 + Math.floor(Math.random() * 2880);
    
    // Set the final rotation as a custom property that can be used in CSS
    wheelCanvas.style.setProperty('--final-rotation', `${finalRotation}deg`);
    
    // Set timeout for stopping the wheel
    spinTimeout = setTimeout(() => {
        // Switch to stopping animation
        wheelCanvas.classList.remove('wheel-spinning');
        wheelCanvas.classList.add('wheel-stopping');
        
        // Calculate the final position for determining the winner
        spinAngleStart = finalRotation % 360;
        
        // Set timeout for when wheel fully stops
        setTimeout(stopRotateWheel, 1000); // Match spin-stop-animation duration
    }, 2000);
}

function stopRotateWheel() {
    clearTimeout(spinTimeout);
    
    // Remove spinning class, stopping class will be removed after its animation
    wheelCanvas.classList.remove('wheel-spinning');
    
    const degrees = (spinAngleStart % 360 + 360) % 360; // Ensure positive degrees
    const winningSegmentIndex = Math.floor(numSegments - (degrees / 360 * numSegments)) % numSegments;
    const winningSegment = segments[winningSegmentIndex];
    
    // Add shake animation to the pointer
    const pointer = document.querySelector('.pointer');
    pointer.classList.add('shake');
    pointer.addEventListener('animationend', () => {
        pointer.classList.remove('shake');
    }, { once: true });

    // Play win sound
    winSound.play();

    wheelCanvas.addEventListener('animationend', () => {
        wheelCanvas.classList.remove('wheel-stopping');
        wheelCanvas.style.transform = `rotate(${spinAngleStart}deg)`; // Ensure final position is set
        showResultPopup(winningSegment.text);
        spinButton.disabled = false;
    }, { once: true });
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
    
    // Reset any existing transforms and animations
    wheelCanvas.style.transition = 'none';
    wheelCanvas.style.transform = 'rotate(0deg)';
    wheelCanvas.classList.remove('wheel-spinning', 'wheel-stopping');
    
    // Force reflow to ensure the reset takes effect immediately
    void wheelCanvas.offsetWidth;
    
    // Restore transition
    wheelCanvas.style.transition = '';
    
    // Start the wheel rotation
    rotateWheel();
});

// Initialize wheel size and draw
wheelCanvas.width = 400;
wheelCanvas.height = 400;
drawWheel();