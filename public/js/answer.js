document.addEventListener('DOMContentLoaded', async () => {
    // --- ELEMENTS ---
    const cursor = document.getElementById('cursor');
    const chatInput = document.getElementById('chat-input');
    const inputWrapper = document.querySelector('.gpt-input-wrapper');
    const sendButton = document.getElementById('send-button');
    const tutorialTextContainer = document.getElementById('tutorial-text-container');
    const tutorialText = document.getElementById('tutorial-text');
    const messagesContainer = document.getElementById('chat-messages');

    // --- CONFIG ---
    const engines = {
        chatgpt: 'https://chatgpt.com/?hints=search&q=',
        gemini: 'https://gemini.google.com/app?q=',
        claude: 'https://claude.ai/new?q=',
        grok: 'https://grok.com/?q=',
        deepseek: 'https://chat.deepseek.com/?q=',
        perplexity: 'https://www.perplexity.ai/search?q=',
        bing: 'https://www.bing.com/search?showconv=1&sendquery=1&q=',
        metaso: 'https://metaso.cn/?q=',
        felo: 'https://felo.ai/search?q=',
        tiangong: 'https://search.tiangong.cn/result?query=',
        you: 'https://you.com/search?q=',
        phind: 'https://www.phind.com/search?q=',
        brave: 'https://search.brave.com/search?q=',
        so360: 'https://www.so.com/s?q=',
        baidu: 'https://www.baidu.com/s?wd='
    };

    // Engines that surface an answer on their own after the jump: search pages
    // that land directly on results, or chat sites that auto-submit the query.
    // Everything NOT listed here only PRE-FILLS the box — those sites block
    // cross-site auto-submit for security, so the recipient must press send once.
    const autoAsk = new Set([
        'perplexity', 'grok', 'bing', 'metaso', 'felo',
        'tiangong', 'you', 'phind', 'brave', 'so360', 'baidu'
    ]);

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

    // Tracks where the pointer tip currently sits, so ripples can spawn there.
    let cursorTip = { x: -100, y: 50 };

    const moveCursorTo = async (element, settle = 900) => {
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width * 0.5;
        const y = rect.top + rect.height * 0.5;
        // Offset by the pointer's hotspot so the TIP (not the box corner) lands on target.
        cursor.style.transform = `translate(${x - 6}px, ${y - 4}px)`;
        cursorTip = { x, y };
        await sleep(settle);
    };

    const spawnRipple = (x, y) => {
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.transform = `translate(${x}px, ${y}px)`;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    };

    const typeText = async (text, element) => {
        element.value = '';
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            element.value += ch;
            if (i === 0) sendButton.classList.add('enabled'); // send lights up once typing starts
            // Human-like cadence: jittered base speed plus a longer pause after punctuation/spaces.
            let delay = 55 + Math.random() * 70;
            if (/[\s,.!?，。！？、]/.test(ch)) delay += 110;
            await sleep(delay);
        }
    };

    const clickElement = async (element) => {
        // Pointer presses down + ripple radiates from the tip for tactile feedback.
        cursor.classList.add('clicking');
        spawnRipple(cursorTip.x, cursorTip.y);
        element.classList.add('active');
        await sleep(180);
        cursor.classList.remove('clicking');
        element.classList.remove('active');
        await sleep(120);
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

    const ASSISTANT_AVATAR_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></svg>';

    const showTypingIndicator = () => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'gpt-message';

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'gpt-avatar';
        avatarDiv.innerHTML = ASSISTANT_AVATAR_SVG;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'gpt-message-content';
        const dots = document.createElement('div');
        dots.className = 'typing-dots';
        dots.innerHTML = '<span></span><span></span><span></span>';
        contentDiv.appendChild(dots);

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return messageDiv;
    };

    const engineNames = {
        chatgpt: 'ChatGPT',
        gemini: 'Google Gemini',
        claude: 'Claude',
        grok: 'Grok',
        deepseek: 'DeepSeek',
        perplexity: 'Perplexity AI',
        bing: 'Bing Copilot',
        metaso: '秘塔AI搜索',
        felo: 'Felo',
        tiangong: '天工AI',
        you: 'You.com',
        phind: 'Phind',
        brave: 'Brave Search',
        so360: '360 AI搜索',
        baidu: '百度'
    };

    const engineDomains = { // New map for domain names
        chatgpt: 'chatgpt.com',
        gemini: 'gemini.google.com',
        claude: 'claude.ai',
        grok: 'grok.com',
        deepseek: 'chat.deepseek.com',
        perplexity: 'perplexity.ai',
        bing: 'bing.com',
        metaso: 'metaso.cn',
        felo: 'felo.ai',
        tiangong: 'tiangong.cn',
        you: 'you.com',
        phind: 'phind.com',
        brave: 'search.brave.com',
        so360: 'so.com',
        baidu: 'baidu.com'
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
        const engineName = engineNames[engine] || engineDomains[engine] || engine;
        const readTime = 1900;

        await sleep(1300);

        await setTutorial(`看好了，我这就用「${engineName}」帮你查一下这个问题…`);
        await sleep(readTime);

        await setTutorial('第一步：把光标移到屏幕底部的输入框。');
        await sleep(400);
        await moveCursorTo(chatInput);
        if (inputWrapper) inputWrapper.classList.add('focused');

        await setTutorial('第二步：一字一句地敲下你那“与众不同”的问题。');
        await sleep(700);
        await typeText(decodedQuestion, chatInput);
        await sleep(500);

        await setTutorial('第三步：对，就是右边那个发送按钮，按下去。');
        await sleep(500);
        await moveCursorTo(sendButton);
        await clickElement(sendButton);

        if (inputWrapper) inputWrapper.classList.remove('focused');
        sendButton.classList.remove('enabled');
        chatInput.value = '';
        await createUserMessageBubble(decodedQuestion);
        await sleep(700);

        // The AI "thinks" for a beat, then we whisk them off to the real engine.
        showTypingIndicator();
        const willAutoAsk = autoAsk.has(engine);
        if (willAutoAsk) {
            await setTutorial('就是这么简单。马上为你跳转，答案这就来…');
        } else {
            await setTutorial(`正在跳转到 ${engineName}。它出于安全不让链接自动发送，到了之后再戳一下发送键就行~`);
        }
        await sleep(willAutoAsk ? 2200 : 3200);

        document.body.classList.add('fade-out');
        await sleep(600);

        const redirectUrl = engines[engine] + encodeURIComponent(decodedQuestion);
        window.location.href = redirectUrl;
    };

    runAnimation();
});
