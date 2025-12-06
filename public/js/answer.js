document.addEventListener('DOMContentLoaded', async () => {
    // --- ELEMENTS ---
    const cursor = document.getElementById('cursor');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const tutorialTextContainer = document.getElementById('tutorial-text-container');
    const tutorialText = document.getElementById('tutorial-text');
    const messagesContainer = document.getElementById('chat-messages');

    // --- CONFIG ---
    const engines = {
        perplexity: 'https://www.perplexity.ai/search?q=',
        you: 'https://you.com/search?q=',
        phind: 'https://www.phind.com/search?q=',
        brave: 'https://search.brave.com/search?q=',
        baidu: 'https://www.baidu.com/s?wd=',
        so360: 'https://www.so.com/s?q=',
        tiangong: 'https://search.tiangong.cn/result?query='
    };

    // --- URL PARSING ---
    const params = new URLSearchParams(window.location.search);
    const engine = params.get('engine');
    const question = params.get('q');

    // --- UTILITY FUNCTIONS ---
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const setTutorial = async (text) => {
        if (!tutorialTextContainer || !tutorialText) return;

        tutorialText.textContent = ''; // Clear previous text
        tutorialTextContainer.classList.add('visible');

        if (!text) {
            tutorialTextContainer.classList.remove('visible');
            return;
        }

        for (let i = 0; i < text.length; i++) {
            tutorialText.textContent += text[i];
            await sleep(40); // Typing speed for tutorial text
        }
    };

    const moveCursorTo = async (element) => {
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width * 0.5; // Center of the element
        const y = rect.top + rect.height * 0.5;
        // Apply centering transform here to ensure the cursor's middle point is at x,y
        cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        await sleep(1000);
    };

    const typeText = async (text, element) => {
        element.value = '';
        for (let i = 0; i < text.length; i++) {
            element.value += text[i];
            await sleep(50);
        }
    };

    const clickElement = async (element) => {
        element.classList.add('active');
        await sleep(200);
        element.classList.remove('active');
    };

    const createUserMessageBubble = async (text) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'user-message';

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'user-avatar';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'user-message-content';
        const p = document.createElement('p');
        p.textContent = text;
        contentDiv.appendChild(p);

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        messagesContainer.appendChild(messageDiv);
        await sleep(100);
        messageDiv.classList.add('visible');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    const engineNames = {
        perplexity: 'Perplexity AI',
        you: 'You.com',
        phind: 'Phind',
        brave: 'Brave Search',
        baidu: '百度',
        so360: '360 AI搜索',
        tiangong: '天工AI'
    };

    const engineDomains = { // New map for domain names
        perplexity: 'perplexity.ai',
        you: 'you.com',
        phind: 'phind.com',
        brave: 'search.brave.com',
        baidu: 'baidu.com',
        so360: 'so.com',
        tiangong: 'tiangong.cn'
    };

    // --- MAIN ANIMATION SEQUENCE ---
    const runAnimation = async () => {
        if (!engine || !question || !engines[engine]) {
            setTutorial('错误: URL中缺少参数或引擎无效。');
            if (cursor) cursor.style.display = 'none';
            return;
        }

        // Defensive check for essential elements
        if (!chatInput || !sendButton || !cursor || !messagesContainer) {
            console.error('Fatal Error: Could not find essential UI elements for animation.');
            setTutorial('初始化错误: 界面元素缺失，无法播放动画。');
            if (cursor) cursor.style.display = 'none';
            return;
        }

        const decodedQuestion = decodeURIComponent(question);
        const readTime = 2000; // Increased delay to 2 seconds for readability

        await sleep(1500);

        await setTutorial(`首先第一步：我们将打开 ${engineDomains[engine]} 网站，请看好...`);
        await sleep(readTime);

        await setTutorial('第一步：定位到屏幕底部的输入框。');
        await sleep(500); // Shorter sleep before action
        await moveCursorTo(chatInput);

        await setTutorial('第二步：开始输入你那“与众不同”的问题。');
        await sleep(readTime);
        await typeText(decodedQuestion, chatInput);

        await setTutorial('第三步：对，就是那个发送按钮，按下去。');
        await sleep(500); // Shorter sleep before action
        await moveCursorTo(sendButton);
        await clickElement(sendButton);

        chatInput.value = '';
        await createUserMessageBubble(decodedQuestion);
        await sleep(1500); // Wait a bit for the bubble to appear before redirecting

        document.body.style.transition = 'opacity 0.5s';
        document.body.style.opacity = 0;
        await sleep(500);

        const redirectUrl = engines[engine] + encodeURIComponent(decodedQuestion);
        window.location.href = redirectUrl;
    };

    runAnimation();
});
