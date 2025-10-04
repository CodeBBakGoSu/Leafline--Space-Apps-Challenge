"""헬스 체크 서비스 - 비즈니스 로직"""

from datetime import datetime


class HealthService:
    """헬스 체크 관련 비즈니스 로직"""

    @staticmethod
    def check_health() -> dict:
        """
        서버 상태 확인 로직
        
        Returns:
            dict: 서버 상태 정보
        """
        return {
            "status": "ok",
            "message": "Server is running",
            "timestamp": datetime.utcnow().isoformat(),
        }

