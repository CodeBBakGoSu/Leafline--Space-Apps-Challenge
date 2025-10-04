/**
 * ========================================
 * Bee Flight Range Module
 * 벌 비행 범위 시각화 모듈
 * ========================================
 * 
 * 이 모듈은 양봉장을 중심으로 벌이 날아갈 수 있는 범위를
 * Google Maps 위에 원(Circle)으로 표시하는 기능을 제공합니다.
 * 
 * @author Leafline Team
 * @description 벌은 일반적으로 3km~5km 범위 내에서 활동합니다.
 */

/* ================================
   전역 변수
================================ */

/**
 * 벌 비행 범위를 표시하는 Circle 객체들의 배열
 * @type {google.maps.Circle[]}
 */
let beeRangeCircles = [];

/**
 * 벌 비행 범위 설정 상수
 * @constant {Object}
 */
const BEE_RANGE_CONFIG = {
    // 범위 설정 (미터 단위)
    RANGES: {
        INNER: 3000,   // 3km - 벌의 일반적인 활동 범위
        OUTER: 5000,   // 5km - 벌의 최대 활동 범위
    },
    
    // 색상 설정 (벌 테마: 황금색/노란색)
    COLORS: {
        INNER_STROKE: '#FFA500',  // 안쪽 원 테두리: 오렌지색
        INNER_FILL: '#FFD700',    // 안쪽 원 내부: 황금색
        OUTER_STROKE: '#FFB800',  // 바깥쪽 원 테두리: 주황빛 노란색
        OUTER_FILL: '#FFD700',    // 바깥쪽 원 내부: 황금색
    },
    
    // 투명도 설정 (0.0 ~ 1.0)
    OPACITY: {
        INNER_STROKE: 0.8,   // 안쪽 원 테두리: 80% 불투명
        INNER_FILL: 0.25,    // 안쪽 원 내부: 25% 불투명 (더 진하게)
        OUTER_STROKE: 0.6,   // 바깥쪽 원 테두리: 60% 불투명
        OUTER_FILL: 0.15,    // 바깥쪽 원 내부: 15% 불투명 (더 옅게)
    },
    
    // 기타 스타일
    STROKE_WEIGHT: 2,  // 테두리 두께 (픽셀)
};

/* ================================
   핵심 함수
================================ */

/**
 * 벌 비행 범위 원(Circle)을 생성하고 지도에 표시합니다.
 * 
 * @param {google.maps.Map} map - Google Maps 객체
 * @param {Object} center - 원의 중심점 (양봉장 위치)
 * @param {number} center.lat - 위도
 * @param {number} center.lng - 경도
 * 
 * @description
 * - 기존에 표시된 원들을 먼저 제거합니다.
 * - 5km(외곽)와 3km(내부) 두 개의 원을 겹쳐서 생성합니다.
 * - 내부 원이 더 진한 색으로 표시되어 시각적 효과를 줍니다.
 * 
 * @example
 * createBeeRangeCircles(map, { lat: 28.5383, lng: -81.3792 });
 */
function createBeeRangeCircles(map, center) {
    // 1. 기존 원들 제거 (메모리 누수 방지)
    clearBeeRangeCircles();
    
    // 2. 5km 범위 원 생성 (바깥쪽 - 더 옅은 색)
    const circle5km = new google.maps.Circle({
        strokeColor: BEE_RANGE_CONFIG.COLORS.OUTER_STROKE,
        strokeOpacity: BEE_RANGE_CONFIG.OPACITY.OUTER_STROKE,
        strokeWeight: BEE_RANGE_CONFIG.STROKE_WEIGHT,
        fillColor: BEE_RANGE_CONFIG.COLORS.OUTER_FILL,
        fillOpacity: BEE_RANGE_CONFIG.OPACITY.OUTER_FILL,
        map: map,
        center: center,
        radius: BEE_RANGE_CONFIG.RANGES.OUTER,
        clickable: false,  // 클릭 이벤트 비활성화
    });
    
    // 3. 3km 범위 원 생성 (안쪽 - 더 진한 색)
    const circle3km = new google.maps.Circle({
        strokeColor: BEE_RANGE_CONFIG.COLORS.INNER_STROKE,
        strokeOpacity: BEE_RANGE_CONFIG.OPACITY.INNER_STROKE,
        strokeWeight: BEE_RANGE_CONFIG.STROKE_WEIGHT,
        fillColor: BEE_RANGE_CONFIG.COLORS.INNER_FILL,
        fillOpacity: BEE_RANGE_CONFIG.OPACITY.INNER_FILL,
        map: map,
        center: center,
        radius: BEE_RANGE_CONFIG.RANGES.INNER,
        clickable: false,
    });
    
    // 4. 생성된 원들을 배열에 저장 (나중에 관리하기 위해)
    beeRangeCircles = [circle5km, circle3km];
    
    console.log('🐝 벌 비행 범위 표시 완료:', {
        center: center,
        ranges: `${BEE_RANGE_CONFIG.RANGES.INNER/1000}km, ${BEE_RANGE_CONFIG.RANGES.OUTER/1000}km`
    });
}

/**
 * 벌 비행 범위 원들을 지도에서 제거합니다.
 * 
 * @description
 * - 각 원의 setMap(null)을 호출하여 지도에서 제거합니다.
 * - 배열을 초기화하여 메모리를 해제합니다.
 * 
 * @private
 */
function clearBeeRangeCircles() {
    beeRangeCircles.forEach(circle => {
        if (circle) {
            circle.setMap(null);  // 지도에서 제거
        }
    });
    beeRangeCircles = [];  // 배열 초기화
}

/**
 * 벌 비행 범위의 표시/숨김을 토글합니다.
 * 
 * @param {google.maps.Map} map - Google Maps 객체
 * @param {boolean} show - true: 표시, false: 숨김
 * 
 * @description
 * - 원들이 이미 생성되어 있어야 합니다.
 * - show가 true면 지도에 표시, false면 숨김 처리합니다.
 * 
 * @example
 * toggleBeeRange(map, true);   // 범위 표시
 * toggleBeeRange(map, false);  // 범위 숨김
 */
function toggleBeeRange(map, show) {
    beeRangeCircles.forEach(circle => {
        if (circle) {
            circle.setMap(show ? map : null);
        }
    });
    
    console.log(`🐝 벌 비행 범위: ${show ? '표시 ✅' : '숨김 ❌'}`);
}

/**
 * 벌 비행 범위의 중심점을 업데이트합니다.
 * 
 * @param {google.maps.Map} map - Google Maps 객체
 * @param {Object} newCenter - 새로운 중심점
 * @param {number} newCenter.lat - 위도
 * @param {number} newCenter.lng - 경도
 * 
 * @description
 * - 사용자 위치가 변경되면 이 함수를 호출하여 범위를 업데이트합니다.
 * - 기존 원을 제거하고 새 위치에 원을 다시 생성합니다.
 * 
 * @example
 * updateBeeRangeCenter(map, { lat: 25.7617, lng: -80.1918 });
 */
function updateBeeRangeCenter(map, newCenter) {
    // 원들이 표시되어 있는지 확인
    const isVisible = beeRangeCircles.length > 0 && beeRangeCircles[0].getMap() !== null;
    
    // 새 위치에 원 생성
    createBeeRangeCircles(map, newCenter);
    
    // 이전에 숨겨져 있었다면 다시 숨김 처리
    if (!isVisible) {
        toggleBeeRange(map, false);
    }
    
    console.log('🐝 벌 비행 범위 중심점 업데이트:', newCenter);
}

/**
 * 벌 비행 범위가 현재 표시되어 있는지 확인합니다.
 * 
 * @returns {boolean} true: 표시 중, false: 숨김 상태
 */
function isBeeRangeVisible() {
    return beeRangeCircles.length > 0 && 
           beeRangeCircles[0] && 
           beeRangeCircles[0].getMap() !== null;
}

/* ================================
   Export (전역으로 노출)
================================ */

// 다른 파일에서 사용할 수 있도록 window 객체에 추가
window.BeeFlightRange = {
    create: createBeeRangeCircles,
    toggle: toggleBeeRange,
    update: updateBeeRangeCenter,
    clear: clearBeeRangeCircles,
    isVisible: isBeeRangeVisible,
    CONFIG: BEE_RANGE_CONFIG,  // 설정값도 노출 (커스터마이징 가능)
};

