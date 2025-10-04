# 날씨 정보 통합 가이드 (7일 예보)

## 개요

Bloom AI 챗봇은 현재 날짜/시간과 **7일 날씨 예보**를 기반으로 양봉 조언을 제공합니다.

## 작동 방식

### 1. 날씨 정보 업데이트

날씨 정보는 `user_profile.py`의 `weather_forecast` 필드에 7일치 저장됩니다.

**자동 업데이트 방법:**

#### Dashboard에서 7일 날씨 조회 시 자동 업데이트
```javascript
// 프론트엔드에서 호출
fetch('http://localhost:8000/api/dashboard/weather/7day')
```
→ 7일 날씨를 조회하면 자동으로 `user_profile`에 저장됩니다.

### 2. AI 챗봇에서 사용

챗봇은 매 응답마다 다음 정보를 자동으로 포함합니다:

```
현재 시간 정보:
- 현재 날짜: 2025-10-04 (Saturday)
- 현재 시각: 2025-10-04 14:30

현재 날씨 정보:
- 날씨: sun, 온도: 29.4°C (84.9°F)
```

## 사용 예시

### 날짜 질문
**사용자:** "오늘이 언제야?"
**AI:** "오늘은 2025년 10월 4일 토요일입니다. 무엇을 도와드릴까요?"

### 오늘 날씨 질문
**사용자:** "오늘 날씨 어때?"
**AI:** "오늘 Orlando의 날씨는 맑고 화창합니다 (sun). 현재 온도는 29.4°C (84.9°F)입니다. 
벌들이 활발하게 활동하기 좋은 날씨네요! 벌통 점검이나 꿀 수확 작업을 하기에 적합합니다."

### 7일 날씨 예보 질문
**사용자:** "이번 주 날씨 어때?"
**AI:** "이번 주 Orlando의 7일 날씨 예보입니다:
- 10/4: sun, 29.4°C
- 10/5: cloud, 27.8°C
- 10/6: rain, 24.2°C
- 10/7: sun, 28.5°C
...
비가 오는 10/6은 실내 작업을 추천하고, 그 전후 맑은 날에 벌통 점검을 하시면 좋겠습니다."

### 날씨 기반 일정 조언
**사용자:** "이번 주 언제 벌통 점검하면 좋을까?"
**AI:** "7일 예보를 보니, 10/4(오늘)과 10/5가 맑고 온도가 적당합니다. 10/6은 비가 올 예정이니 
10/4나 10/5에 점검하시는 것을 추천드립니다. 10/7부터 다시 날씨가 좋아지니 그때 추가 작업을 하셔도 좋습니다."

## 날씨 데이터 형식

### weather 필드 값
- `sun`: 맑음 ☀️
- `cloud`: 흐림 ☁️
- `rain`: 비 🌧️
- `snow`: 눈 ❄️
- `thunderstorm`: 뇌우 ⛈️

### 저장 형식 (user_profile.py)
```python
"weather_forecast": {
    "days": [
        {
            "date": "2025-10-04",
            "avgTempC": 29.4,
            "avgTempF": 84.9,
            "weather": "sun"
        },
        {
            "date": "2025-10-05",
            "avgTempC": 27.8,
            "avgTempF": 82.0,
            "weather": "cloud"
        },
        // ... 최대 7일
    ],
    "last_updated": "2025-10-04T14:30:00"
}
```

## API 엔드포인트

### GET /api/dashboard/weather/7day
Orlando의 7일 날씨 예보 조회 및 user_profile 자동 업데이트

**요청:**
```bash
curl "http://localhost:8000/api/dashboard/weather/7day"
```

**응답:**
```json
{
  "days": [
    {
      "date": "2025-10-04",
      "avgTempC": 29.4,
      "avgTempF": 84.9,
      "weather": "sun"
    },
    {
      "date": "2025-10-05",
      "avgTempC": 27.8,
      "avgTempF": 82.0,
      "weather": "cloud"
    }
    // ... 최대 7일
  ]
}
```

## 프론트엔드 통합

### 페이지 로드 시 7일 날씨 업데이트
```javascript
// index.html 또는 dashboard.html
window.addEventListener('load', async function() {
    try {
        // 7일 날씨 예보 가져오기 (자동으로 user_profile 업데이트)
        const response = await fetch('http://localhost:8000/api/dashboard/weather/7day');
        const weather = await response.json();
        console.log('7일 날씨 업데이트 완료:', weather);
        console.log('오늘 날씨:', weather.days[0]);
    } catch (error) {
        console.error('날씨 업데이트 실패:', error);
    }
});
```

### 주기적 업데이트 (선택사항)
```javascript
// 6시간마다 날씨 정보 갱신
setInterval(async () => {
    await fetch('http://localhost:8000/api/dashboard/weather/7day');
}, 21600000); // 6시간 = 21600000ms
```

## 주의사항

1. **날씨 정보가 없을 때**
   - AI는 "날씨 정보 없음"으로 표시하고 일반적인 조언을 제공합니다.

2. **위치 정보**
   - 기본 위치: Orlando, Florida (28.5383, -81.3792)
   - `user_profile.py`에서 위치 변경 가능

3. **날씨 API 제한**
   - NWS (National Weather Service) API 사용
   - 미국 지역만 지원
   - 요청 제한: 합리적인 사용 권장

## 문제 해결

### 날씨 정보가 업데이트되지 않을 때
```bash
# 7일 날씨 조회 (자동 업데이트)
curl http://localhost:8000/api/dashboard/weather/7day
```

### 날씨 정보 확인
```bash
# 프로필 정보 확인
curl http://localhost:8000/api/profile

# weather_forecast 필드 확인
```

### 날씨 초기화
```python
# user_profile.py에서 직접 수정
"weather_forecast": {
    "days": [],
    "last_updated": None,
}
```

## 챗봇에서 활용 가능한 질문들

- "오늘 날씨 어때?"
- "이번 주 날씨 알려줘"
- "내일 비 와?"
- "언제 벌통 점검하면 좋을까?" (날씨 기반 일정 추천)
- "이번 주 벌 작업 계획 세워줘" (7일 예보 기반 작업 계획)

