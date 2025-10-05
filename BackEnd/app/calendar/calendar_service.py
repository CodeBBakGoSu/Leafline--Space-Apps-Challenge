"""캘린더 서비스 - Gemini AI 기반 일정 예측"""

import google.generativeai as genai
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.core.config import settings
from app.data.user_profile import get_profile


class CalendarService:
    """Gemini 기반 일정 예측 서비스"""

    def __init__(self):
        """Gemini API 초기화"""
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")

    def predict_schedules(
        self, user_date: str, user_tasks: List[str]
    ) -> List[Dict[str, Any]]:
        """
        사용자 일정을 기반으로 미래 일정 예측

        Args:
            user_date: 사용자가 추가한 날짜 (YYYY-MM-DD)
            user_tasks: 사용자가 추가한 일정 목록

        Returns:
            예측된 일정 목록 (사용자 일정 포함)
        """
        # 1. 사용자가 추가한 일정을 먼저 추가 (AI: false)
        all_schedules = []
        for task in user_tasks:
            all_schedules.append({"date": user_date, "task": task, "AI": False})

        # 2. AI로 미래 일정 예측
        try:
            ai_predictions = self._generate_ai_predictions(user_date, user_tasks)
            all_schedules.extend(ai_predictions)
        except Exception as e:
            print(f"[CalendarService Error] AI 예측 실패: {str(e)}")

        return all_schedules

    def _generate_ai_predictions(
        self, base_date: str, tasks: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Gemini를 사용하여 미래 일정 예측

        Args:
            base_date: 기준 날짜
            tasks: 일정 목록

        Returns:
            AI 예측 일정 목록
        """
        user_profile = get_profile()
        
        # 날짜 계산: base_date 이후 30일까지
        base_dt = datetime.strptime(base_date, "%Y-%m-%d")
        end_date = base_dt + timedelta(days=30)
        today = datetime.now().strftime("%Y-%m-%d")

        # Gemini에게 전달할 프롬프트 생성
        prompt = f"""당신은 양봉업자를 위한 일정 관리 AI입니다.

**중요: 오늘 날짜는 {today}입니다. 모든 예측 날짜는 {base_date}부터 {end_date.strftime("%Y-%m-%d")} 사이여야 합니다.**

사용자 정보:
- 이름: {user_profile['name']}
- 위치: {user_profile['location']['city']}, {user_profile['location']['state']}
- 양봉 경력: {user_profile['beekeeping_info']['experience_years']}년
- 벌통 수: {user_profile['beekeeping_info']['number_of_hives']}개
- 주요 목표: {user_profile['beekeeping_info']['primary_goal']}
- 현재 계절: {user_profile['current_season']}

사용자가 추가한 일정:
- 날짜: {base_date}
- 일정: {', '.join(tasks)}
7. 반드시 영어로 대답할것

위 일정을 분석하여 **{base_date} 이후 30일 내**에 필요한 관련 일정을 예측해주세요.

예측 규칙:
1. 주기적 작업 (먹이 주기, 점검 등)의 경우 다음 예정일을 추천
2. 특정 작업의 선행/후속 작업 추천
3. 계절과 양봉 경험을 고려한 조언
4. 최대 5개의 미래 일정 추천
5. 각 일정은 구체적이고 실행 가능해야 함
6. **날짜는 반드시 {base_date} ~ {end_date.strftime("%Y-%m-%d")} 범위 내여야 함**
7. 반드시 영어로 대답할것

응답 형식 (JSON):
[
  {{"date": "YYYY-MM-DD", "task": "일정 내용"}},
  {{"date": "YYYY-MM-DD", "task": "일정 내용"}}
]

예시:
[
  {{"date": "{(base_dt + timedelta(days=3)).strftime("%Y-%m-%d")}", "task": "벌통 점검"}},
  {{"date": "{(base_dt + timedelta(days=7)).strftime("%Y-%m-%d")}", "task": "먹이 추가"}}
]

또한 반드시 영어로 대답할것
**주의: 날짜는 {base_date} 이후의 날짜만 사용하세요. JSON만 출력하고 다른 설명은 하지 마세요.**"""


        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()

            # JSON 파싱
            import json

            # 마크다운 코드 블록 제거
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
                response_text = response_text.strip()

            predictions = json.loads(response_text)

            # AI: true 플래그 추가 및 날짜 검증
            ai_schedules = []
            for pred in predictions:
                if "date" in pred and "task" in pred:
                    # 날짜 검증
                    try:
                        pred_date = datetime.strptime(pred["date"], "%Y-%m-%d")
                        # base_date 이후의 날짜만 허용
                        if pred_date >= base_dt:
                            ai_schedules.append(
                                {"date": pred["date"], "task": pred["task"], "AI": True}
                            )
                            print(f"[CalendarService] AI 예측 추가: {pred['date']} - {pred['task']}")
                        else:
                            print(f"[CalendarService] 과거 날짜 무시: {pred['date']}")
                    except ValueError:
                        print(f"[CalendarService] 잘못된 날짜 형식: {pred.get('date')}")
                        continue

            return ai_schedules[:5]  # 최대 5개

        except json.JSONDecodeError as e:
            print(f"[CalendarService] JSON 파싱 오류: {str(e)}")
            # 폴백: 간단한 규칙 기반 예측
            return self._simple_rule_based_prediction(base_date, tasks)
        except Exception as e:
            print(f"[CalendarService] AI 예측 오류: {str(e)}")
            return []

    def _simple_rule_based_prediction(
        self, base_date: str, tasks: List[str]
    ) -> List[Dict[str, Any]]:
        """
        간단한 규칙 기반 예측 (폴백)

        Args:
            base_date: 기준 날짜
            tasks: 일정 목록

        Returns:
            예측 일정 목록
        """
        predictions = []
        base = datetime.strptime(base_date, "%Y-%m-%d")

        for task in tasks:
            task_lower = task.lower()

            # 먹이 주기 관련
            if any(word in task_lower for word in ["feed", "feeding", "먹이", "급이"]):
                # 3일 후, 6일 후 먹이 주기 예측
                predictions.append(
                    {
                        "date": (base + timedelta(days=3)).strftime("%Y-%m-%d"),
                        "task": f"{task} (AI 추천)",
                        "AI": True,
                    }
                )
                predictions.append(
                    {
                        "date": (base + timedelta(days=6)).strftime("%Y-%m-%d"),
                        "task": f"{task} (AI 추천)",
                        "AI": True,
                    }
                )

            # 점검 관련
            elif any(
                word in task_lower for word in ["check", "inspect", "점검", "확인"]
            ):
                # 7일 후 점검 예측
                predictions.append(
                    {
                        "date": (base + timedelta(days=7)).strftime("%Y-%m-%d"),
                        "task": f"{task} (AI 추천)",
                        "AI": True,
                    }
                )

            # 수확 관련
            elif any(
                word in task_lower for word in ["harvest", "수확", "채집", "채밀"]
            ):
                # 수확 2일 전 준비 작업
                predictions.append(
                    {
                        "date": (base - timedelta(days=2)).strftime("%Y-%m-%d"),
                        "task": "Prepare harvest equipment (AI 추천)",
                        "AI": True,
                    }
                )

        return predictions[:5]


# 싱글톤 인스턴스
calendar_service = CalendarService()

