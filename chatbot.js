let chatHistory = {
    'BART': [],
    'GPT2': [],
    'T5': [],
    'PHI3.5': []
};

let apiUrl = "";

function loadNgrokUrl() {
    return fetch('NgrokTunnel')
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
    
    const statusMessage = document.getElementById('status');
    statusMessage.style.display = 'block';

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: userQuestion })
    })
    .then(response => response.json())
    .then(data => {
        statusMessage.style.display = 'none';

        const models = ['T5', 'BART', 'PHI3.5', 'GPT2'];
        models.forEach(model => {
            const answer = data[model] || 'No response';
            chatHistory[model].push({ user: userQuestion, bot: answer });
        });
        updateChatColumns();
    })
    .catch(error => {
        console.error('Error:', error);
        statusMessage.style.display = 'none';
    });
});

window.onload = function() {
    loadNgrokUrl().then(updateChatColumns);
};
