"""챗봇 스키마"""

from typing import List, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """채팅 메시지"""

    role: str = Field(..., description="메시지 역할 (user 또는 assistant)")
    content: str = Field(..., description="메시지 내용")


class ChatRequest(BaseModel):
    """챗봇 요청"""

    message: str = Field(..., description="사용자 메시지")
    history: Optional[List[ChatMessage]] = Field(
        default=None, description="이전 대화 기록"
    )


class ChatResponse(BaseModel):
    """챗봇 응답"""

    response: str = Field(..., description="AI 응답")
    success: bool = Field(default=True, description="성공 여부")
    error: Optional[str] = Field(default=None, description="에러 메시지")

