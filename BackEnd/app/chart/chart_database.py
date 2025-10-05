# app/chart/chart_database.py

# 연도별 개화량 데이터
bloom_data = {
    2025: {
        "acacia": [
            {"month": 1, "data": 0},
            {"month": 2, "data": 5},
            {"month": 3, "data": 45},
            {"month": 4, "data": 280},
            {"month": 5, "data": 450},  # 최고조
            {"month": 6, "data": 320},
            {"month": 7, "data": 150},
            {"month": 8, "data": 60},
            {"month": 9, "data": 20},
            {"month": 10, "data": 5},
            {"month": 11, "data": 0},
            {"month": 12, "data": 0}
        ],
        "almond": [                    #실제 개화량 데이터임.
            {"month": 1, "data": 0},
            {"month": 2, "data": 0},
            {"month": 3, "data": 0},
            {"month": 4, "data": 0},
            {"month": 5, "data": 4},
            {"month": 6, "data": 5},
            {"month": 7, "data": 4},
            {"month": 8, "data": 7},
            {"month": 9, "data": 9},
            {"month": 10, "data": 16}, # 10월, 11월에 예측일이 집중되어 개화량 높음
            {"month": 11, "data": 15},
            {"month": 12, "data": 6}
        ],
        "honey": [
            {"month": 1, "amount": 20},
            {"month": 2, "amount": 30},
            {"month": 3, "amount": 200},
            {"month": 4, "amount": 500},
            {"month": 5, "amount": 400},
            {"month": 6, "amount": 150},
            {"month": 7, "amount": 80},
            {"month": 8, "amount": 30},
            {"month": 9, "amount": 10},
            {"month": 10, "amount": 5},
            {"month": 11, "amount": 2},
            {"month": 12, "amount": 0}
        ]
    },
    2026: {
        "Maple": [
            {"month": 1, "data": 11},
            {"month": 2, "data": 0},
            {"month": 3, "data": 0},
            {"month": 4, "data": 0},
            {"month": 5, "data": 0},
            {"month": 6, "data": 0},
            {"month": 7, "data": 0},
            {"month": 8, "data": 0},
            {"month": 9, "data": 0},
            {"month": 10, "data": 0},
            {"month": 11, "data": 0},
            {"month": 12, "data": 0}
        ]
    }
}
