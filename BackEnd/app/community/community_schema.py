# app/community/community_schema.py
from pydantic import BaseModel, Field
from datetime import datetime

# =================================
#  공통 스키마 (다른 기능에서도 재사용 가능)
# =================================
class User(BaseModel):
    """게시글 또는 댓글의 작성자 정보를 나타내는 스키마"""
    id: int
    username: str
    avatar_url: str | None = None  # 아바타 URL은 선택적 필드


# =================================
#  게시글 (Post) 관련 스키마
# =================================

# --- 응답 (Response) 스키마 ---

class Post(BaseModel):
    """
    단일 게시글 상세 조회(`GET /api/posts/{postId}`) 시 사용되는 응답 스키마.
    (모든 필드 포함)
    """
    id: int
    title: str
    content: str
    author: User  # 작성자 정보를 User 스키마로 포함
    created_at: datetime
    comment_count: int = 0
    # 댓글 기능 추가 시 comments: list[Comment] 필드도 포함될 수 있습니다.

class PostList(BaseModel):
    """
    게시글 목록 조회(`GET /api/posts`) 시 사용되는 응답 스키마.
    (성능을 위해 본문(content) 제외)
    """
    id: int
    title: str
    author: User
    created_at: datetime
    comment_count: int = 0
    # 댓글 기능 추가 시 comment_count 필드도 포함될 수 있습니다.

# --- 요청 (Request) 스키마 ---

class PostCreate(BaseModel):
    """
    새로운 게시글을 작성(`POST /api/posts`)할 때 사용하는 요청 스키마
    """
    title: str = Field(..., min_length=1, max_length=100, description="게시글 제목")
    content: str = Field(..., min_length=1, description="게시글 본문")
    author_id: int # 실제 앱에서는 인증을 통해 자동으로 처리될 작성자 ID

class PostUpdate(BaseModel):
    """
    게시글을 수정(`PUT /api/posts/{postId}`)할 때 사용하는 요청 스키마
    """
    title: str = Field(..., min_length=1, max_length=100, description="게시글 제목")
    content: str = Field(..., min_length=1, description="게시글 본문")