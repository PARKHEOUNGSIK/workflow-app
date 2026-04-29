import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './supabase.js'

// ─── Constants ────────────────────────────────────────────────────────────────
const COLORS = ['#E8673A','#4A9EFF','#A855F7','#22C55E','#F59E0B','#EC4899','#14B8A6','#F97316']
const STATUS = {
  todo:  { label:'할 일',   color:'#94A3B8', bg:'rgba(148,163,184,0.12)' },
  doing: { label:'진행중',  color:'#4A9EFF', bg:'rgba(74,158,255,0.12)'  },
  done:  { label:'완료',    color:'#22C55E', bg:'rgba(34,197,94,0.12)'   },
}
const PRIORITY = {
  high: { label:'높음', color:'#E8673A' },
  mid:  { label:'보통', color:'#F59E0B' },
  low:  { label:'낮음', color:'#94A3B8' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

const Icon = ({ name, size=16, color='currentColor' }) => {
  const paths = {
    plus:'M12 5v14M5 12h14', trash:'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    edit:'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    chevR:'M9 18l6-6-6-6', chevD:'M6 9l6 6 6-6', menu:'M3 12h18M3 6h18M3 18h18',
    logout:'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
    search:'M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z',
    user:'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
    refresh:'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15',
  }
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke={color} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
      <path d={paths[name]} />
    </svg>
  )
}

// ─── Auth Page ────────────────────────────────────────────────────────────────
function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login') // login | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: name || email.split('@')[0] } }
        })
        if (error) throw error
        setSuccess('가입 완료! 이메일을 확인해주세요. (확인 후 로그인)')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onAuth(data.user)
      }
    } catch (err) {
      const msg = err.message
      if (msg.includes('Invalid login')) setError('이메일 또는 비밀번호가 틀렸습니다.')
      else if (msg.includes('already registered')) setError('이미 가입된 이메일입니다.')
      else setError(msg)
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0F1117', fontFamily:"'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; }`}</style>
      <div style={{ width:380, padding:36, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:36, marginBottom:8 }}>⚡</div>
          <div style={{ fontSize:22, fontWeight:700, color:'#F1F5F9', letterSpacing:'-0.5px' }}>WorkFlow</div>
          <div style={{ fontSize:13, color:'#64748B', marginTop:4 }}>팀 프로젝트 관리 도구</div>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, color:'#64748B', fontWeight:600, display:'block', marginBottom:5 }}>이름</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder='홍길동'
                style={inputStyle} />
            </div>
          )}
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:12, color:'#64748B', fontWeight:600, display:'block', marginBottom:5 }}>이메일</label>
            <input type='email' value={email} onChange={e=>setEmail(e.target.value)} placeholder='name@company.com' required
              style={inputStyle} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:12, color:'#64748B', fontWeight:600, display:'block', marginBottom:5 }}>비밀번호</label>
            <input type='password' value={password} onChange={e=>setPassword(e.target.value)} placeholder='6자 이상' required minLength={6}
              style={inputStyle} />
          </div>

          {error && <div style={{ background:'rgba(232,103,58,0.1)', border:'1px solid rgba(232,103,58,0.3)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#E8673A', marginBottom:14 }}>{error}</div>}
          {success && <div style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#22C55E', marginBottom:14 }}>{success}</div>}

          <button type='submit' disabled={loading}
            style={{ width:'100%', padding:'12px', background: loading ? '#4A5568' : 'linear-gradient(135deg,#E8673A,#F59E0B)', border:'none', borderRadius:10, color:'#fff', fontSize:14, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s' }}>
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>

        <div style={{ textAlign:'center', marginTop:18, fontSize:13, color:'#64748B' }}>
          {mode === 'login' ? (
            <>계정이 없으신가요? <button onClick={()=>{setMode('signup');setError('');setSuccess('')}} style={{ background:'none', border:'none', color:'#4A9EFF', cursor:'pointer', fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>회원가입</button></>
          ) : (
            <>이미 계정이 있으신가요? <button onClick={()=>{setMode('login');setError('');setSuccess('')}} style={{ background:'none', border:'none', color:'#4A9EFF', cursor:'pointer', fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>로그인</button></>
          )}
        </div>
      </div>
    </div>
  )
}
const inputStyle = { width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'10px 14px', color:'#E2E8F0', fontSize:14, outline:'none', fontFamily:"'DM Sans',sans-serif" }

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0F1117', color:'#64748B', fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ textAlign:'center' }}><div style={{ fontSize:32, marginBottom:8 }}>⚡</div>로딩 중...</div>
    </div>
  )

  if (!user) return <AuthPage onAuth={setUser} />
  return <MainApp user={user} onLogout={() => supabase.auth.signOut()} />
}

// ─── Main Workspace ───────────────────────────────────────────────────────────
function MainApp({ user, onLogout }) {
  const [projects, setProjects] = useState([])
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [activeTab, setActiveTab] = useState('tasks')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [loadingProjects, setLoadingProjects] = useState(true)

  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0]
  const activeProject = projects.find(p => p.id === activeProjectId)

  // Load projects
  useEffect(() => {
    fetchProjects()
    // Realtime subscription
    const channel = supabase.channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchProjects)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('*').or(`is_private.eq.false,created_by.eq.${user.id}`)
    .order('created_at', { ascending: true })
    if (data) {
      setProjects(data)
      if (data.length > 0 && !activeProjectId) setActiveProjectId(data[0].id)
    }
    setLoadingProjects(false)
  }

  const addProject = async () => {
    const color = COLORS[projects.length % COLORS.length]
    const { data } = await supabase.from('projects').insert({ name:'새 프로젝트', color, created_by: user.id }).select().single()
    if (data) { setProjects(p => [...p, data]); setActiveProjectId(data.id); setEditingId(data.id) }
  }

  const updateProjectName = async (id, name) => {
    await supabase.from('projects').update({ name }).eq('id', id)
    setProjects(ps => ps.map(p => p.id===id ? { ...p, name } : p))
  }

  const updateProjectColor = async (id, color) => {
    await supabase.from('projects').update({ color }).eq('id', id)
    setProjects(ps => ps.map(p => p.id===id ? { ...p, color } : p))
  }

  const deleteProject = async (id) => {
    if (!window.confirm('이 프로젝트를 삭제하시겠습니까? 모든 업무와 노트도 삭제됩니다.')) return
    await supabase.from('projects').delete().eq('id', id)
    setProjects(ps => ps.filter(p => p.id!==id))
    if (activeProjectId === id) setActiveProjectId(projects.find(p=>p.id!==id)?.id || null)
  }

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#0F1117', fontFamily:"'DM Sans', sans-serif", color:'#E2E8F0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:#2D3748; border-radius:3px; }
        .btn-icon { background:none; border:none; cursor:pointer; padding:4px; border-radius:6px; display:flex; align-items:center; justify-content:center; transition:background 0.15s; }
        .btn-icon:hover { background:rgba(255,255,255,0.08); }
        .si { border-radius:8px; cursor:pointer; transition:all 0.15s; padding:8px 10px; display:flex; align-items:center; gap:8px; }
        .si:hover { background:rgba(255,255,255,0.05); }
        .si.active { background:rgba(255,255,255,0.08); }
        .si .actions { opacity:0; display:flex; gap:2px; transition:opacity 0.15s; }
        .si:hover .actions { opacity:1; }
        .task-row { border-radius:10px; padding:12px 14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); margin-bottom:8px; transition:all 0.15s; }
        .task-row:hover { background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.1); }
        .note-item { border-radius:10px; padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); cursor:pointer; transition:all 0.15s; margin-bottom:6px; }
        .note-item:hover, .note-item.active { background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.1); }
        .editable { background:transparent; border:none; outline:none; color:#E2E8F0; resize:none; width:100%; font-family:'DM Sans',sans-serif; }
        .pbtn { background:#E8673A; color:#fff; border:none; cursor:pointer; padding:8px 16px; border-radius:8px; font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif; transition:all 0.15s; display:flex; align-items:center; gap:6px; }
        .pbtn:hover { background:#D4562A; }
        .pbtn:disabled { background:#4A5568; cursor:not-allowed; }
        select { background:#1A202C; border:1px solid rgba(255,255,255,0.1); color:#E2E8F0; padding:4px 8px; border-radius:6px; font-size:13px; outline:none; cursor:pointer; font-family:'DM Sans',sans-serif; }
        input[type='date'] { color-scheme:dark; }
        .tag-chip { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:20px; font-size:11px; font-weight:500; background:rgba(74,158,255,0.12); color:#4A9EFF; }
        .status-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:500; cursor:pointer; border:none; font-family:'DM Sans',sans-serif; }
        .fade-in { animation:fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        .online-dot { width:8px; height:8px; border-radius:50%; background:#22C55E; display:inline-block; box-shadow:0 0 6px #22C55E; animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      `}</style>

      {/* ── Sidebar ── */}
      {sidebarOpen && (
        <div style={{ width:240, flexShrink:0, background:'#080C13', borderRight:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column' }}>
          {/* Logo */}
          <div style={{ padding:'18px 16px 12px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:7, background:'linear-gradient(135deg,#E8673A,#F59E0B)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>⚡</div>
              <div>
                <div style={{ fontWeight:700, fontSize:14, letterSpacing:'-0.3px' }}>WorkFlow</div>
                <div style={{ fontSize:10, color:'#4A5568', display:'flex', alignItems:'center', gap:4 }}>
                  <span className='online-dot' /> 실시간 연동
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div style={{ padding:'10px 12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, padding:'6px 10px' }}>
              <Icon name='search' size={13} color='#4A5568' />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='검색...'
                style={{ background:'none', border:'none', outline:'none', color:'#E2E8F0', fontSize:13, width:'100%', fontFamily:"'DM Sans',sans-serif" }} />
            </div>
          </div>

          {/* Projects list */}
          <div style={{ flex:1, overflowY:'auto', padding:'4px 8px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 6px 4px' }}>
              <span style={{ fontSize:11, fontWeight:600, color:'#4A5568', letterSpacing:'0.08em', textTransform:'uppercase' }}>프로젝트</span>
              <button className='btn-icon' onClick={addProject} title='새 프로젝트'>
                <Icon name='plus' size={13} color='#E8673A' />
              </button>
            </div>
            {loadingProjects ? (
              <div style={{ textAlign:'center', color:'#4A5568', padding:16, fontSize:12 }}>불러오는 중...</div>
            ) : filtered.map(p => (
              <div key={p.id} className={`si ${p.id===activeProjectId?'active':''}`} onClick={()=>setActiveProjectId(p.id)}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:p.color, flexShrink:0 }} />
                {editingId === p.id ? (
                  <input autoFocus value={p.name}
                    onChange={e => setProjects(ps => ps.map(x => x.id===p.id ? { ...x, name:e.target.value } : x))}
                    onBlur={() => { updateProjectName(p.id, p.name); setEditingId(null) }}
                    onKeyDown={e => { if (e.key==='Enter') { updateProjectName(p.id, p.name); setEditingId(null) } }}
                    style={{ background:'none', border:'none', outline:'none', color:'#E2E8F0', fontSize:13, width:'100%', fontFamily:"'DM Sans',sans-serif" }} />
                ) : (
                  <span style={{ fontSize:13, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</span>
                )}
                <div className='actions'>
                  <button className='btn-icon' onClick={e=>{e.stopPropagation();setEditingId(p.id)}} title='이름 변경'>
                    <Icon name='edit' size={11} color='#94A3B8' />
                  </button>
                  <button className='btn-icon' onClick={e=>{e.stopPropagation();deleteProject(p.id)}} title='삭제'>
                    <Icon name='trash' size={11} color='#E8673A' />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* User info */}
          <div style={{ padding:'10px 14px 14px', borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#4A9EFF,#A855F7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>
              {displayName[0].toUpperCase()}
            </div>
            <div style={{ flex:1, overflow:'hidden' }}>
              <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{displayName}</div>
              <div style={{ fontSize:10, color:'#4A5568', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</div>
            </div>
            <button className='btn-icon' onClick={onLogout} title='로그아웃'>
              <Icon name='logout' size={15} color='#64748B' />
            </button>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Header */}
        <div style={{ padding:'14px 24px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:12, background:'rgba(255,255,255,0.01)', flexShrink:0 }}>
          <button className='btn-icon' onClick={()=>setSidebarOpen(v=>!v)}>
            <Icon name='menu' size={18} color='#94A3B8' />
          </button>
          {activeProject && (
            <>
              <div style={{ width:10, height:10, borderRadius:'50%', background:activeProject.color }} />
              <span style={{ fontWeight:700, fontSize:17, letterSpacing:'-0.3px', flex:1 }}>{activeProject.name}</span>
              {/* Color picker */}
              <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                {COLORS.map(c => (
                  <div key={c} onClick={()=>updateProjectColor(activeProject.id,c)}
                    style={{ width:13, height:13, borderRadius:'50%', background:c, cursor:'pointer', outline: activeProject.color===c ? `2px solid ${c}` : 'none', outlineOffset:2, transform: activeProject.color===c ? 'scale(1.3)' : 'scale(1)', transition:'all 0.15s' }} />
                ))}
              </div>
              <div style={{ display:'flex', gap:4, marginLeft:8, background:'rgba(255,255,255,0.03)', padding:3, borderRadius:9 }}>
                {[['tasks','📋 업무'],['notes','📝 노트']].map(([k,label]) => (
                  <button key={k} onClick={()=>setActiveTab(k)}
                    style={{ background: activeTab===k ? 'rgba(255,255,255,0.08)' : 'transparent', border:'none', color: activeTab===k ? '#E2E8F0' : '#64748B', cursor:'pointer', padding:'6px 14px', borderRadius:7, fontSize:13, fontWeight: activeTab===k ? 600 : 400, fontFamily:"'DM Sans',sans-serif", transition:'all 0.15s' }}>
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div style={{ flex:1, overflow:'auto', padding:'24px' }}>
          {!activeProject ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#4A5568' }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🗂️</div>
                <div style={{ fontSize:15, fontWeight:500, marginBottom:16 }}>프로젝트를 선택하거나 새로 만드세요</div>
                <button className='pbtn' onClick={addProject} style={{ margin:'0 auto' }}>
                  <Icon name='plus' size={14} color='#fff' /> 새 프로젝트
                </button>
              </div>
            </div>
          ) : activeTab === 'tasks' ? (
            <TasksPanel key={activeProject.id} project={activeProject} userId={user.id} userName={displayName} />
          ) : (
            <NotesPanel key={activeProject.id} project={activeProject} userId={user.id} userName={displayName} />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Tasks Panel ──────────────────────────────────────────────────────────────
function TasksPanel({ project, userId, userName }) {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [tagInputs, setTagInputs] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTasks()
    const ch = supabase.channel(`tasks-${project.id}`)
      .on('postgres_changes', { event:'*', schema:'public', table:'tasks', filter:`project_id=eq.${project.id}` }, fetchTasks)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [project.id])

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').eq('project_id', project.id).order('created_at', { ascending:true })
    if (data) setTasks(data)
    setLoading(false)
  }

  const addTask = async () => {
    if (!newTitle.trim()) return
    setSaving(true)
    const { data } = await supabase.from('tasks').insert({
      project_id: project.id, title: newTitle.trim(), status:'todo', priority:'mid',
      tags:[], memo:'', created_by: userId, creator_name: userName
    }).select().single()
    if (data) setTasks(t => [...t, data])
    setNewTitle('')
    setSaving(false)
  }

  const updateTask = async (id, changes) => {
    setTasks(ts => ts.map(t => t.id===id ? { ...t, ...changes } : t))
    await supabase.from('tasks').update(changes).eq('id', id)
  }

  const deleteTask = async (id) => {
    setTasks(ts => ts.filter(t => t.id!==id))
    await supabase.from('tasks').delete().eq('id', id)
  }

  const cycleStatus = (id, cur) => {
    const order = ['todo','doing','done']
    updateTask(id, { status: order[(order.indexOf(cur)+1)%3] })
  }

  const addTag = async (tid) => {
    const val = (tagInputs[tid]||'').trim()
    if (!val) return
    const task = tasks.find(t=>t.id===tid)
    const tags = [...(task.tags||[]).filter(x=>x!==val), val]
    await updateTask(tid, { tags })
    setTagInputs(v => ({ ...v, [tid]:'' }))
  }

  const removeTag = (tid, tag) => {
    const task = tasks.find(t=>t.id===tid)
    updateTask(tid, { tags: (task.tags||[]).filter(x=>x!==tag) })
  }

  const isOverdue = t => t.due_date && t.status!=='done' && new Date(t.due_date) < new Date()

  const filtered = tasks.filter(t => filter==='all' || t.status===filter)
  const counts = { all:tasks.length, ...Object.fromEntries(['todo','doing','done'].map(s=>[s,tasks.filter(t=>t.status===s).length])) }
  const done = tasks.filter(t=>t.status==='done').length
  const pct = tasks.length ? Math.round(done/tasks.length*100) : 0

  return (
    <div className='fade-in' style={{ maxWidth:820 }}>
      {/* Progress */}
      <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'14px 18px', marginBottom:20, display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#64748B', marginBottom:6 }}>
            <span>전체 진행률</span>
            <span style={{ color:'#22C55E', fontWeight:700 }}>{pct}%</span>
          </div>
          <div style={{ height:6, background:'rgba(255,255,255,0.06)', borderRadius:6 }}>
            <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#22C55E,#4A9EFF)', borderRadius:6, transition:'width 0.4s ease' }} />
          </div>
        </div>
        <div style={{ display:'flex', gap:16, fontSize:13 }}>
          {Object.entries(STATUS).map(([k,v]) => (
            <div key={k} style={{ textAlign:'center' }}>
              <div style={{ fontWeight:700, color:v.color, fontSize:16 }}>{counts[k]}</div>
              <div style={{ fontSize:11, color:'#4A5568' }}>{v.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div style={{ display:'flex', gap:4, marginBottom:16, background:'rgba(255,255,255,0.03)', padding:4, borderRadius:10, width:'fit-content' }}>
        {[['all','전체'],['todo','할 일'],['doing','진행중'],['done','완료']].map(([k,label]) => (
          <button key={k} onClick={()=>setFilter(k)}
            style={{ background: filter===k ? 'rgba(255,255,255,0.08)' : 'transparent', border:'none', color: filter===k ? '#E2E8F0' : '#64748B', cursor:'pointer', padding:'6px 14px', borderRadius:7, fontSize:13, fontWeight:500, fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', gap:6, transition:'all 0.15s' }}>
            {label}
            <span style={{ background:'rgba(255,255,255,0.07)', padding:'1px 7px', borderRadius:20, fontSize:11, fontWeight:600 }}>{counts[k]}</span>
          </button>
        ))}
      </div>

      {/* Add task */}
      <div style={{ display:'flex', gap:10, marginBottom:20 }}>
        <input value={newTitle} onChange={e=>setNewTitle(e.target.value)}
          onKeyDown={e=>e.key==='Enter' && addTask()}
          placeholder='새 업무 추가... (Enter)'
          style={{ flex:1, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'10px 14px', color:'#E2E8F0', fontSize:14, outline:'none', fontFamily:"'DM Sans',sans-serif" }} />
        <button className='pbtn' onClick={addTask} disabled={saving}>
          <Icon name='plus' size={14} color='#fff' /> 추가
        </button>
      </div>

      {/* Tasks */}
      {loading ? (
        <div style={{ textAlign:'center', color:'#4A5568', padding:40 }}>업무 불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', color:'#4A5568', padding:48 }}>
          <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
          <div style={{ fontSize:14 }}>업무가 없습니다</div>
        </div>
      ) : filtered.map(task => (
        <div key={task.id} className='task-row' style={{ borderLeft:`3px solid ${task.status==='done' ? '#22C55E' : isOverdue(task) ? '#E8673A' : 'transparent'}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button className='status-badge' onClick={()=>cycleStatus(task.id,task.status)}
              style={{ background:STATUS[task.status].bg, color:STATUS[task.status].color, flexShrink:0 }}>
              {task.status==='done' ? '✓' : task.status==='doing' ? '⟳' : '○'} {STATUS[task.status].label}
            </button>
            <input value={task.title} className='editable'
              onChange={e=>setTasks(ts=>ts.map(t=>t.id===task.id?{...t,title:e.target.value}:t))}
              onBlur={e=>updateTask(task.id,{title:e.target.value})}
              style={{ flex:1, fontSize:14, fontWeight:500, textDecoration:task.status==='done'?'line-through':'none', color:task.status==='done'?'#64748B':'#E2E8F0' }} />
            <select value={task.priority} onChange={e=>updateTask(task.id,{priority:e.target.value})}
              style={{ color:PRIORITY[task.priority].color, background:'transparent', border:'none', fontSize:12, fontWeight:600 }}>
              {Object.entries(PRIORITY).map(([k,v]) => <option key={k} value={k} style={{background:'#1A202C',color:v.color}}>{v.label}</option>)}
            </select>
            <input type='date' value={task.due_date||''} onChange={e=>updateTask(task.id,{due_date:e.target.value})}
              style={{ background:'transparent', border:'none', color:isOverdue(task)?'#E8673A':'#64748B', fontSize:12, cursor:'pointer', outline:'none', fontFamily:"'DM Sans',sans-serif" }} />
            {task.creator_name && task.creator_name !== '' && (
              <span style={{ fontSize:11, color:'#4A5568', whiteSpace:'nowrap' }}>{task.creator_name}</span>
            )}
            <button className='btn-icon' onClick={()=>setExpanded(expanded===task.id?null:task.id)}>
              <Icon name={expanded===task.id?'chevD':'chevR'} size={15} color='#64748B' />
            </button>
            <button className='btn-icon' onClick={()=>deleteTask(task.id)}>
              <Icon name='trash' size={14} color='#E8673A' />
            </button>
          </div>

          {(task.tags||[]).length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:8 }}>
              {task.tags.map(tag => (
                <span key={tag} className='tag-chip'>
                  #{tag}
                  <button onClick={()=>removeTag(task.id,tag)} style={{ background:'none',border:'none',cursor:'pointer',color:'#4A9EFF',padding:0,fontSize:12,lineHeight:1 }}>×</button>
                </span>
              ))}
            </div>
          )}

          {expanded === task.id && (
            <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:11, color:'#4A5568', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>메모</div>
                <textarea value={task.memo||''} className='editable'
                  onChange={e=>setTasks(ts=>ts.map(t=>t.id===task.id?{...t,memo:e.target.value}:t))}
                  onBlur={e=>updateTask(task.id,{memo:e.target.value})}
                  placeholder='업무 관련 메모...'
                  style={{ fontSize:13, color:'#94A3B8', lineHeight:1.6, minHeight:60 }} />
              </div>
              <div>
                <div style={{ fontSize:11, color:'#4A5568', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>태그</div>
                <input value={tagInputs[task.id]||''} onChange={e=>setTagInputs(v=>({...v,[task.id]:e.target.value}))}
                  onKeyDown={e=>e.key==='Enter' && addTag(task.id)}
                  placeholder='태그 입력 후 Enter...'
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, padding:'5px 10px', color:'#E2E8F0', fontSize:12, outline:'none', width:180, fontFamily:"'DM Sans',sans-serif" }} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Notes Panel ──────────────────────────────────────────────────────────────
function NotesPanel({ project, userId, userName }) {
  const [notes, setNotes] = useState([])
  const [activeNoteId, setActiveNoteId] = useState(null)
  const [preview, setPreview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef(null)
  const saveTimer = useRef(null)

  useEffect(() => {
    fetchNotes()
    const ch = supabase.channel(`notes-${project.id}`)
      .on('postgres_changes', { event:'*', schema:'public', table:'notes', filter:`project_id=eq.${project.id}` }, fetchNotes)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [project.id])

  const fetchNotes = async () => {
    const { data } = await supabase.from('notes').select('*').eq('project_id', project.id).order('updated_at', { ascending:false })
    if (data) { setNotes(data); if (!activeNoteId && data.length>0) setActiveNoteId(data[0].id) }
    setLoading(false)
  }

  const addNote = async () => {
    setSaving(true)
    const { data } = await supabase.from('notes').insert({
      project_id: project.id, title:'새 노트', content:'', created_by: userId, creator_name: userName
    }).select().single()
    if (data) { setNotes(n => [data, ...n]); setActiveNoteId(data.id) }
    setSaving(false)
  }

  const updateNote = (id, changes) => {
    setNotes(ns => ns.map(n => n.id===id ? { ...n, ...changes, updated_at: new Date().toISOString() } : n))
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaving(true)
      await supabase.from('notes').update({ ...changes, updated_at: new Date().toISOString() }).eq('id', id)
      setSaving(false)
    }, 800)
  }

  const deleteNote = async (id) => {
    await supabase.from('notes').delete().eq('id', id)
    setNotes(ns => { const r = ns.filter(n=>n.id!==id); setActiveNoteId(r[0]?.id||null); return r })
  }

  const insertMd = (syntax) => {
    const ta = textareaRef.current; if (!ta || !activeNote) return
    const s=ta.selectionStart, e=ta.selectionEnd, sel=ta.value.slice(s,e)
    const map = { bold:`**${sel||'굵게'}**`, italic:`*${sel||'이탤릭'}*`, h1:`# ${sel||'제목'}`, h2:`## ${sel||'소제목'}`, list:`\n- ${sel||'항목'}`, check:`\n- [ ] ${sel||'체크 항목'}`, code:`\`${sel||'코드'}\``, hr:`\n---\n` }
    const ins = map[syntax]
    const newVal = ta.value.slice(0,s)+ins+ta.value.slice(e)
    updateNote(activeNote.id, { content: newVal })
    setTimeout(()=>{ ta.focus(); ta.setSelectionRange(s+ins.length,s+ins.length) }, 0)
  }

  const renderMd = (text) => {
    if (!text) return ''
    return text
      .replace(/^# (.+)$/gm,'<h1 style="font-size:22px;font-weight:700;margin:12px 0 6px;color:#F1F5F9">$1</h1>')
      .replace(/^## (.+)$/gm,'<h2 style="font-size:17px;font-weight:600;margin:10px 0 4px;color:#E2E8F0">$1</h2>')
      .replace(/^### (.+)$/gm,'<h3 style="font-size:15px;font-weight:600;margin:8px 0 4px;color:#CBD5E1">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,'<em>$1</em>')
      .replace(/`(.+?)`/g,'<code style="background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:4px;font-family:\'DM Mono\',monospace;font-size:12px;color:#4A9EFF">$1</code>')
      .replace(/^- \[x\] (.+)$/gm,'<div style="display:flex;align-items:center;gap:6px;margin:3px 0"><span style="color:#22C55E">☑</span><span style="text-decoration:line-through;color:#64748B">$1</span></div>')
      .replace(/^- \[ \] (.+)$/gm,'<div style="display:flex;align-items:center;gap:6px;margin:3px 0"><span style="color:#64748B">☐</span>$1</div>')
      .replace(/^- (.+)$/gm,'<div style="display:flex;align-items:start;gap:6px;margin:2px 0"><span style="color:#E8673A;margin-top:2px">•</span>$1</div>')
      .replace(/^---$/gm,'<hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:16px 0">')
      .replace(/\n/g,'<br>')
  }

  const activeNote = notes.find(n => n.id === activeNoteId)

  return (
    <div className='fade-in' style={{ display:'flex', gap:20, height:'calc(100vh - 130px)' }}>
      {/* Note list */}
      <div style={{ width:220, flexShrink:0, display:'flex', flexDirection:'column' }}>
        <button className='pbtn' onClick={addNote} disabled={saving} style={{ marginBottom:12, justifyContent:'center' }}>
          <Icon name='plus' size={14} color='#fff' /> 새 노트
        </button>
        <div style={{ flex:1, overflowY:'auto' }}>
          {loading ? <div style={{ textAlign:'center', color:'#4A5568', padding:24, fontSize:12 }}>불러오는 중...</div>
          : notes.length === 0 ? (
            <div style={{ textAlign:'center', color:'#4A5568', padding:32 }}>
              <div style={{ fontSize:28, marginBottom:6 }}>📝</div>
              <div style={{ fontSize:13 }}>노트가 없습니다</div>
            </div>
          ) : notes.map(n => (
            <div key={n.id} className={`note-item ${n.id===activeNoteId?'active':''}`} onClick={()=>setActiveNoteId(n.id)}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:148 }}>{n.title||'제목 없음'}</span>
                <button className='btn-icon' onClick={e=>{e.stopPropagation();deleteNote(n.id)}}>
                  <Icon name='trash' size={12} color='#E8673A' />
                </button>
              </div>
              {n.creator_name && <div style={{ fontSize:10, color:'#4A9EFF', marginTop:2 }}>{n.creator_name}</div>}
              <div style={{ fontSize:11, color:'#4A5568', marginTop:1 }}>{fmtDate(n.updated_at)}</div>
              <div style={{ fontSize:12, color:'#64748B', marginTop:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {n.content.slice(0,55)||'내용 없음...'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      {activeNote ? (
        <div style={{ flex:1, display:'flex', flexDirection:'column', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:10 }}>
            <input value={activeNote.title} onChange={e=>updateNote(activeNote.id,{title:e.target.value})}
              placeholder='노트 제목...'
              style={{ flex:1, background:'none', border:'none', outline:'none', color:'#F1F5F9', fontSize:16, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }} />
            {saving && <span style={{ fontSize:11, color:'#4A5568' }}>저장 중...</span>}
            <span style={{ fontSize:11, color:'#4A5568' }}>{fmtDate(activeNote.updated_at)}</span>
            {activeNote.creator_name && <span style={{ fontSize:11, color:'#4A9EFF' }}>by {activeNote.creator_name}</span>}
            <button onClick={()=>setPreview(v=>!v)}
              style={{ background: preview ? 'rgba(74,158,255,0.15)' : 'rgba(255,255,255,0.05)', border:`1px solid ${preview?'rgba(74,158,255,0.3)':'rgba(255,255,255,0.08)'}`, color: preview?'#4A9EFF':'#94A3B8', padding:'4px 12px', borderRadius:6, fontSize:12, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>
              {preview ? '편집' : '미리보기'}
            </button>
          </div>

          {!preview && (
            <div style={{ padding:'5px 12px', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', gap:4, flexWrap:'wrap', background:'rgba(0,0,0,0.08)' }}>
              {[['H1','h1'],['H2','h2'],['B','bold'],['I','italic'],['—','hr'],['•','list'],['☐','check'],['</>','code']].map(([label,cmd]) => (
                <button key={cmd} onClick={()=>insertMd(cmd)}
                  style={{ background:'none', border:'1px solid rgba(255,255,255,0.07)', color:'#94A3B8', padding:'2px 8px', borderRadius:5, fontSize:12, cursor:'pointer', fontFamily:"'DM Mono',monospace" }}>
                  {label}
                </button>
              ))}
            </div>
          )}

          <div style={{ flex:1, overflow:'auto', padding:'16px 20px' }}>
            {preview ? (
              <div style={{ fontSize:14, lineHeight:1.8, color:'#CBD5E1' }} dangerouslySetInnerHTML={{ __html: renderMd(activeNote.content) }} />
            ) : (
              <textarea ref={textareaRef} value={activeNote.content}
                onChange={e=>updateNote(activeNote.id,{content:e.target.value})}
                placeholder={'# 제목\n\n내용을 작성하세요...\n\n마크다운 지원:\n**굵게**, *이탤릭*, `코드`\n- [ ] 체크리스트\n---'}
                style={{ width:'100%', height:'100%', background:'none', border:'none', outline:'none', color:'#CBD5E1', fontSize:14, lineHeight:1.8, resize:'none', fontFamily:"'DM Mono',monospace" }} />
            )}
          </div>

          <div style={{ padding:'5px 16px', borderTop:'1px solid rgba(255,255,255,0.04)', fontSize:11, color:'#4A5568', display:'flex', gap:14 }}>
            <span>글자: {activeNote.content.replace(/\s/g,'').length}</span>
            <span>단어: {activeNote.content.trim() ? activeNote.content.trim().split(/\s+/).length : 0}</span>
            <span>줄: {activeNote.content.split('\n').length}</span>
          </div>
        </div>
      ) : (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#4A5568' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:10 }}>📄</div>
            <div>새 노트를 만들어보세요</div>
          </div>
        </div>
      )}
    </div>
  )
}
