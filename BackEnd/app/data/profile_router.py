"""프로필 API 라우터"""

from fastapi import APIRouter
from typing import Dict, Any
from .profile_schema import UserProfile, ProfileUpdateRequest, WeatherUpdateRequest
from .profile_service import (
    get_user_profile,
    update_user_profile,
    update_user_weather,
    get_user_location,
    get_ai_context,
)

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=Dict[str, Any])
def get_profile():
    """사용자 프로필 조회"""
    return get_user_profile()


@router.put("", response_model=Dict[str, Any])
def update_profile(updates: ProfileUpdateRequest):
    """사용자 프로필 업데이트"""
    return update_user_profile(updates)


@router.put("/weather", response_model=Dict[str, Any])
def update_weather(weather: WeatherUpdateRequest):
    """날씨 정보 업데이트"""
    return update_user_weather(weather)


@router.get("/location")
def get_location():
    """위치 정보 조회"""
    return get_user_location()


@router.get("/context")
def get_context():
    """AI용 컨텍스트 조회"""
    return {"context": get_ai_context()}

