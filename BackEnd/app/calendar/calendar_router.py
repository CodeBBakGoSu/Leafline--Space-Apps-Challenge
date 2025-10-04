"""캘린더 API 라우터"""

from fastapi import APIRouter, HTTPException
from .calendar_schema import ScheduleRequest, ScheduleResponse, ScheduleItem
from .calendar_service import calendar_service

router = APIRouter(prefix="/api/calendar", tags=["calendar"])


@router.post("/schedule", response_model=ScheduleResponse)
async def create_schedule(request: ScheduleRequest) -> ScheduleResponse:
    """
    사용자 일정을 저장하고 AI 예측 일정을 함께 반환

    Args:
        request: 날짜와 일정 목록

    Returns:
        사용자 일정 + AI 예측 일정
    """
    try:
        # 입력 검증
        if not request.date or not request.tasks:
            raise HTTPException(status_code=400, detail="날짜와 일정을 입력해주세요")

        # 날짜 형식 검증
        from datetime import datetime

        try:
            datetime.strptime(request.date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(
                status_code=400, detail="날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)"
            )

        # AI 예측 수행 (사용자 일정 포함)
        all_schedules = calendar_service.predict_schedules(
            user_date=request.date, user_tasks=request.tasks
        )

        # 응답 생성
        schedule_items = [ScheduleItem(**schedule) for schedule in all_schedules]

        return ScheduleResponse(response=schedule_items)

    except HTTPException:
        raise
    except Exception as e:
        error_message = f"일정 처리 중 오류 발생: {str(e)}"
        print(f"[CalendarRouter Error] {error_message}")
        raise HTTPException(status_code=500, detail=error_message)


@router.get("/health")
async def health_check():
    """캘린더 서비스 헬스체크"""
    return {"status": "healthy", "service": "Calendar AI"}

