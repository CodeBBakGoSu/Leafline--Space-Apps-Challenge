# app/chart/chart_service.py
from fastapi import HTTPException
from datetime import datetime  # <-- datetime 라이브러리 임포트
from app.chart import chart_database

def get_current_year_bloom_data(): # <-- 함수 이름 변경 및 year 파라미터 삭제
    """
    '현재 연도'를 기준으로 개화량 데이터를 찾아 반환합니다.
    """
    # 1. 현재 날짜와 시간 정보를 가져와서 연도만 추출합니다.
    #    (이 코드가 실행되는 시점이 2025년이므로 current_year는 2025가 됩니다.)
    current_year = datetime.now().year

    # 2. 동적으로 얻은 '올해'의 연도를 key로 사용해 데이터를 찾습니다.
    if current_year in chart_database.bloom_data:
        # 데이터베이스의 Mock 데이터를 바로 반환.
        return chart_database.bloom_data[current_year]

       
    
    # 만약 '올해'에 해당하는 데이터가 없다면 404 에러를 발생시킵니다.
    raise HTTPException(status_code=404, detail=f"Chart data for the current year ({current_year}) not found")