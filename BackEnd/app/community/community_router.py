# app/community/community_router.py
from fastapi import APIRouter, status, Response
from typing import List

from app.community import community_service as service
from app.community import community_schema as schema

router = APIRouter(
    prefix="/community/posts",
    tags=["Community Posts"]
)

@router.get("", response_model=List[schema.PostList])
def get_posts_route():
    """전체 게시글 목록을 조회합니다."""
    return service.get_all_posts()

@router.post("", response_model=schema.Post, status_code=status.HTTP_201_CREATED)
def create_post_route(post_create: schema.PostCreate):
    """새로운 게시글을 작성합니다."""
    return service.create_new_post(post_create)

@router.get("/{post_id}", response_model=schema.Post)
def get_post_route(post_id: int):
    """특정 ID의 게시글을 상세 조회합니다."""
    return service.get_post_by_id(post_id)

@router.put("/{post_id}", response_model=schema.Post)
def update_post_route(post_id: int, post_update: schema.PostUpdate):
    """특정 ID의 게시글을 수정합니다."""
    return service.update_post(post_id, post_update)
    
@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post_route(post_id: int):
    """특정 ID의 게시글을 삭제합니다."""
    service.delete_post(post_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)