# app/community/community_database.py
from datetime import datetime, timezone

# --- 사용자(User) Mock 데이터 ---
# 게시글과 댓글에서 이 사용자 정보를 참조하게 됩니다.
users = [
    {"id": 1, "username": "Alex", "avatar_url": None},
    {"id": 2, "username": "Eunseo", "avatar_url": None},
    {"id": 3, "username": "NasaDev", "avatar_url": None},
]

# --- 게시글(Post) Mock 데이터 ---
# author_id를 통해 위 users 리스트의 사용자와 연결됩니다.
posts = [
    {
        "id": 101,
        "title": "Hello Bloomwatch Community!",
        "content": "This is a test post for the Leafline community page.",
        "author_id": 1, 
        "created_at": datetime(2025, 10, 5, 14, 0, 0, tzinfo=timezone.utc),
        "comment_count": 2
    },
    {
        "id": 102,
        "title": "Hive Management Tips",
        "content": "Here are some tips for managing your beehives effectively.",
        "author_id": 2, # Eunseo2가 작성
        "created_at": datetime(2025, 10, 4, 14, 0, 0, tzinfo=timezone.utc),
        "comment_count": 3
    },
    {
        "id": 103,
        "title": "Prioritizing Todo Items",
        "content": "When managing your tasks, it's important to prioritize them based on urgency and importance. Here are some strategies to help you do that effectively.",
        "author_id": 1, # Eunseo가 작성
        "created_at": datetime(2025, 10, 4, 19, 15, 0, tzinfo=timezone.utc),
        "comment_count": 0
    }
]

# (댓글 기능 추가 시 여기에 comments 리스트를 만들게 됩니다.)

# 새 데이터 생성 시 사용할 ID 카운터
latest_post_id = 103