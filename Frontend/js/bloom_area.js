/**
 * ========================================
 * Bloom Area Module
 * 개화 예상 지역 시각화 모듈
 * ========================================
 */

let bloomAreaObjects = [];

function generateIrregularPolygonCoords(center, averageRadius) {
  const coords = [];
  const numVertices = 30;
  const radiusVariance = 0.3;

  for (let i = 0; i < numVertices; i++) {
    const angle = (i / numVertices) * 360;
    const randomRadius = averageRadius * (1 + (Math.random() - 0.5) * 2 * radiusVariance);
    const point = google.maps.geometry.spherical.computeOffset(center, randomRadius, angle);
    coords.push(point.toJSON());
  }
  return coords;
}

/**
 * 개화 예상 지역들을 생성하고 지도에 표시합니다.
 * @param {google.maps.Map} map - Google Maps 객체
 * @param {Array<Object>} bloom_areas - 개화 예상 지역 데이터 배열
 */
function createBloomAreas(map, bloom_areas) {
  clearBloomAreas(); // 기존 객체들 제거

  const infoWindow = new google.maps.InfoWindow();

  // 개화 예상 지역들을 순회하며 폴리곤과 마커 생성
  bloom_areas.forEach(area => {
    const centerPoint = new google.maps.LatLng(area.lat, area.lng);
    const polygonCoords = generateIrregularPolygonCoords(centerPoint, area.radius);

    const polygon = new google.maps.Polygon({
      paths: polygonCoords,
      strokeColor: "#FFC107",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FFC107",
      fillOpacity: 0.35,
      map: map,
    });
    bloomAreaObjects.push(polygon);

    const flowerIcon = {
      url: "https://www.vecteezy.com/png/12895938-cute-and-simple-flower-illustration-in-trendy-color-theme-for-design-element-and-ornament",
      scaledSize: new google.maps.Size(40, 40)
    };
    const areaMarker = new google.maps.Marker({
      position: centerPoint,
      map: map,
      icon: flowerIcon,
      title: area.name
    });
    areaMarker.addListener("click", () => {
      infoWindow.setContent(`<strong>${area.name}</strong><br>${area.info}`);
      infoWindow.open(map, areaMarker);
    });
    bloomAreaObjects.push(areaMarker);
  });

  console.log('🌸 개화 예상 지역 표시 완료');
}

function clearBloomAreas() {
  bloomAreaObjects.forEach(obj => obj.setMap(null));
  bloomAreaObjects = [];
}

function toggleBloomAreas(map, show) {
  bloomAreaObjects.forEach(obj => obj.setMap(show ? map : null));
  console.log(`🌸 개화 예상 지역: ${show ? '표시 ✅'  : '숨김 ❌' }`);
}

// window 객체에 노출
window.BloomArea = {
  create: createBloomAreas,
  clear: clearBloomAreas,
  toggle: toggleBloomAreas,
};