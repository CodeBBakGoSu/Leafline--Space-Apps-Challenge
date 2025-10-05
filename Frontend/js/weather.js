/* ===== weather.js : 7일 날씨 블럭 렌더 (fetch + 아이콘 매핑) ===== */

(function () {
    const API = "/api/dashboard/weather/7day";

    // 안전하게 주입할 컨테이너(두 번째 weather-item)
    const mount = document.querySelector(".weather-container .weather-item:nth-of-type(2)");
    if (!mount) {
        console.error("weather mount not found");
        return;
    }

    // 요일 텍스트
    const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Fallback (API 오류 시)
    const FALLBACK = {
        days: [
            { date: "2025-10-04", avgTempC: 29.4, avgTempF: 84.9, weather: "sun" },
            { date: "2025-10-05", avgTempC: 28.1, avgTempF: 82.6, weather: "cloud" },
            { date: "2025-10-06", avgTempC: 27.5, avgTempF: 81.5, weather: "rain" },
            { date: "2025-10-07", avgTempC: 30.1, avgTempF: 86.2, weather: "sun" },
            { date: "2025-10-08", avgTempC: 29.0, avgTempF: 84.2, weather: "sun" },
            { date: "2025-10-09", avgTempC: 26.8, avgTempF: 80.2, weather: "cloud" },
            { date: "2025-10-10", avgTempC: 25.7, avgTempF: 78.3, weather: "rain" },
        ],
    };

    // 날짜 유틸
    const pad2 = (n) => String(n).padStart(2, "0");
    const toYMD = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

    function parseYMD(s) {
        // "YYYY-MM-DD" -> Date(현지)
        const [y, m, d] = s.split("-").map(Number);
        return new Date(y, m - 1, d);
    }

    // 아이콘 경로 매핑
    // today(첫 카드)는 컬러 아이콘, 나머지는 회색 아이콘을 씁니다.
    function getIconSrc(weather, isToday) {
        const t = (weather || "").toLowerCase();

        // weather → 파일명 매핑
        const map = {
            sun: "sunny",
            cloud: "cloudy",
            rain: "rainy",
            snow: "snow",
            thunderstorm: "thunderstorm",
        };

        // 매칭되는 파일명 없으면 기본값 'sunny'
        const base = map[t] || "sunny";

        // 오늘 블록이면 컬러, 아니면 회색 아이콘 사용
        return isToday
            ? `../img/weather/weather_icon_${base}_color.png`
            : `../img/weather/weather_icon_${base}_gray.png`;
    }

    // days 배열을 오늘부터 시작하도록 회전
    function sliceForwardFromToday(days) {
        const today = new Date();
        const todayYMD = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
            today.getDate()
        ).padStart(2, "0")}`;

        // 오늘과 일치하는 인덱스, 없으면 '오늘 이후에서 가장 가까운 날짜'
        let start = days.findIndex((d) => d.date === todayYMD);
        if (start === -1) {
            start = days.findIndex((d) => parseYMD(d.date) >= parseYMD(todayYMD));
            if (start === -1) start = 0; // 모두 과거라면 그냥 처음부터
        }
        return days.slice(start, start + 7); // ← wrap 금지
    }

    // 카드 HTML 생성
    function cardHTML(item, i) {
        const d = parseYMD(item.date);
        const dayNum = d.getDate();
        const dow = WEEK[d.getDay()];
        const isToday = i === 0; // 회전 후 첫 카드가 Today

        const topLabel = isToday ? `Today ${dayNum}` : `${dow} ${dayNum}`;
        const iconSrc = getIconSrc(item.weather, isToday);

        return `
      <div class="wcard ${isToday ? "today" : ""}">
        <div class="top">${topLabel}</div>
        <div class="divider"></div>
        <img src="${iconSrc}" alt="${item.weather || "sun"} icon">
        <div class="temp">${Math.round(item.avgTempC)}°</div>
      </div>
    `;
    }

    // 리스트 렌더
    function render(days) {
        const picked = days.slice(0, 8);
        const html = `
      <div class="weather-list">
        ${picked.map(cardHTML).join("")}
      </div>
    `;
        mount.innerHTML = html;
    }

    // 데이터 로드 (fetch 사용)
    async function init() {
        let payload;
        try {
            const res = await fetch(API, { headers: { Accept: "application/json" } });
            if (!res.ok) throw new Error(`status ${res.status}`);
            payload = await res.json();
        } catch (err) {
            console.warn("[weather] use fallback:", err);
            payload = FALLBACK;
        }

        const days = Array.isArray(payload?.days) ? payload.days : FALLBACK.days;

        // 날짜 오름차순 정렬 후, 오늘부터 시작하도록 회전
        const sorted = [...days].sort((a, b) => parseYMD(a.date) - parseYMD(b.date));
        const forward = sliceForwardFromToday(sorted);
        render(forward);
    }

    init();
})();
