/**
 * ///SIGNAL_INTERCEPTOR///
 * Underground Rave Event - Interactive Website
 * All frontend, no backend required
 */

// ========================================
// CONFIGURATION
// ========================================

const CONFIG = {
    // Event date: December 27, 2025 at 22:00 (Bulgaria timezone UTC+2)
    targetDate: new Date('2025-12-27T22:00:00+02:00'),

    // Varna, Bulgaria coordinates
    location: {
        lat: 43.204666,
        lon: 27.910543,
        displayLat: "43°12'16\"N",
        displayLon: "27°54'38\"E"
    },

    // Terminal commands
    commands: {
        help: 'Available commands: help, status, signal, decrypt, locate, frequency, clear, about, rave',
        status: 'SYSTEM STATUS: ACTIVE\nSIGNAL: DETECTED\nENCRYPTION: LEVEL 7\nCOUNTDOWN: ACTIVE',
        signal: 'SIGNAL ANALYSIS:\n- Frequency: 138.00 BPM\n- Type: TECHNO/UNDERGROUND\n- Origin: SUBTERRANEAN\n- Depth: CLASSIFIED',
        locate: 'TRIANGULATING...\nSIGNAL ORIGIN: BLACK SEA COAST\nREGION: EASTERN EUROPE\nPRECISION: ███████░░░ 73%\nFULL COORDINATES REQUIRE LEVEL OMEGA ACCESS',
        frequency: 'SCANNING FREQUENCIES...\n138.00 MHz - ACTIVE [TECHNO]\n140.00 MHz - ACTIVE [ACID]\n145.00 MHz - DORMANT\n150.00 MHz - ENCRYPTED',
        about: 'SIGNAL INTERCEPTOR v6.66\nDeveloped by: [REDACTED]\nPurpose: LOCATE THE UNDERGROUND\nWarning: NOT FOR PUBLIC DISTRIBUTION',
        rave: 'R.A.V.E.\nRadical Audio Visual Experience\n\nThe underground calls...\nWill you answer?',
        clear: 'CLEAR'
    },

    // Secret codes
    secrets: {
        konami: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
        decrypt: 'underground',
        omega: '27121022'
    },

    // Encrypted messages that slowly reveal
    encryptedMessages: [
        '████████████████████',
        '██████UNDERGROUND██████',
        '████UNDERGROUND████████',
        '██UNDERGROUND██████████',
        'UNDERGROUND████████████',
        'UNDERGROUND AWAITS█████',
        'UNDERGROUND AWAITS.████',
        'UNDERGROUND AWAITS..███',
        'UNDERGROUND AWAITS...██',
        'UNDERGROUND AWAITS....█',
        'UNDERGROUND AWAITS.....'
    ]
};

// ========================================
// STATE
// ========================================

let state = {
    bootComplete: false,
    audioEnabled: false,
    audioContext: null,
    oscillators: [],
    konamiProgress: 0,
    secretsFound: [],
    visitorCount: 0,
    decryptIndex: 0,
    glitchInterval: null,
    terminalHistory: [],
    historyIndex: -1,
    passwordAttempts: 3
};

// Secret password for boot access
const BOOT_PASSWORD = 'truerave';

// ========================================
// RETRO KEYBOARD SOUNDS (Mechanical Keyboard Style)
// ========================================

let keyboardAudioContext = null;

function initKeyboardSounds() {
    // Create audio context on first user interaction
    document.addEventListener('keydown', initAudioOnce, { once: true });
    document.addEventListener('click', initAudioOnce, { once: true });
}

function initAudioOnce() {
    if (!keyboardAudioContext) {
        keyboardAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playKeySound(type = 'press') {
    if (!keyboardAudioContext) {
        keyboardAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const ctx = keyboardAudioContext;
    const now = ctx.currentTime;

    if (type === 'press') {
        // Mechanical keyboard click - short, sharp, clicky
        // Uses noise burst with tight bandpass filter for realistic click
        const bufferSize = ctx.sampleRate * 0.015; // 15ms of noise
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // Create short noise burst
        for (let i = 0; i < bufferSize; i++) {
            // Sharp attack, quick decay
            const envelope = Math.exp(-i / (bufferSize * 0.1));
            data[i] = (Math.random() * 2 - 1) * envelope;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        // Bandpass filter for that clicky mechanical sound
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3000 + Math.random() * 1000, now);
        filter.Q.setValueAtTime(2, now);

        // Highpass to remove low rumble
        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.setValueAtTime(800, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15 + Math.random() * 0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        noise.connect(filter);
        filter.connect(highpass);
        highpass.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);

    } else if (type === 'enter') {
        // Enter key - slightly longer, more substantial thunk
        const bufferSize = ctx.sampleRate * 0.03; // 30ms
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const envelope = Math.exp(-i / (bufferSize * 0.15));
            data[i] = (Math.random() * 2 - 1) * envelope;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.Q.setValueAtTime(1.5, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);

    } else if (type === 'error') {
        // Error - low buzz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.setValueAtTime(100, now + 0.1);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);

    } else if (type === 'success') {
        // Success - pleasant ascending tones
        const frequencies = [523, 659, 784];
        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.08);

            gain.gain.setValueAtTime(0, now);
            gain.gain.setValueAtTime(0.06, now + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.12);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.12);
        });

    } else if (type === 'backspace') {
        // Backspace - slightly softer click, different pitch
        const bufferSize = ctx.sampleRate * 0.012;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const envelope = Math.exp(-i / (bufferSize * 0.08));
            data[i] = (Math.random() * 2 - 1) * envelope;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2500, now);
        filter.Q.setValueAtTime(2.5, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);
    }
}

// Global keyboard sound handler
document.addEventListener('keydown', (e) => {
    // Only play sounds for actual character input, not modifier keys
    if (e.key === 'Enter') {
        playKeySound('enter');
    } else if (e.key === 'Backspace') {
        playKeySound('backspace');
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        playKeySound('press');
    }
});

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Scroll to top on load
    window.scrollTo(0, 0);

    initBootSequence();
    initCountdown();
    initRadarMap();
    initTerminal();
    initEventListeners();
    initRandomGlitches();
    initVisitorCount();
    initBpmSlider();
    initEncryptedMessage();
    initAudioPlayer();
    initMapMinigame();
});

// ========================================
// INTRO ANIMATION
// ========================================

function playIntroAnimation() {
    const introOverlay = document.getElementById('intro-overlay');
    const mainContent = document.getElementById('main-content');
    const floatingPlayer = document.getElementById('floating-player');

    // Show intro overlay with TRUE RAVE text
    introOverlay.classList.add('active');

    // After 1.5 seconds, start shrinking animation
    setTimeout(() => {
        introOverlay.classList.add('shrinking');

        // After shrink animation, fade out and show main content
        setTimeout(() => {
            introOverlay.classList.remove('active');
            introOverlay.classList.add('fade-out');
            mainContent.classList.remove('hidden');

            // Scroll to top
            window.scrollTo(0, 0);

            // Show floating player
            setTimeout(() => {
                floatingPlayer.classList.add('visible');
                state.bootComplete = true;
                startAmbientEffects();
                autoPlayAfterBoot();
            }, 300);

        }, 800);
    }, 1500);
}

// ========================================
// BOOT SEQUENCE WITH PASSWORD
// ========================================

function initBootSequence() {
    const passwordInput = document.getElementById('boot-password');
    const passwordHint = document.getElementById('password-hint');
    const attemptsDisplay = document.getElementById('password-attempts');
    const passwordSection = document.getElementById('password-section');
    const accessGrantedSection = document.getElementById('access-granted-section');
    const bootSequence = document.getElementById('boot-sequence');
    const mainContent = document.getElementById('main-content');

    // Focus password input after animation
    setTimeout(() => {
        if (passwordInput) {
            passwordInput.focus();
        }
    }, 2800);

    // Handle password input
    if (passwordInput) {
        passwordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const enteredPassword = passwordInput.value.toLowerCase().trim();

                if (enteredPassword === BOOT_PASSWORD || enteredPassword === 'sun') {
                    // Correct password
                    passwordHint.textContent = 'PASSWORD ACCEPTED';
                    passwordHint.className = 'password-hint success';
                    passwordInput.disabled = true;

                    // Show access granted
                    setTimeout(() => {
                        passwordSection.style.display = 'none';
                        accessGrantedSection.classList.remove('hidden');

                        // Transition to intro animation
                        setTimeout(() => {
                            bootSequence.classList.add('hidden');
                            playIntroAnimation();
                        }, 2000);
                    }, 500);

                } else {
                    // Wrong password
                    state.passwordAttempts--;
                    attemptsDisplay.textContent = `ATTEMPTS REMAINING: ${state.passwordAttempts}`;

                    if (state.passwordAttempts <= 0) {
                        passwordHint.textContent = 'ACCESS DENIED - SYSTEM LOCKED';
                        passwordHint.className = 'password-hint error';
                        passwordInput.disabled = true;
                        attemptsDisplay.textContent = 'LOCKOUT INITIATED';
                        attemptsDisplay.style.color = '#ff0040';

                        // After lockout, reveal a hint
                        setTimeout(() => {
                            passwordHint.textContent = 'HINT: What do seekers find? The _ _ _ _   _ _ _ _';
                            passwordHint.style.color = '#00ffff';
                            passwordInput.disabled = false;
                            state.passwordAttempts = 1;
                            attemptsDisplay.textContent = 'FINAL ATTEMPT';
                        }, 3000);
                    } else {
                        passwordHint.textContent = 'INVALID ACCESS CODE';
                        passwordHint.className = 'password-hint error';

                        // Give subtle hints based on attempts
                        if (state.passwordAttempts === 2) {
                            setTimeout(() => {
                                passwordHint.textContent = 'HINT: Seek the authentic experience...';
                                passwordHint.style.color = '#ffaa00';
                            }, 1500);
                        } else if (state.passwordAttempts === 1) {
                            setTimeout(() => {
                                passwordHint.textContent = 'HINT: What is genuine? What is real?';
                                passwordHint.style.color = '#ffaa00';
                            }, 1500);
                        }
                    }

                    // Clear input and shake effect
                    passwordInput.value = '';
                    passwordInput.classList.add('shake');
                    setTimeout(() => passwordInput.classList.remove('shake'), 500);
                }
            }
        });

        // Visual feedback while typing
        passwordInput.addEventListener('input', () => {
            if (passwordInput.value.length > 0) {
                passwordHint.textContent = '█'.repeat(passwordInput.value.length);
                passwordHint.style.color = '#00ff41';
            } else {
                passwordHint.textContent = '';
            }
        });
    }
}

// ========================================
// COUNTDOWN TIMER
// ========================================

function initCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const now = new Date();
    const diff = CONFIG.targetDate - now;

    if (diff <= 0) {
        // Event has started
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        document.querySelector('.countdown-label').textContent = 'TRANSMISSION ACTIVE';
        document.querySelector('.countdown-label').style.color = '#00ff41';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = padZero(days);
    document.getElementById('hours').textContent = padZero(hours);
    document.getElementById('minutes').textContent = padZero(minutes);
    document.getElementById('seconds').textContent = padZero(seconds);
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}

// ========================================
// BPM TIMELINE SLIDER
// ========================================

function initBpmSlider() {
    const slider = document.getElementById('bpm-slider');
    const bpmValue = document.getElementById('bpm-value');
    const progressBar = document.getElementById('timeline-progress');

    if (!slider || !bpmValue) return;

    // BPM range: 138 to 150
    const minBpm = 138;
    const maxBpm = 150;

    function updateBpm(value) {
        // Calculate BPM based on slider position (0-100)
        const bpm = Math.round(minBpm + (value / 100) * (maxBpm - minBpm));
        bpmValue.textContent = bpm;

        // Update progress bar width based on slider value
        if (progressBar) {
            progressBar.style.width = `${value}%`;
        }

        // Add glow effect when BPM is high
        if (bpm >= 145) {
            bpmValue.style.color = '#00ffff';
            bpmValue.style.textShadow = '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff';
        } else {
            bpmValue.style.color = '#00ff41';
            bpmValue.style.textShadow = '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41';
        }
    }

    // Handle slider input
    slider.addEventListener('input', (e) => {
        updateBpm(e.target.value);
    });

    // Initialize with starting value
    updateBpm(0);

    // Optional: Auto-animate the slider slowly over time
    let autoAnimate = false;
    let animationValue = 0;

    function animateBpm() {
        if (autoAnimate && animationValue < 100) {
            animationValue += 0.02; // Very slow progression
            slider.value = animationValue;
            updateBpm(animationValue);
        }
        requestAnimationFrame(animateBpm);
    }

    // Start auto-animation when boot completes (optional - commented out by default)
    // To enable, uncomment the line below in startAmbientEffects()
    window.startBpmAnimation = () => {
        autoAnimate = true;
        animateBpm();
    };

    // Stop animation when user interacts with slider
    slider.addEventListener('mousedown', () => {
        autoAnimate = false;
    });
    slider.addEventListener('touchstart', () => {
        autoAnimate = false;
    });
}

// ========================================
// AUDIO PLAYER WITH LIVE VISUALIZER
// ========================================

let audioElement = null;
let audioContext = null;
let analyser = null;
let isPlaying = false;
let animationId = null;

function initAudioPlayer() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');

    // Create audio element
    audioElement = new Audio('Ben Klock - Subzero.mp3');
    audioElement.crossOrigin = 'anonymous';
    audioElement.volume = 0.7;
    audioElement.loop = true;

    // Update time display
    audioElement.addEventListener('timeupdate', () => {
        currentTimeEl.textContent = formatTime(audioElement.currentTime);
    });

    audioElement.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audioElement.duration);
        console.log('Audio loaded, duration:', audioElement.duration);
    });

    audioElement.addEventListener('play', () => {
        isPlaying = true;
        updatePlayButton();
        // Initialize audio context on first play (user interaction required)
        if (!audioContext) {
            initAudioContext();
        }
        startVisualizer();
    });

    audioElement.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayButton();
    });

    audioElement.addEventListener('error', (e) => {
        console.error('Audio error:', e);
    });

    // Play/Pause button
    playPauseBtn.addEventListener('click', togglePlay);

    // Volume slider
    volumeSlider.addEventListener('input', (e) => {
        if (audioElement) {
            audioElement.volume = e.target.value / 100;
        }
    });
}

function initAudioContext() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();

        // Configure analyser for better frequency resolution
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.7;

        // Connect audio element to analyser
        const source = audioContext.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        console.log('Audio context initialized');
    } catch (e) {
        console.error('Failed to create audio context:', e);
    }
}

function togglePlay() {
    if (!audioElement) return;

    if (isPlaying) {
        audioElement.pause();
    } else {
        // Resume audio context if suspended (Chrome autoplay policy)
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
        audioElement.play();
    }
}

function updatePlayButton() {
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');

    if (isPlaying) {
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
    } else {
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Auto-play after boot sequence completes
function autoPlayAfterBoot() {
    if (audioElement && !isPlaying) {
        setTimeout(() => {
            // Resume audio context if suspended (required for Chrome autoplay policy)
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }

            // Initialize audio context if not already done
            if (!audioContext) {
                initAudioContext();
            }

            audioElement.play().then(() => {
                console.log('Autoplay started successfully');
            }).catch(e => {
                console.log('Autoplay blocked, user must click play:', e);
            });
        }, 500);
    }
}


// ========================================
// RADAR MAP - Custom Canvas Drawing
// ========================================

function initRadarMap() {
    const canvas = document.getElementById('radar-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Set canvas size
    function resizeCanvas() {
        const wrapper = canvas.parentElement;
        canvas.width = wrapper.offsetWidth;
        canvas.height = wrapper.offsetHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Radar state
    let sweepAngle = 0;
    const targetX = 0.58; // Target position (relative)
    const targetY = 0.52;

    // Draw radar
    function drawRadar() {
        const w = canvas.width;
        const h = canvas.height;
        const centerX = w * 0.4;
        const centerY = h * 0.5;
        const maxRadius = Math.min(w, h) * 0.45;

        // Clear
        ctx.fillStyle = '#000800';
        ctx.fillRect(0, 0, w, h);

        // Draw coastline (simplified Varna coast)
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Simplified coastline shape
        ctx.moveTo(w * 0.7, 0);
        ctx.lineTo(w * 0.65, h * 0.2);
        ctx.lineTo(w * 0.7, h * 0.35);
        ctx.lineTo(w * 0.6, h * 0.5);
        ctx.lineTo(w * 0.65, h * 0.7);
        ctx.lineTo(w * 0.55, h * 0.85);
        ctx.lineTo(w * 0.6, h);
        ctx.stroke();

        // Fill sea area
        ctx.fillStyle = 'rgba(0, 100, 100, 0.1)';
        ctx.beginPath();
        ctx.moveTo(w * 0.7, 0);
        ctx.lineTo(w * 0.65, h * 0.2);
        ctx.lineTo(w * 0.7, h * 0.35);
        ctx.lineTo(w * 0.6, h * 0.5);
        ctx.lineTo(w * 0.65, h * 0.7);
        ctx.lineTo(w * 0.55, h * 0.85);
        ctx.lineTo(w * 0.6, h);
        ctx.lineTo(w, h);
        ctx.lineTo(w, 0);
        ctx.closePath();
        ctx.fill();

        // Draw grid
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
        ctx.lineWidth = 1;

        // Vertical lines
        for (let x = 0; x < w; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y < h; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Draw radar circles from target position
        const targetPosX = w * targetX;
        const targetPosY = h * targetY;

        ctx.strokeStyle = 'rgba(0, 255, 65, 0.2)';
        for (let r = 30; r < maxRadius * 2; r += 50) {
            ctx.beginPath();
            ctx.arc(targetPosX, targetPosY, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw sweep line
        ctx.save();
        ctx.translate(targetPosX, targetPosY);
        ctx.rotate(sweepAngle);

        // Sweep gradient
        const gradient = ctx.createLinearGradient(0, 0, maxRadius, 0);
        gradient.addColorStop(0, 'rgba(0, 255, 65, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 255, 65, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, maxRadius, -0.2, 0.2);
        ctx.closePath();
        ctx.fill();

        // Sweep line
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(maxRadius, 0);
        ctx.stroke();

        ctx.restore();

        // Draw some random noise dots
        ctx.fillStyle = 'rgba(0, 255, 65, 0.3)';
        for (let i = 0; i < 20; i++) {
            const nx = Math.random() * w;
            const ny = Math.random() * h;
            const ns = Math.random() * 2 + 1;
            if (Math.random() > 0.5) {
                ctx.beginPath();
                ctx.arc(nx, ny, ns, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw roads (simplified)
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.25)';
        ctx.lineWidth = 1;

        // Main road
        ctx.beginPath();
        ctx.moveTo(0, h * 0.5);
        ctx.lineTo(w * 0.5, h * 0.5);
        ctx.lineTo(w * 0.55, h * 0.55);
        ctx.stroke();

        // Secondary roads
        ctx.beginPath();
        ctx.moveTo(w * 0.3, h * 0.3);
        ctx.lineTo(w * 0.3, h * 0.7);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(w * 0.15, h * 0.45);
        ctx.lineTo(w * 0.45, h * 0.45);
        ctx.stroke();

        // Draw "buildings" (small rectangles in city area)
        ctx.fillStyle = 'rgba(0, 255, 65, 0.15)';
        for (let i = 0; i < 30; i++) {
            const bx = w * 0.1 + Math.random() * w * 0.4;
            const by = h * 0.3 + Math.random() * h * 0.4;
            const bw = 3 + Math.random() * 6;
            const bh = 3 + Math.random() * 6;
            ctx.fillRect(bx, by, bw, bh);
        }

        // Update sweep angle
        sweepAngle += 0.02;
        if (sweepAngle > Math.PI * 2) {
            sweepAngle = 0;
        }

        requestAnimationFrame(drawRadar);
    }

    drawRadar();
}

// ========================================
// TERMINAL
// ========================================

function initTerminal() {
    const input = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');
    const terminalBody = document.querySelector('.terminal-body');

    // Auto-scroll when input is focused
    input.addEventListener('focus', () => {
        scrollTerminalToBottom();
    });

    // Auto-scroll on any input
    input.addEventListener('input', () => {
        scrollTerminalToBottom();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = input.value.trim().toLowerCase();
            processCommand(command);
            state.terminalHistory.push(command);
            state.historyIndex = state.terminalHistory.length;
            input.value = '';
            scrollTerminalToBottom();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (state.historyIndex > 0) {
                state.historyIndex--;
                input.value = state.terminalHistory[state.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (state.historyIndex < state.terminalHistory.length - 1) {
                state.historyIndex++;
                input.value = state.terminalHistory[state.historyIndex];
            } else {
                state.historyIndex = state.terminalHistory.length;
                input.value = '';
            }
        }
        scrollTerminalToBottom();
    });
}

function scrollTerminalToBottom() {
    const terminalBody = document.querySelector('.terminal-body');
    if (terminalBody) {
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }
}

function processCommand(command) {
    const output = document.getElementById('terminal-output');

    // Add user command to output
    addTerminalLine(`> ${command}`, 'user-command');

    // Check for secret commands
    if (command === 'decrypt' || command === CONFIG.secrets.decrypt) {
        unlockSecret('decrypt');
        addTerminalLine('DECRYPTING...', 'system');
        setTimeout(() => {
            addTerminalLine('ACCESS LEVEL: OMEGA', 'success');
            addTerminalLine('Type "omega" for classified information', 'hint');
        }, 1000);
        return;
    }

    if (command === 'omega' || command === CONFIG.secrets.omega) {
        showSecretPanel();
        addTerminalLine('///OMEGA ACCESS GRANTED///', 'success');
        return;
    }

    if (command === '138' || command === '138.00' || command === '138bpm') {
        addTerminalLine('FREQUENCY LOCKED: 138 BPM', 'success');
        addTerminalLine('This is the heartbeat of the underground.', 'hint');
        triggerGlitch();
        return;
    }

    if (command === 'varna' || command === 'bulgaria' || command === 'black sea') {
        addTerminalLine('LOCATION RECOGNIZED', 'warning');
        addTerminalLine('Signal origin confirmed in target region.', 'system');
        addTerminalLine('The coast holds secrets...', 'hint');
        return;
    }

    // Standard commands
    if (CONFIG.commands[command]) {
        if (command === 'clear') {
            output.innerHTML = '<p>> Terminal cleared.</p><p>> _</p>';
            return;
        }

        const response = CONFIG.commands[command];
        response.split('\n').forEach(line => {
            addTerminalLine(line, 'system');
        });
    } else if (command === '') {
        return;
    } else {
        addTerminalLine(`Command not recognized: ${command}`, 'error');
        addTerminalLine('Type "help" for available commands.', 'hint');
    }
}

function addTerminalLine(text, type = 'system') {
    const output = document.getElementById('terminal-output');
    const line = document.createElement('p');
    line.textContent = text;

    switch(type) {
        case 'error':
            line.style.color = '#ff0040';
            break;
        case 'success':
            line.style.color = '#00ff41';
            break;
        case 'warning':
            line.style.color = '#ffaa00';
            break;
        case 'hint':
            line.style.color = '#00ffff';
            break;
        case 'user-command':
            line.style.color = '#888';
            break;
    }

    output.appendChild(line);
    scrollTerminalToBottom();
}

// ========================================
// EVENT LISTENERS
// ========================================

function initEventListeners() {
    // Konami code listener
    document.addEventListener('keydown', handleKonamiCode);

    // Secret panel close
    const closeSecret = document.getElementById('close-secret');
    closeSecret.addEventListener('click', hideSecretPanel);

    // Konami overlay click to close
    const konamiOverlay = document.getElementById('konami-overlay');
    konamiOverlay.addEventListener('click', () => {
        konamiOverlay.classList.add('hidden');
    });

    // Click on map blip
    const mapBlip = document.getElementById('map-blip');
    if (mapBlip) {
        mapBlip.style.cursor = 'pointer';
        mapBlip.style.pointerEvents = 'auto';
        mapBlip.addEventListener('click', () => {
            triggerGlitch();
            addTerminalLine('> TARGET LOCKED', 'user-command');
            addTerminalLine('Location: TABOO E.F.C., Primorski District', 'system');
            addTerminalLine('Coordinates confirmed. See you there...', 'hint');
        });
    }

    // Easter egg: Click on footer symbols
    const secretSymbols = document.querySelector('.secret-symbols');
    let symbolClicks = 0;
    secretSymbols.style.cursor = 'pointer';
    secretSymbols.addEventListener('click', () => {
        symbolClicks++;
        if (symbolClicks >= 5) {
            showSecretPanel();
            symbolClicks = 0;
        } else {
            triggerGlitch();
        }
    });

    // Double-click anywhere for random glitch
    document.addEventListener('dblclick', triggerGlitch);
}

function handleKonamiCode(e) {
    const expected = CONFIG.secrets.konami[state.konamiProgress];

    if (e.key === expected) {
        state.konamiProgress++;

        if (state.konamiProgress === CONFIG.secrets.konami.length) {
            // Konami code complete!
            showKonamiOverlay();
            state.konamiProgress = 0;
        }
    } else {
        state.konamiProgress = 0;
    }
}

// ========================================
// MAP MINIGAME - Decrypt coordinates
// ========================================

let minigameState = {
    currentStep: 0,
    targetOrder: [],
    isActive: false
};

function initMapMinigame() {
    const infoLocked = document.getElementById('info-locked');
    const infoMinigame = document.getElementById('info-minigame');
    const infoUnlocked = document.getElementById('info-unlocked');
    const minigameTargets = document.getElementById('minigame-targets');
    const minigameProgress = document.getElementById('minigame-progress');

    if (!infoLocked) return;

    // Click on locked state to start minigame
    infoLocked.addEventListener('click', () => {
        startMinigame();
    });

    // Handle target button clicks
    if (minigameTargets) {
        const buttons = minigameTargets.querySelectorAll('.target-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                handleTargetClick(btn, buttons);
            });
        });
    }
}

function startMinigame() {
    const infoLocked = document.getElementById('info-locked');
    const infoMinigame = document.getElementById('info-minigame');
    const minigameTargets = document.getElementById('minigame-targets');
    const minigameProgress = document.getElementById('minigame-progress');

    // Hide locked, show minigame
    infoLocked.classList.add('hidden');
    infoMinigame.classList.remove('hidden');

    // Reset state
    minigameState.currentStep = 0;
    minigameState.isActive = true;

    // Randomize button positions
    const buttons = minigameTargets.querySelectorAll('.target-btn');
    const shuffledPositions = shuffleArray([0, 1, 2, 3]);

    buttons.forEach((btn, i) => {
        btn.classList.remove('correct', 'wrong');
        btn.style.order = shuffledPositions[i];
    });

    // Update progress
    minigameProgress.textContent = '0/4';

    // Play sound
    playKeySound('press');
    triggerGlitch();
}

function handleTargetClick(clickedBtn, allButtons) {
    if (!minigameState.isActive) return;

    const expectedOrder = minigameState.currentStep + 1;
    const clickedOrder = parseInt(clickedBtn.dataset.order);

    if (clickedOrder === expectedOrder) {
        // Correct!
        clickedBtn.classList.add('correct');
        minigameState.currentStep++;

        const minigameProgress = document.getElementById('minigame-progress');
        minigameProgress.textContent = `${minigameState.currentStep}/4`;

        playKeySound('press');

        if (minigameState.currentStep >= 4) {
            // Minigame complete!
            minigameState.isActive = false;
            setTimeout(() => {
                completeMinigame();
            }, 500);
        }
    } else {
        // Wrong!
        clickedBtn.classList.add('wrong');
        playKeySound('error');

        // Reset after brief delay
        setTimeout(() => {
            allButtons.forEach(btn => btn.classList.remove('correct', 'wrong'));
            minigameState.currentStep = 0;
            document.getElementById('minigame-progress').textContent = '0/4';
        }, 500);
    }
}

function completeMinigame() {
    const infoMinigame = document.getElementById('info-minigame');
    const infoUnlocked = document.getElementById('info-unlocked');

    // Hide minigame, show unlocked
    infoMinigame.classList.add('hidden');
    infoUnlocked.classList.remove('hidden');

    // Effects
    playKeySound('success');
    triggerGlitch();

    // Add terminal message
    addTerminalLine('> COORDINATES DECRYPTED', 'success');
    addTerminalLine('Target: TABOO E.F.C.', 'system');
    addTerminalLine('43.2198°N 27.9310°E', 'hint');
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ========================================
// VISUAL EFFECTS
// ========================================

function initRandomGlitches() {
    // Random glitches every 5-15 seconds
    setInterval(() => {
        if (Math.random() > 0.7) {
            triggerGlitch();
        }
    }, 8000);
}

function triggerGlitch() {
    const container = document.querySelector('.glitch-container');
    container.classList.add('glitch-active');

    // Random color shift
    document.body.style.filter = `hue-rotate(${Math.random() * 360}deg)`;

    setTimeout(() => {
        container.classList.remove('glitch-active');
        document.body.style.filter = 'none';
    }, 300);
}

function startAmbientEffects() {
    // Update signal strength randomly
    setInterval(() => {
        const strength = Math.floor(60 + Math.random() * 35);
        const bars = '█'.repeat(Math.floor(strength / 10)) + '░'.repeat(10 - Math.floor(strength / 10));
        document.getElementById('signal-strength').textContent = bars;
        document.getElementById('signal-percent').textContent = `${strength}%`;
    }, 2000);

    // Update bass/mid/high levels
    setInterval(() => {
        const bass = Math.floor(3 + Math.random() * 5);
        const mid = Math.floor(4 + Math.random() * 4);
        const high = Math.floor(2 + Math.random() * 4);

        document.getElementById('bass-level').textContent = '█'.repeat(bass) + '░'.repeat(8 - bass);
        document.getElementById('mid-level').textContent = '█'.repeat(mid) + '░'.repeat(8 - mid);
        document.getElementById('high-level').textContent = '█'.repeat(high) + '░'.repeat(8 - high);
    }, 500);
}

// ========================================
// COORDINATE ANIMATION
// ========================================

function initCoordinateAnimation() {
    const latDisplay = document.getElementById('lat-display');
    const lonDisplay = document.getElementById('lon-display');

    // Gradually reveal coordinates
    let revealProgress = 0;
    const targetLat = CONFIG.location.displayLat;
    const targetLon = CONFIG.location.displayLon;

    setInterval(() => {
        if (revealProgress < 100) {
            revealProgress += 0.5;

            // Partially reveal with scramble effect
            const scrambleChars = '?█░▓#@&%';

            let displayLat = '';
            let displayLon = '';

            for (let i = 0; i < targetLat.length; i++) {
                const threshold = (i / targetLat.length) * 100;
                if (revealProgress > threshold) {
                    displayLat += targetLat[i];
                } else {
                    displayLat += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                }
            }

            for (let i = 0; i < targetLon.length; i++) {
                const threshold = (i / targetLon.length) * 100;
                if (revealProgress > threshold) {
                    displayLon += targetLon[i];
                } else {
                    displayLon += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                }
            }

            latDisplay.textContent = displayLat;
            lonDisplay.textContent = displayLon;
        }
    }, 200);
}

function initFrequencyAnimation() {
    const freqDisplay = document.getElementById('frequency');
    const baseFreq = 138.00;

    setInterval(() => {
        const variance = (Math.random() - 0.5) * 0.5;
        const freq = (baseFreq + variance).toFixed(2);
        freqDisplay.textContent = `${freq} MHz`;
    }, 300);
}

// ========================================
// ENCRYPTED MESSAGE
// ========================================

function initEncryptedMessage() {
    const encryptedText = document.getElementById('encrypted-text');
    let messageIndex = 0;

    // Slowly decrypt the message over time
    setInterval(() => {
        if (messageIndex < CONFIG.encryptedMessages.length - 1) {
            // Random chance to advance
            if (Math.random() > 0.7) {
                messageIndex++;
            }
        }

        // Add some scrambling effect
        let display = CONFIG.encryptedMessages[messageIndex];
        const scramblePos = Math.floor(Math.random() * display.length);
        const scrambleChars = '█▓░▒';

        if (display[scramblePos] === '█') {
            display = display.substring(0, scramblePos) +
                      scrambleChars[Math.floor(Math.random() * scrambleChars.length)] +
                      display.substring(scramblePos + 1);
        }

        encryptedText.textContent = display;
    }, 3000);
}

// ========================================
// VISITOR COUNT
// ========================================

function initVisitorCount() {
    // Simulate visitor count from localStorage
    let count = localStorage.getItem('visitorCount');

    if (!count) {
        count = Math.floor(1000 + Math.random() * 500);
    } else {
        count = parseInt(count) + 1;
    }

    localStorage.setItem('visitorCount', count);

    // Animate count display
    const countDisplay = document.getElementById('visitor-count');
    let displayCount = 0;
    const increment = Math.ceil(count / 50);

    const animateCount = setInterval(() => {
        displayCount += increment;
        if (displayCount >= count) {
            displayCount = count;
            clearInterval(animateCount);
        }
        countDisplay.textContent = displayCount.toString().padStart(4, '0');
    }, 50);
}

// ========================================
// SECRET PANELS
// ========================================

function showSecretPanel() {
    const panel = document.getElementById('secret-panel');
    panel.classList.remove('hidden');
    triggerGlitch();

    // Play reveal sound if audio is enabled
    if (state.audioEnabled && state.audioContext) {
        playRevealSound();
    }
}

function hideSecretPanel() {
    const panel = document.getElementById('secret-panel');
    panel.classList.add('hidden');
    triggerGlitch();
}

function showKonamiOverlay() {
    const overlay = document.getElementById('konami-overlay');
    overlay.classList.remove('hidden');
    triggerGlitch();

    // Auto-hide after 5 seconds
    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 5000);
}

function playRevealSound() {
    const ctx = state.audioContext;

    // Dramatic reveal sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
}

function unlockSecret(secretName) {
    if (!state.secretsFound.includes(secretName)) {
        state.secretsFound.push(secretName);
        console.log(`Secret unlocked: ${secretName}. Total: ${state.secretsFound.length}`);
    }
}

// ========================================
// UTILITIES
// ========================================

// Console Easter Egg
console.log('%c///SIGNAL_INTERCEPTED///', 'color: #00ff41; font-size: 20px; font-family: monospace;');
console.log('%cThe underground awaits those who seek...', 'color: #00ffff; font-family: monospace;');
console.log('%cTry the Konami Code or type "decrypt" in the terminal.', 'color: #ffaa00; font-family: monospace;');
console.log('%c43°12\'N 27°54\'E - Where the Black Sea whispers', 'color: #ff0040; font-family: monospace;');

// Prevent right-click context menu (adds to mystery)
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    addTerminalLine('> ACCESS DENIED: Right-click disabled', 'error');
    triggerGlitch();
});

// Page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.title = '///SIGNAL_LOST///';
    } else {
        document.title = '///SIGNAL_DETECTED///';
    }
});

// Window focus events
window.addEventListener('blur', () => {
    document.title = '...awaiting return...';
});

window.addEventListener('focus', () => {
    document.title = '///SIGNAL_DETECTED///';
    triggerGlitch();
});
