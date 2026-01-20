"""
NLP Error Tracker - v1.1.2

NLP 분석 실패 케이스를 로깅하여 향후 분석 개선에 활용합니다.
"""
import os
import json
from datetime import datetime
from typing import Optional, Dict, Any

# 로그 파일 경로
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
LOG_PATH = os.path.join(BASE_DIR, "data", "nlp_errors.log")


def log_analysis_error(
    sentence: str,
    error_type: str,
    details: Optional[Dict[str, Any]] = None
) -> None:
    """NLP 분석 오류를 로그 파일에 기록합니다.
    
    Args:
        sentence: 분석에 실패한 문장
        error_type: 오류 유형 (예: "no_root", "no_subject", "parse_error")
        details: 추가 세부 정보 (선택)
    """
    try:
        os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
        
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "sentence": sentence,
            "error_type": error_type,
            "details": details or {}
        }
        
        with open(LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")
            
    except Exception as e:
        # 로깅 실패는 무시 (메인 기능에 영향을 주지 않음)
        print(f"[ErrorTracker] Failed to log error: {e}")


def get_error_stats() -> Dict[str, int]:
    """로그 파일에서 오류 통계를 집계합니다.
    
    Returns:
        오류 유형별 발생 횟수
    """
    stats: Dict[str, int] = {}
    
    if not os.path.exists(LOG_PATH):
        return stats
    
    try:
        with open(LOG_PATH, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    entry = json.loads(line.strip())
                    error_type = entry.get("error_type", "unknown")
                    stats[error_type] = stats.get(error_type, 0) + 1
                except json.JSONDecodeError:
                    continue
    except Exception:
        pass
    
    return stats
