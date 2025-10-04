# app/services/nws_service.py
from __future__ import annotations

from enum import Enum
from typing import Dict, List, Optional
from datetime import datetime
import httpx

NWS_BASE = "https://api.weather.gov"
USER_AGENT = "LeaflineWeather/1.0 (contact@leafline.com)"


class WeatherType(str, Enum):
    sun = "sun"
    cloud = "cloud"
    rain = "rain"
    snow = "snow"
    thunderstorm = "thunderstorm"


# 간단 키워드 매핑 (짧은 텍스트 우선 매칭)
_ICON_RULES: List[tuple[str, WeatherType]] = [
    ("t-storm", WeatherType.thunderstorm),
    ("thunder", WeatherType.thunderstorm),
    ("storm", WeatherType.thunderstorm),
    ("snow", WeatherType.snow),
    ("sleet", WeatherType.snow),
    ("ice", WeatherType.snow),
    ("freez", WeatherType.snow),   # freezing rain 등
    ("rain", WeatherType.rain),
    ("showers", WeatherType.rain),
    ("drizzle", WeatherType.rain),
    ("mostly cloudy", WeatherType.cloud),
    ("partly cloudy", WeatherType.cloud),
    ("cloud", WeatherType.cloud),
    ("mostly sunny", WeatherType.sun),
    ("sunny", WeatherType.sun),
    ("clear", WeatherType.sun),
]


def _to_celsius(f: Optional[float]) -> Optional[float]:
    if f is None:
        return None
    return (f - 32.0) * 5.0 / 9.0


def _pick_weather(text: Optional[str]) -> WeatherType:
    if not text:
        return WeatherType.sun
    t = text.lower()
    for key, val in _ICON_RULES:
        if key in t:
            return val
    return WeatherType.sun


class NWSService:
    def __init__(self, client: Optional[httpx.AsyncClient] = None) -> None:
        self._client = client or httpx.AsyncClient(
            headers={"User-Agent": USER_AGENT, "Accept": "application/geo+json"}
        )

    async def _points(self, lat: float, lon: float) -> Dict:
        url = f"{NWS_BASE}/points/{lat},{lon}"
        r = await self._client.get(url, timeout=15)
        r.raise_for_status()
        return r.json()

    async def _forecast(self, forecast_url: str) -> Dict:
        r = await self._client.get(forecast_url, timeout=15)
        r.raise_for_status()
        return r.json()

    async def get_today(self, lat: float, lon: float) -> Dict:
        """
        반환 형태:
        {
          "date": "YYYY-MM-DD",
          "avgTempC": 29.4,
          "avgTempF": 84.9,
          "weather": "sun" | "cloud" | "rain" | "snow" | "thunderstorm"
        }
        """
        p = await self._points(lat, lon)
        forecast_url = p["properties"]["forecast"]
        fc = await self._forecast(forecast_url)
        periods = fc["properties"]["periods"]  # 12시간 단위 (주/야)

        # 오늘 날짜는 period의 startTime 기준으로 판단
        # 같은 날짜의 주간/야간 온도를 평균
        today_iso = datetime.utcnow().date().isoformat()
        day_f: Optional[float] = None
        night_f: Optional[float] = None
        texts: List[str] = []

        for pd in periods:
            start_date = pd["startTime"][:10]
            if start_date != today_iso:
                continue
            if pd.get("isDaytime", False) and day_f is None:
                day_f = pd.get("temperature")
                texts.append(pd.get("shortForecast") or pd.get("detailedForecast") or "")
            if (not pd.get("isDaytime", True)) and night_f is None:
                night_f = pd.get("temperature")
                texts.append(pd.get("shortForecast") or pd.get("detailedForecast") or "")
            if day_f is not None and night_f is not None:
                break

        temps_f = [t for t in (day_f, night_f) if t is not None]
        if not temps_f:
            # 오늘 period가 없으면 첫 period로 대체
            first = periods[0]
            temps_f = [first.get("temperature")]
            texts = [first.get("shortForecast") or ""]

        avg_f = sum(temps_f) / len(temps_f)
        avg_c = _to_celsius(avg_f)
        weather = _pick_weather(", ".join([t for t in texts if t]))

        return {
            "date": today_iso,
            "avgTempC": round(avg_c, 1) if avg_c is not None else None,
            "avgTempF": round(avg_f, 1) if avg_f is not None else None,
            "weather": weather,
        }

    async def get_7day(self, lat: float, lon: float) -> Dict:
        """
        반환 형태:
        {
          "days": [
            {"date":"YYYY-MM-DD","avgTempC":..,"avgTempF":..,"weather":"sun" | ...},
            ... (최대 7개)
          ]
        }
        """
        p = await self._points(lat, lon)
        forecast_url = p["properties"]["forecast"]
        fc = await self._forecast(forecast_url)
        periods = fc["properties"]["periods"]

        # 날짜별 day/night 평균
        bucket: Dict[str, Dict[str, Optional[float]]] = {}
        texts: Dict[str, List[str]] = {}
        for pd in periods:
            d = pd["startTime"][:10]
            b = bucket.setdefault(d, {"day": None, "night": None})
            if pd.get("isDaytime", False):
                b["day"] = pd.get("temperature")
            else:
                b["night"] = pd.get("temperature")
            if pd.get("shortForecast"):
                texts.setdefault(d, []).append(pd["shortForecast"])

        days = []
        for d in sorted(bucket.keys())[:7]:
            day_f = bucket[d]["day"]
            night_f = bucket[d]["night"]
            vals = [v for v in (day_f, night_f) if v is not None]
            if vals:
                avg_f = sum(vals) / len(vals)
                avg_c = _to_celsius(avg_f)
            else:
                avg_f = avg_c = None
            weather = _pick_weather(", ".join(texts.get(d, [])))
            days.append(
                {
                    "date": d,
                    "avgTempC": round(avg_c, 1) if avg_c is not None else None,
                    "avgTempF": round(avg_f, 1) if avg_f is not None else None,
                    "weather": weather,
                }
            )
        return {"days": days}