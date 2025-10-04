# app/community/community_service.py
from fastapi import HTTPException
from datetime import datetime, timezone

from app.community import community_database as db
from app.community import community_schema as schema

def get_all_posts() -> list[schema.PostList]:
    """전체 게시글 목록을 조회하면서, 각 게시글의 작성자 정보를 조합합니다."""
    
    # 사용자 정보를 빠르게 찾기 위해 id를 key로 하는 딕셔너리로 변환
    users_by_id = {user['id']: user for user in db.users}
    
    results = []
    for post_data in db.posts:
        author_info = users_by_id.get(post_data['author_id'])
        if not author_info:
            continue # 작성자를 찾을 수 없는 경우, 목록에서 제외

        # 최종 응답 스키마(PostList)에 맞게 데이터를 조합
        post_response = schema.PostList(
            id=post_data['id'],
            title=post_data['title'],
            author=author_info,
            created_at=post_data['created_at'],
            comment_count=post_data['comment_count']
        )
        results.append(post_response)
        
    return results

def get_post_by_id(post_id: int) -> schema.Post:
    """ID로 특정 게시글을 찾아 상세 정보를 반환합니다."""

    # 1. 게시글 찾기
    post_to_find = next((post for post in db.posts if post['id'] == post_id), None)
    if not post_to_find:
        raise HTTPException(status_code=404, detail=f"Post with ID {post_id} not found")

    # 2. 작성자 정보 찾기
    author_info = next((user for user in db.users if user['id'] == post_to_find['author_id']), None)
    if not author_info:
         raise HTTPException(status_code=404, detail=f"Author for Post ID {post_id} not found")

    # 3. 최종 응답 스키마(Post)에 맞게 조합
    return schema.Post(
        id=post_to_find['id'],
        title=post_to_find['title'],
        content=post_to_find['content'],
        author=author_info,
        created_at=post_to_find['created_at'],
        comment_count=post_to_find['comment_count']
    )

def create_new_post(post_create: schema.PostCreate) -> schema.Post:
    """새로운 게시글을 생성합니다.
    만약, 사용자가 없다면 새로운 게시글을 생성할 수 없습니다.
    """
    
    # 1. 작성자가 실제로 존재하는지 확인
    author_exists = any(user['id'] == post_create.author_id for user in db.users)
    if not author_exists:
        raise HTTPException(status_code=404, detail=f"Author with ID {post_create.author_id} not found")

    # 2. 새 게시글 ID 생성 및 데이터 구성
    db.latest_post_id += 1
    new_post_data = {
        "id": db.latest_post_id,
        "title": post_create.title,
        "content": post_create.content,
        "author_id": post_create.author_id,
        "created_at": datetime.now(timezone.utc),
        "comment_count": 0
    }
    
    # 3. 데이터베이스에 추가
    db.posts.append(new_post_data)
    
    # 4. 방금 만든 게시글의 전체 정보를 반환하기 위해 get_post_by_id 함수 재사용
    return get_post_by_id(new_post_data['id'])

def update_post(post_id: int, post_update: schema.PostUpdate) -> schema.Post:
    """게시글을 수정합니다."""
    
    post_to_update = next((post for post in db.posts if post['id'] == post_id), None)
    if not post_to_update:
        raise HTTPException(status_code=404, detail=f"Post with ID {post_id} not found")
        
    post_to_update['title'] = post_update.title
    post_to_update['content'] = post_update.content
    
    return get_post_by_id(post_id)
    
def delete_post(post_id: int):
    """게시글을 삭제합니다."""
    
    post_to_delete = next((post for post in db.posts if post['id'] == post_id), None)
    if not post_to_delete:
        raise HTTPException(status_code=404, detail=f"Post with ID {post_id} not found")
        
    db.posts.remove(post_to_delete)
    return True