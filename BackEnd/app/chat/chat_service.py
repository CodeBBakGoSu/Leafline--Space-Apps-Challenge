"""챗봇 서비스 - Gemini AI"""

import google.generativeai as genai
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.core.config import settings
from app.data.user_profile import get_profile, get_beekeeping_context


class ChatService:
    """Gemini 기반 챗봇 서비스"""

    def __init__(self):
        """Gemini API 초기화"""
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-2.5-flash")
        self.chat_sessions: Dict[str, Any] = {}

    def _create_system_prompt(self) -> str:
        """양봉업자를 위한 시스템 프롬프트 생성"""
        user_profile = get_profile()
        context = get_beekeeping_context()
        
        # 현재 날짜 및 시간
        now = datetime.now()
        current_date = now.strftime("%Y-%m-%d")
        current_datetime = now.strftime("%Y-%m-%d %H:%M")
        day_of_week = now.strftime("%A")
        
        # 7일 날씨 예보 정보
        weather_forecast = user_profile.get("weather_forecast", {})
        days = weather_forecast.get("days", [])
        
        # 오늘 날씨 (첫 번째 날)
        today_weather_str = "날씨 정보 없음"
        if days and len(days) > 0:
            today = days[0]
            condition = today.get("weather", "unknown")
            temp_c = today.get("avgTempC")
            temp_f = today.get("avgTempF")
            
            weather_parts = [f"날씨: {condition}"]
            if temp_c is not None:
                weather_parts.append(f"온도: {temp_c}°C ({temp_f}°F)")
            today_weather_str = ", ".join(weather_parts)
        
        # 7일 예보 요약 (선택적)
        forecast_summary = ""
        if len(days) > 1:
            forecast_lines = []
            for day in days[:7]:  # 최대 7일
                date = day.get("date", "")
                weather = day.get("weather", "")
                temp_c = day.get("avgTempC", "")
                forecast_lines.append(f"  - {date}: {weather}, {temp_c}°C")
            forecast_summary = "\n".join(forecast_lines)

        system_prompt = f"""당신은 양봉업자를 위한 전문 AI 어시스턴트 'Bloom AI'입니다.

현재 시간 정보:
- 현재 날짜: {current_date} ({day_of_week})
- 현재 시각: {current_datetime}

오늘 날씨:
- {today_weather_str}

7일 날씨 예보:
{forecast_summary if forecast_summary else "예보 정보 없음"}

사용자 정보:
- 이름: {user_profile['name']}
- 직업: {user_profile['occupation']}
- 위치: {user_profile['location']['city']}, {user_profile['location']['state']}, {user_profile['location']['country']}
- 양봉 경력: {user_profile['beekeeping_info']['experience_years']}년
- 벌통 수: {user_profile['beekeeping_info']['number_of_hives']}개
- 양봉 유형: {user_profile['beekeeping_info']['beekeeping_type']}
- 주요 목표: {user_profile['beekeeping_info']['primary_goal']}
- 현재 계절: {user_profile['current_season']}

당신의 역할:
0. 사용자의 질문에 대해 적절한 답변을 제공합니다.
1. 현재 날짜와 시간 정보 제공 ("오늘이 언제야?" 같은 질문에 위에 제공된 현재 날짜 정보로 답변)
2. 오늘 날씨 정보 제공 ("오늘 날씨 어때?" 같은 질문에 위에 제공된 오늘 날씨 정보로 답변)
3. 7일 날씨 예보 제공 ("이번 주 날씨 어때?" 같은 질문에 위에 제공된 7일 예보로 답변)
4. 날씨에 따른 양봉 작업 조언 (현재 및 향후 날씨를 고려한 맞춤형 조언)
5. 날씨 기반 일정 제안 (예: "비 오는 날 피해서 벌통 점검 추천")
6. 양봉 관리 및 벌통 유지보수에 대한 전문적인 조언 제공
7. 계절별 양봉 활동 가이드 제공
8. 꿀벌의 건강과 질병 관리에 대한 정보 제공
9. 꿀 생산 및 수확 최적화 팁 제공
10. 꿀벌 행동 및 생태에 대한 교육
11. 양봉 도구 및 장비 사용법 안내
12. 적당히 말하자 너무 많이 말하지마 

응답 가이드라인:
- 친근하고 전문적인 톤 유지
- 실용적이고 실행 가능한 조언 제공
- 사용자의 경험 수준({user_profile['beekeeping_info']['experience_years']}년)을 고려
- 사용자의 위치({user_profile['location']['city']})와 계절({user_profile['current_season']})을 고려한 맞춤형 조언
- 복잡한 개념은 이해하기 쉽게 설명
- 필요시 단계별 가이드 제공
- 안전과 꿀벌 복지를 최우선으로 고려
- 적당히 말하자 너무 많이 말하지마 
- 사용자의 이름은 말하되 경력과 위치는 답변할때 참고만하고 사용자가 원하기 전까지 말하지 말것

문장이 끝나면 줄바꿈을 해주세요!
영어로 응답해주세요."""

        return system_prompt

    def get_response(
        self, user_message: str, history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """
        Gemini로부터 응답 받기

        Args:
            user_message: 사용자 메시지
            history: 대화 기록

        Returns:
            AI 응답 메시지
        """
        try:
            # 시스템 프롬프트 생성
            system_prompt = self._create_system_prompt()

            # 대화 히스토리 구성
            chat_history = []
            if history:
                for msg in history:
                    # Gemini는 'user'와 'model'만 허용 ('assistant' -> 'model'로 변환)
                    role = "model" if msg["role"] == "assistant" else msg["role"]
                    chat_history.append(
                        {"role": role, "parts": [msg["content"]]}
                    )

            # 시스템 프롬프트를 첫 메시지로 추가
            full_message = f"{system_prompt}\n\n사용자 질문: {user_message}"

            # Gemini API 호출
            if chat_history:
                # 대화 세션 생성
                chat = self.model.start_chat(history=chat_history)
                response = chat.send_message(full_message)
            else:
                # 새로운 대화
                response = self.model.generate_content(full_message)

            return response.text

        except Exception as e:
            error_message = f"AI 응답 생성 중 오류가 발생했습니다: {str(e)}"
            print(f"[ChatService Error] {error_message}")
            return "죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요."

    def get_streaming_response(
        self, user_message: str, history: Optional[List[Dict[str, str]]] = None
    ):
        """
        스트리밍 응답 생성 (향후 프론트엔드 스트리밍 구현용)

        Args:
            user_message: 사용자 메시지
            history: 대화 기록

        Yields:
            응답 텍스트 청크
        """
        try:
            system_prompt = self._create_system_prompt()
            full_message = f"{system_prompt}\n\n사용자 질문: {user_message}"

            response = self.model.generate_content(full_message, stream=True)

            for chunk in response:
                if chunk.text:
                    yield chunk.text

        except Exception as e:
            yield f"오류: {str(e)}"


# 싱글톤 인스턴스
chat_service = ChatService()

