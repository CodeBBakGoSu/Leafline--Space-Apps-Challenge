"""캘린더 스키마"""

from pydantic import BaseModel, Field
from typing import List


class ScheduleRequest(BaseModel):
    """일정 추가 요청"""

    date: str = Field(..., description="일정 날짜 (YYYY-MM-DD)")
    tasks: List[str] = Field(..., description="일정 목록")


class ScheduleItem(BaseModel):
    """일정 항목"""

    date: str = Field(..., description="일정 날짜 (YYYY-MM-DD)")
    task: str = Field(..., description="일정 내용")
    AI: bool = Field(..., description="AI 예측 여부 (false: 사용자, true: AI)")


class ScheduleResponse(BaseModel):
    """일정 응답 (사용자 일정 + AI 예측 일정)"""

    response: List[ScheduleItem] = Field(..., description="모든 일정 목록")

