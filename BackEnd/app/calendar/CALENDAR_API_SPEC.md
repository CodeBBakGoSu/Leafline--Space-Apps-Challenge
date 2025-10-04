# 캘린더 API 명세서

## 개요
사용자가 추가한 일정을 기반으로 AI가 미래 일정을 예측하여 자동으로 추천하는 스마트 캘린더 시스템입니다.

## API 엔드포인트

### POST /api/calendar/schedule
사용자가 선택한 일정을 저장하고, AI가 예측한 미래 일정을 함께 반환합니다.

**요청 (Request)**
```json
{
  "date": "2025-10-05",
  "tasks": [
    "Feed bees",
    "Check hive health"
  ]
}
```

**요청 필드:**
- `date` (string, required): 일정 날짜 (YYYY-MM-DD 형식)
- `tasks` (array of string, required): 선택한 일정 목록

**응답 (Response)**
```json
{
  "response": [
    {
      "date": "2025-10-05",
      "task": "Feed bees",
      "AI": false
    },
    {
      "date": "2025-10-05",
      "task": "Check hive health",
      "AI": false
    },
    {
      "date": "2025-10-08",
      "task": "Feed bees (AI 예측)",
      "AI": true
    },
    {
      "date": "2025-10-12",
      "task": "Check hive health (AI 예측)",
      "AI": true
    }
  ]
}
```

**응답 필드:**
- `response` (array): 모든 일정 목록 (사용자 + AI 예측)
  - `date` (string): 일정 날짜 (YYYY-MM-DD)
  - `task` (string): 일정 내용
  - `AI` (boolean): AI 예측 여부
    - `false`: 사용자가 직접 추가한 일정
    - `true`: AI가 예측한 일정

## AI 예측 로직 예시

### 패턴 1: 주기적 작업
```
사용자 입력: "Feed bees" (10/5)
AI 예측: "Feed bees" (10/8, 10/11, 10/14) → 3일 주기
```

### 패턴 2: 선행 작업 추천
```
사용자 입력: "Harvest honey" (10/20)
AI 예측: 
  - "Check honey readiness" (10/18) → 수확 2일 전 확인
  - "Prepare equipment" (10/19) → 수확 1일 전 준비
```

### 패턴 3: 계절별 작업
```
사용자 입력: "Spring hive inspection" (3/15)
AI 예측:
  - "Add supers" (4/1) → 벌통 확장
  - "Monitor swarming" (4/15) → 분봉 관찰
```

## 프론트엔드 처리

### 1. 일정 표시 스타일

**사용자 일정 (AI: false)**
- 진하게 표시
- 배경: `#232323`
- 글자색: `#ffb246`
- opacity: 1.0

**AI 예측 일정 (AI: true)**
- 반투명 표시 (40% opacity)
- 이탤릭체
- 점선 테두리
- 호버 시 80% opacity로 증가

### 2. 렌더링 로직
```javascript
function renderSchedulesFromBackend(schedules) {
    schedules.forEach(schedule => {
        const todoItem = document.createElement('div');
        todoItem.classList.add('todo-item');
        todoItem.textContent = schedule.task;
        
        if (schedule.AI) {
            todoItem.classList.add('ai-predicted');
        }
        
        // 해당 날짜에 추가
        addToCalendar(schedule.date, todoItem);
    });
}
```

## 백엔드 구현 가이드

### 필요한 파일 구조
```
calendar/
├── __init__.py
├── calendar_router.py      # API 라우터
├── calendar_schema.py      # Pydantic 스키마
├── calendar_service.py     # AI 예측 로직
└── calendar_database.py    # 데이터 저장 (옵션)
```

### calendar_schema.py
```python
from pydantic import BaseModel
from typing import List

class ScheduleRequest(BaseModel):
    date: str  # YYYY-MM-DD
    tasks: List[str]

class ScheduleItem(BaseModel):
    date: str
    task: str
    AI: bool

class ScheduleResponse(BaseModel):
    response: List[ScheduleItem]
```

### calendar_service.py (예시)
```python
def predict_future_schedules(user_schedule, history):
    """
    사용자 일정을 기반으로 미래 일정 예측
    
    Args:
        user_schedule: 사용자가 추가한 일정
        history: 과거 일정 이력
    
    Returns:
        예측된 일정 목록
    """
    predictions = []
    
    # 1. 주기 패턴 분석
    if "Feed" in user_schedule.task:
        # 3일마다 먹이 주기 예측
        for i in range(1, 4):
            predictions.append({
                "date": add_days(user_schedule.date, i * 3),
                "task": user_schedule.task,
                "AI": True
            })
    
    # 2. 계절별 작업 추천
    # ...
    
    return predictions
```

### calendar_router.py
```python
from fastapi import APIRouter
from .calendar_schema import ScheduleRequest, ScheduleResponse
from .calendar_service import save_schedule, predict_future_schedules

router = APIRouter(prefix="/api/calendar", tags=["calendar"])

@router.post("/schedule", response_model=ScheduleResponse)
async def create_schedule(request: ScheduleRequest):
    # 1. 사용자 일정 저장
    user_schedules = save_schedule(request)
    
    # 2. AI 예측 일정 생성
    ai_schedules = predict_future_schedules(request)
    
    # 3. 합쳐서 반환
    all_schedules = user_schedules + ai_schedules
    
    return {"response": all_schedules}
```

## 테스트 시나리오

### 시나리오 1: 먹이 주기
```
입력: "Feed bees" (10/5)
예상 출력:
  - 10/5: Feed bees (AI: false)
  - 10/8: Feed bees (AI: true)
  - 10/11: Feed bees (AI: true)
```

### 시나리오 2: 벌통 점검
```
입력: "Hive inspection" (10/10)
예상 출력:
  - 10/10: Hive inspection (AI: false)
  - 10/17: Hive inspection (AI: true) → 7일 후
  - 10/24: Hive inspection (AI: true) → 14일 후
```

## UI/UX 가이드

### 사용자 경험
1. 사용자가 일정 추가
2. 즉시 캘린더에 진하게 표시
3. AI 예측 일정이 반투명하게 추가됨
4. 사용자는 예측 일정을 확인하고 수락/거절 가능 (향후 기능)

### 시각적 구분
- **사용자 일정**: 확실한 계획 (진하게)
- **AI 예측 일정**: 제안/추천 (반투명)

## 향후 개선 사항

- [ ] AI 예측 일정 수락/거절 기능
- [ ] 패턴 학습 정확도 향상
- [ ] 날씨 정보 연동 (비 오는 날 작업 조정)
- [ ] 계절별 양봉 작업 자동 추천
- [ ] 사용자별 맞춤 예측 (경험, 벌통 수 고려)

