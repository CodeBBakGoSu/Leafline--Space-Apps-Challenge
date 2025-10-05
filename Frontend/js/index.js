/**
 * Leafline Frontend - Main JavaScript
 */

// 백엔드 API 기본 URL
const API_BASE_URL = ""; // Vercel 프록시 사용

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
    // const HONEY_ORG = { width: 190, left: 18 }; // px
    const HONEY_ORG = { width: 190, left: 18 };
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
        const page = item.dataset.page;
        if (DISABLED_PAGES.has(page)) {
            item.style.cursor = "default";
            item.setAttribute("aria-disabled", "true");
            item.addEventListener("click", (e) => e.stopPropagation());
        } else {
            item.style.cursor = "pointer";
            // ❗ animateTo만 실행하고, src 변경은 index.html의 switchContent에서만 처리
            item.addEventListener("click", (e) => {
                animateTo(idx);
                e.stopPropagation(); // 중복 클릭 방지
            });
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

/**
 * 메뉴 클릭 시 로고 이미지 변경
 */

// // 캘린더
// $img = document.querySelector(".menu-img > img");
// $img.src = `../img/icon_common/icon_nav_calendar_yellow.png`;
// // 대시보드
// $img = document.querySelector(".menu-img > img");
// $img.src = `../img/icon_common/icon_nav_dashboard_yellow.png.png`;
// // 커뮤니티
// $img = document.querySelector(".menu-img > img");
// $img.src = `../img/icon_common/icon_nav_dashboard_yellow.png.png`;

// $(".menu-img > img").attr({ src: "../img/icon_common/icon_nav_dashboard_yellow.png" });

// ==============================

// jQuery로 메뉴 아이콘 색상 토글 (버블링 의존 X)
$(function () {
  // 파일명에서 _gray ↔ _yellow 치환
  const toYellow = (src) => src.replace(/_gray(.\w+)$/i, "_yellow$1");
  const toGray   = (src) => src.replace(/_yellow(.\w+)$/i, "_gray$1");

  function updateIcons($targetItem) {
    $(".menu-item img.item-img").each(function () {
      const $img = $(this);
      const isTarget = $img.closest(".menu-item")[0] === $targetItem[0];
      const src = $img.attr("src");
      $img.attr("src", isTarget ? toYellow(src) : toGray(src));
    });
  }

  // 클릭: 전부 gray → 현재만 yellow
  $(".menu-item").on("click", function () {
    updateIcons($(this));
  });

  // 초기 상태: .active가 있으면 그 아이콘만 yellow, 없으면 dashboard를 yellow
  (function initIconColor() {
    const $active = $(".menu-item.active").first();
    const $fallback = $('.menu-item[data-page="dashboard"]');
    updateIcons($active.length ? $active : $fallback);
  })();
});
