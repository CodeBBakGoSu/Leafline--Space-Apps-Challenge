// Google Map 불러오기
// async function initMap() {
//     const {Map} = await google.maps.importLibrary("maps");

//     map = new Map(document.getElementById("map"), {
//         center: { lat: 28.5649628, lng: -81.1589157 }, // 지도 중앙 위치의 위도, 경도
//         zoom: 10, // 지도를 얼마나 가깝게 볼 건지
//     })
// }
// window.initMap = function () {
//     const map = new google.maps.Map(document.getElementById("map"), {
//         center: { lat: 28.5649628, lng: -81.1589157 }, // 지도 중앙 위치의 위도, 경도
//         zoom: 10, // 지도를 얼마나 가깝게 볼 건지
//     });
// };

// initMap();

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
