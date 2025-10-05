/**
 * chat.js
 * 챗봇 UI 및 기능 구현
 */

// DOM 요소
const chatModal = document.getElementById('chatModal');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const sendIcon = document.getElementById('sendIcon');
const chatMessages = document.getElementById('chatMessages');
const chatClose = document.getElementById('chatClose');

// 챗봇 모달 열기/닫기 함수
window.openChatModal = function() {
    chatModal.classList.remove('hidden');
    setTimeout(() => {
        chatInput.focus();
    }, 100);
};

window.closeChatModal = function() {
    chatModal.classList.add('hidden');
};

// 닫기 버튼 클릭 시 모달 닫기
chatClose?.addEventListener('click', closeChatModal);

// 입력창 변화 감지 - 전송 버튼 아이콘 변경
chatInput.addEventListener('input', function() {
    const hasText = this.value.trim().length > 0;
    
    if (hasText) {
        sendIcon.src = 'img/chatting/icon_send_color.png';
        sendButton.disabled = false;
    } else {
        sendIcon.src = 'img/chatting/icon_send_gray.png';
        sendButton.disabled = true;
    }
});

// Enter 키로 메시지 전송
chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !sendButton.disabled) {
        sendMessage();
    }
});

// 전송 버튼 클릭
sendButton.addEventListener('click', sendMessage);

// 메시지 전송 함수
function sendMessage() {
    const message = chatInput.value.trim();
    
    if (message === '') return;
    
    // 사용자 메시지 추가
    addMessage(message, 'user');
    
    // 입력창 초기화
    chatInput.value = '';
    sendIcon.src = 'img/chatting/icon_send_gray.png';
    sendButton.disabled = true;
    
    // AI 응답 시뮬레이션 (로딩 표시 후 스트리밍)
    showAIResponse(message);
}

// 메시지 추가 함수
function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = formatMessage(text);
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    
    return messageDiv;
}

// AI 로딩 메시지 표시
function showLoadingMessage() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai loading';
    loadingDiv.innerHTML = '<span class="loading-dots"><span>.</span><span>.</span><span>.</span></span>';
    
    chatMessages.appendChild(loadingDiv);
    scrollToBottom();
    
    return loadingDiv;
}

// AI 응답 가져오기
async function showAIResponse(userMessage) {
    // 로딩 메시지 표시
    const loadingMessage = showLoadingMessage();
    
    try {
        // 백엔드 API 호출
        const response = await fetch('/api/chat/message', { // Vercel 프록시 사용
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage,
                history: getChatHistory()
            })
        });
        
        if (!response.ok) {
            throw new Error('API 호출 실패');
        }
        
        const data = await response.json();
        
        // 로딩 메시지 제거
        loadingMessage.remove();
        
        // AI 응답 스트리밍 효과로 표시
        await streamMessage(data.response, 'ai');
        
    } catch (error) {
        console.error('AI 응답 오류:', error);
        loadingMessage.remove();
        
        // 에러 시 폴백 응답
    }
}

// 스트리밍 효과로 메시지 표시
async function streamMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = '';
    
    chatMessages.appendChild(messageDiv);
    
    let currentText = '';
    
    // 한 글자씩 추가
    for (let i = 0; i < text.length; i++) {
        currentText += text[i];
        messageDiv.innerHTML = formatMessage(currentText);
        scrollToBottom();
        await sleep(20); // 20ms마다 한 글자씩
    }
}


// 채팅창 하단으로 스크롤
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 슬립 함수
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 메시지 포맷팅 (마크다운 & 줄바꿈 처리)
function formatMessage(text) {
    // 줄바꿈 처리
    let formatted = text.replace(/\n/g, '<br>');
    
    // 마크다운 처리
    // **bold** 처리
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // *italic* 처리
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // `code` 처리
    formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // ### 헤더 처리
    formatted = formatted.replace(/###\s(.*?)<br>/g, '<h3>$1</h3>');
    formatted = formatted.replace(/##\s(.*?)<br>/g, '<h2>$1</h2>');
    formatted = formatted.replace(/#\s(.*?)<br>/g, '<h1>$1</h1>');
    
    // 리스트 처리 (-, *, 숫자.)
    formatted = formatted.replace(/^[-*]\s(.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>');
    
    return formatted;
}

// 대화 기록 가져오기 (최근 10개)
function getChatHistory() {
    const messages = Array.from(chatMessages.children)
        .filter(msg => msg.classList.contains('message') && !msg.classList.contains('loading'))
        .slice(-10)
        .map(msg => ({
            role: msg.classList.contains('user') ? 'user' : 'assistant',
            content: msg.textContent
        }));
    
    return messages;
}

// 초기화 - 환영 메시지
window.addEventListener('load', function() {
    // 모달이 열릴 때만 환영 메시지 표시
    const originalOpen = window.openChatModal;
    let firstOpen = true;
    
    window.openChatModal = function() {
        originalOpen();
        
        if (firstOpen) {
            setTimeout(() => {
                addMessage('🌼 Hiya! Bloom AI here — your friendly assistant bot. What are we solving today?', 'ai');
            }, 500);
            firstOpen = false;
        }
    };
});

