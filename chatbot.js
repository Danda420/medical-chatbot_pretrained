let chatHistory = {
    'BART': [],
    'GPT2': [],
    'T5': [],
    'PHI3.5': []
};

let apiUrl = "";

function loadNgrokUrl() {
    return fetch('ngrokTunnel')
        .then(response => response.text())
        .then(data => {
            const ngrokPart = data.trim();
            apiUrl = `https://${ngrokPart}.ngrok-free.app/generate`;
        })
        .catch(error => {
            console.error('Error loading ngrok URL:', error);
        });
}

function scrollToBottom() {
    const chatColumns = document.querySelectorAll('.chat-column');
    chatColumns.forEach(column => {
        column.scrollTop = column.scrollHeight;
    });
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-mode');
    const themeButton = document.querySelector('.theme-toggle-btn');
    themeButton.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
}

function updateChatColumns() {
    const chatColumnsDiv = document.getElementById('chat-columns');
    chatColumnsDiv.innerHTML = '';

    const models = ['T5', 'BART', 'PHI3.5', 'GPT2'];
    models.forEach(model => {
        const columnDiv = document.createElement('div');
        columnDiv.className = 'chat-column';
        const header = document.createElement('h2');
        header.textContent = model;
        columnDiv.appendChild(header);

        chatHistory[model].forEach(chat => {
            const userMessageDiv = document.createElement('div');
            userMessageDiv.className = 'message user-message';
            userMessageDiv.innerHTML = `<p>${chat.user}</p>`;
            
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'message bot-message';
            botMessageDiv.innerHTML = `<p>${chat.bot}</p>`;

            columnDiv.appendChild(userMessageDiv);
            columnDiv.appendChild(botMessageDiv);
        });

        chatColumnsDiv.appendChild(columnDiv);
    });

    scrollToBottom();
}

document.getElementById('chat-form').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const userQuestion = document.getElementById('question').value;
    if (userQuestion.trim() === '') return;

    document.getElementById('question').value = '';
    
    const generateStatus = document.getElementById('status');
    const statusText = document.getElementById('status-text');
    const serverDownMsg = document.getElementById('serverdown');
    const loadingAnim = document.getElementById('loader');

    generateStatus.style.display = 'block';
    statusText.style.display = 'block';
    loadingAnim.style.display = 'block';
    serverDownMsg.style.display = 'none';
    
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: userQuestion })
    })
    .then(response => response.json())
    .then(data => {
        generateStatus.style.display = 'none';

        const models = ['T5', 'BART', 'PHI3.5', 'GPT2'];
        models.forEach(model => {
            const answer = data[model] || 'No response';
            chatHistory[model].push({ user: userQuestion, bot: answer });
        });
        updateChatColumns();
    })
    .catch(error => {
        console.error('Error:', error);
        generateStatus.style.display = 'block';
        loadingAnim.style.display = 'none';
        statusText.style.display = 'none';
        serverDownMsg.style.display = 'block';
    });
});

window.onload = function() {
    loadNgrokUrl().then(updateChatColumns);
};
