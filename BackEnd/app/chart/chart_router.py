# app/chart/chart_router.py
from fastapi import APIRouter
from app.chart import chart_service
# 새로 정의한 전체 응답 모델인 ChartResponse를 가져옵니다.
from app.chart.chart_schema import ChartResponse

router = APIRouter(
    prefix="/charts",
    tags=["Charts"]
)

@router.get("/bloom-watch",
            # 응답 모델을 ChartResponse로 지정합니다.
    response_model=ChartResponse) 
def get_bloom_watch_route():
    """
    현재 연도의 개화량 데이터를 조회합니다.
    """
    return chart_service.get_current_year_bloom_data()


