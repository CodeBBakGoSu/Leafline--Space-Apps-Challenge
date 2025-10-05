# app/chart/chart_service.py
from fastapi import HTTPException
from datetime import datetime
from app.chart import chart_database

def get_current_year_bloom_data():
    """
    현재 연도 데이터를 가져와 프론트엔드가 예상하는
    {"bloom": {...}, "honey": [...]} 형태로 재구성하여 반환합니다.
    """
    current_year = datetime.now().year

    if current_year in chart_database.bloom_data:
        # 원본 데이터를 가져옵니다.
        original_data = chart_database.bloom_data[current_year]

        # 프론트엔드가 예상하는 형태로 데이터를 재구성합니다.
        formatted_data = {
            "bloom": {
                "acacia": original_data.get("acacia", []),
                "almond": original_data.get("almond", [])
            },
            "honey": original_data.get("honey", [])
        }

        # print() 함수는 서버를 실행한 터미널에 결과를 출력합니다.
        print("✅ Formatted Data:")
        print(formatted_data)

        # 재구성한 데이터를 반환합니다.
        return formatted_data

    # if 조건이 맞지 않을 때(데이터가 없을 때) 실행되도록 안으로 이동
    raise HTTPException(status_code=404, detail=f"Chart data for the current year ({current_year}) not found")