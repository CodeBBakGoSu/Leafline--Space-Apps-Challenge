/**
 * Leafline Frontend - Main JavaScript
 */

// 백엔드 API 기본 URL
const API_BASE_URL = "http://localhost:8000";

/**
 * API 요청 헬퍼 함수
 */
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API 요청 실패:", error);
        throw error;
    }
}

/**
 * 페이지 로드 시 초기화
 */
document.addEventListener("DOMContentLoaded", () => {
    console.log("Leafline Frontend 초기화 완료");

    // TODO: 필요한 초기화 로직 추가
});

// 전역으로 export
window.fetchAPI = fetchAPI;
window.API_BASE_URL = API_BASE_URL;

/**
 * menu 선택 시 메뉴바 이동
 */
(function () {
    const honey = document.querySelector(".nav-honey");
    const menuItems = document.querySelectorAll(".menu .menu-item");
    if (!honey || !menuItems.length) return;

    // 이동 금지 대상
    const DISABLED_PAGES = new Set(["setting"]);

    // 초기 파라미터
    const HONEY_ORG = { width: 190, left: 18}; // px
    const HONEY_SHRINK = { width: 0, left: 200 }; // px
    const DUR = { shrink: 160, move: 260, expand: 200 }; // ms

    let currentIndex = 0;
    let animating = false;

    // ★ 메뉴 아이템의 세로 '중앙'에 nav-honey가 오도록 top 계산
    function targetTopFor(item) {
        const mid = item.offsetTop + item.offsetHeight / 2;
        const t = Math.round(mid - honey.offsetHeight / 2);
        return t;
    }

    function animateTo(index) {
        if (animating || index === currentIndex) return;
        animating = true;

        const targetTop = targetTopFor(menuItems[index]);

        // PHASE 1: 오른쪽으로 흡수 (폭 줄이고 오른쪽으로 이동)
        honey.style.transition = `width 500ms ease, left 600ms ease`;
        honey.style.width = `${HONEY_SHRINK.width}px`;
        honey.style.left = `${HONEY_SHRINK.left}px`;

        setTimeout(() => {
            // PHASE 2: 줄어든 상태로 목표 y 위치로 이동
            honey.style.transition = `top ${DUR.move}ms cubic-bezier(0.2, 0.7, 0.2, 1)`;
            honey.style.top = `${targetTop}px`;

            setTimeout(() => {
                // PHASE 3: 원래 크기로 복귀
                honey.style.transition = `width 500ms ease, left 600ms ease`;
                honey.style.width = `${HONEY_ORG.width}px`;
                honey.style.left = `${HONEY_ORG.left}px`;

                setTimeout(() => {
                    currentIndex = index;
                    animating = false;
                }, DUR.expand + 20);
            }, DUR.move + 20);
        }, DUR.shrink + 20);
    }

    // 이벤트 바인딩
    menuItems.forEach((item, idx) => {
        const page = item.dataset.page; // ★ 올바른 접근
        if (DISABLED_PAGES.has(page)) {
            item.style.cursor = "default";
            item.setAttribute("aria-disabled", "true");
            // 이동 막고, 기존 alert 등은 외부 핸들러에 맡김
            item.addEventListener("click", (e) => {
                e.stopPropagation();
            });
        } else {
            item.style.cursor = "pointer";
            item.addEventListener("click", () => animateTo(idx));
        }
    });

    // 초기 위치(대시보드)에 맞춤
    honey.style.top = `${targetTopFor(menuItems[currentIndex])}px`;
    honey.style.width = `${HONEY_ORG.width}px`;
    honey.style.left = `${HONEY_ORG.left}px`;

    // (선택) 리사이즈 시 위치 보정
    // window.addEventListener('resize', () => {
    //   honey.style.top = `${targetTopFor(menuItems[currentIndex])}px`;
    // });
})();
