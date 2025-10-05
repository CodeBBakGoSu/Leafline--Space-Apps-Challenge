# app/chart/chart_schema.py

from pydantic import BaseModel
from typing import List

# 개화량 데이터의 각 항목 모델 (month, data)
class BloomDataPoint(BaseModel):
    month: int
    data: int

# 꿀 생산량 데이터의 각 항목 모델 (month, amount)
class HoneyDataPoint(BaseModel):
    month: int
    amount: int

# 'bloom' 키 내부에 있는 중첩된 객체의 모델
class BloomData(BaseModel):
    acacia: List[BloomDataPoint]
    almond: List[BloomDataPoint]

# API가 최종적으로 반환할 전체 응답의 모델
class ChartResponse(BaseModel):
    bloom: BloomData
    honey: List[HoneyDataPoint]