# app/routers/weather_router.py
from fastapi import APIRouter, Query, HTTPException
import httpx

from app.dashBord.nws_srvice import NWSService
from app.data.user_profile import update_weather, get_location

router = APIRouter(prefix="/dashboard/weather", tags=["weather"])

DEFAULT_LAT = 28.5383   # Orlando, FL
DEFAULT_LON = -81.3792


@router.get("/7day")
async def seven_day(
    lat: float = Query(DEFAULT_LAT),
    lon: float = Query(DEFAULT_LON),
):
    """
    7일 날씨 예보 조회 및 user_profile에 자동 업데이트
    """
    async with httpx.AsyncClient() as client:
        svc = NWSService(client)
        try:
            weather_data = await svc.get_7day(lat, lon)
            
            # user_profile에 7일 날씨 정보 업데이트
            update_weather(weather_data.get("days", []))
            
            return weather_data
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail="Upstream NWS error")
        except Exception:
            raise HTTPException(status_code=504, detail="NWS timeout or unexpected error")