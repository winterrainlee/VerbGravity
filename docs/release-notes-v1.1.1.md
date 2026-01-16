# VerbGravity v1.1.1 Release Notes (Hotfix)

**Release Date:** 2026-01-16

## 🚑 Hotfix: DB Schema Migration

### 🐛 Bug Fixes
*   **Fix Deployment Error**: Cloud 배포(Fly.io) 환경에서 기존 데이터베이스 파일 유지로 인해, `sessions` 테이블에 `mode` 컬럼이 누락되어 세션 생성이 실패하는 문제를 해결했습니다.
*   **Auto Migration**: 서버 시작 시 DB 스키마를 검사하고, `mode` 컬럼이 없으면 자동으로 추가하는 마이그레이션 로직(`check_and_migrate_schema`)을 추가했습니다.

## 📝 Notes
이 업데이트는 배포 환경의 데이터베이스 호환성 문제를 해결하기 위한 긴급 패치입니다. 기능상의 변경은 없습니다.
