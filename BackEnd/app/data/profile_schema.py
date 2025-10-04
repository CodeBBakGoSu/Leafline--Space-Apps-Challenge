"""사용자 프로필 스키마"""

from pydantic import BaseModel
from typing import Optional


class Location(BaseModel):
    city: str
    state: str
    country: str
    latitude: float
    longitude: float


class BeekeepingInfo(BaseModel):
    experience_years: int
    number_of_hives: int
    beekeeping_type: str  # Hobby, Commercial, Sideline
    primary_goal: str  # Honey Production, Pollination, Queen Rearing


class Preferences(BaseModel):
    preferred_language: str = "en"
    notification_enabled: bool = True
    ai_suggestions_enabled: bool = True


class CurrentWeather(BaseModel):
    temperature: Optional[float] = None
    condition: Optional[str] = None
    humidity: Optional[float] = None
    last_updated: Optional[str] = None


class UserProfile(BaseModel):
    name: str
    occupation: str
    location: Location
    beekeeping_info: BeekeepingInfo
    preferences: Preferences
    current_weather: CurrentWeather
    current_season: str
    last_hive_inspection: Optional[str] = None
    created_at: str
    updated_at: str


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    location: Optional[Location] = None
    beekeeping_info: Optional[BeekeepingInfo] = None
    preferences: Optional[Preferences] = None
    current_season: Optional[str] = None
    last_hive_inspection: Optional[str] = None


class WeatherUpdateRequest(BaseModel):
    temperature: Optional[float] = None
    condition: Optional[str] = None
    humidity: Optional[float] = None

