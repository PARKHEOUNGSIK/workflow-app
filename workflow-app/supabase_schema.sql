-- ============================================================
-- WorkFlow 앱 — Supabase SQL 스키마
-- Supabase > SQL Editor 에서 이 내용을 복사 & 실행하세요
-- ============================================================

-- 1. 프로젝트 테이블
CREATE TABLE projects (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL DEFAULT '새 프로젝트',
  color       TEXT NOT NULL DEFAULT '#E8673A',
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. 업무(태스크) 테이블
CREATE TABLE tasks (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title         TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','done')),
  priority      TEXT NOT NULL DEFAULT 'mid'  CHECK (priority IN ('high','mid','low')),
  due_date      DATE,
  memo          TEXT DEFAULT '',
  tags          TEXT[] DEFAULT '{}',
  created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_name  TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 3. 노트 테이블
CREATE TABLE notes (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title         TEXT NOT NULL DEFAULT '새 노트',
  content       TEXT DEFAULT '',
  created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_name  TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RLS (Row Level Security) 설정
-- 로그인한 팀원 전체가 모든 데이터를 읽고 쓸 수 있게 허용
-- ============================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes    ENABLE ROW LEVEL SECURITY;

-- 로그인한 유저라면 누구나 조회 가능
CREATE POLICY "team_read_projects"  ON projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "team_read_tasks"     ON tasks    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "team_read_notes"     ON notes    FOR SELECT USING (auth.role() = 'authenticated');

-- 로그인한 유저라면 누구나 생성 가능
CREATE POLICY "team_insert_projects" ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "team_insert_tasks"    ON tasks    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "team_insert_notes"    ON notes    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 로그인한 유저라면 누구나 수정 가능
CREATE POLICY "team_update_projects" ON projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "team_update_tasks"    ON tasks    FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "team_update_notes"    ON notes    FOR UPDATE USING (auth.role() = 'authenticated');

-- 로그인한 유저라면 누구나 삭제 가능
CREATE POLICY "team_delete_projects" ON projects FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "team_delete_tasks"    ON tasks    FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "team_delete_notes"    ON notes    FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- Realtime 활성화 (실시간 동기화)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
