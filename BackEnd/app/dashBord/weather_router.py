# app/routers/weather_router.py
from fastapi import APIRouter, Query, HTTPException
import httpx

from app.dashBord.nws_srvice import NWSService

router = APIRouter(prefix="/dashboard/weather", tags=["weather"])

DEFAULT_LAT = 28.5383   # Orlando, FL
DEFAULT_LON = -81.3792


@router.get("/today")
async def today(
    lat: float = Query(DEFAULT_LAT),
    lon: float = Query(DEFAULT_LON),
):
    # 이 라우터는 NWSService만 호출하고, 모든 로직은 서비스에서 처리
    async with httpx.AsyncClient() as client:
        svc = NWSService(client)
        try:
            return await svc.get_today(lat, lon)
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail="Upstream NWS error")
        except Exception:
            raise HTTPException(status_code=504, detail="NWS timeout or unexpected error")


@router.get("/7day")
async def seven_day(
    lat: float = Query(DEFAULT_LAT),
    lon: float = Query(DEFAULT_LON),
):
    async with httpx.AsyncClient() as client:
        svc = NWSService(client)
        try:
            return await svc.get_7day(lat, lon)
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail="Upstream NWS error")
        except Exception:
            raise HTTPException(status_code=504, detail="NWS timeout or unexpected error")