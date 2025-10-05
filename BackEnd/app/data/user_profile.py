"""사용자 페르소나 데이터 (임시 DB 역할)"""

from datetime import datetime
from typing import Dict, Any

# 사용자 페르소나 데이터
USER_PROFILE: Dict[str, Any] = {
    "name": "Alex Johnson",
    "occupation": "Beekeeper",
    "location": {
        "city": "Orlando",
        "state": "Florida",
        "country": "USA",
        "latitude": 28.5649675,
        "longitude": -81.1614906,
    },
    "beekeeping_info": {
        "experience_years": 5,
        "number_of_hives": 12,
        "beekeeping_type": "Hobby",  # Hobby, Commercial, Sideline
        "primary_goal": "Honey Production",  # Honey Production, Pollination, Queen Rearing
    },
    "preferences": {
        "preferred_language": "en",
        "notification_enabled": True,
        "ai_suggestions_enabled": True,
    },
    "weather_forecast": {
        "days": [],  # 7일 날씨 예보 리스트
        "last_updated": None,
    },
    "current_season": "spring",  # spring, summer, fall, winter
    "last_hive_inspection": None,
    "created_at": datetime.now().isoformat(),
    "updated_at": datetime.now().isoformat(),
}


def get_profile() -> Dict[str, Any]:
    """사용자 프로필 조회"""
    return USER_PROFILE.copy()


def update_profile(updates: Dict[str, Any]) -> Dict[str, Any]:
    """
    사용자 프로필 업데이트
    
    Args:
        updates: 업데이트할 필드들
    
    Returns:
        업데이트된 프로필
    """
    global USER_PROFILE
    
    # 중첩된 dict 업데이트 처리
    for key, value in updates.items():
        if key in USER_PROFILE and isinstance(USER_PROFILE[key], dict) and isinstance(value, dict):
            USER_PROFILE[key].update(value)
        else:
            USER_PROFILE[key] = value
    
    USER_PROFILE["updated_at"] = datetime.now().isoformat()
    
    return USER_PROFILE.copy()


def update_weather(days_list: list) -> None:
    """
    7일 날씨 정보 업데이트
    
    Args:
        days_list: 7일 날씨 데이터 리스트
        예: [
            {"date": "2025-10-04", "avgTempC": 29.4, "avgTempF": 84.9, "weather": "sun"},
            ...
        ]
    """
    global USER_PROFILE
    USER_PROFILE["weather_forecast"] = {
        "days": days_list,
        "last_updated": datetime.now().isoformat(),
    }
    USER_PROFILE["updated_at"] = datetime.now().isoformat()


def get_weather_forecast() -> Dict[str, Any]:
    """7일 날씨 예보 반환"""
    return USER_PROFILE.get("weather_forecast", {"days": [], "last_updated": None})


def get_location() -> Dict[str, float]:
    """위치 정보 반환"""
    return {
        "lat": USER_PROFILE["location"]["latitude"],
        "lon": USER_PROFILE["location"]["longitude"],
    }


def get_beekeeping_context() -> str:
    """AI에게 전달할 양봉 컨텍스트 생성"""
    profile = USER_PROFILE
    
    context_parts = [
        f"Location: {profile['location']['city']}, {profile['location']['state']}",
        f"Experience: {profile['beekeeping_info']['experience_years']} years",
        f"Number of hives: {profile['beekeeping_info']['number_of_hives']}",
        f"Type: {profile['beekeeping_info']['beekeeping_type']} beekeeper",
        f"Primary goal: {profile['beekeeping_info']['primary_goal']}",
        f"Current season: {profile['current_season']}",
    ]
    
    # 7일 날씨 정보 중 오늘 날씨 추가
    weather_forecast = profile.get("weather_forecast", {})
    days = weather_forecast.get("days", [])
    if days and len(days) > 0:
        today = days[0]
        context_parts.append(f"Today's weather: {today.get('weather')}, {today.get('avgTempC')}°C")
    
    if profile["last_hive_inspection"]:
        context_parts.append(f"Last inspection: {profile['last_hive_inspection']}")
    
    return " | ".join(context_parts)

