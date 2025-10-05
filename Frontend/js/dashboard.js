$(function () {
    // Blooming Area 체크박스 - 2025
    $("#check2025").click(() => {
        if ($("#checkText2025").hasClass("checked")) {
            $("#checkText2025").removeClass("checked");
        } else {
            $("#checkText2025").addClass("checked");
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
 * @requires bloom_area.js - 개화 예상 지역 모듈
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

        window.map = map;

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

        // 6. 개화 예상 지역 표시 (bloom_area.js 모듈 사용)
        const bloomAreasData = [
            { id: 1, name: "개화 예상 지역 1", lat: 28.598, lng: -81.147, radius: 1500, info: "군집 1" },
            { id: 2, name: "개화 예상 지역 2", lat: 28.531, lng: -81.119, radius: 1000, info: "군집 2" },
            { id: 3, name: "개화 예상 지역 3", lat: 28.54, lng: -81.225, radius: 2000, info: "군집 3" },
        ];
        // window.BloomArea.create(map, bloomAreasData);

        window.bloomAreasData = bloomAreasData;
        // 체크박스가 켜져 있을 때만 개화 지역 표시
        if ($("#check2025").prop("checked")) {
            BloomArea.create(map, bloomAreasData);
        }

        console.log("✅ Google Maps 초기화 완료");
    } catch (error) {
        console.error("❌ Google Maps 초기화 실패:", error);
    }
};

$(function () {
    const $checkbox = $("#check2025");

    $checkbox.on("change", function () {
        if (this.checked) {
            // console.log("✅ Present Blooming Area 표시됨");
            BloomArea.create(window.map, window.bloomAreasData);
            // if (window.map && window.bloomAreasData) {
            //     BloomArea.create(window.map, window.bloomAreasData);
            // }
        } else {
            console.log("❌ Present Blooming Area 숨김");
            BloomArea.clear();
        }
    });
});

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
        const response = await fetch("/api/profile"); // Vercel 프록시 사용
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
/* ======= Blooming Chart JS (Honey 토글 복구) ======= */
const API_URL = "/api/charts/bloom-watch";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const NOW = new Date();
const NOW_IDX = NOW.getMonth(); // 0..11
const NOW_YEAR = NOW.getFullYear();

/* 폴백 데이터 */
const FALLBACK = {
    bloom: {
        acacia: [
            { month: 1, data: 0 },
            { month: 2, data: 11 },
            { month: 3, data: 200 },
            { month: 4, data: 400 },
            { month: 5, data: 280 },
            { month: 6, data: 210 },
            { month: 7, data: 160 },
            { month: 8, data: 120 },
            { month: 9, data: 60 },
            { month: 10, data: 20 },
            { month: 11, data: 5 },
            { month: 12, data: 0 },
        ],
        almond: [
            { month: 1, data: 0 },
            { month: 2, data: 0 },
            { month: 3, data: 10 },
            { month: 4, data: 120 },
            { month: 5, data: 260 },
            { month: 6, data: 240 },
            { month: 7, data: 200 },
            { month: 8, data: 150 },
            { month: 9, data: 130 },
            { month: 10, data: 80 },
            { month: 11, data: 20 },
            { month: 12, data: 0 },
        ],
    },
    honey: [
        { month: 1, amount: 20 },
        { month: 2, amount: 30 },
        { month: 3, amount: 200 },
        { month: 4, amount: 260 },
        { month: 5, amount: 240 },
        { month: 6, amount: 200 },
        { month: 7, amount: 150 },
        { month: 8, amount: 130 },
        { month: 9, amount: 80 },
        { month: 10, amount: 60 },
        { month: 11, amount: 10 },
        { month: 12, amount: 0 },
    ],
};

/* 비정형 JSON 정규화 */
function normalizePayload(x) {
    if (!x) return FALLBACK;
    if (Array.isArray(x)) {
        const obj = {};
        x.forEach((it) => Object.assign(obj, it));
        x = obj;
    }
    if (Array.isArray(x.bloom)) {
        const obj = {};
        x.bloom.forEach((it) => Object.assign(obj, it));
        x.bloom = obj;
    }
    if (!x.bloom || !x.honey) return FALLBACK;
    return x;
}

function months12() {
    return Array.from({ length: 12 }, (_, i) => i + 1);
}
function getBloomSeries(payload, species) {
    const arr = payload?.bloom?.[species] ?? [];
    const m = new Map(arr.map((o) => [o.month, o.data]));
    return months12().map((mm) => m.get(mm) ?? 0);
}
function getHoneySeries(payload) {
    const arr = payload?.honey ?? [];
    const m = new Map(arr.map((o) => [o.month, o.amount]));
    return months12().map((mm) => m.get(mm) ?? 0);
}

/* ---------- X축 롤링: 왼쪽 시작 = 현재-3 ---------- */
const START_IDX = (NOW_IDX + 12 - 3) % 12; // 가장 왼쪽은 현재-3개월
const VISIBLE_TICKS = [0, 3, 6, 9]; // 4개의 눈금만 노출
const CURRENT_POS = 3; // 두 번째 눈금(현재)의 위치

function rotate12(arr, startIdx) {
    return [...arr.slice(startIdx), ...arr.slice(0, startIdx)];
}

/* 눈금 라벨: (현재-3)+i 개월의 YYYY Mon */
function labelDateForIndex(i) {
    const base = new Date(NOW_YEAR, NOW_IDX - 3, 1);
    const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
    return `${d.getFullYear()} ${MONTHS[d.getMonth()]}`;
}

/* 과거/예측 구분: 회전된 축 기준으로 현재 이후는 점선 */
function segDashRolled(ctx) {
    const right = ctx.p1DataIndex;
    return right >= CURRENT_POS ? [6, 6] : undefined;
}

/* 차트 인스턴스 */
let chart = null;

/* Honey on/off */
function addHoneyDataset(dataRolled) {
    const accent = "#ffca80"; // 원래 코드 색상 유지 (요청대로 체크박스만 복구)
    const ds = {
        type: "bar",
        label: "Honey",
        data: dataRolled,
        yAxisID: "y2",
        backgroundColor: accent,
        borderColor: accent,
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
    };
    const i = chart.data.datasets.findIndex((d) => d.label === "Honey");
    if (i >= 0) chart.data.datasets[i] = ds;
    else chart.data.datasets.push(ds);
    chart.options.scales.y2.display = true;
    chart.update();
}
function removeHoneyDataset() {
    chart.data.datasets = chart.data.datasets.filter((d) => d.label !== "Honey");
    chart.options.scales.y2.display = false;
    chart.update();
}

/* -------------------- 차트 생성 -------------------- */
function buildChart(bloomData, honeyData) {
    const ctxEl = document.querySelector("#chartBox canvas.chart");
    if (!ctxEl) {
        console.error("canvas not found");
        return;
    }
    const ctx = ctxEl.getContext("2d");
    if (chart) chart.destroy();

    // 12개월 롤링 데이터 & 라벨
    const labelsRolling = rotate12(MONTHS, START_IDX);
    const bloomRolling = rotate12(bloomData, START_IDX);
    const honeyRolling = rotate12(honeyData, START_IDX);

    chart = new Chart(ctx, {
        data: {
            labels: labelsRolling, // 실제 라벨은 tick callback에서 4개만 출력
            datasets: [
                {
                    type: "line",
                    label: "Past / Predict",
                    data: bloomRolling,
                    yAxisID: "y",
                    borderColor: "#FF462D",
                    borderWidth: 3,
                    backgroundColor: "transparent",
                    tension: 0, // ← 완전히 각진 꺾은선
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    segment: { borderDash: segDashRolled },
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                    labels: {
                        usePointStyle: true,
                        /*pointStyle: "line"*/ boxWidth: 14,
                        boxHeight: 14,
                        generateLabels(chart) {
                            // 기본 라벨 생성
                            const defaultGen = Chart.defaults.plugins.legend.labels.generateLabels;
                            const labels = defaultGen(chart);

                            // Honey 라벨만 둥근 정사각형 + 노란색으로 커스텀
                            return labels.map((l) => {
                                if (l.text === "Honey") {
                                    l.pointStyle = "rectRounded";
                                    l.fillStyle = "#ffca80";
                                    l.strokeStyle = "#ffca80";
                                    l.lineWidth = 1;
                                } else if (l.text === "Past / Predict") {
                                    l.pointStyle = "line";
                                }
                                return l;
                            });
                        },
                    },
                }, // 범례 유지
                tooltip: { mode: "index", intersect: false },
            },
            interaction: { mode: "index", intersect: false },
            scales: {
                y: {
                    position: "left",
                    title: { display: true, text: "Bloom Amount" },
                    grid: { display: false }, // 가로선 없음
                    border: { display: false },
                    ticks: { color: "#6b7280" },
                },
                y2: {
                    display: false,
                    position: "right",
                    title: { display: true, text: "Honey Amount" },
                    grid: { drawOnChartArea: false },
                    border: { display: false },
                    ticks: { color: "#6b7280" },
                },
                x: {
                    // 세로 그리드: 4 지점만 표시(실선 1px #ccc8c2)
                    grid: {
                        drawBorder: false,
                        drawTicks: false,
                        lineWidth: 1,
                        color: (ctx) => (VISIBLE_TICKS.includes(ctx.index) ? "#ccc8c2" : "transparent"),
                    },
                    ticks: {
                        padding: 8,
                        // 현재(두 번째 눈금: CURRENT_POS)만 색 바꾸려면 아래 주석 해제
                        color: (ctx) => (ctx.index === CURRENT_POS ? "#ffb246" : "#6b7280"),
                        callback: (val, idx) => (VISIBLE_TICKS.includes(idx) ? labelDateForIndex(idx) : ""),
                    },
                },
            },
        },
    });

    // 초기 토글 반영
    if ($("#toggleHoney").prop("checked")) addHoneyDataset(honeyRolling);

    // 토글 이벤트 바인딩
    $("#toggleHoney")
        .off("change")
        .on("change", function () {
            if (this.checked) addHoneyDataset(honeyRolling);
            else removeHoneyDataset();
        });
}

/* -------------------- 초기화 -------------------- */
(async function init() {
    // ✅ Honey 체크박스를 원래처럼 .title-radio 영역에 삽입
    $(".title-radio")
        .empty()
        .append(
            '<label class="honey-toggle"> <input type="checkbox" id="toggleHoney"> <div class="honey-icon"></div> <span class="text">Honey</span> </label>'
        );

    let payload;
    try {
        console.log("API URL : ", API_URL);
        // const r = await fetch(API_URL, { headers: { Accept: "application/json" } });
        // if (!r.ok) throw new Error(`bad status ${r.status}`);
        // payload = await r.json();
    } catch (e) {
        console.warn("API failed, using FALLBACK:", e);
        payload = FALLBACK;
    }
    payload = normalizePayload(payload);

    const bloomData = getBloomSeries(payload, "almond");
    const honeyData = getHoneySeries(payload);

    buildChart(bloomData, honeyData);
})();

/* ================================
   Event 토글 시 지도 대신 이미지 표시
================================ */
$(function () {
    const $map = $("#map");
    const eventImage = "../img/live map/livemap_event_map.png";
    // 추가
    const $subtitle = $("#map-text"); // p태그 선택

    // 원래 텍스트 저장
    const originalText = $subtitle.text();

    $(".toggle-option").on("click", function () {
        const isEvent = $(this).hasClass("event");
        if (isEvent) {
            // Google Maps 숨기고 이미지 삽입
            $map.empty().append(`
                <img src="${eventImage}" 
                     alt="Event Map Image" 
                     style="width:100%; height:100%; object-fit:cover; border-radius:10px;">
            `);

            // p태그 내용 변경
            $subtitle.html("California Central Valley region<br>85% almond bloom predicted within 2 weeks");
            console.log("📷 Event 모드: 이미지로 전환됨");
        } else {
            // My 모드: 다시 Google Maps 표시
            $map.empty(); // 이미지 제거
            if (typeof initMap === "function") {
                initMap(); // 기존 지도 재초기화
            }

            // 원래 p태그 내용 복원
            $subtitle.text(originalText);
        }
    });
});
