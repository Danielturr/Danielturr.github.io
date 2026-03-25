document.addEventListener('DOMContentLoaded', () => {
    // ── DOM References ──────────────────────────────────────────────────────
    const homeContainer   = document.getElementById('home-container');
    const chatContainer   = document.getElementById('chat-container');
    const historySection  = document.getElementById('history-section');
    const chatBox         = document.getElementById('chat-box');
    const userInput       = document.getElementById('user-input');
    const sendBtn         = document.getElementById('send-btn');
    const newChatBtn      = document.getElementById('new-chat-btn');
    const backBtn         = document.getElementById('back-btn');

    // ── Simulated Chat History ──────────────────────────────────────────────
    const now = Date.now();
    const min = 60 * 1000;
    const hr  = 60 * min;
    const day = 24 * hr;

    const chatHistory = [
        {
            id: 1,
            title: "Refactor authentication module",
            timestamp: new Date(now - 2 * hr),
            messages: [
                { sender: 'user',    text: 'Can you refactor my authentication module to use async/await?' },
                { sender: 'copilot', text: 'Certainly! Here is a cleaner, refactored version using modern ES6 async/await syntax:\n\n```javascript\nasync function authenticate(username, password) {\n  try {\n    const user = await db.findUser(username);\n    const valid = await bcrypt.compare(password, user.passwordHash);\n    if (!valid) throw new Error(\'Invalid credentials\');\n    return generateToken(user);\n  } catch (err) {\n    throw new Error(\'Authentication failed: \' + err.message);\n  }\n}\n```' },
                { sender: 'user',    text: 'Great, can you explain the changes you made?' },
                { sender: 'copilot', text: 'The refactored function now uses `async/await` instead of nested callbacks, making the control flow much easier to read. Error handling is consolidated into a single `try/catch` block, and each asynchronous step is `await`-ed sequentially.' }
            ]
        },
        {
            id: 2,
            title: "Explain React useEffect hook",
            timestamp: new Date(now - 6 * hr),
            messages: [
                { sender: 'user',    text: 'explain how the React useEffect hook works' },
                { sender: 'copilot', text: 'The `useEffect` hook lets you run side effects in functional components. It takes two arguments:\n\n1. A **callback function** containing your side-effect logic.\n2. A **dependency array** that controls when the effect re-runs.\n\nIf the dependency array is empty `[]`, the effect runs only once after the first render (like `componentDidMount`).' },
                { sender: 'user',    text: 'What about the cleanup function?' },
                { sender: 'copilot', text: 'If your effect returns a function, React will call it when the component unmounts or before re-running the effect. This is ideal for cleaning up subscriptions, timers, or event listeners:\n\n```javascript\nuseEffect(() => {\n  const id = setInterval(tick, 1000);\n  return () => clearInterval(id); // cleanup\n}, []);\n```' }
            ]
        },
        {
            id: 3,
            title: "@workspace – project structure overview",
            timestamp: new Date(now - 1 * day),
            messages: [
                { sender: 'user',    text: '@workspace give me an overview of this project' },
                { sender: 'copilot', text: "I've searched your workspace. It looks like you are working on a front-end web application using standard HTML/JS. The key files are:\n\n- `index.html` – the main page and styles\n- `app.js` – chat logic and mock agent responses\n- `src/ngamuru.jpg` – image asset\n\nHow can I help you modify your `index.html` or `app.js`?" },
                { sender: 'user',    text: 'Can you suggest improvements?' },
                { sender: 'copilot', text: 'Here are a few ideas to enhance the app:\n\n1. **Persist chat history** using `localStorage` so sessions survive page reloads.\n2. **Connect to a real API** – replace `getMockAgentResponse` with a `fetch` call to your backend.\n3. **Add syntax highlighting** using a library like Highlight.js for code blocks.\n4. **Support Markdown** headings and bullet lists in responses.' }
            ]
        },
        {
            id: 4,
            title: "Refactor CSS to use CSS variables",
            timestamp: new Date(now - 2 * day),
            messages: [
                { sender: 'user',    text: 'refactor my CSS to make better use of variables' },
                { sender: 'copilot', text: 'I can help with that! A good approach is to declare all your design tokens inside a `:root` block at the top of your stylesheet:\n\n```css\n:root {\n  --color-bg: #0d1117;\n  --color-surface: #161b22;\n  --color-accent: #238636;\n  --radius-md: 8px;\n  --spacing-md: 16px;\n}\n```\n\nThen replace hardcoded values throughout the file with `var(--token-name)`.' }
            ]
        },
        {
            id: 5,
            title: "Unit tests for utility functions",
            timestamp: new Date(now - 4 * day),
            messages: [
                { sender: 'user',    text: 'Can you write unit tests for my escapeHTML utility function?' },
                { sender: 'copilot', text: 'Sure! Here are Jest-style unit tests covering the key edge cases:\n\n```javascript\ndescribe(\'escapeHTML\', () => {\n  test(\'escapes ampersand\', () => {\n    expect(escapeHTML(\'a & b\')).toBe(\'a &amp; b\');\n  });\n  test(\'escapes angle brackets\', () => {\n    expect(escapeHTML(\'<script>\')).toBe(\'&lt;script&gt;\');\n  });\n  test(\'escapes quotes\', () => {\n    expect(escapeHTML(\'"hello"\'))  .toBe(\'&quot;hello&quot;\');\n  });\n  test(\'returns plain text unchanged\', () => {\n    expect(escapeHTML(\'hello\')).toBe(\'hello\');\n  });\n});\n```' },
                { sender: 'user',    text: 'Perfect, thanks!' },
                { sender: 'copilot', text: "You're welcome! Run these with `npx jest` once you've added Jest to your project. Let me know if you need help setting it up." }
            ]
        }
    ];

    // ── Helpers ─────────────────────────────────────────────────────────────

    // Prevent HTML injection while allowing markdown parsing
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

    function formatRelativeTime(date) {
        const diff = Date.now() - date.getTime();
        const minutes = Math.round(diff / (60 * 1000));
        if (minutes < 1)   return 'Just now';
        if (minutes < 60)  return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        const hours = Math.round(diff / (60 * 60 * 1000));
        if (hours < 24)    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        const days = Math.round(diff / (24 * 60 * 60 * 1000));
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }

    // ── View Navigation ─────────────────────────────────────────────────────

    function showHome() {
        chatContainer.style.display = 'none';
        homeContainer.style.display = 'flex';
    }

    function showChat(messages) {
        homeContainer.style.display = 'none';
        chatContainer.style.display = 'flex';

        // Clear and populate chat box
        chatBox.innerHTML = '';
        if (messages && messages.length > 0) {
            messages.forEach(msg => addMessage(msg.sender, msg.text));
        } else {
            // New empty chat: show welcome message
            const welcome = document.createElement('div');
            welcome.className = 'message copilot-message';
            welcome.innerHTML = '<strong>Copilot:</strong><br>Hello! I am your web-based Copilot Agent. How can I assist you with your code today? Try asking me to <code>refactor</code> something, <code>explain</code> a concept, or use <code>@workspace</code>.';
            chatBox.appendChild(welcome);
        }

        userInput.value = '';
        userInput.focus();
    }

    // ── Render History ──────────────────────────────────────────────────────

    function renderHistory() {
        // Remove any existing history items (keep the <h2> heading)
        const existing = historySection.querySelectorAll('.history-item');
        existing.forEach(el => el.remove());

        if (chatHistory.length === 0) {
            const empty = document.createElement('p');
            empty.style.cssText = 'color:#8b949e;font-size:0.9em;margin:0;';
            empty.textContent = 'No previous chats. Start a new one!';
            historySection.appendChild(empty);
            return;
        }

        chatHistory.forEach(chat => {
            const lastMsg = chat.messages[chat.messages.length - 1];

            const item = document.createElement('div');
            item.className = 'history-item';
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');
            item.setAttribute('aria-label', `Open chat: ${chat.title}`);

            item.innerHTML = `
                <div class="history-item-title">${escapeHTML(chat.title)}</div>
                <div class="history-item-preview">${escapeHTML(lastMsg ? lastMsg.text : '')}</div>
                <div class="history-item-meta">${formatRelativeTime(chat.timestamp)} &middot; ${chat.messages.length} message${chat.messages.length !== 1 ? 's' : ''}</div>
            `;

            item.addEventListener('click', () => showChat(chat.messages));
            item.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    showChat(chat.messages);
                }
            });

            historySection.appendChild(item);
        });
    }

    // ── Chat Message Rendering ──────────────────────────────────────────────

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

    // ── Send Logic ──────────────────────────────────────────────────────────

    async function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage('user', text);
        userInput.value = '';

        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.id = 'typing';
        typingIndicator.className = 'message copilot-message';
        typingIndicator.innerHTML = '<em>Copilot is thinking...</em>';
        chatBox.appendChild(typingIndicator);
        chatBox.scrollTop = chatBox.scrollHeight;

        // --- DEMO AGENT DELAY SIMULATION ---
        setTimeout(() => {
            chatBox.removeChild(typingIndicator);

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

    // ── Event Listeners ─────────────────────────────────────────────────────

    newChatBtn.addEventListener('click', () => showChat(null));
    backBtn.addEventListener('click', showHome);

    sendBtn.addEventListener('click', handleSend);

    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // ── Init ─────────────────────────────────────────────────────────────────

    renderHistory();
    showHome();
});
