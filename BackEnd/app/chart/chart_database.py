# app/chart/chart_database.py

# 연도별 개화량 데이터를 저장합니다.
# 현재 시점(2025년)을 기준으로 데이터를 조회하는 로직을 만들었으므로,
# 2025년 데이터를 키(key)로 사용합니다.
bloom_data = {
    2025: {
        "acacia": [
            {"month": 1, "data": 0},
            {"month": 2, "data": 5},
            {"month": 3, "data": 45},
            {"month": 4, "data": 280},
            {"month": 5, "data": 450}, # 아카시아 개화량 최고조
            {"month": 6, "data": 320},
            {"month": 7, "data": 150},
            {"month": 8, "data": 60},
            {"month": 9, "data": 20},
            {"month": 10, "data": 5},
            {"month": 11, "data": 0},
            {"month": 12, "data": 0}
        ],
        "almond": [
            {"month": 1, "data": 0},
            {"month": 2, "data": 10},
            {"month": 3, "data": 150},
            {"month": 4, "data": 380}, # 아몬드 개화량 최고조
            {"month": 5, "data": 210},
            {"month": 6, "data": 90},
            {"month": 7, "data": 40},
            {"month": 8, "data": 15},
            {"month": 9, "data": 5},
            {"month": 10, "data": 0},
            {"month": 11, "data": 0},
            {"month": 12, "data": 0}
        ]
    },
    2024: {
        # (필요하다면 다른 연도의 데이터도 여기에 추가할 수 있습니다.)
        "acacia": [
            {"month": 1, "data": 0},
            {"month": 2, "data": 8},
            {"month": 3, "data": 60},
            {"month": 4, "data": 250},
            # ... (2024년 데이터)
        ],
        "almond": [
            {"month": 1, "data": 0},
            {"month": 2, "data": 15},
            {"month": 3, "data": 180},
            {"month": 4, "data": 350},
            # ... (2024년 데이터)
        ]
    }
}