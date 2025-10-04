"""챗봇 API 라우터"""

from fastapi import APIRouter
from typing import Dict
from .chat_schema import ChatRequest, ChatResponse
from .chat_service import chat_service

router = APIRouter(prefix="/chat", tags=["chat"])

# 임시 대화 기록 저장소 (실제로는 DB 또는 세션에 저장)
conversation_history: Dict[str, list] = {}


@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest) -> ChatResponse:
    """
    사용자 메시지를 받아 AI 응답 반환

    Args:
        request: 사용자 메시지와 대화 기록

    Returns:
        AI 응답
    """
    try:
        # 대화 기록 변환
        history = None
        if request.history:
            history = [
                {"role": msg.role, "content": msg.content} for msg in request.history
            ]

        # AI 응답 생성
        response_text = chat_service.get_response(
            user_message=request.message, history=history
        )

        return ChatResponse(response=response_text, success=True)

    except Exception as e:
        error_message = f"메시지 처리 중 오류 발생: {str(e)}"
        print(f"[ChatRouter Error] {error_message}")
        return ChatResponse(
            response="죄송합니다. 오류가 발생했습니다.", success=False, error=error_message
        )


@router.delete("/history")
async def clear_history() -> Dict[str, str]:
    """대화 기록 초기화"""
    conversation_history.clear()
    return {"message": "대화 기록이 초기화되었습니다."}

