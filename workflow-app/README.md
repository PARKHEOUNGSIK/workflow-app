# ⚡ WorkFlow — 팀 프로젝트 관리 앱

실시간 협업이 가능한 팀용 프로젝트 관리 도구입니다.
Vite + React + Supabase 스택으로 구성되어 있습니다.

---

## 🚀 배포 가이드 (총 20분 예상)

### STEP 1 — Supabase 설정 (5분)

1. https://supabase.com 접속 → 구글 계정으로 로그인
2. **New Project** 클릭 → 프로젝트 이름 입력 (예: `workflow-app`) → 비밀번호 설정 → **Create Project**
3. 프로젝트 생성 완료 후 좌측 메뉴에서 **SQL Editor** 클릭
4. 이 폴더의 `supabase_schema.sql` 파일 내용을 전체 복사 → SQL Editor에 붙여넣기 → **Run** 클릭
5. 좌측 메뉴 **Project Settings → API** 에서:
   - `Project URL` 복사해두기
   - `anon public` key 복사해두기

### STEP 2 — 환경 변수 설정 (1분)

이 폴더에서 `.env.example` 파일을 복사해서 `.env.local` 파일을 만들고:

```
VITE_SUPABASE_URL=붙여넣은 Project URL
VITE_SUPABASE_ANON_KEY=붙여넣은 anon key
```

### STEP 3 — GitHub에 올리기 (5분)

1. https://github.com → **New repository** → 이름 입력 → **Create**
2. VS Code에서 이 폴더 열기
3. 터미널에서:
```bash
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/[내아이디]/[저장소명].git
git push -u origin main
```

### STEP 4 — Vercel 배포 (5분)

1. https://vercel.com → GitHub으로 로그인
2. **Add New Project** → 방금 만든 저장소 선택 → **Import**
3. **Environment Variables** 섹션에서:
   - `VITE_SUPABASE_URL` 추가
   - `VITE_SUPABASE_ANON_KEY` 추가
4. **Deploy** 클릭
5. 배포 완료 후 `https://[프로젝트명].vercel.app` URL 팀원에게 공유!

### STEP 5 — 팀원 초대

팀원이 URL에 접속해서 **회원가입**하면 바로 사용 가능합니다.
모든 팀원이 같은 프로젝트, 업무, 노트를 실시간으로 공유합니다.

---

## 📦 로컬 개발 실행

Node.js가 설치된 상태에서:

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:5173 접속

---

## ✨ 주요 기능

- **이메일/비밀번호 로그인** (Supabase Auth)
- **프로젝트 관리** — 여러 프로젝트 생성, 색상 설정
- **업무 관리** — 상태(할일/진행중/완료), 우선순위, 마감일, 태그, 메모
- **노트** — 마크다운 지원, 미리보기, 자동 저장
- **실시간 동기화** — 팀원이 수정하면 즉시 반영
- **작성자 표시** — 누가 만든 업무/노트인지 표시

---

## 🛠 기술 스택

- **Frontend**: React 18 + Vite
- **Backend/DB**: Supabase (PostgreSQL + Auth + Realtime)
- **배포**: Vercel (무료)
