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
// 추후 애니메이션
// nav-honey 이동 애니메이션 (단순 로직)
(function () {
    const honey = document.querySelector(".nav-honey");
    const menuItems = document.querySelectorAll(".menu .menu-item");
    const nav = document.querySelector(".nav");
    if (!honey || !menuItems.length) return;

    // 이동을 금지할 메뉴 data-page 목록 (Setting 금지)
    const DISABLED_PAGES = new Set(["setting"]);

    // 초기값(마커가 dashboard에 맞춰져 있다고 가정)
    const HONEY_ORG = { width: 190, left: 7 }; // px
    const HONEY_SHRINK = { width: /*150*/ 0, left: /*25*/ 200 }; // "오른쪽으로 줄어든" 느낌
    const DUR = { shrink: 160, move: 260, expand: 200 }; // ms

    // 대시보드 메뉴와 마커의 상대 위치를 기준 오프셋으로 삼음
    const baseOffset = honey.offsetTop - menuItems[0].offsetTop;

    let currentIndex = 0;
    let animating = false;

    // 목표 top 계산(세로 가운데 정렬이 필요하면 여기서 미세 조정)
    function targetTopFor(item) {
        return item.offsetTop + baseOffset;
    }

    function animateTo(index) {
        if (animating || index === currentIndex) return;
        animating = true;

        const targetTop = targetTopFor(menuItems[index]);

        // PHASE 1) 오른쪽으로 살짝 줄이기
        // honey.style.transition = `width ${DUR.shrink}ms ease, left ${DUR.shrink}ms ease`;
        honey.style.transition = `width 500ms ease, left 600ms ease`;
        honey.style.width = `${HONEY_SHRINK.width}px`;
        honey.style.left = `${HONEY_SHRINK.left}px`;

        setTimeout(() => {
            // PHASE 2) 줄어든 상태로 목표 y 위치로 이동
            honey.style.transition = `top ${DUR.move}ms cubic-bezier(0.2, 0.7, 0.2, 1)`;
            honey.style.top = `${targetTop}px`;

            setTimeout(() => {
                // PHASE 3) 원래 크기로 복귀
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
        item.style.cursor = "pointer";
        item.addEventListener("click", () => animateTo(idx));

        // Setting에서는 애니메이션 금지
        const page = item.CDATA_SECTION_NODE.page;
        if (DISABLED_PAGES.has(page)) {
            item.style.cursor = "default";
            item.setAttribute("aria-disabled", "true");

            item.addEventListener("click", (e) => {
                // 여기서 애니메이션을 막음, 기존 alert 로직은 그대로 실행
                e.stopPropagation();
            });
            return;
        }

        // 정상 메뉴는 이동 애니메이션
        item.addEventListener("click", () => animateTo(idx));
    });

    // (선택) 초기 위치 보정: 현재 DOM 레이아웃 기준으로 한번 맞춰주고 시작
    honey.style.top = `${targetTopFor(menuItems[currentIndex])}px`;
    honey.style.width = `${HONEY_ORG.width}px`;
    honey.style.left = `${HONEY_ORG.left}px`;

    // (선택) 리사이즈 시 위치 보정이 필요하면 아래 주석 해제
    // window.addEventListener('resize', () => {
    //   honey.style.top = `${targetTopFor(menuItems[currentIndex])}px`;
    // });
})();
