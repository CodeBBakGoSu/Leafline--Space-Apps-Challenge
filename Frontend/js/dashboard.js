/* ================================
Google Map 초기화
================================ */
let map;
let userMarker;

// Google Maps API 콜백 함수
window.initMap = async function () {
    // 기본 위치: Orlando, Florida
    const defaultLocation = { lat: 28.5383, lng: -81.3792 };

    try {
        // 지도 생성
        map = new google.maps.Map(document.getElementById("map"), {
            center: defaultLocation,
            zoom: 10,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
        });

        // 사용자 위치 마커 추가
        userMarker = new google.maps.Marker({
            position: defaultLocation,
            map: map,
            title: "Orlando, FL",
            animation: google.maps.Animation.DROP,
        });

        // 사용자 위치 정보 창
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px;">
                    <h3 style="margin: 0 0 5px 0;">Orlando, Florida</h3>
                    <p style="margin: 0; color: #666;">Your beekeeping location</p>
                </div>
            `,
        });

        // 마커 클릭 시 정보 창 표시
        userMarker.addListener("click", () => {
            infoWindow.open(map, userMarker);
        });

        console.log("Google Maps 초기화 완료");
    } catch (error) {
        console.error("Google Maps 초기화 실패:", error);
    }
};

// 위치 업데이트 함수
function updateMapLocation(lat, lng, title = "My Location") {
    if (!map || !userMarker) {
        console.error("지도가 초기화되지 않았습니다.");
        return;
    }

    const newLocation = { lat, lng };
    
    // 지도 중심 이동
    map.setCenter(newLocation);
    
    // 마커 위치 업데이트
    userMarker.setPosition(newLocation);
    userMarker.setTitle(title);
    
    console.log(`위치 업데이트: ${title} (${lat}, ${lng})`);
}

// 백엔드에서 사용자 프로필 가져오기
async function loadUserProfile() {
    try {
        const response = await fetch('http://localhost:8000/api/profile');
        const profile = await response.json();
        
        // 지도 위치 업데이트
        if (profile.location) {
            const { latitude, longitude, city, state } = profile.location;
            updateMapLocation(
                latitude, 
                longitude, 
                `${city}, ${state}`
            );
            
            console.log('사용자 프로필 로드 완료:', profile);
        }
        
        return profile;
    } catch (error) {
        console.error('프로필 로드 실패:', error);
        return null;
    }
}

// 페이지 로드 시 프로필 가져오기
document.addEventListener('DOMContentLoaded', () => {
    // Google Maps가 로드되면 프로필 정보 가져오기
    const checkMapLoaded = setInterval(() => {
        if (map && userMarker) {
            clearInterval(checkMapLoaded);
            loadUserProfile();
        }
    }, 500);
});

/* ================================
Toggle Button
================================ */
// const buttons = document.querySelectorAll(".toggle-btn");

//     buttons.forEach(btn => {
//       btn.addEventListener("click", () => {
//         buttons.forEach(b => b.classList.remove("active")); // 모두 해제
//         btn.classList.add("active"); // 클릭된 버튼만 활성화
//       });
//     });

const container = document.querySelector(".toggle-container");
const options = document.querySelectorAll(".toggle-option");

options.forEach((option) => {
    option.addEventListener("click", () => {
        const value = option.classList.contains("my") ? "my" : "event";
        container.setAttribute("data-active", value);

        // 기능 분기 예시
        if (value === "my") {
            console.log("My 모드 실행!");
        } else {
            console.log("Event 모드 실행!");
        }
    });
});
