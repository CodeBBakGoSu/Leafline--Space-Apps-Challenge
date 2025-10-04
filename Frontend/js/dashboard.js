$(function () {
    // Blooming Area 체크박스 - 2025
    $("#check2025").click(() => {
        if ($("#checkText2025").hasClass("checked")) {
            $("#checkText2025").removeClass("checked");
        } else {
            $("#checkText2025").addClass("checked");
        }
    });
    // Blooming Area 체크박스 - 2025
    $("#check2024").click(() => {
        if ($("#checkText2024").hasClass("checked")) {
            $("#checkText2024").removeClass("checked");
        } else {
            $("#checkText2024").addClass("checked");
        }
    });
});

/**
 * ========================================
 * Dashboard Module
 * 대시보드 메인 모듈
 * ========================================
 *
 * Google Maps 초기화 및 사용자 위치 관리
 *
 * @requires bee_flight_range.js - 벌 비행 범위 모듈
 */

/* ================================
   전역 변수
================================ */

/**
 * Google Maps 객체
 * @type {google.maps.Map}
 */
let map;

/**
 * 사용자 위치를 표시하는 마커
 * @type {google.maps.Marker}
 */
let userMarker;

/* ================================
   지도 초기화
================================ */

/**
 * Google Maps API 콜백 함수
 * Google Maps API가 로드되면 자동으로 호출됩니다.
 *
 * @async
 * @description
 * - 지도를 생성하고 기본 위치로 설정합니다.
 * - 사용자 위치 마커를 추가합니다.
 * - 벌 비행 범위를 표시합니다.
 */
window.initMap = async function () {
    // 기본 위치: Orlando, Florida
    const defaultLocation = { lat: 28.5649675, lng: -81.1614906 };

    try {
        // 1. 지도 생성
        map = new google.maps.Map(document.getElementById("map"), {
            center: defaultLocation,
            zoom: 12.5, // 벌 비행 범위를 보기 좋게 줌 레벨 조정
            mapTypeControl: true, // 지도 유형 컨트롤 표시 (지도/위성)
            streetViewControl: false, // 스트리트 뷰 비활성화
            fullscreenControl: true, // 전체화면 버튼 표시
            zoomControl: true, // 줌 컨트롤 표시
        });

        // 2. 사용자 위치 마커 생성
        userMarker = new google.maps.Marker({
            position: defaultLocation,
            map: map,
            title: "Orlando, FL",
            animation: google.maps.Animation.DROP, // 마커 떨어지는 애니메이션
        });

        // 3. 정보 창 생성 (마커 클릭 시 표시)
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px; font-family: Arial, sans-serif;">
                    <h3 style="margin: 0 0 5px 0; color: #333;">Orlando, Florida</h3>
                    <p style="margin: 0; color: #666;">Your beekeeping location</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">
                        🐝 Bee flight range: 3km ~ 5km
                    </p>
                </div>
            `,
        });

        // 4. 마커 클릭 이벤트 등록
        userMarker.addListener("click", () => {
            infoWindow.open(map, userMarker);
        });

        // 5. 벌 비행 범위 표시 (bee_flight_range.js 모듈 사용)
        window.BeeFlightRange.create(map, defaultLocation);

        console.log("✅ Google Maps 초기화 완료");
    } catch (error) {
        console.error("❌ Google Maps 초기화 실패:", error);
    }
};

/* ================================
   위치 관리
================================ */

/**
 * 지도의 중심과 마커 위치를 업데이트합니다.
 *
 * @param {number} lat - 새로운 위도
 * @param {number} lng - 새로운 경도
 * @param {string} [title="My Location"] - 마커 타이틀
 *
 * @description
 * - 지도 중심을 새 위치로 이동합니다.
 * - 마커 위치를 업데이트합니다.
 * - 벌 비행 범위도 함께 업데이트합니다.
 *
 * @example
 * updateMapLocation(25.7617, -80.1918, "Miami, FL");
 */
function updateMapLocation(lat, lng, title = "My Location") {
    // 지도와 마커가 초기화되었는지 확인
    if (!map || !userMarker) {
        console.error("❌ 지도가 초기화되지 않았습니다.");
        return;
    }

    const newLocation = { lat, lng };

    // 1. 지도 중심 이동
    map.setCenter(newLocation);

    // 2. 마커 위치 업데이트
    userMarker.setPosition(newLocation);
    userMarker.setTitle(title);

    // 3. 벌 비행 범위 중심점 업데이트
    window.BeeFlightRange.update(map, newLocation);

    console.log(`📍 위치 업데이트: ${title} (${lat}, ${lng})`);
}

/* ================================
   백엔드 연동
================================ */

/**
 * 백엔드에서 사용자 프로필을 가져옵니다.
 *
 * @async
 * @returns {Promise<Object|null>} 프로필 데이터 또는 null
 *
 * @description
 * - 백엔드 API(/api/profile)에서 사용자 정보를 가져옵니다.
 * - 위치 정보가 있으면 지도를 해당 위치로 업데이트합니다.
 */
async function loadUserProfile() {
    try {
        // API 요청
        const response = await fetch("http://localhost:8000/api/profile");
        const profile = await response.json();

        // 위치 정보가 있으면 지도 업데이트
        if (profile.location) {
            const { latitude, longitude, city, state } = profile.location;
            updateMapLocation(latitude, longitude, `${city}, ${state}`);

            console.log("✅ 사용자 프로필 로드 완료:", profile);
        }

        return profile;
    } catch (error) {
        console.error("❌ 프로필 로드 실패:", error);
        return null;
    }
}

/**
 * 페이지 로드 시 프로필 가져오기
 *
 * @description
 * - DOM이 로드되면 실행됩니다.
 * - Google Maps가 완전히 로드될 때까지 기다립니다.
 * - 지도 로드 후 백엔드에서 프로필을 가져옵니다.
 */
document.addEventListener("DOMContentLoaded", () => {
    console.log("📱 페이지 로드 완료, Google Maps 대기 중...");

    // Google Maps가 로드될 때까지 0.5초마다 확인
    const checkMapLoaded = setInterval(() => {
        if (map && userMarker) {
            clearInterval(checkMapLoaded);
            console.log("🗺️  Google Maps 로드 완료, 프로필 로드 시작...");
            loadUserProfile();
        }
    }, 500);
});

/* ================================
   토글 버튼 (My / Event)
================================ */

/**
 * My/Event 토글 버튼 이벤트 핸들러
 *
 * @description
 * - My 모드: 사용자 양봉장 중심으로 벌 비행 범위 표시
 * - Event 모드: 이벤트/행사 정보 표시 (벌 범위 숨김)
 */
const container = document.querySelector(".toggle-container");
const options = document.querySelectorAll(".toggle-option");

// 토글 버튼이 존재하는지 확인
if (container && options.length > 0) {
    options.forEach((option) => {
        option.addEventListener("click", () => {
            const value = option.classList.contains("my") ? "my" : "event";
            container.setAttribute("data-active", value);

            // 모드에 따라 벌 비행 범위 표시/숨김
            if (value === "my") {
                // My 모드: 벌 비행 범위 표시
                console.log("🐝 My 모드: 벌 비행 범위 표시");
                window.BeeFlightRange.toggle(map, true);
            } else {
                // Event 모드: 벌 비행 범위 숨김
                console.log("📅 Event 모드: 벌 비행 범위 숨김");
                window.BeeFlightRange.toggle(map, false);
            }
        });
    });
} else {
    console.warn("⚠️  토글 버튼을 찾을 수 없습니다.");
}

/* ================================
   벌 비행 범위 토글 버튼
================================ */

/**
 * 벌 비행 범위 토글 스위치 이벤트 핸들러
 *
 * @description
 * - 체크박스 ON: 벌 비행 범위 표시
 * - 체크박스 OFF: 벌 비행 범위 숨김
 */
const beeRangeToggleCheckbox = document.getElementById("beeRangeToggle");

if (beeRangeToggleCheckbox) {
    beeRangeToggleCheckbox.addEventListener("change", (event) => {
        const isChecked = event.target.checked;

        if (map) {
            // 벌 비행 범위 표시/숨김
            window.BeeFlightRange.toggle(map, isChecked);

            console.log(`🐝 벌 비행 범위 토글: ${isChecked ? "ON ✅" : "OFF ❌"}`);
        }
    });

    console.log("🐝 벌 비행 범위 토글 버튼 활성화됨 (기본: ON)");
} else {
    console.warn("⚠️  벌 비행 범위 토글 버튼을 찾을 수 없습니다.");
}

/* ================================
    Chart JSON 받아오기

URL: /chart/get_bloom_watch
HTTP Method: GET

dashboard.js 파일 내에서 fetch 함수를 사용하여 위 API 엔드포인트를 호출해 주세요.
API로부터 받은 JSON 데이터를 사용하여 차트를 렌더링하는 로직을 구현해 주세요.
================================ */
/* Chart.JS 삽입 */
const ctx = $(".chart");

new Chart(ctx, {
    type: "line",
    data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [
            {
                label: "# of Votes",
                data: [12, 19, 3, 5, 2, 3],
                borderWidth: 1,
            },
        ],
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    },
});
