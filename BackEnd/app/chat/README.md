# Bloom AI 챗봇 모듈

양봉업자를 위한 Gemini 기반 AI 챗봇 서비스입니다.

## 파일 구조

```
chat/
├── __init__.py
├── chat_router.py    # FastAPI 라우터
├── chat_service.py   # Gemini AI 서비스
├── chat_schema.py    # Pydantic 스키마
└── README.md
```

## 주요 기능

### 1. 개인화된 AI 어시스턴트
- 사용자 프로필 정보를 기반으로 맞춤형 조언 제공
- 위치, 경력, 벌통 수, 계절 등을 고려한 응답

### 2. 양봉 전문 지식
- 벌통 관리 및 유지보수
- 계절별 양봉 활동 가이드
- 꿀벌 건강 및 질병 관리
- 꿀 생산 최적화
- 날씨 기반 조언

### 3. 대화 기록 관리
- 이전 대화 맥락 유지
- 최근 10개 메시지 기반 컨텍스트

## API 엔드포인트

### POST /api/chat/message
사용자 메시지에 대한 AI 응답 생성

**요청:**
```json
{
  "message": "벌통 점검은 언제 하나요?",
  "history": [
    {
      "role": "user",
      "content": "안녕하세요"
    },
    {
      "role": "assistant",
      "content": "안녕하세요! Bloom AI입니다."
    }
  ]
}
```

**응답:**
```json
{
  "response": "벌통 점검은...",
  "success": true,
  "error": null
}
```

### DELETE /api/chat/history
대화 기록 초기화

**응답:**
```json
{
  "message": "대화 기록이 초기화되었습니다."
}
```

## 사용 예시

### Python (백엔드)
```python
from app.chat.chat_service import chat_service

# 응답 생성
response = chat_service.get_response(
    user_message="꿀벌이 활발하지 않아요",
    history=[...]
)
```

### JavaScript (프론트엔드)
```javascript
// 메시지 전송
const response = await fetch('http://localhost:8000/api/chat/message', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        message: '안녕하세요',
        history: []
    })
});

const data = await response.json();
console.log(data.response);
```

## 환경 변수

`.env` 파일에 Gemini API 키 설정:
```
GEMINI_API_KEY=your_api_key_here
```

## 시스템 프롬프트

사용자 정보를 기반으로 동적으로 생성되는 시스템 프롬프트:
- 사용자 프로필 (이름, 위치, 경력)
- 양봉 정보 (벌통 수, 목표)
- 현재 계절 및 날씨
- 전문적이고 친근한 톤
- 실용적이고 실행 가능한 조언

## 개발 노트

- Gemini Pro 모델 사용
- 대화 기록은 메모리 내 저장 (향후 DB 연동 필요)
- 에러 처리 및 폴백 메시지 제공
- 스트리밍 응답 지원 (향후 프론트엔드 구현 예정)

## 향후 계획

- [ ] 대화 기록 DB 저장
- [ ] SSE (Server-Sent Events)를 통한 실시간 스트리밍
- [ ] 다국어 지원
- [ ] 이미지 분석 (벌통, 꿀벌 사진)
- [ ] 음성 입력/출력

