document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // Utility to prevent HTML injection but allow markdown parsing
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // Function to add messages to the UI
    function addMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}-message`;
        
        let formattedText = escapeHTML(text);
        
        // Parse multi-line code blocks: ```code```
        formattedText = formattedText.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        // Parse single-line inline code: `code`
        formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>');
        // Parse line breaks
        formattedText = formattedText.replace(/\n/g, '<br>');

        msgDiv.innerHTML = `<strong>${sender === 'user' ? 'You' : 'Copilot'}:</strong> <br> ${formattedText}`;
        
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Main logic when user submits a prompt
    async function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        // Display user message
        addMessage('user', text);
        userInput.value = '';

        // Show a temporary typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.id = 'typing';
        typingIndicator.className = 'message copilot-message';
        typingIndicator.innerHTML = '<em>Copilot is thinking...</em>';
        chatBox.appendChild(typingIndicator);
        chatBox.scrollTop = chatBox.scrollHeight;

        // --- DEMO AGENT DELAY SIMULATION ---
        setTimeout(() => {
            chatBox.removeChild(typingIndicator);
            
            // Generate simulated response
            const response = getMockAgentResponse(text);
            addMessage('copilot', response);

            /* 
            ===============================================================
            HOW TO CONNECT TO A REAL API / AGENT BACKEND:
            Replace the setTimeout block above with a fetch request like this:
            ===============================================================

            try {
                const res = await fetch('https://your-agent-backend-url.com/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: text })
                });
                const data = await res.json();
                addMessage('copilot', data.reply);
            } catch (error) {
                addMessage('copilot', 'Error: Unable to reach the Copilot Agent.');
            }
            */

        }, 1200); // 1.2 second mock delay
    }

    // A small intelligent mock engine to simulate agent behavior
    function getMockAgentResponse(input) {
        const lowerInput = input.toLowerCase();
        
        if (lowerInput.includes('refactor')) {
            return "Certainly! Here is a cleaner, refactored version of your JavaScript function using modern ES6 syntax:\n\n```javascript\nconst greetUser = (name) => `Hello, ${name}! Welcome back.`;\n```";
        } else if (lowerInput.includes('explain')) {
            return "This code snippet defines a simple greeting function. It uses **ES6 template literals** to seamlessly inject the `name` variable into the string, making it more readable than standard string concatenation.";
        } else if (lowerInput.includes('@workspace')) {
            return "I've searched your workspace. It looks like you are working on a front-end web application using standard HTML/JS. How can I help you modify your `index.html` or `app.js`?";
        } else {
            return "I am a simulated demo of a Copilot Agent!\n\nYou can ask me to `refactor` code, `explain` a concept, or use `@workspace` to see how I handle different commands. To make me fully functional, connect `app.js` to your real agent endpoint!";
        }
    }

    // Event Listeners
    sendBtn.addEventListener('click', () => { createSparkles(); handleSend(); });
    
    userInput.addEventListener('keydown', (e) => {
        // Send on 'Enter' (but allow Shift+Enter for new lines)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            createSparkles();
            handleSend();
        }
    });

    function createSparkles() {
        const rect = userInput.getBoundingClientRect();
        const originX = rect.left + rect.width / 2;
        const originY = rect.top;
        const colors = ['#58a6ff', '#f78166', '#ffa657', '#7ee787', '#d2a8ff', '#ffffff'];
        const count = 18;

        for (let i = 0; i < count; i++) {
            const spark = document.createElement('span');
            spark.className = 'spark';
            const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
            const distance = 40 + Math.random() * 60;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            spark.style.left = `${originX}px`;
            spark.style.top  = `${originY}px`;
            spark.style.setProperty('--dx', `${dx}px`);
            spark.style.setProperty('--dy', `${dy}px`);
            spark.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            document.body.appendChild(spark);
            spark.addEventListener('animationend', () => spark.remove());
        }
    }
});
