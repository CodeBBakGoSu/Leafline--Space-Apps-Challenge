/**
 * Leafline Frontend - Main JavaScript
 */

// 백엔드 API 기본 URL
const API_BASE_URL = 'http://localhost:8000';

/**
 * API 요청 헬퍼 함수
 */
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API 요청 실패:', error);
        throw error;
    }
}

/**
 * 페이지 로드 시 초기화
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Leafline Frontend 초기화 완료');
    
    // TODO: 필요한 초기화 로직 추가
});

// 전역으로 export
window.fetchAPI = fetchAPI;
window.API_BASE_URL = API_BASE_URL;

