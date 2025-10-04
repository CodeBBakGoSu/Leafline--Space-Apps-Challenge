"""pytest 설정 및 fixture"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """테스트 클라이언트 fixture"""
    with TestClient(app) as c:
        yield c

