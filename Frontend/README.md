# Leafline Frontend

## 🌿 Git 워크플로우

### 📋 작업 프로세스    

#### 1️⃣ 새 브랜치 생성 및 작업

```bash
# 1. main 브랜치에서 최신 코드 받기
git checkout main
git pull origin main

# 2. 새 기능 브랜치 생성
git checkout -b feature/기능명
# 예시: git checkout -b feature/add-login-page

# 3. 작업 진행 및 커밋
git add .
git commit -m "feat: 로그인 페이지 UI 구현"
git commit -m "feat: 로그인 API 연동"
```

#### 2️⃣ Push 전 Rebase (최신 main 반영)

```bash
# 1. main의 최신 변경사항 가져오기
git fetch origin main

# 2. 현재 브랜치를 최신 main 기준으로 rebase
git rebase origin/main

# 3. 충돌 발생 시
# - 충돌 파일 수정
git add .
git rebase --continue

# 4. Rebase 중단하고 싶다면
git rebase --abort
```

#### 3️⃣ 원격 브랜치에 Push

```bash
# 처음 push
git push -u origin feature/기능명

# Rebase 후 push (force push 필요)
git push --force-with-lease origin feature/기능명
```

> ⚠️ **주의**: `--force-with-lease`는 다른 사람의 변경사항을 보호하면서 강제 push합니다.

#### 4️⃣ GitHub에서 Pull Request (PR) 생성

1. GitHub 저장소 페이지 방문
2. "Compare & pull request" 클릭
3. PR 제목과 설명 작성
4. Reviewer 지정 (선택사항)
5. "Create pull request" 클릭

#### 5️⃣ Squash Merge (커밋 합치기)

GitHub PR 페이지에서:

1. 코드 리뷰 완료 후
2. **"Squash and merge"** 버튼 클릭
   - 여러 개의 커밋이 하나로 합쳐짐
   - 깔끔한 히스토리 유지
3. 커밋 메시지 확인/수정
4. "Confirm squash and merge" 클릭

```
Before Squash:
main ─┬─ feat: 로그인 UI
      ├─ feat: 로그인 API
      ├─ fix: 버그 수정
      └─ refactor: 코드 정리

After Squash:
main ─── feat: 로그인 기능 구현 (4 commits)
```

#### 6️⃣ 다음 작업 준비

```bash
# 1. main 브랜치로 전환
git checkout main

# 2. 병합된 최신 main 받기
git pull origin main

# 3. 작업 완료된 로컬 브랜치 삭제
git branch -d feature/기능명

# 4. 새로운 작업을 위한 브랜치 생성
git checkout -b feature/다음-기능명
```

---

## 🔄 전체 워크플로우 요약

```bash
# 1. 브랜치 생성
git checkout main
git pull origin main
git checkout -b feature/new-feature

# 2. 작업 및 커밋
git add .
git commit -m "작업 내용"

# 3. Push 전 Rebase
git fetch origin main
git rebase origin/main

# 4. Push
git push -u origin feature/new-feature
# (rebase 후) git push --force-with-lease

# 5. GitHub에서 PR 생성

# 6. Squash and Merge

# 7. 다음 작업 준비
git checkout main
git pull origin main
git branch -d feature/new-feature
```

---

## 💡 커밋 메시지 컨벤션

```bash
feat:     새로운 기능 추가
fix:      버그 수정
docs:     문서 수정
style:    코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test:     테스트 코드 추가
chore:    빌드 업무, 패키지 매니저 설정 등
```

**예시:**
```bash
git commit -m "feat: 사용자 프로필 페이지 추가"
git commit -m "fix: 로그인 버튼 클릭 오류 수정"
git commit -m "refactor: API 호출 로직 개선"
```

---

## ❓ FAQ

### Q: Rebase vs Merge 차이는?
- **Rebase**: 커밋 히스토리를 일직선으로 유지 (깔끔함) ✅
- **Merge**: 브랜치의 분기/병합 히스토리 유지

### Q: Squash Merge를 왜 사용하나요?
- 작업 중 생긴 수많은 커밋을 하나로 합침
- main 브랜치 히스토리가 깔끔해짐
- 기능 단위로 커밋 관리 가능

### Q: force push가 위험하지 않나요?
- `--force-with-lease` 사용으로 안전하게 처리
- 혼자 작업하는 브랜치에서만 사용
- main 브랜치에는 절대 force push 금지! ⛔

### Q: Rebase 중 충돌이 너무 많아요
```bash
# Rebase 취소하고 Merge 사용
git rebase --abort
git merge origin/main
```

---

## 🚨 주의사항

1. ⛔ **main 브랜치에 직접 push 금지**
2. ⛔ **main 브랜치에 force push 절대 금지**
3. ✅ **항상 브랜치를 만들어서 작업**
4. ✅ **Push 전에 최신 main rebase**
5. ✅ **의미 있는 커밋 메시지 작성**

---

## 🛠️ 개발 환경 설정

(프론트엔드 개발 환경 설정 내용은 여기에 추가)

```bash
# Node.js 설치 확인
node --version
npm --version

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

