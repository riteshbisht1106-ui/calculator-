class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
    }

    delete() {
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            if (this.shouldResetScreen) {
                this.currentOperand = number.toString();
                this.shouldResetScreen = false;
            } else {
                this.currentOperand = this.currentOperand.toString() + number.toString();
            }
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                if (current === 0) {
                    alert("Error: Division by zero");
                    this.clear();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;

        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandTextElement.innerText =
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
}

// Audio Utility for Synthesized Sounds
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();
let isSoundEnabled = true;

// Theme Management
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check stored preference
if (localStorage.getItem('theme') === 'light') {
    body.classList.add('light-theme');
    themeToggle.innerText = '☀️';
    themeToggle.title = 'Switch to Dark Mode';
} else {
    themeToggle.title = 'Switch to Light Mode';
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    const isLight = body.classList.contains('light-theme');
    themeToggle.innerText = isLight ? '☀️' : '🌙';
    themeToggle.title = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

const soundToggle = document.getElementById('sound-toggle');
soundToggle.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    soundToggle.innerText = isSoundEnabled ? '🔊' : '🔇';
    soundToggle.classList.toggle('muted', !isSoundEnabled);
});

// History Management
let history = [];
const historyPanel = document.getElementById('history-panel');
const historyList = document.getElementById('history-list');
const historyToggle = document.getElementById('history-toggle');

historyToggle.addEventListener('click', () => {
    historyPanel.classList.toggle('active');
    historyToggle.innerText = historyPanel.classList.contains('active') ? '✖' : '📜';
});

document.getElementById('history-back').addEventListener('click', () => {
    historyPanel.classList.remove('active');
    historyToggle.innerText = '📜';
});

function saveHistory(expression, result) {
    history.unshift({ expression, result });
    if (history.length > 50) history.pop(); // Keep last 50
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = history.map(item => `
        <li class="history-item">
            <span class="exp">${item.expression} =</span>
            <span class="res">${item.result}</span>
        </li>
    `).join('');
}

function clearHistory() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playSound('pop');
    history = [];
    renderHistory();
}

function playSound(type) {
    if (!isSoundEnabled) return;

    const now = audioCtx.currentTime;

    const playTone = (freq, typeStr, startTime, duration, vol = 0.1) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = typeStr;
        oscillator.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(vol, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    };

    switch (type) {
        case 'click': // Soft click for numbers/operators
            playTone(600, 'sine', now, 0.05, 0.05);
            break;
        case 'success': // Cyber-success arpeggio
            playTone(400, 'sine', now, 0.1);
            playTone(600, 'sine', now + 0.05, 0.1);
            playTone(800, 'sine', now + 0.1, 0.2);
            break;
        case 'error': // Error beep
            playTone(150, 'sawtooth', now, 0.3, 0.03);
            playTone(100, 'sawtooth', now + 0.1, 0.3, 0.03);
            break;
        case 'pop': // Sharp for DEL/AC
            playTone(1000, 'triangle', now, 0.05, 0.05);
            break;
    }
}

const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

function appendNumber(number) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playSound('click');
    calculator.appendNumber(number);
    calculator.updateDisplay();
}

function appendOperator(operator) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playSound('click');
    calculator.chooseOperation(operator);
    calculator.updateDisplay();
}

function clearDisplay() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playSound('pop');
    calculator.clear();
    calculator.updateDisplay();
}

function deleteLast() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playSound('pop');
    calculator.delete();
    calculator.updateDisplay();
}

function compute() {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Check for error condition (like division by zero) before computing
    const prev = parseFloat(calculator.previousOperand);
    const current = parseFloat(calculator.currentOperand);
    const operation = calculator.operation;

    if (operation === '/' && current === 0) {
        playSound('error');
    } else if (!isNaN(prev) && !isNaN(current)) {
        playSound('success');
        const expression = `${calculator.getDisplayNumber(prev)} ${operation} ${calculator.getDisplayNumber(current)}`;
        const result = calculator.getDisplayNumber(
            operation === '+' ? prev + current :
                operation === '-' ? prev - current :
                    operation === '*' ? prev * current :
                        prev / current
        );
        saveHistory(expression, result);
    } else {
        playSound('click');
    }

    calculator.compute();
    calculator.updateDisplay();
}

// Add keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= 0 && e.key <= 9) appendNumber(e.key);
    if (e.key === '.') appendNumber(e.key);
    if (e.key === '=' || e.key === 'Enter') compute();
    if (e.key === 'Backspace') deleteLast();
    if (e.key === 'Escape') clearDisplay();
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') appendOperator(e.key);
});
