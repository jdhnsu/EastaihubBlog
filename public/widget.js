(function() {
    // 获取当前脚本标签
    const currentScript = document.currentScript;
    const dataset = currentScript ? currentScript.dataset : {};

    // 配置
    const config = {
        chatUrl: dataset.chatUrl || 'http://10.217.13.78:8080/chat/share/019b5422-8708-7ec1-9bfd-9e0e6b00f606',
        iconUrl: dataset.iconUrl || 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png', // 默认机器人图标
        themeColor: dataset.themeColor || '#1677ff',
        title: dataset.title || 'AI 助手',
        width: dataset.width || '380px',
        height: dataset.height || '600px'
    };

    // 创建样式
    const style = document.createElement('style');
    style.textContent = `
        .maxkb-widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .maxkb-widget-button {
            width: 60px;
            height: 60px;
            border-radius: 30px;
            background-color: ${config.themeColor};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
        }

        .maxkb-widget-button:hover {
            transform: scale(1.1);
        }

        .maxkb-widget-button img {
            width: 32px;
            height: 32px;
            filter: brightness(0) invert(1);
        }

        .maxkb-chat-window {
            position: fixed;
            bottom: 100px;
            right: 20px;
            width: ${config.width};
            height: ${config.height};
            max-height: 80vh;
            background-color: #fff;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            opacity: 0;
            pointer-events: none;
            transform: translateY(20px);
            transition: all 0.3s ease;
        }

        .maxkb-chat-window.open {
            opacity: 1;
            pointer-events: all;
            transform: translateY(0);
        }

        .maxkb-chat-header {
            padding: 16px;
            background-color: ${config.themeColor};
            color: #fff;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .maxkb-chat-title {
            font-size: 16px;
            font-weight: 600;
        }

        .maxkb-chat-close {
            cursor: pointer;
            opacity: 0.8;
            font-size: 20px;
            line-height: 1;
        }

        .maxkb-chat-close:hover {
            opacity: 1;
        }

        .maxkb-chat-iframe {
            flex: 1;
            border: none;
            width: 100%;
            height: 100%;
        }

        @media (max-width: 480px) {
            .maxkb-chat-window {
                width: 100%;
                height: 100%;
                bottom: 0;
                right: 0;
                border-radius: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // 创建 DOM 结构
    const container = document.createElement('div');
    container.className = 'maxkb-widget-container';

    // 聊天窗口
    const chatWindow = document.createElement('div');
    chatWindow.className = 'maxkb-chat-window';
    chatWindow.innerHTML = `
        <div class="maxkb-chat-header">
            <span class="maxkb-chat-title">${config.title}</span>
            <span class="maxkb-chat-close">×</span>
        </div>
        <iframe class="maxkb-chat-iframe" src="${config.chatUrl}" allow="microphone"></iframe>
    `;

    // 悬浮按钮
    const button = document.createElement('div');
    button.className = 'maxkb-widget-button';
    button.innerHTML = `<img src="${config.iconUrl}" alt="Chat">`;

    // 组装
    document.body.appendChild(chatWindow);
    container.appendChild(button);
    document.body.appendChild(container);

    // 事件绑定
    let isOpen = false;

    function toggleChat() {
        isOpen = !isOpen;
        if (isOpen) {
            chatWindow.classList.add('open');
            button.style.display = 'none'; // 可选：打开时隐藏按钮
        } else {
            chatWindow.classList.remove('open');
            button.style.display = 'flex';
        }
    }

    button.addEventListener('click', toggleChat);
    chatWindow.querySelector('.maxkb-chat-close').addEventListener('click', toggleChat);

})();
