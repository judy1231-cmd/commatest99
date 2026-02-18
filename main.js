const numberDisplay = document.querySelector('.number-display');
const generateBtn = document.querySelector('#generate-btn');
const historyList = document.querySelector('#history-list');

const history = [];

function generateNumbers() {
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);
    displayNumbers(sortedNumbers);
    addToHistory(sortedNumbers);
}

function displayNumbers(numbers) {
    numberDisplay.innerHTML = '';
    for (const number of numbers) {
        const span = document.createElement('span');
        span.textContent = number;
        numberDisplay.appendChild(span);
    }
}

function addToHistory(numbers) {
    history.push(numbers);
    displayHistory();
}

function displayHistory() {
    historyList.innerHTML = '';
    for (const numbers of history) {
        const li = document.createElement('li');
        li.textContent = numbers.join(', ');
        historyList.appendChild(li);
    }
}

generateBtn.addEventListener('click', generateNumbers);
