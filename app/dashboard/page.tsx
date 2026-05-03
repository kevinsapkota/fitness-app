'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import { Problem } from '@/types/problem'

const LeafletMapWrapper = dynamic(
  () => import('./components/LeafletMapWrapper'),
  { ssr: false }
)

type Gravidade = 1 | 2 | 3
type Filter    = 'all' | '1' | '2' | '3'
type SortKey   = 'recente' | 'gravidade' | 'confirmacoes'
type ViewMode  = 'todos' | 'meus'
type FormMode  = 'criar' | 'editar' | null

interface ProblemExt extends Problem {
  user_id?:      string
  resolved?:     boolean
  is_anonymous?: boolean
  user_name?:    string
}

const i18n = {
  pt: {
    tagline:        'MELHORA A TUA CIDADE',
    navDashboard:   'Dashboard',
    navAnalytics:   'Análise',
    navReports:     'Relatórios',
    systemActive:   'sistema ativo',
    newProblem:     '+ Novo problema',
    allProblems:    'Todos',
    myProblems:     'Os meus',
    statTotal:      'Total',
    statConf:       'Confirmações',
    statCrit:       'Críticos',
    statProblems:   'problemas',
    statVotes:      'votos',
    statHighRisk:   'alto risco',
    searchPh:       'Pesquisar...',
    filterAll:      'Todos',
    filterHigh:     'Alto',
    filterMed:      'Médio',
    filterLow:      'Baixo',
    sortLabel:      'Ordenar:',
    sortRecente:    'Mais recente',
    sortGrav:       'Gravidade',
    sortConf:       'Confirmações',
    confirm:        'Confirmar',
    edit:           'Editar',
    remove:         'Remover',
    detailEmpty:    '← seleciona um problema para ver detalhes',
    detailLoc:      'Localização',
    detailConf:     'Confirmações',
    detailSev:      'Gravidade',
    detailScore:    'Vibrancy Score',
    detailVotes:    'votos',
    sevHigh:        'Alto',
    sevMed:         'Médio',
    sevLow:         'Baixo',
    clickHint:      'Clica no mapa para marcar a localização',
    locMarked:      'Localização marcada',
    formCreate:     'Registar problema urbano',
    formEdit:       'Editar problema',
    fName:          'Nome',
    fDesc:          'Descrição',
    fLoc:           'Localização',
    fSev:           'Gravidade',
    fNamePh:        'ex: Buraco no passeio',
    fDescPh:        'Descreve o problema...',
    fLocPh:         'Clica no mapa para marcar o local',
    cancel:         'Cancelar',
    save:           'Guardar alterações',
    register:       'Registar problema',
    saving:         'A guardar...',
    markFirst:      'Marca o local primeiro',
    noResults:      'sem resultados',
    occurrences:    'ocorrências',
    statsTitle:     'Estatísticas detalhadas',
    statsClose:     'Fechar',
    statsAvg:       'Média de confirmações',
    statsHighPct:   '% gravidade alta',
    allZones:       'todas as zonas',
    mine:           'meu',
    ofTotal:        'do total',
    sevDist:        'distribuição por gravidade',
    errCreate:      'Erro ao criar problema. Verifica se todos os campos estão preenchidos e se a tua sessão está ativa.',
    errEdit:        'Erro ao editar o problema.',
    fillFields:     'Preenche o nome e a descrição.',
    pickLocation:   'Clica no mapa para escolher a localização.',
    useMyLocation:  'Usar minha localização',
    anonymous:      'Publicar como anónimo',
    anonLabel:      'Anónimo',
  },
  en: {
    tagline:        'collaborative urban map',
    navDashboard:   'Dashboard',
    navAnalytics:   'Analytics',
    navReports:     'Reports',
    systemActive:   'system active',
    newProblem:     '+ New problem',
    allProblems:    'All',
    myProblems:     'Mine',
    statTotal:      'Total',
    statConf:       'Confirmations',
    statCrit:       'Critical',
    statProblems:   'problems',
    statVotes:      'votes',
    statHighRisk:   'high risk',
    searchPh:       'Search...',
    filterAll:      'All',
    filterHigh:     'High',
    filterMed:      'Medium',
    filterLow:      'Low',
    sortLabel:      'Sort:',
    sortRecente:    'Most recent',
    sortGrav:       'Severity',
    sortConf:       'Confirmations',
    confirm:        'Confirm',
    edit:           'Edit',
    remove:         'Remove',
    detailEmpty:    '← select a problem to see details',
    detailLoc:      'Location',
    detailConf:     'Confirmations',
    detailSev:      'Severity',
    detailScore:    'Vibrancy Score',
    detailVotes:    'votes',
    sevHigh:        'High',
    sevMed:         'Medium',
    sevLow:         'Low',
    clickHint:      'Click the map to mark the location',
    locMarked:      'Location marked',
    formCreate:     'Register urban problem',
    formEdit:       'Edit problem',
    fName:          'Name',
    fDesc:          'Description',
    fLoc:           'Location',
    fSev:           'Severity',
    fNamePh:        'e.g. Broken pavement',
    fDescPh:        'Describe the problem...',
    fLocPh:         'Click the map to mark the location',
    cancel:         'Cancel',
    save:           'Save changes',
    register:       'Register problem',
    saving:         'Saving...',
    markFirst:      'Mark location first',
    noResults:      'no results',
    occurrences:    'occurrences',
    statsTitle:     'Detailed statistics',
    statsClose:     'Close',
    statsAvg:       'Avg. confirmations',
    statsHighPct:   '% high severity',
    allZones:       'all zones',
    mine:           'mine',
    ofTotal:        'of total',
    sevDist:        'severity distribution',
    errCreate:      'Error creating problem. Check all fields and your session.',
    errEdit:        'Error editing problem.',
    fillFields:     'Fill in the name and description.',
    pickLocation:   'Click the map to choose a location.',
    useMyLocation:  'Use my location',
    anonymous:      'Publish as anonymous',
    anonLabel:      'Anonymous',
  },
}

function getVibrancy(p: Problem) {
  return Math.min(100, Math.round(p.confirmacoes * 5 + p.gravidade * 10))
}

function SevDot({ g, size = 9 }: { g: number; size?: number }) {
  const c = g === 3 ? '#DC2626' : g === 2 ? '#D97706' : '#059669'
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      background: c, display: 'inline-block', flexShrink: 0,
      marginTop: size === 9 ? 5 : 0,
    }} />
  )
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'pt' } }
    )
    const data = await res.json()
    return (
      data.address?.road   ||
      data.address?.suburb ||
      data.address?.city   ||
      `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    )
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  }
}

export default function DashboardPage() {

  const [lang, setLang]                     = useState<'pt' | 'en'>('pt')
  const t = i18n[lang]

  const [problems,          setProblems]         = useState<ProblemExt[]>([])
  const [currentUserId,     setCurrentUserId]     = useState<string | null>(null)
  const [currentUserName,   setCurrentUserName]   = useState<string | null>(null)
  const [userConfirmations, setUserConfirmations] = useState<string[]>([])
  const [loading,           setLoading]           = useState(false)
  const [formMode,          setFormMode]          = useState<FormMode>(null)
  const [editingId,         setEditingId]         = useState<string | null>(null)
  const [selectedId,        setSelectedId]        = useState<string | null>(null)
  const [activeFilter,      setActiveFilter]      = useState<Filter>('all')
  const [sortKey,           setSortKey]           = useState<SortKey>('recente')
  const [viewMode,          setViewMode]          = useState<ViewMode>('todos')
  const [search,            setSearch]            = useState('')
  const [showStats,         setShowStats]         = useState(false)
  const [previewPin,        setPreviewPin]        = useState<{ lat: number; lng: number } | null>(null)
  const [activeNav,         setActiveNav]         = useState('dashboard')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const emptyForm = {
    name: '', description: '', location: '',
    gravidade:    1 as Gravidade,
    lat:          null as number | null,
    lng:          null as number | null,
    is_anonymous: false,
  }
  const [form, setForm] = useState(emptyForm)

  // ── Auth ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null)
      setCurrentUserName(data.user?.user_metadata?.full_name ?? null)
    })
  }, [])

  // ── Fetch confirmações ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return
    const load = async () => {
      const { data } = await supabase
        .from('confirmations').select('problem_id').eq('user_id', currentUserId)
      setUserConfirmations(data?.map((d: { problem_id: string }) => d.problem_id) || [])
    }
    load()
  }, [currentUserId])

  // ── Fetch problems ─────────────────────────────────────────────────────────
  const fetchProblems = useCallback(async () => {
    const { data } = await supabase
      .from('problems').select('*').order('created_at', { ascending: false })
    setProblems((data as ProblemExt[]) || [])
  }, [])

  useEffect(() => { fetchProblems() }, [fetchProblems])

  // ── Criar ──────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (form.name.trim().length < 3)         { alert('Nome demasiado curto'); return }
    if (form.description.trim().length < 10) { alert('Descrição muito curta'); return }
    if (!form.lat || !form.lng)              { alert(t.pickLocation); return }

    setLoading(true)
    const locationName = await reverseGeocode(form.lat, form.lng)

    const payload = {
      name:            form.name.trim(),
      description:     form.description.trim(),
      location:        locationName,
      latitude:        form.lat,
      longitude:       form.lng,
      gravidade:       form.gravidade,
      confirmacoes:    0,
      validated_level: 1,
      user_id:         currentUserId,
      user_name:       form.is_anonymous ? null : (currentUserName ?? null),
      is_anonymous:    form.is_anonymous,
    }

    const { data, error } = await supabase.from('problems').insert([payload]).select()

    if (error) {
      console.error('Supabase create error:', JSON.stringify(error, null, 2))
      alert('Erro: ' + (error?.message || 'unknown'))
      setLoading(false)
      return
    }
    if (data) setProblems(prev => [(data[0] as ProblemExt), ...prev])
    setLoading(false)
    closeForm()
  }

  // ── Editar ─────────────────────────────────────────────────────────────────
  const handleEdit = async () => {
    if (!editingId || !form.name.trim() || !form.description.trim()) {
      alert(t.fillFields); return
    }
    setLoading(true)
    const updates: Partial<ProblemExt> = {
      name: form.name.trim(), description: form.description.trim(), gravidade: form.gravidade,
    }
    if (form.lat && form.lng) {
      updates.latitude  = form.lat
      updates.longitude = form.lng
      updates.location  = await reverseGeocode(form.lat, form.lng)
    }
    const { error } = await supabase.from('problems').update(updates).eq('id', editingId)
    if (error) { console.error(error); alert(t.errEdit); setLoading(false); return }
    setProblems(prev => prev.map(p => p.id === editingId ? { ...p, ...updates } : p))
    setLoading(false)
    closeForm()
  }

  // ── Apagar ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres remover este problema?')) return
    await supabase.from('problems').delete().eq('id', id)
    setProblems(prev => prev.filter(p => p.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  // ── Confirmar ──────────────────────────────────────────────────────────────
  const handleConfirm = async (id: string) => {
    if (!currentUserId) { alert('Tens de estar autenticado'); return }

    const { data: existing } = await supabase
      .from('confirmations').select('*')
      .eq('user_id', currentUserId).eq('problem_id', id).single()

    if (existing) {
      setUserConfirmations(prev => prev.includes(id) ? prev : [...prev, id])
      return
    }

    const { error: insertError } = await supabase
      .from('confirmations').insert({ user_id: currentUserId, problem_id: id })

    if (insertError) { console.error(insertError); return }

    const p = problems.find(x => x.id === id)
    if (!p) return
    const n = p.confirmacoes + 1
    await supabase.from('problems').update({ confirmacoes: n }).eq('id', id)
    setProblems(prev => prev.map(x => x.id === id ? { ...x, confirmacoes: n } : x))
    setUserConfirmations(prev => [...prev, id])
  }

  // ── Formulário ─────────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(emptyForm); setEditingId(null); setPreviewPin(null); setFormMode('criar')
  }

  const openEdit = (p: ProblemExt) => {
    setForm({
      name: p.name, description: p.description, location: p.location ?? '',
      gravidade: p.gravidade as Gravidade,
      lat: p.latitude ?? null, lng: p.longitude ?? null,
      is_anonymous: p.is_anonymous ?? false,
    })
    setEditingId(p.id)
    setPreviewPin(p.latitude && p.longitude ? { lat: p.latitude, lng: p.longitude } : null)
    setFormMode('editar')
  }

  const closeForm = () => {
    setFormMode(null); setEditingId(null); setPreviewPin(null); setForm(emptyForm)
  }

  // ── Clique no mapa ─────────────────────────────────────────────────────────
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (!formMode) return
    setPreviewPin({ lat, lng })
    setForm(prev => ({ ...prev, lat, lng, location: '' }))
  }, [formMode])

  // ── Clique num pin — seleciona e abre sidebar no mobile ────────────────────
  const handlePinClick = useCallback((id: string) => {
    setSelectedId(id)
    setMobileSidebarOpen(true)
  }, [])

  // ── Localização do dispositivo ─────────────────────────────────────────────
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) { alert('Geolocalização não suportada.'); return }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPreviewPin({ lat: coords.latitude, lng: coords.longitude })
        setForm(prev => ({ ...prev, lat: coords.latitude, lng: coords.longitude }))
      },
      () => alert('Não foi possível obter a localização.')
    )
  }

  // ── Lista filtrada + ordenada ──────────────────────────────────────────────
  const filtered = useMemo<ProblemExt[]>(() => {
    const list = problems.filter(p => {
      const matchView = viewMode === 'todos' || p.user_id === currentUserId
      const matchF    = activeFilter === 'all' || p.gravidade === parseInt(activeFilter)
      const locStr    = p.location ?? ''
      const matchQ    = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        locStr.toLowerCase().includes(search.toLowerCase())
      return matchView && matchF && matchQ
    })
    return [...list].sort((a, b) => {
      if (sortKey === 'gravidade')    return b.gravidade - a.gravidade
      if (sortKey === 'confirmacoes') return b.confirmacoes - a.confirmacoes
      return 0
    })
  }, [problems, viewMode, currentUserId, activeFilter, search, sortKey])

  const selected  = problems.find(p => p.id === selectedId) ?? null
  const totalConf = filtered.reduce((a, p) => a + p.confirmacoes, 0)
  const totalCrit = filtered.filter(p => p.gravidade === 3).length
  const sevLabel  = (g: number) => g === 3 ? t.sevHigh : g === 2 ? t.sevMed : t.sevLow

  const mono = "'DM Mono', monospace"
  const body = "'DM Sans', sans-serif"

  const inputSt: React.CSSProperties = {
    width: '100%', fontFamily: body, fontSize: 15,
    padding: '11px 14px', border: '1px solid #d1d5db', borderRadius: 10,
    background: '#f9fafb', color: '#111827', outline: 'none', resize: 'none', lineHeight: 1.55,
  }

  const labelSt: React.CSSProperties = {
    fontSize: 12, letterSpacing: '0.07em', textTransform: 'uppercase',
    color: '#6b7280', marginBottom: 7, display: 'block', fontFamily: mono,
  }

  const actionSt: React.CSSProperties = {
    fontFamily: body, fontSize: 13, fontWeight: 400, padding: '5px 13px',
    borderRadius: 7, border: '1px solid #e5e7eb', background: '#ffffff',
    color: '#6b7280', cursor: 'pointer', transition: 'all 0.15s',
  }

  // ── Conteúdo da sidebar (partilhado desktop + mobile drawer) ───────────────
  const SidebarContent = (
    <>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
        {([['todos',t.allProblems],['meus',t.myProblems]] as [ViewMode,string][]).map(([k,l]) => (
          <button key={k} className="sv-tab" onClick={() => setViewMode(k)} style={{
            flex: 1, fontFamily: body, fontSize: 15, fontWeight: 400,
            padding: '13px 0', border: 'none', cursor: 'pointer', background: 'transparent',
            color:        viewMode === k ? '#1A56DB' : '#9ca3af',
            borderBottom: viewMode === k ? '2px solid #1A56DB' : '2px solid transparent',
            marginBottom: -1,
          }}>{l}</button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: '#e5e7eb', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
        {[
          { label: t.statTotal, value: filtered.length, sub: t.statProblems, color: undefined },
          { label: t.statConf,  value: totalConf,       sub: t.statVotes,    color: '#059669' },
          { label: t.statCrit,  value: totalCrit,       sub: t.statHighRisk, color: '#DC2626' },
        ].map(s => (
          <div key={s.label} className="sv-stat-cell" style={{ background: '#ffffff', padding: '13px 12px 11px' }}>
            <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4, fontFamily: mono }}>{s.label}</div>
            <div className="sv-stat-num" style={{ fontFamily: mono, fontSize: 22, fontWeight: 500, color: s.color ?? '#111827', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="sv-filters" style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPh}
            style={{ ...inputSt, paddingLeft: 32, fontSize: 13 }} className="sv-drawer-input" />
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {([['all',t.filterAll,null],['3',t.filterHigh,'#DC2626'],['2',t.filterMed,'#D97706'],['1',t.filterLow,'#059669']] as [Filter,string,string|null][]).map(([f,label,dot]) => {
            const active = activeFilter === f
            const ac: Record<string,{bg:string;border:string;color:string}> = {
              all:{bg:'#EFF6FF',border:'#1A56DB',color:'#1A56DB'},
              '3':{bg:'#FEF2F2',border:'#DC2626',color:'#DC2626'},
              '2':{bg:'#FFFBEB',border:'#D97706',color:'#D97706'},
              '1':{bg:'#ECFDF5',border:'#059669',color:'#059669'},
            }
            return (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                fontFamily: body, fontSize: 12, padding: '4px 11px', borderRadius: 20,
                border: `1px solid ${active ? ac[f].border : '#e5e7eb'}`,
                background: active ? ac[f].bg : '#ffffff',
                color:      active ? ac[f].color : '#6b7280',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s',
              }}>
                {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block' }}/>}
                {label}
              </button>
            )
          })}
        </div>
        <div className="sv-sort-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: mono, fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>{t.sortLabel}</span>
          <div style={{ display: 'flex', gap: 3 }}>
            {([['recente',t.sortRecente],['gravidade',t.sortGrav],['confirmacoes',t.sortConf]] as [SortKey,string][]).map(([k,l]) => (
              <button key={k} className="sv-sort" onClick={() => setSortKey(k)} style={{
                fontFamily: body, fontSize: 12, padding: '3px 9px', borderRadius: 7,
                border: '1px solid #e5e7eb',
                background: sortKey === k ? '#f3f4f6' : '#ffffff',
                color:      sortKey === k ? '#111827' : '#9ca3af',
                cursor: 'pointer',
              }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 32, fontSize: 13, color: '#9ca3af', fontFamily: mono }}>{t.noResults}</div>
        )}
        {filtered.map((p, idx) => {
          const vib              = getVibrancy(p)
          const isSelected       = selectedId === p.id
          const isOwner          = p.user_id === currentUserId
          const sevColor         = p.gravidade === 3 ? '#DC2626' : p.gravidade === 2 ? '#D97706' : '#059669'
          const edge             = isSelected ? '#1A56DB' : '#e5e7eb'
          const alreadyConfirmed = userConfirmations.includes(p.id)
          const authorLabel      = p.is_anonymous ? t.anonLabel : (p.user_name ?? null)
          return (
            <div key={p.id} className="sv-card"
              onClick={() => setSelectedId(isSelected ? null : p.id)}
              style={{
                background:   isSelected ? '#f0f7ff' : '#ffffff',
                borderTop:    `1px solid ${edge}`,
                borderRight:  `1px solid ${edge}`,
                borderBottom: `1px solid ${edge}`,
                borderLeft:   `3px solid ${sevColor}`,
                borderRadius: 10, padding: '11px 12px', cursor: 'pointer',
                animation: `slideIn 0.18s ease ${idx * 0.02}s both`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 5 }}>
                <SevDot g={p.gravidade} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.3, color: '#111827', marginBottom: (isOwner || authorLabel) ? 3 : 0 }}>
                    {p.name}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {isOwner && <span style={{ fontFamily: mono, fontSize: 10, color: '#1A56DB', background: '#EFF6FF', borderRadius: 4, padding: '1px 5px', border: '1px solid #BFDBFE' }}>{t.mine}</span>}
                    {authorLabel && <span style={{ fontFamily: mono, fontSize: 10, color: '#6b7280', background: '#f9fafb', borderRadius: 4, padding: '1px 5px', border: '1px solid #e5e7eb' }}>{authorLabel}</span>}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, marginBottom: 7, paddingLeft: 17 }}>{p.description}</div>
              <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 17, marginBottom: 7 }}>
                <span style={{ fontFamily: mono, fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 2C5.24 2 3 4.24 3 7c0 4 5 8 5 8s5-4 5-8c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  {p.location ?? '—'}
                </span>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 36, height: 3, background: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${vib}%`, height: '100%', background: '#1A56DB', borderRadius: 2 }}/>
                  </div>
                  <span style={{ fontFamily: mono, fontSize: 10, color: '#9ca3af' }}>{vib}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 5, paddingLeft: 17, paddingTop: 7, borderTop: '1px solid #f3f4f6', alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="sv-btn-confirm" onClick={e => { e.stopPropagation(); handleConfirm(p.id) }}
                  disabled={alreadyConfirmed}
                  style={{ ...actionSt, background: alreadyConfirmed?'#ECFDF5':'#ffffff', color: alreadyConfirmed?'#059669':'#6b7280', border: alreadyConfirmed?'1px solid #059669':'1px solid #e5e7eb', cursor: alreadyConfirmed?'not-allowed':'pointer', opacity: alreadyConfirmed?0.85:1 }}>
                  {alreadyConfirmed ? 'Confirmado' : t.confirm}
                </button>
                {isOwner && <button className="sv-btn-edit" onClick={e => { e.stopPropagation(); openEdit(p) }} style={actionSt}>{t.edit}</button>}
                {isOwner && <button className="sv-btn-delete" onClick={e => { e.stopPropagation(); handleDelete(p.id) }} style={actionSt}>{t.remove}</button>}
                <div style={{ fontFamily: mono, fontSize: 11, padding: '3px 9px', borderRadius: 6, background: '#f9fafb', color: '#9ca3af', border: '1px solid #e5e7eb', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                    <path d="M2 10l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {p.confirmacoes}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )

  // ── Formulário ─────────────────────────────────────────────────────────────
  const FormContent = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>
          {formMode === 'criar' ? t.formCreate : t.formEdit}
        </div>
        <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 24, lineHeight: 1, padding: '0 4px' }}>×</button>
      </div>

      <div>
        <label style={labelSt}>{t.fName}</label>
        <input placeholder={t.fNamePh} value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          style={inputSt} className="sv-drawer-input" />
      </div>

      <div>
        <label style={labelSt}>{t.fDesc}</label>
        <textarea rows={3} placeholder={t.fDescPh} value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          style={inputSt} className="sv-drawer-input" />
      </div>

      <div>
        <label style={labelSt}>{t.fLoc}</label>
        <div style={{
          padding: '10px 13px',
          border: `1px solid ${previewPin ? '#059669' : '#d1d5db'}`,
          borderRadius: 10,
          background: previewPin ? '#ECFDF5' : '#f9fafb',
          fontSize: 13, fontFamily: mono,
          color: previewPin ? '#059669' : '#9ca3af',
          minHeight: 42, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
        }}>
          {previewPin ? (
            <>
              <span style={{ flex: 1 }}>{previewPin.lat.toFixed(5)}, {previewPin.lng.toFixed(5)}</span>
              <button onClick={() => { setPreviewPin(null); setForm(p => ({ ...p, lat: null, lng: null, location: '' })) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#059669', fontSize: 18, lineHeight: 1 }}>×</button>
            </>
          ) : (
            <span>{t.fLocPh}</span>
          )}
        </div>
        <button className="sv-loc-btn" onClick={handleUseMyLocation}
          style={{ marginTop: 6, fontSize: 12, color: '#1A56DB', background: 'none', border: 'none', cursor: 'pointer', fontFamily: body, padding: 0 }}>
          {t.useMyLocation}
        </button>
      </div>

      <div>
        <label style={labelSt}>{t.fSev}</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {([
            [1, t.sevLow,  '#059669', '#ECFDF5'],
            [2, t.sevMed,  '#D97706', '#FFFBEB'],
            [3, t.sevHigh, '#DC2626', '#FEF2F2'],
          ] as [Gravidade, string, string, string][]).map(([v, label, border, bg]) => (
            <button key={v} onClick={() => setForm({ ...form, gravidade: v })} style={{
              flex: 1, padding: '9px 0', borderRadius: 9,
              border: `1px solid ${form.gravidade === v ? border : '#e5e7eb'}`,
              background: form.gravidade === v ? bg : '#ffffff',
              color: form.gravidade === v ? border : '#9ca3af',
              cursor: 'pointer', fontFamily: body, fontSize: 14, transition: 'all 0.15s',
            }}>{label}</button>
          ))}
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6b7280', cursor: 'pointer', fontFamily: body }}>
        <input type="checkbox" checked={form.is_anonymous}
          onChange={e => setForm({ ...form, is_anonymous: e.target.checked })}
          style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#1A56DB' }} />
        {t.anonymous}
      </label>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={closeForm} style={{
          flex: 1, padding: '11px 0', fontFamily: body, fontSize: 15,
          border: '1px solid #e5e7eb', borderRadius: 9, background: '#ffffff', color: '#6b7280', cursor: 'pointer',
        }}>{t.cancel}</button>
        <button
          onClick={formMode === 'criar' ? handleCreate : handleEdit}
          disabled={loading || (formMode === 'criar' && !previewPin)}
          style={{
            flex: 2, padding: '11px 0', fontFamily: body, fontSize: 15, fontWeight: 500,
            border: 'none', borderRadius: 9,
            background: (loading || (formMode === 'criar' && !previewPin)) ? '#93BBFD' : '#1A56DB',
            color: '#ffffff',
            cursor: (loading || (formMode === 'criar' && !previewPin)) ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {loading ? t.saving : formMode === 'editar' ? t.save : !previewPin ? t.markFirst : t.register}
        </button>
      </div>
    </>
  )

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', fontFamily: body, background: '#f9fafb', color: '#111827' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        @keyframes sheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        .sv-card { transition: border-color 0.15s, background 0.15s; }
        .sv-card:hover { border-color: #9ca3af !important; }
        .sv-btn-confirm:hover { background:#ECFDF5!important; border-color:#059669!important; color:#059669!important; }
        .sv-btn-edit:hover    { background:#EFF6FF!important; border-color:#1A56DB!important; color:#1A56DB!important; }
        .sv-btn-delete:hover  { background:#FEF2F2!important; border-color:#DC2626!important; color:#DC2626!important; }
        .sv-tab  { transition: all 0.15s; }
        .sv-sort { transition: background 0.15s; }
        .sv-sort:hover { background: #f3f4f6!important; }
        .sv-drawer-input:focus { border-color: #1A56DB!important; outline: none; }
        .sv-loc-btn:hover { text-decoration: underline; }
        .sv-logo-link { text-decoration: none; }
        .sv-logo-link:focus { outline: none; }

        /* ── Mobile sidebar slide-in ──────────────────────────────────── */
        .sv-mobile-sidebar {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 75%;
          max-width: 340px;
          background: #ffffff;
          z-index: 700;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 4px 0 24px rgba(0,0,0,0.18);
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(0.32,0.72,0,1);
        }
        .sv-mobile-sidebar.open { transform: translateX(0); }

        .sv-mobile-sidebar-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.38);
          z-index: 699;
          opacity: 0; pointer-events: none;
          transition: opacity 0.25s ease;
        }
        .sv-mobile-sidebar-overlay.open { opacity: 1; pointer-events: all; }

        /* FAB hover */
        .sv-fab-list:hover { transform: scale(1.07); box-shadow: 0 6px 20px rgba(26,86,219,0.45) !important; }
        .sv-fab-list:active { transform: scale(0.97); }

        /* ════ MOBILE ≤ 768px ══════════════════════════════════════════ */
        @media (max-width: 768px) {
          .sv-topbar { padding: 0 14px !important; height: 50px !important; gap: 10px !important; }
          .sv-nav-center { display: none !important; }
          .sv-right-desktop { display: none !important; }
          .sv-logo-sub { display: none !important; }
          .sv-logo-name { font-size: 15px !important; }
          .sv-sidebar-desktop { display: none !important; }
          .sv-body { flex-direction: column !important; }
          .sv-main { flex: 1 !important; min-height: 0 !important; }
          .sv-detail { display: none !important; }
          .sv-sort-row { display: none !important; }
          .sv-stat-num { font-size: 18px !important; }
          .sv-stat-cell { padding: 10px 10px 8px !important; }
          .sv-filters { padding: 8px 10px !important; gap: 7px !important; }
          .sv-desktop-drawer { display: none !important; }
          /* Subbar mais compacta */
          .sv-subbar { padding: 5px 12px !important; }
        }

        /* ════ DESKTOP > 768px ═════════════════════════════════════════ */
        @media (min-width: 769px) {
          .sv-mobile-new-btn { display: none !important; }
          .sv-mobile-sheet-overlay { display: none !important; }
          .sv-mobile-bottom-sheet { display: none !important; }
          .sv-mobile-sidebar { display: none !important; }
          .sv-mobile-sidebar-overlay { display: none !important; }
          .sv-fab-list { display: none !important; }
        }
      `}</style>

      {/* ══════════════════════════ TOP BAR ══════════════════════════════ */}
      <div className="sv-topbar" style={{
        display: 'flex', alignItems: 'center', padding: '0 24px', height: 58,
        background: '#ffffff', borderBottom: '1px solid #e5e7eb', flexShrink: 0, gap: 16, zIndex: 10,
      }}>
        {/* Logo → home */}
        <a href="/" className="sv-logo-link" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src="/logo.png" style={{ height: 44, borderRadius: 9, display: 'block' }} alt="StreetViz"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none'
                const p = e.currentTarget.parentElement
                if (p) {
                  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
                  s.setAttribute('width','24'); s.setAttribute('height','24')
                  s.setAttribute('viewBox','0 0 16 16'); s.setAttribute('fill','none')
                  s.innerHTML = '<rect x="2" y="9" width="3" height="5" rx="1" fill="#1A56DB"/><rect x="6.5" y="5" width="3" height="9" rx="1" fill="#1A56DB"/><rect x="11" y="2" width="3" height="12" rx="1" fill="#1A56DB"/>'
                  p.appendChild(s)
                }
              }}
            />
          </div>
          <div>
            <div className="sv-logo-name" style={{ fontFamily: mono, fontSize: 17, fontWeight: 500, letterSpacing: '0.03em', lineHeight: 1.1, color: '#111827' }}>
              Street<span style={{ color: '#1A56DB' }}>Viz</span>
            </div>
            <div className="sv-logo-sub" style={{ fontFamily: mono, fontSize: 10, color: '#9ca3af', letterSpacing: '0.05em' }}>
              {t.tagline}
            </div>
          </div>
        </a>

        {/* Nav — desktop only */}
        <div className="sv-nav-center" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 1, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 11, padding: 3 }}>
            {([['dashboard',t.navDashboard],['analytics',t.navAnalytics],['reports',t.navReports]] as [string,string][]).map(([k,l]) => (
              <button key={k} className="sv-tab" onClick={() => setActiveNav(k)} style={{
                fontFamily: body, fontSize: 14, fontWeight: 400, padding: '6px 22px',
                border: 'none', borderRadius: 8, cursor: 'pointer',
                background: activeNav === k ? '#1A56DB' : 'transparent',
                color:      activeNav === k ? '#ffffff' : '#6b7280',
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Direita — desktop only */}
        <div className="sv-right-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          <div style={{ display: 'flex', gap: 1, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, padding: 2 }}>
            {(['pt','en'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                fontFamily: mono, fontSize: 11, padding: '3px 9px', border: 'none', borderRadius: 6, cursor: 'pointer',
                background: lang === l ? '#ffffff' : 'transparent',
                color:      lang === l ? '#111827' : '#9ca3af',
                fontWeight: lang === l ? 500 : 400,
              }}>{l.toUpperCase()}</button>
            ))}
          </div>
          <button onClick={() => setShowStats(true)} style={{ fontSize: 15, padding: '6px 12px', background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 9, cursor: 'pointer' }}>📊</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: mono, fontSize: 12, color: '#059669', background: '#ECFDF5', borderRadius: 20, padding: '4px 12px', border: '1px solid #A7F3D0' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            {t.systemActive}
          </div>
          <button onClick={openCreate} style={{ fontFamily: body, fontSize: 15, fontWeight: 500, padding: '8px 22px', background: '#1A56DB', color: '#ffffff', border: 'none', borderRadius: 9, cursor: 'pointer' }}>
            {t.newProblem}
          </button>
        </div>

        {/* Mobile: só botão novo à direita */}
        <div className="sv-mobile-new-btn" style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <button onClick={openCreate} style={{
            fontFamily: body, fontSize: 13, fontWeight: 500,
            padding: '7px 14px', background: '#1A56DB', color: '#ffffff',
            border: 'none', borderRadius: 8, cursor: 'pointer',
          }}>
            {t.newProblem}
          </button>
        </div>
      </div>

      {/* ══════════════════════════ BODY ═════════════════════════════════ */}
      <div className="sv-body" style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>

        {/* Desktop sidebar */}
        <div className="sv-sidebar-desktop" style={{
          width: 395, flexShrink: 0, background: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {SidebarContent}
        </div>

        {/* Main — mapa + detalhe */}
        <div className="sv-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Subbar */}
          <div className="sv-subbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 14px', background: '#ffffff', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
            <div style={{ fontFamily: mono, fontSize: 12, color: '#9ca3af' }}>
              Porto, PT &rsaquo; <span style={{ color: '#111827' }}>{t.allZones}</span>
            </div>
            <div style={{ fontFamily: mono, fontSize: 12, color: formMode?'#1A56DB':'#9ca3af', background: formMode?'#EFF6FF':'#f9fafb', border: `1px solid ${formMode?'#BFDBFE':'#e5e7eb'}`, borderRadius: 7, padding: '4px 11px', transition: 'all 0.2s' }}>
              {formMode ? (previewPin ? '✓ '+t.locMarked : t.clickHint) : `${filtered.length} ${t.occurrences}`}
            </div>
          </div>

          {/* Mapa — full no mobile */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0 }}>
            <LeafletMapWrapper
              problems={filtered}
              onMapClick={handleMapClick}
              clickEnabled={!!formMode}
              previewPin={previewPin}
              
            />
          </div>

          {/* Detalhe — só desktop */}
          <div className="sv-detail" style={{ height: 185, background: '#ffffff', borderTop: '1px solid #e5e7eb', padding: '14px 20px', flexShrink: 0, overflowY: 'auto' }}>
            {!selected ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 13, color: '#9ca3af', fontFamily: mono }}>{t.detailEmpty}</div>
            ) : (
              <div style={{ animation: 'fadeUp 0.2s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <SevDot g={selected.gravidade} size={10} />
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>{selected.name}</div>
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12, lineHeight: 1.55 }}>{selected.description}</div>
                <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', rowGap: 10 }}>
                  {[
                    {label:t.detailLoc,  value:selected.location??'—'},
                    {label:t.detailConf, value:`${selected.confirmacoes} ${t.detailVotes}`},
                    {label:t.detailSev,  value:sevLabel(selected.gravidade)},
                  ].map(f => (
                    <div key={f.label}>
                      <div style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', fontFamily: mono, marginBottom: 3 }}>{f.label}</div>
                      <div style={{ fontSize: 14, color: '#111827' }}>{f.value}</div>
                    </div>
                  ))}
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', fontFamily: mono, marginBottom: 5 }}>{t.detailScore}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 72, height: 4, background: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${getVibrancy(selected)}%`, height: '100%', background: '#1A56DB', borderRadius: 2 }}/>
                      </div>
                      <span style={{ fontSize: 13, fontFamily: mono, color: '#111827' }}>{getVibrancy(selected)}/100</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop form drawer */}
        {formMode && (
          <div className="sv-desktop-drawer" style={{
            position: 'absolute', left: 395, bottom: 0,
            width: 350, zIndex: 400,
            background: '#ffffff',
            borderTop: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb',
            boxShadow: '4px -4px 24px rgba(0,0,0,0.10)',
            padding: '20px 18px 24px',
            display: 'flex', flexDirection: 'column', gap: 14,
            animation: 'fadeUp 0.22s ease',
            maxHeight: '80vh', overflowY: 'auto',
          }}>
            {FormContent}
          </div>
        )}
      </div>

      {/* ════ FAB — botão flutuante para abrir sidebar no mobile ═════════ */}
      <button
        className="sv-fab-list"
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Abrir lista de problemas"
        style={{
          position: 'fixed', bottom: 24, left: 20, zIndex: 600,
          width: 52, height: 52, borderRadius: '50%',
          background: '#1A56DB', color: '#ffffff',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(26,86,219,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8"  y1="6"  x2="21" y2="6"/>
          <line x1="8"  y1="12" x2="21" y2="12"/>
          <line x1="8"  y1="18" x2="21" y2="18"/>
          <line x1="3"  y1="6"  x2="3.01" y2="6"/>
          <line x1="3"  y1="12" x2="3.01" y2="12"/>
          <line x1="3"  y1="18" x2="3.01" y2="18"/>
        </svg>
      </button>

      {/* ════ MOBILE SIDEBAR OVERLAY ══════════════════════════════════════ */}
      <div
        className={`sv-mobile-sidebar-overlay${mobileSidebarOpen ? ' open' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
      />

      {/* ════ MOBILE SIDEBAR (desliza da esquerda, 75%) ══════════════════ */}
      <div className={`sv-mobile-sidebar${mobileSidebarOpen ? ' open' : ''}`}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderBottom: '1px solid #e5e7eb', flexShrink: 0,
        }}>
          <div style={{ fontFamily: mono, fontSize: 13, fontWeight: 500, color: '#111827' }}>
            Street<span style={{ color: '#1A56DB' }}>Viz</span>
            <span style={{ color: '#9ca3af', fontWeight: 400, marginLeft: 8 }}>· lista</span>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 24, lineHeight: 1, padding: '0 2px' }}
          >×</button>
        </div>
        {SidebarContent}
      </div>

      {/* ════ MOBILE BOTTOM SHEET (formulário) ═══════════════════════════ */}
      {formMode && (
        <>
          <div className="sv-mobile-sheet-overlay" onClick={closeForm} style={{
            position: 'fixed', inset: 0, zIndex: 500,
            background: 'rgba(0,0,0,0.35)',
            animation: 'fadeIn 0.2s ease',
          }} />
          <div className="sv-mobile-bottom-sheet" style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 600,
            background: '#ffffff',
            borderRadius: '18px 18px 0 0',
            boxShadow: '0 -4px 32px rgba(0,0,0,0.15)',
            padding: '16px 18px 32px',
            display: 'flex', flexDirection: 'column', gap: 13,
            maxHeight: '92vh', overflowY: 'auto',
            animation: 'sheetUp 0.28s cubic-bezier(0.32,0.72,0,1)',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e5e7eb', margin: '-4px auto 4px' }} />
            {FormContent}
          </div>
        </>
      )}

      {/* ════ MODAL ESTATÍSTICAS ══════════════════════════════════════════ */}
      {showStats && (
        <div onClick={e => e.target===e.currentTarget && setShowStats(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 800, background: 'rgba(0,0,0,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.15s ease', padding: 16 }}>
          <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 28, width: '100%', maxWidth: 500, animation: 'fadeUp 0.2s ease', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ fontSize: 17, fontWeight: 500, color: '#111827' }}>{t.statsTitle}</div>
              <button onClick={() => setShowStats(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 24, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {[
                {label:t.statTotal,    value:problems.length,  sub:t.statProblems, color:'#1A56DB', bg:'#EFF6FF'},
                {label:t.statsAvg,     value:problems.length?(problems.reduce((a,p)=>a+p.confirmacoes,0)/problems.length).toFixed(1):'0', sub:t.statVotes, color:'#059669', bg:'#ECFDF5'},
                {label:t.statCrit,     value:problems.filter(p=>p.gravidade===3).length, sub:t.statHighRisk, color:'#DC2626', bg:'#FEF2F2'},
                {label:t.statsHighPct, value:problems.length?Math.round(problems.filter(p=>p.gravidade===3).length/problems.length*100)+'%':'0%', sub:t.ofTotal, color:'#D97706', bg:'#FFFBEB'},
              ].map(s => (
                <div key={s.label} style={{ background:s.bg, borderRadius:12, padding:'16px', border:`1px solid ${s.color}22` }}>
                  <div style={{ fontSize:10, fontFamily:mono, letterSpacing:'0.07em', textTransform:'uppercase', color:s.color, marginBottom:8, opacity:0.8 }}>{s.label}</div>
                  <div style={{ fontFamily:mono, fontSize:28, fontWeight:500, color:s.color, lineHeight:1 }}>{s.value}</div>
                  <div style={{ fontSize:12, color:s.color, marginTop:4, opacity:0.7 }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:10, fontFamily:mono, color:'#9ca3af', marginBottom:12, letterSpacing:'0.06em', textTransform:'uppercase' }}>{t.sevDist}</div>
              {([
                [3,t.sevHigh,'#DC2626'],[2,t.sevMed,'#D97706'],[1,t.sevLow,'#059669'],
              ] as [number,string,string][]).map(([g,label,color]) => {
                const count = problems.filter(p=>p.gravidade===g).length
                const pct   = problems.length ? Math.round(count/problems.length*100) : 0
                return (
                  <div key={g} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                    <div style={{ width:44, fontSize:13, color:'#6b7280', fontFamily:body, flexShrink:0 }}>{label}</div>
                    <div style={{ flex:1, height:7, background:'#f3f4f6', borderRadius:4, overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:4, transition:'width 0.4s ease' }}/>
                    </div>
                    <div style={{ width:24, fontSize:13, fontFamily:mono, color:'#9ca3af', flexShrink:0 }}>{count}</div>
                  </div>
                )
              })}
            </div>
            <button onClick={() => setShowStats(false)} style={{ width:'100%', marginTop:10, padding:'11px 0', fontFamily:body, fontSize:14, border:'1px solid #e5e7eb', borderRadius:10, background:'#ffffff', color:'#6b7280', cursor:'pointer' }}>
              {t.statsClose}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}