<?php
session_start();
set_time_limit(9999);

if (!isset($_SESSION['chat_history'])) {
    $_SESSION['chat_history'] = [
        'BART' => [],
        'GPT2' => [],
        'T5' => [],
        'PHI3.5' => []
    ];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['question'])) {
    $userQuestion = $_POST['question'];

    $data = json_encode(['input' => $userQuestion]);

    $ch = curl_init('http://localhost:5000/generate');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

    $response = curl_exec($ch);
    curl_close($ch);

    $result = json_decode($response, true);

    $models = ['T5', 'BART', 'PHI3.5', 'GPT2'];
    foreach ($models as $model) {
        $answer = $result[$model] ?? 'No response';
        $_SESSION['chat_history'][$model][] = ['user' => $userQuestion, 'bot' => $answer];
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medical Chatbot</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="chat-container">
        <div class="input-area">
            <form action="" method="POST">
                <input type="text" id="question" name="question" class="user-input" placeholder="Type your message..." required>
                <button type="submit" class="send-btn">Send</button>
                <button type="button" class="theme-toggle-btn" onclick="toggleTheme()">🌙</button>
            </form>
        </div>
        <div class="chat-columns">
            <?php
            $models = ['T5', 'BART', 'PHI3.5', 'GPT2'];
            foreach ($models as $model) {
                echo "<div class='chat-column'>";
                echo "<h2>$model</h2>";
                if (isset($_SESSION['chat_history'][$model])) {
                    foreach ($_SESSION['chat_history'][$model] as $chat) {
                        echo "<div class='message user-message'><p>" . htmlspecialchars($chat['user']) . "</p></div>";
                        echo "<div class='message bot-message'><p>" . htmlspecialchars($chat['bot']) . "</p></div>";
                    }
                }
                echo "</div>";
            }
            ?>
        </div>
    </div>
    <script>
        function scrollToBottom() {
            const chatColumns = document.querySelectorAll('.chat-column');
            chatColumns.forEach(column => {
                column.scrollTop = column.scrollHeight;
            });
        }

        // Function to toggle between light and dark themes
        function toggleTheme() {
            const body = document.body;
            body.classList.toggle('light-mode');
        }

        window.onload = scrollToBottom;
    </script>
</body>
</html>
