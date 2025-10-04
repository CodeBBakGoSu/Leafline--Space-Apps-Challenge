"""프로필 관리 서비스"""

from typing import Dict, Any
from .user_profile import (
    get_profile,
    update_profile,
    update_weather,
    get_location,
    get_beekeeping_context,
)
from .profile_schema import UserProfile, ProfileUpdateRequest, WeatherUpdateRequest


def get_user_profile() -> Dict[str, Any]:
    """사용자 프로필 조회"""
    return get_profile()


def update_user_profile(updates: ProfileUpdateRequest) -> Dict[str, Any]:
    """사용자 프로필 업데이트"""
    update_dict = updates.model_dump(exclude_unset=True)
    return update_profile(update_dict)


def update_user_weather(weather: WeatherUpdateRequest) -> Dict[str, Any]:
    """날씨 정보 업데이트"""
    weather_dict = weather.model_dump(exclude_unset=True)
    update_weather(weather_dict)
    return get_profile()


def get_user_location() -> Dict[str, float]:
    """사용자 위치 정보 조회"""
    return get_location()


def get_ai_context() -> str:
    """AI용 컨텍스트 조회"""
    return get_beekeeping_context()

