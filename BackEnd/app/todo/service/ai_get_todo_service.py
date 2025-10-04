"""Gemini AI를 사용한 TODO 리스트 추천 서비스"""

import json
from typing import List
import google.generativeai as genai
from app.core.config import settings
from app.data.user_profile import get_beekeeping_context
from ..schema.todo_schema import Todo


def get_ai_recommended_todos(context: str = "") -> List[Todo]:
    """
    Gemini AI를 통해 양봉업자를 위한 TODO 리스트를 추천받습니다.
    
    Args:
        context: 추가 컨텍스트 (예: 계절, 날씨 등)
    
    Returns:
        List[Todo]: AI가 추천한 TODO 리스트
    """
    # 사용자 페르소나 정보 가져오기
    persona_context = get_beekeeping_context()
    
    # 컨텍스트 결합
    full_context = f"{persona_context}"
    if context:
        full_context += f" | Additional context: {context}"
    
    # Gemini API 설정
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
    # Gemini 모델 생성 (JSON 출력 강제)
    generation_config = {
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
        "response_mime_type": "application/json",
    }
    
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash-lite",
        generation_config=generation_config,
    )
    
    # 프롬프트 생성
    prompt = f"""당신은 양봉 전문가입니다. 양봉업자를 위한 할 일 목록을 추천해주세요.

다음 JSON 형식으로 정확히 5개의 할 일을 생성해주세요:

{{
  "todos": [
    {{
      "id": 1,
      "content": "할 일 제목 (영어로)",
      "duration": "예상 소요 시간 (about X hours 형식)",
      "completed": false
    }}
  ]
}}

규칙:
1. content는 반드시 영어로 작성하고, 양봉 작업과 관련된 실질적인 작업이어야 합니다.
2. duration은 "about X hours" 형식으로 작성하세요 (예: "about 2 hours").
3. id는 1부터 시작하는 순차적인 숫자입니다.
4. completed는 항상 false로 설정하세요.
5. 반드시 위 JSON 형식을 정확히 따라야 합니다.

양봉 작업 예시:
- 벌통 검사 (Hive Inspection)
- 여왕벌 확인 (Queen Check)
- 꿀 수확 (Honey Harvesting)
- 응애 방제 (Varroa Mite Treatment)
- 먹이 급여 (Feeding)
- 벌통 청소 (Hive Cleaning)
- 겨울 준비 (Winter Preparation)

사용자 정보 및 컨텍스트: {full_context}

위 사용자 정보를 고려하여 맞춤형 할 일 5개를 생성해주세요."""
    
    try:
        # Gemini API 호출
        response = model.generate_content(prompt)
        
        # JSON 파싱
        response_data = json.loads(response.text)
        
        # Todo 객체 리스트로 변환
        todos = [
            Todo(
                id=todo_data["id"],
                content=todo_data["content"],
                duration=todo_data["duration"],
                completed=todo_data["completed"]
            )
            for todo_data in response_data.get("todos", [])
        ]
        
        return todos
        
    except Exception as e:
        # 에러 발생 시 기본 TODO 리스트 반환
        print(f"Gemini API 에러: {str(e)}")
        return [
            Todo(id=1, content="Hive Inspection", duration="about 1 hours", completed=True),
            Todo(id=2, content="Pollen Patty Feeding", duration="about 2 hours", completed=False),
            Todo(id=3, content="Hive Cleaning", duration="about 1 hours", completed=False),
            Todo(id=4, content="Hive Inspection", duration="about 1 hours", completed=False),
            Todo(id=5, content="Hive Inspection", duration="about 1 hours", completed=False),
        ]

