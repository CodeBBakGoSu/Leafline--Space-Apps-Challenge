from pydantic import BaseModel
from typing import List

class ChartDataPoint(BaseModel):
    """차트 그래프의 한 점 (x, y 좌표)을 나타내는 모델"""
    month : int  # month (1~12)  
    data : float  # 정수 또는 실수가 될 수 있으므로 float이 더 유연합니다.
