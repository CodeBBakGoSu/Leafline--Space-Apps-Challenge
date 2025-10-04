# app/chart/chart_router.py
from fastapi import APIRouter
from typing import List, Dict
from app.chart import chart_service # <-- service를 통째로 가져오도록 변경
from app.chart.chart_schema import ChartDataPoint

router = APIRouter(
    prefix="/charts",
    tags=["Charts"]
)

@router.get(
    "/bloom-watch",
    response_model=Dict[str, List[ChartDataPoint]]
)

def get_bloom_watch_route(): 
    """
    현재 연도의 개화량 데이터를 조회합니다.
    """
    # 새로 만든 서비스 함수를 호출합니다.
    return chart_service.get_current_year_bloom_data()