#!/bin/bash
# ============================================================
# 쉼표(,) EC2 배포 스크립트
# 사용법: bash deploy.sh
# ============================================================

set -e

echo "▶ 코드 최신화..."
git pull origin develop

echo "▶ 기존 컨테이너 정리..."
docker-compose down

echo "▶ Docker 이미지 빌드 + 실행..."
docker-compose up --build -d

echo "▶ 컨테이너 상태 확인..."
docker-compose ps

echo ""
echo "✅ 배포 완료!"
echo "   프론트엔드: http://$(curl -s ifconfig.me)"
echo "   백엔드 API: http://$(curl -s ifconfig.me):8080"
