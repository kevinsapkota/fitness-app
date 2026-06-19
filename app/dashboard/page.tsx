'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import { Problem } from '@/types/problem'

const LeafletMapWrapper = dynamic(
  () => import('./components/LeafletMapWrapper'),
  { ssr: false }
)

type Gravidade  = 1 | 2 | 3
type Filter     = 'all' | '1' | '2' | '3'
type SortKey    = 'recente' | 'gravidade' | 'confirmacoes'
type ViewMode   = 'todos' | 'meus'
type FormMode   = 'criar' | 'editar' | null
type Status     = 'ativo' | 'em_analise' | 'resolvido'
type Categoria  = 'buraco' | 'iluminacao' | 'lixo' | 'agua' | 'vandalismo' | 'vegetacao' | 'outro'
type Lang       = 'pt' | 'en'
type ActiveNav  = 'dashboard' | 'analytics' | 'reports'
type RightPanel = 'notif' | 'profile' | null

interface ProblemExt extends Problem {
  user_id?:      string
  is_anonymous?: boolean
  user_name?:    string
  photo_urls?:   string[]
  categoria?:    Categoria
  status?:       Status
  created_at?:   string
}

interface Notification {
  id:         string
  type:       'confirm' | 'new' | 'resolved' | 'comment'
  title:      string
  message:    string
  time:       string
  read:       boolean
  problemId?: string
}

const DS = {
  blue:        '#0A2FFF',
  blueDark:    '#0822D4',
  blueLight:   '#EEF2FF',
  blueBorder:  '#C7D2FE',
  red:         '#DC2626',
  redLight:    '#FEF2F2',
  redBorder:   '#FCA5A5',
  amber:       '#D97706',
  amberLight:  '#FFFBEB',
  amberBorder: '#FCD34D',
  green:       '#059669',
  greenLight:  '#ECFDF5',
  greenBorder: '#6EE7B7',
  bg:          '#F5F4F0',
  surface:     '#FFFFFF',
  surfaceWarm: '#FAFAF8',
  border:      '#E8E7E2',
  borderLight: '#F0EFE9',
  text:        '#0D1117',
  textSub:     '#5C6070',
  textMuted:   '#9098A8',
  textFaint:   '#B8BFCC',
  dark:        '#0A0F1E',
  darkSub:     '#1A2035',
  darkBorder:  '#2A3050',
  mono:        "'DM Mono', monospace",
  body:        "'Inter', sans-serif",
  rSm:         8,
  rMd:         10,
  rLg:         14,
  shadowSm:    '0 1px 4px rgba(0,0,0,0.05)',
  shadowMd:    '0 4px 20px rgba(0,0,0,0.07)',
  shadowLg:    '0 8px 40px rgba(0,0,0,0.10)',
  trans:       'all 0.18s ease',
}

const STRINGS = {
  pt: {
    tagline:          'MELHORA A TUA CIDADE',
    systemActive:     'sistema ativo',
    navDashboard:     'Dashboard',
    navAnalytics:     'Análise',
    navReports:       'Relatórios',
    newProblem:       'Reportar',
    tabAll:           'Todos',
    tabMine:          'Os meus',
    statTotal:        'Total',
    statConf:         'Confirmações',
    statCrit:         'Críticos',
    subProblems:      'ocorrências',
    subVotes:         'votos',
    subHighRisk:      'alto risco',
    searchPh:         'Pesquisar…',
    radiusLabel:      'Raio',
    radiusClear:      'Limpar',
    sevAll:           'Todos',
    sevHigh:          'Alto',
    sevMed:           'Médio',
    sevLow:           'Baixo',
    catAll:           'Todas',
    statusAll:        'Todos',
    sortLabel:        'Ordenar por',
    sortRecent:       'Mais recente',
    sortSev:          'Gravidade',
    sortConf:         'Confirmações',
    noResults:        'Sem resultados',
    noOccurrences:    'Sem ocorrências nesta área',
    tryFilters:       'Ajusta os filtros',
    beFirst:          'Sê o primeiro a reportar',
    createFirst:      'Criar ocorrência',
    selectHint:       'Seleciona uma ocorrência',
    detailLoc:        'Localização',
    detailConf:       'Confirmações',
    detailSev:        'Gravidade',
    detailScore:      'Score',
    detailVotes:      'votos',
    btnConfirm:       'Confirmar',
    btnConfirmed:     'Confirmado',
    btnEdit:          'Editar',
    btnRemove:        'Remover',
    anonLabel:        'Anónimo',
    mineLabel:        'meu',
    formCreate:       'Nova ocorrência',
    formEdit:         'Editar ocorrência',
    fieldCat:         'Categoria',
    fieldName:        'Título',
    fieldDesc:        'Descrição',
    fieldLoc:         'Localização',
    fieldSev:         'Gravidade',
    fieldStatus:      'Estado',
    fieldPhotos:      'Fotos (máx. 3)',
    namePh:           'ex: Buraco no passeio da Rua X',
    descPh:           'Descreve o problema com detalhe…',
    locPh:            'Clica no mapa para marcar',
    locMarked:        'Local marcado',
    clickHint:        'Clica no mapa',
    useMyLoc:         'Usar a minha localização',
    addPhoto:         'Adicionar foto',
    maxPhotos:        'Máximo atingido',
    publishAnon:      'Publicar como anónimo',
    btnCancel:        'Cancelar',
    btnSave:          'Guardar',
    btnRegister:      'Registar',
    btnMarkFirst:     'Marca primeiro o local',
    saving:           'A guardar…',
    uploading:        'A enviar…',
    occurrences:      'ocorrências',
    allZones:         'todas as zonas',
    myReports:        'Os meus reports',
    statsTitle:       'Estatísticas',
    statsClose:       'Fechar',
    statsAvg:         'Média confirmações',
    statsHighPct:     '% gravidade alta',
    statsOfTotal:     'do total',
    statsByCat:       'Por categoria',
    statsBySev:       'Por gravidade',
    profileSignOut:   'Sair',
    deleteConfirm:    'Remover esta ocorrência?',
    statusAtivo:      'Ativo',
    statusEmAnalise:  'Em análise',
    statusResolvido:  'Resolvido',
    catBuraco:        'Buraco',
    catIluminacao:    'Iluminação',
    catLixo:          'Lixo',
    catAgua:          'Água',
    catVandalismo:    'Vandalismo',
    catVegetacao:     'Vegetação',
    catOutro:         'Outro',
    noLocAuth:        'localização inativa',
    notifTitle:       'Notificações',
    notifEmpty:       'Sem notificações',
    notifMarkAll:     'Marcar todas como lidas',
    analyticsTitle:   'Análise',
    analyticsDesc:    'Estatísticas detalhadas das ocorrências',
    reportsTitle:     'Relatórios',
    reportsDesc:      'Exporta e gera relatórios',
    reportGenerate:   'Gerar relatório',
    reportExportCSV:  'CSV',
    reportExportJSON: 'JSON',
    reportPeriod:     'Período',
    reportLast7:      '7 dias',
    reportLast30:     '30 dias',
    reportLast90:     '90 dias',
    reportAllTime:    'Todo o tempo',
    trendUp:          'subida',
    trendDown:        'descida',
    avgResTime:       'Tempo médio de resolução',
    topAreas:         'Categorias com mais ocorrências',
    heatmapTitle:     'Distribuição por hora',
    weeklyTitle:      'Por semana',
    resolutionRate:   'Taxa de resolução',
    activeReporters:  'Reportadores ativos',
    filters:          'Filtros',
    severity:         'Gravidade',
    category:         'Categoria',
    status:           'Estado',
    radius:           'Raio de pesquisa',
    sort:             'Ordenação',
    mobileNavTitle:   'Ir para',
  },
  en: {
    tagline:          'IMPROVE YOUR CITY',
    systemActive:     'system active',
    navDashboard:     'Dashboard',
    navAnalytics:     'Analytics',
    navReports:       'Reports',
    newProblem:       'Report',
    tabAll:           'All',
    tabMine:          'Mine',
    statTotal:        'Total',
    statConf:         'Confirmations',
    statCrit:         'Critical',
    subProblems:      'reports',
    subVotes:         'votes',
    subHighRisk:      'high risk',
    searchPh:         'Search…',
    radiusLabel:      'Radius',
    radiusClear:      'Clear',
    sevAll:           'All',
    sevHigh:          'High',
    sevMed:           'Medium',
    sevLow:           'Low',
    catAll:           'All',
    statusAll:        'All',
    sortLabel:        'Sort by',
    sortRecent:       'Most recent',
    sortSev:          'Severity',
    sortConf:         'Confirmations',
    noResults:        'No results',
    noOccurrences:    'No reports in this area',
    tryFilters:       'Adjust filters',
    beFirst:          'Be the first to report',
    createFirst:      'Create report',
    selectHint:       'Select a report',
    detailLoc:        'Location',
    detailConf:       'Confirmations',
    detailSev:        'Severity',
    detailScore:      'Score',
    detailVotes:      'votes',
    btnConfirm:       'Confirm',
    btnConfirmed:     'Confirmed',
    btnEdit:          'Edit',
    btnRemove:        'Remove',
    anonLabel:        'Anonymous',
    mineLabel:        'mine',
    formCreate:       'New report',
    formEdit:         'Edit report',
    fieldCat:         'Category',
    fieldName:        'Title',
    fieldDesc:        'Description',
    fieldLoc:         'Location',
    fieldSev:         'Severity',
    fieldStatus:      'Status',
    fieldPhotos:      'Photos (max 3)',
    namePh:           'e.g. Broken pavement on X Street',
    descPh:           'Describe the problem in detail…',
    locPh:            'Click the map to mark',
    locMarked:        'Location marked',
    clickHint:        'Click the map',
    useMyLoc:         'Use my location',
    addPhoto:         'Add photo',
    maxPhotos:        'Max reached',
    publishAnon:      'Publish anonymously',
    btnCancel:        'Cancel',
    btnSave:          'Save',
    btnRegister:      'Submit',
    btnMarkFirst:     'Mark location first',
    saving:           'Saving…',
    uploading:        'Uploading…',
    occurrences:      'reports',
    allZones:         'all zones',
    myReports:        'My reports',
    statsTitle:       'Statistics',
    statsClose:       'Close',
    statsAvg:         'Avg confirmations',
    statsHighPct:     '% high severity',
    statsOfTotal:     'of total',
    statsByCat:       'By category',
    statsBySev:       'By severity',
    profileSignOut:   'Sign out',
    deleteConfirm:    'Remove this report?',
    statusAtivo:      'Active',
    statusEmAnalise:  'Under review',
    statusResolvido:  'Resolved',
    catBuraco:        'Pothole',
    catIluminacao:    'Lighting',
    catLixo:          'Waste',
    catAgua:          'Water',
    catVandalismo:    'Vandalism',
    catVegetacao:     'Vegetation',
    catOutro:         'Other',
    noLocAuth:        'location inactive',
    notifTitle:       'Notifications',
    notifEmpty:       'No notifications',
    notifMarkAll:     'Mark all as read',
    analyticsTitle:   'Analytics',
    analyticsDesc:    'Detailed report statistics',
    reportsTitle:     'Reports',
    reportsDesc:      'Export and generate reports',
    reportGenerate:   'Generate report',
    reportExportCSV:  'CSV',
    reportExportJSON: 'JSON',
    reportPeriod:     'Period',
    reportLast7:      '7 days',
    reportLast30:     '30 days',
    reportLast90:     '90 days',
    reportAllTime:    'All time',
    trendUp:          'increase',
    trendDown:        'decrease',
    avgResTime:       'Avg resolution time',
    topAreas:         'Top categories',
    heatmapTitle:     'Hourly distribution',
    weeklyTitle:      'Per week',
    resolutionRate:   'Resolution rate',
    activeReporters:  'Active reporters',
    filters:          'Filters',
    severity:         'Severity',
    category:         'Category',
    status:           'Status',
    radius:           'Search radius',
    sort:             'Sort',
    mobileNavTitle:   'Go to',
  },
}

const CAT_CFG: Record<Categoria, { color: string; bg: string; border: string; dot: string; icon: string }> = {
  buraco:     { color: DS.red,      bg: DS.redLight,    border: DS.redBorder,    dot: DS.red,      icon: '●' },
  iluminacao: { color: DS.amber,    bg: DS.amberLight,  border: DS.amberBorder,  dot: DS.amber,    icon: '◐' },
  lixo:       { color: '#065F46',   bg: '#ECFDF5',      border: '#6EE7B7',       dot: '#059669',   icon: '▲' },
  agua:       { color: '#0369A1',   bg: '#EFF6FF',      border: '#93C5FD',       dot: '#0284C7',   icon: '◆' },
  vandalismo: { color: '#6D28D9',   bg: '#F5F3FF',      border: '#C4B5FD',       dot: '#7C3AED',   icon: '■' },
  vegetacao:  { color: '#166534',   bg: '#F0FDF4',      border: '#86EFAC',       dot: '#16A34A',   icon: '◉' },
  outro:      { color: DS.textSub,  bg: DS.bg,          border: DS.border,       dot: DS.textMuted, icon: '○' },
}

const STATUS_CFG: Record<Status, { color: string; bg: string; border: string }> = {
  ativo:      { color: DS.red,   bg: DS.redLight,   border: DS.redBorder   },
  em_analise: { color: DS.amber, bg: DS.amberLight, border: DS.amberBorder },
  resolvido:  { color: DS.green, bg: DS.greenLight, border: DS.greenBorder },
}

function getVibrancy(p: Problem): number {
  return Math.min(100, Math.round(p.confirmacoes * 5 + p.gravidade * 10))
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R    = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a    = Math.sin(dLat / 2) ** 2
    + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistanceLabel(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`
}

function timeAgo(iso?: string, lang: Lang = 'pt'): string {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60)    return lang === 'pt' ? 'agora' : 'now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}min`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'pt' } }
    )
    const data = await res.json()
    return data.address?.road
      || data.address?.suburb
      || data.address?.city
      || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  }
}

async function uploadPhotos(files: File[]): Promise<string[]> {
  const urls: string[] = []
  for (const file of files) {
    const ext      = file.name.split('.').pop() || 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage
      .from('problem-photos')
      .upload(filename, file, { cacheControl: '3600', upsert: false })
    if (error) { console.error(error); continue }
    const { data } = supabase.storage.from('problem-photos').getPublicUrl(filename)
    urls.push(data.publicUrl)
  }
  return urls
}

function generateCSV(problems: ProblemExt[]): string {
  const headers = ['ID', 'Nome', 'Descrição', 'Localização', 'Latitude', 'Longitude', 'Gravidade', 'Categoria', 'Estado', 'Confirmações', 'Data']
  const rows    = problems.map(p => [
    p.id,
    `"${p.name.replace(/"/g, '""')}"`,
    `"${p.description.replace(/"/g, '""')}"`,
    `"${(p.location ?? '').replace(/"/g, '""')}"`,
    p.latitude ?? '',
    p.longitude ?? '',
    p.gravidade,
    p.categoria ?? '',
    p.status ?? '',
    p.confirmacoes,
    p.created_at ?? '',
  ])
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function SkeletonCard() {
  return (
    <div className="sv-skeleton-card">
      <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
        <div className="sv-skel sv-skel-dot" />
        <div style={{ flex: 1 }}>
          <div className="sv-skel" style={{ height: 11, width: '58%', marginBottom: 6 }} />
          <div style={{ display: 'flex', gap: 5 }}>
            <div className="sv-skel" style={{ height: 16, width: 48 }} />
            <div className="sv-skel" style={{ height: 16, width: 40 }} />
          </div>
        </div>
      </div>
      <div className="sv-skel" style={{ height: 9, marginBottom: 4 }} />
      <div className="sv-skel" style={{ height: 9, width: '65%' }} />
    </div>
  )
}

function StatusDot({ color, pulse = false }: { color: string; pulse?: boolean }) {
  return (
    <span className={`sv-dot${pulse ? ' sv-dot-pulse' : ''}`} style={{ background: color }} />
  )
}

function Tag({ label, color, bg, border }: { label: string; color: string; bg: string; border: string }) {
  return (
    <span className="sv-tag" style={{ color, background: bg, borderColor: border }}>
      {label}
    </span>
  )
}

interface FilterRowProps {
  label:    string
  children: React.ReactNode
}
function FilterRow({ label, children }: FilterRowProps) {
  return (
    <div className="sv-filter-row">
      <span className="sv-filter-label">{label}</span>
      <div className="sv-filter-controls">{children}</div>
    </div>
  )
}

interface SegmentProps {
  options:  { value: string; label: string; dot?: string }[]
  value:    string
  onChange: (v: string) => void
}
function Segment({ options, value, onChange }: SegmentProps) {
  return (
    <div className="sv-segment">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`sv-segment-btn${value === opt.value ? ' active' : ''}`}
        >
          {opt.dot && <span className="sv-segment-dot" style={{ background: value === opt.value ? opt.dot : DS.textFaint }} />}
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function AnimatedNumber({ value, duration = 700 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const start = useRef(0)
  const raf   = useRef<number>(0)

  useEffect(() => {
    const startVal  = start.current
    const startTime = performance.now()
    const animate   = (now: number) => {
      const p    = Math.min((now - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(startVal + (value - startVal) * ease))
      if (p < 1) raf.current = requestAnimationFrame(animate)
      else start.current = value
    }
    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [value, duration])

  return <>{display}</>
}

function DonutChart({ segments, size = 96, label }: { segments: { value: number; color: string; label: string }[]; size?: number; label?: string }) {
  const total  = segments.reduce((s, d) => s + d.value, 0) || 1
  const stroke = size * 0.16
  const r      = (size - stroke) / 2
  const circ   = 2 * Math.PI * r
  let   offset = 0

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={DS.borderLight} strokeWidth={stroke} />
        {segments.map((s, i) => {
          const pct  = s.value / total
          const dash = pct * circ
          const gap  = circ - dash
          const el   = <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={s.color} strokeWidth={stroke} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset * circ} opacity={0.88} style={{ transition: 'stroke-dasharray 0.5s ease' }} />
          offset += pct
          return el
        })}
      </svg>
      {label && (
        <div className="sv-donut-label">
          <span style={{ fontFamily: DS.mono, fontSize: size * 0.17, fontWeight: 500, color: DS.text }}>{label}</span>
        </div>
      )}
    </div>
  )
}

function ProgressRing({ pct, color, size = 56 }: { pct: number; color: string; size?: number }) {
  const stroke = 5
  const r      = (size - stroke) / 2
  const circ   = 2 * Math.PI * r
  const dash   = (pct / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={DS.borderLight} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.7s cubic-bezier(0.34,1.56,0.64,1)' }} />
    </svg>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="sv-field-label">{children}</div>
}

export default function DashboardPage() {
  const [lang, setLang] = useState<Lang>('pt')
  const t = STRINGS[lang]

  const [currentUserId,    setCurrentUserId]    = useState<string | null>(null)
  const [currentUserName,  setCurrentUserName]  = useState<string | null>(null)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)

  const [problems,          setProblems]          = useState<ProblemExt[]>([])
  const [userConfirmations, setUserConfirmations] = useState<string[]>([])
  const [loadingData,       setLoadingData]       = useState(true)

  const [notifications, setNotifications] = useState<Notification[]>([])
  const unreadCount = notifications.filter(n => !n.read).length

  const [rightPanel, setRightPanel] = useState<RightPanel>(null)

  const [formMode,           setFormMode]          = useState<FormMode>(null)
  const [editingId,          setEditingId]         = useState<string | null>(null)
  const [saving,             setSaving]            = useState(false)
  const [uploadingPhotos,    setUploadingPhotos]   = useState(false)
  const [previewPin,         setPreviewPin]        = useState<{ lat: number; lng: number } | null>(null)
  const [photoFiles,         setPhotoFiles]        = useState<File[]>([])
  const [photoPreviews,      setPhotoPreviews]     = useState<string[]>([])
  const [photoUrlsExisting,  setPhotoUrlsExisting] = useState<string[]>([])
  const photoInputRef = useRef<HTMLInputElement>(null)

  const emptyForm = {
    name:         '',
    description:  '',
    location:     '',
    gravidade:    1 as Gravidade,
    lat:          null as number | null,
    lng:          null as number | null,
    is_anonymous: false,
    categoria:    'outro' as Categoria,
    status:       'ativo' as Status,
  }
  const [form, setForm] = useState(emptyForm)

  const [selectedId,        setSelectedId]       = useState<string | null>(null)
  const [expandedId,        setExpandedId]       = useState<string | null>(null)
  const [activeFilter,      setActiveFilter]     = useState<Filter>('all')
  const [catFilter,         setCatFilter]        = useState<Categoria | 'all'>('all')
  const [statusFilter,      setStatusFilter]     = useState<Status | 'all'>('all')
  const [sortKey,           setSortKey]          = useState<SortKey>('recente')
  const [viewMode,          setViewMode]         = useState<ViewMode>('todos')
  const [search,            setSearch]           = useState('')
  const [showStats,         setShowStats]        = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen]= useState(false)
  const [mobileNavOpen,     setMobileNavOpen]    = useState(false)
  const [activeNav,         setActiveNav]        = useState<ActiveNav>('dashboard')
  const [sidebarCollapsed,  setSidebarCollapsed] = useState(false)
  const [radiusKm,          setRadiusKm]         = useState<number | null>(null)
  const [showRadiusPicker,  setShowRadiusPicker] = useState(false)
  const [userLocation,      setUserLocation]     = useState<{ lat: number; lng: number } | null>(null)
  const [reportPeriod,      setReportPeriod]     = useState<'7' | '30' | '90' | 'all'>('30')
  const [generatingReport,  setGeneratingReport] = useState(false)
  const [reportGenerated,   setReportGenerated]  = useState(false)
  const [hoveredCard,       setHoveredCard]      = useState<string | null>(null)
  const [toast,             setToast]            = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null)
      setCurrentUserName(data.user?.user_metadata?.full_name ?? null)
      setCurrentUserEmail(data.user?.email ?? null)
    })
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => setUserLocation({ lat: coords.latitude, lng: coords.longitude }),
        () => {}
      )
    }
  }, [])

  useEffect(() => {
    if (!currentUserId) return
    supabase.from('confirmations').select('problem_id').eq('user_id', currentUserId)
      .then(({ data }) => setUserConfirmations(data?.map((d: { problem_id: string }) => d.problem_id) || []))
  }, [currentUserId])

  const fetchProblems = useCallback(async () => {
    setLoadingData(true)
    const { data } = await supabase.from('problems').select('*').order('created_at', { ascending: false })
    setProblems((data as ProblemExt[]) || [])
    setLoadingData(false)
  }, [])

  useEffect(() => { fetchProblems() }, [fetchProblems])

  useEffect(() => {
    const channel = supabase
      .channel('problems-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'problems' }, (payload) => {
        const p = payload.new as ProblemExt
        setProblems(prev => [p, ...prev])
        setNotifications(prev => [{
          id:      `n-${Date.now()}`,
          type:    'new',
          title:   lang === 'pt' ? 'Nova ocorrência' : 'New report',
          message: p.name,
          time:    new Date().toISOString(),
          read:    false,
        }, ...prev])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'problems' }, (payload) => {
        const p = payload.new as ProblemExt
        setProblems(prev => prev.map(x => x.id === p.id ? { ...x, ...p } : x))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'problems' }, (payload) => {
        setProblems(prev => prev.filter(x => x.id !== payload.old.id))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [lang])

  const resolutionPct = useMemo(() => {
    if (!problems.length) return 0
    return Math.round(problems.filter(p => p.status === 'resolvido').length / problems.length * 100)
  }, [problems])

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const slots = 3 - (photoUrlsExisting.length + photoPreviews.length)
    if (slots <= 0) return
    const toAdd = files.slice(0, slots)
    setPhotoFiles(prev => [...prev, ...toAdd])
    setPhotoPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))])
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  const removeNewPhoto      = (i: number) => { URL.revokeObjectURL(photoPreviews[i]); setPhotoPreviews(p => p.filter((_, j) => j !== i)); setPhotoFiles(p => p.filter((_, j) => j !== i)) }
  const removeExistingPhoto = (i: number) => setPhotoUrlsExisting(p => p.filter((_, j) => j !== i))
  const totalPhotos = photoUrlsExisting.length + photoPreviews.length

  const handleCreate = async () => {
    if (form.name.trim().length < 3)         { showToast(lang === 'pt' ? 'Título demasiado curto' : 'Title too short', 'error'); return }
    if (form.description.trim().length < 10) { showToast(lang === 'pt' ? 'Descrição muito curta' : 'Description too short', 'error'); return }
    if (!form.lat || !form.lng)              { showToast(lang === 'pt' ? 'Clica no mapa para escolher a localização' : 'Click the map to choose a location', 'error'); return }
    setSaving(true)
    let photoUrls: string[] = []
    if (photoFiles.length > 0) { setUploadingPhotos(true); photoUrls = await uploadPhotos(photoFiles); setUploadingPhotos(false) }
    const locationName = await reverseGeocode(form.lat, form.lng)
    const payload = { name: form.name.trim(), description: form.description.trim(), location: locationName, latitude: form.lat, longitude: form.lng, gravidade: form.gravidade, confirmacoes: 0, validated_level: 1, user_id: currentUserId, user_name: form.is_anonymous ? null : (currentUserName ?? null), is_anonymous: form.is_anonymous, photo_urls: photoUrls, categoria: form.categoria, status: form.status }
    const { data, error } = await supabase.from('problems').insert([payload]).select()
    if (error) { console.error(error); showToast('Erro: ' + (error?.message || 'unknown'), 'error'); setSaving(false); return }
    if (data) setProblems(prev => [(data[0] as ProblemExt), ...prev])
    showToast(lang === 'pt' ? 'Ocorrência registada!' : 'Report submitted!', 'success')
    setSaving(false)
    closeForm()
  }

  const handleEdit = async () => {
    if (!editingId || !form.name.trim() || !form.description.trim()) { showToast(lang === 'pt' ? 'Preenche o título e descrição' : 'Fill in title and description', 'error'); return }
    setSaving(true)
    let newUrls: string[] = []
    if (photoFiles.length > 0) { setUploadingPhotos(true); newUrls = await uploadPhotos(photoFiles); setUploadingPhotos(false) }
    const allPhotoUrls = [...photoUrlsExisting, ...newUrls]
    const updates: Partial<ProblemExt> = { name: form.name.trim(), description: form.description.trim(), gravidade: form.gravidade, photo_urls: allPhotoUrls, categoria: form.categoria, status: form.status }
    if (form.lat && form.lng) { updates.latitude = form.lat; updates.longitude = form.lng; updates.location = await reverseGeocode(form.lat, form.lng) }
    const { error } = await supabase.from('problems').update(updates).eq('id', editingId)
    if (error) { console.error(error); showToast('Erro ao guardar', 'error'); setSaving(false); return }
    setProblems(prev => prev.map(p => p.id === editingId ? { ...p, ...updates } : p))
    showToast(lang === 'pt' ? 'Alterações guardadas' : 'Changes saved', 'success')
    setSaving(false)
    closeForm()
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return
    await supabase.from('problems').delete().eq('id', id)
    setProblems(prev => prev.filter(p => p.id !== id))
    if (selectedId === id) setSelectedId(null)
    if (expandedId === id) setExpandedId(null)
    showToast(lang === 'pt' ? 'Ocorrência removida' : 'Report removed', 'info')
  }

  const handleConfirm = async (id: string) => {
    if (!currentUserId) { showToast(lang === 'pt' ? 'Inicia sessão para confirmar' : 'Sign in to confirm', 'info'); return }
    const { data: existing } = await supabase.from('confirmations').select('*').eq('user_id', currentUserId).eq('problem_id', id).single()
    if (existing) { setUserConfirmations(prev => prev.includes(id) ? prev : [...prev, id]); return }
    const { error } = await supabase.from('confirmations').insert({ user_id: currentUserId, problem_id: id })
    if (error) return
    const p = problems.find(x => x.id === id)
    if (!p) return
    const n = p.confirmacoes + 1
    await supabase.from('problems').update({ confirmacoes: n }).eq('id', id)
    setProblems(prev => prev.map(x => x.id === id ? { ...x, confirmacoes: n } : x))
    setUserConfirmations(prev => [...prev, id])
    showToast(lang === 'pt' ? 'Confirmação registada' : 'Confirmation registered', 'success')
  }

  const handleStatusChange = async (id: string, status: Status) => {
    await supabase.from('problems').update({ status }).eq('id', id)
    setProblems(prev => prev.map(p => p.id === id ? { ...p, status } : p))
    showToast(lang === 'pt' ? 'Estado atualizado' : 'Status updated', 'success')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const markRead    = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

  const handleExportCSV  = () => { downloadFile(generateCSV(filteredForReport), `streetviz-${Date.now()}.csv`, 'text/csv'); showToast('CSV exportado', 'success') }
  const handleExportJSON = () => { downloadFile(JSON.stringify(filteredForReport, null, 2), `streetviz-${Date.now()}.json`, 'application/json'); showToast('JSON exportado', 'success') }

  const handleGenerateReport = async () => {
    setGeneratingReport(true)
    await new Promise(r => setTimeout(r, 1800))
    setGeneratingReport(false)
    setReportGenerated(true)
    showToast(lang === 'pt' ? 'Relatório gerado' : 'Report generated', 'success')
    setTimeout(() => setReportGenerated(false), 3000)
  }

  const filteredForReport = useMemo(() => {
    const now    = Date.now()
    const days   = reportPeriod === '7' ? 7 : reportPeriod === '30' ? 30 : reportPeriod === '90' ? 90 : Infinity
    const cutoff = now - days * 24 * 60 * 60 * 1000
    return problems.filter(p => !p.created_at || new Date(p.created_at).getTime() >= cutoff)
  }, [problems, reportPeriod])

  const openCreate = () => {
    setForm(emptyForm); setEditingId(null); setPreviewPin(null); setPhotoFiles([]); setPhotoPreviews([]); setPhotoUrlsExisting([]); setFormMode('criar'); setActiveNav('dashboard')
  }

  const openEdit = (p: ProblemExt) => {
    setForm({ name: p.name, description: p.description, location: p.location ?? '', gravidade: p.gravidade as Gravidade, lat: p.latitude ?? null, lng: p.longitude ?? null, is_anonymous: p.is_anonymous ?? false, categoria: p.categoria ?? 'outro', status: p.status ?? 'ativo' })
    setEditingId(p.id); setPreviewPin(p.latitude && p.longitude ? { lat: p.latitude, lng: p.longitude } : null); setPhotoFiles([]); setPhotoPreviews([]); setPhotoUrlsExisting(p.photo_urls ?? []); setFormMode('editar'); setActiveNav('dashboard')
  }

  const closeForm = () => {
    photoPreviews.forEach(u => URL.revokeObjectURL(u))
    setFormMode(null); setEditingId(null); setPreviewPin(null); setForm(emptyForm); setPhotoFiles([]); setPhotoPreviews([]); setPhotoUrlsExisting([])
  }

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (!formMode) return
    setPreviewPin({ lat, lng })
    setForm(prev => ({ ...prev, lat, lng, location: '' }))
  }, [formMode])

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setPreviewPin({ lat: coords.latitude, lng: coords.longitude }); setForm(prev => ({ ...prev, lat: coords.latitude, lng: coords.longitude })) },
      () => showToast(lang === 'pt' ? 'Localização não disponível' : 'Location unavailable', 'error')
    )
  }

  const filtered = useMemo<ProblemExt[]>(() => {
    const list = problems.filter(p => {
      const matchView   = viewMode === 'todos' || p.user_id === currentUserId
      const matchF      = activeFilter === 'all' || p.gravidade === parseInt(activeFilter)
      const matchCat    = catFilter === 'all' || p.categoria === catFilter
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      const matchQ      = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.location ?? '').toLowerCase().includes(search.toLowerCase())
      const matchRadius = !radiusKm || !userLocation || !p.latitude || !p.longitude ? true : getDistanceKm(userLocation.lat, userLocation.lng, p.latitude, p.longitude) <= radiusKm
      return matchView && matchF && matchCat && matchStatus && matchQ && matchRadius
    })
    return [...list].sort((a, b) => {
      if (sortKey === 'gravidade')    return b.gravidade - a.gravidade
      if (sortKey === 'confirmacoes') return b.confirmacoes - a.confirmacoes
      return 0
    })
  }, [problems, viewMode, currentUserId, activeFilter, catFilter, statusFilter, search, sortKey, radiusKm, userLocation])

  const selected  = problems.find(p => p.id === selectedId) ?? null
  const totalConf = filtered.reduce((a, p) => a + p.confirmacoes, 0)
  const totalCrit = filtered.filter(p => p.gravidade === 3).length

  function catLabel(cat?: Categoria): string {
    const map: Record<Categoria, string> = { buraco: t.catBuraco, iluminacao: t.catIluminacao, lixo: t.catLixo, agua: t.catAgua, vandalismo: t.catVandalismo, vegetacao: t.catVegetacao, outro: t.catOutro }
    return map[cat ?? 'outro'] ?? t.catOutro
  }

  function statusLabel(s?: Status): string {
    const map: Record<Status, string> = { ativo: t.statusAtivo, em_analise: t.statusEmAnalise, resolvido: t.statusResolvido }
    return map[s ?? 'ativo'] ?? t.statusAtivo
  }

  function sevLabel(g: number): string {
    return g === 3 ? t.sevHigh : g === 2 ? t.sevMed : t.sevLow
  }

  const goToNav = (nav: ActiveNav) => {
    setActiveNav(nav)
    setMobileNavOpen(false)
    setMobileSidebarOpen(false)
  }

  const PhotoSection = (
    <div>
      <FieldLabel>{t.fieldPhotos}</FieldLabel>
      {(photoUrlsExisting.length > 0 || photoPreviews.length > 0) && (
        <div className="sv-photo-grid">
          {photoUrlsExisting.map((url, i) => (
            <div key={`ex-${i}`} className="sv-photo-thumb">
              <img src={url} alt="" />
              <button className="sv-photo-remove" onClick={() => removeExistingPhoto(i)}>×</button>
            </div>
          ))}
          {photoPreviews.map((url, i) => (
            <div key={`new-${i}`} className="sv-photo-thumb sv-photo-thumb--new">
              <img src={url} alt="" />
              <button className="sv-photo-remove" onClick={() => removeNewPhoto(i)}>×</button>
            </div>
          ))}
        </div>
      )}
      {totalPhotos < 3 ? (
        <>
          <input ref={photoInputRef} type="file" accept="image/*" capture="environment" multiple style={{ display: 'none' }} onChange={handlePhotoSelect} />
          <button className="sv-photo-add" onClick={() => photoInputRef.current?.click()}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            {t.addPhoto}
            <span className="sv-photo-count">{totalPhotos}/3</span>
          </button>
        </>
      ) : (
        <p className="sv-photo-max">{t.maxPhotos}</p>
      )}
    </div>
  )

  const FormContent = (
    <>
      <div className="sv-form-header">
        <span className="sv-form-title">{formMode === 'criar' ? t.formCreate : t.formEdit}</span>
        <button className="sv-icon-close" onClick={closeForm}>×</button>
      </div>

      <div>
        <FieldLabel>{t.fieldCat}</FieldLabel>
        <div className="sv-cat-grid">
          {(Object.keys(CAT_CFG) as Categoria[]).map(cat => {
            const cfg    = CAT_CFG[cat]
            const active = form.categoria === cat
            return (
              <button
                key={cat}
                onClick={() => setForm(f => ({ ...f, categoria: cat }))}
                className={`sv-cat-btn${active ? ' active' : ''}`}
                style={active ? { borderColor: cfg.border, background: cfg.bg, color: cfg.color } : {}}
              >
                <span className="sv-cat-icon" style={{ color: active ? cfg.color : DS.textFaint }}>{cfg.icon}</span>
                {catLabel(cat)}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <FieldLabel>{t.fieldName}</FieldLabel>
        <input className="sv-input" placeholder={t.namePh} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
      </div>

      <div>
        <FieldLabel>{t.fieldDesc}</FieldLabel>
        <textarea className="sv-input sv-textarea" rows={3} placeholder={t.descPh} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      </div>

      <div>
        <FieldLabel>{t.fieldLoc}</FieldLabel>
        <div className={`sv-loc-display${previewPin ? ' sv-loc-display--set' : ''}`}>
          {previewPin ? (
            <>
              <span className="sv-loc-coords">{previewPin.lat.toFixed(5)}, {previewPin.lng.toFixed(5)}</span>
              <button className="sv-loc-clear" onClick={() => { setPreviewPin(null); setForm(p => ({ ...p, lat: null, lng: null, location: '' })) }}>×</button>
            </>
          ) : <span>{t.locPh}</span>}
        </div>
        <button className="sv-loc-use-me" onClick={handleUseMyLocation}>{t.useMyLoc}</button>
      </div>

      <div>
        <FieldLabel>{t.fieldSev}</FieldLabel>
        <div className="sv-sev-row">
          {([[1, t.sevLow, DS.green, DS.greenLight, DS.greenBorder], [2, t.sevMed, DS.amber, DS.amberLight, DS.amberBorder], [3, t.sevHigh, DS.red, DS.redLight, DS.redBorder]] as [Gravidade, string, string, string, string][]).map(([v, label, color, bg, border]) => (
            <button
              key={v}
              onClick={() => setForm({ ...form, gravidade: v })}
              className={`sv-sev-btn${form.gravidade === v ? ' active' : ''}`}
              style={form.gravidade === v ? { borderColor: border, background: bg, color } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {formMode === 'editar' && (
        <div>
          <FieldLabel>{t.fieldStatus}</FieldLabel>
          <div className="sv-sev-row">
            {(['ativo', 'em_analise', 'resolvido'] as Status[]).map(s => {
              const cfg    = STATUS_CFG[s]
              const active = form.status === s
              return (
                <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                  className={`sv-sev-btn${active ? ' active' : ''}`}
                  style={active ? { borderColor: cfg.border, background: cfg.bg, color: cfg.color } : {}}>
                  {statusLabel(s)}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {PhotoSection}

      <label className="sv-anon-check">
        <input type="checkbox" checked={form.is_anonymous} onChange={e => setForm({ ...form, is_anonymous: e.target.checked })} />
        {t.publishAnon}
      </label>

      <div className="sv-form-actions">
        <button className="sv-btn sv-btn--ghost" onClick={closeForm}>{t.btnCancel}</button>
        <button
          className="sv-btn sv-btn--primary"
          onClick={formMode === 'criar' ? handleCreate : handleEdit}
          disabled={saving || (formMode === 'criar' && !previewPin)}
        >
          {uploadingPhotos ? t.uploading : saving ? t.saving : formMode === 'editar' ? t.btnSave : !previewPin ? t.btnMarkFirst : t.btnRegister}
        </button>
      </div>
    </>
  )

  const AnalyticsPanel = (
    <div className="sv-panel-scroll">
      <div className="sv-panel-header">
        <h2 className="sv-panel-title">{t.analyticsTitle}</h2>
        <p className="sv-panel-sub">{t.analyticsDesc}</p>
      </div>

      <div className="sv-kpi-row">
        {[
          { label: t.statTotal,      value: problems.length,                                 color: DS.blue  },
          { label: t.statConf,       value: problems.reduce((a, p) => a + p.confirmacoes, 0), color: DS.green },
          { label: t.statCrit,       value: problems.filter(p => p.gravidade === 3).length,   color: DS.red   },
          { label: t.resolutionRate, value: resolutionPct + '%',                               color: DS.amber },
        ].map((kpi, i) => (
          <div key={i} className="sv-kpi">
            <div className="sv-kpi-accent" style={{ background: kpi.color }} />
            <span className="sv-kpi-label">{kpi.label}</span>
            <span className="sv-kpi-value" style={{ color: kpi.color }}>
              {typeof kpi.value === 'number' ? <AnimatedNumber value={kpi.value} /> : kpi.value}
            </span>
          </div>
        ))}
      </div>

      <div className="sv-charts-row">
        <div className="sv-chart-card">
          <div className="sv-chart-title">{t.statsByCat}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 8 }}>
            <DonutChart
              segments={(Object.keys(CAT_CFG) as Categoria[]).map(cat => ({ value: problems.filter(p => p.categoria === cat).length, color: CAT_CFG[cat].dot, label: catLabel(cat) }))}
              size={88} label={`${problems.length}`}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {(Object.keys(CAT_CFG) as Categoria[]).slice(0, 5).map(cat => {
                const count = problems.filter(p => p.categoria === cat).length
                const pct   = problems.length ? Math.round(count / problems.length * 100) : 0
                return (
                  <div key={cat} className="sv-cat-legend-row">
                    <span className="sv-dot" style={{ background: CAT_CFG[cat].dot, flexShrink: 0 }} />
                    <span className="sv-cat-legend-name">{catLabel(cat)}</span>
                    <span className="sv-cat-legend-pct">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="sv-chart-card">
          <div className="sv-chart-title">{t.statsBySev}</div>
          {([[3, t.sevHigh, DS.red], [2, t.sevMed, DS.amber], [1, t.sevLow, DS.green]] as [number, string, string][]).map(([g, label, color]) => {
            const count = problems.filter(p => p.gravidade === g).length
            const pct   = problems.length ? Math.round(count / problems.length * 100) : 0
            return (
              <div key={g} className="sv-sev-row-stat">
                <span className="sv-sev-stat-label">{label}</span>
                <div className="sv-progress-track">
                  <div className="sv-progress-bar" style={{ width: `${pct}%`, background: color }} />
                </div>
                <span className="sv-sev-stat-count">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="sv-chart-card sv-chart-card--center">
        <div className="sv-chart-title" style={{ alignSelf: 'flex-start' }}>{t.resolutionRate}</div>
        <div style={{ position: 'relative', margin: '8px 0' }}>
          <ProgressRing pct={resolutionPct} color={DS.green} size={80} />
          <div className="sv-ring-center">
            <span style={{ fontFamily: DS.mono, fontSize: 18, fontWeight: 500, color: DS.green }}>{resolutionPct}%</span>
          </div>
        </div>
        <span className="sv-ring-sub">{problems.filter(p => p.status === 'resolvido').length}/{problems.length} {t.subProblems}</span>
      </div>

      <div className="sv-table-card">
        <div className="sv-table-head">{t.topAreas}</div>
        {(Object.keys(CAT_CFG) as Categoria[])
          .map(cat => ({ cat, count: problems.filter(p => p.categoria === cat).length, conf: problems.filter(p => p.categoria === cat).reduce((a, p) => a + p.confirmacoes, 0) }))
          .sort((a, b) => b.count - a.count).slice(0, 5)
          .map((row, i) => {
            const cfg = CAT_CFG[row.cat]
            return (
              <div key={row.cat} className="sv-table-row">
                <span className="sv-table-rank">#{i + 1}</span>
                <span className="sv-table-dot" style={{ color: cfg.color }}>{cfg.icon}</span>
                <span className="sv-table-name">{catLabel(row.cat)}</span>
                <Tag label={`${row.count}`} color={cfg.color} bg={cfg.bg} border={cfg.border} />
                <span className="sv-table-conf">{row.conf} ✓</span>
              </div>
            )
          })}
      </div>
    </div>
  )

  const ReportsPanel = (
    <div className="sv-panel-scroll">
      <div className="sv-panel-header">
        <h2 className="sv-panel-title">{t.reportsTitle}</h2>
        <p className="sv-panel-sub">{t.reportsDesc}</p>
      </div>

      <div className="sv-chart-card">
        <FieldLabel>{t.reportPeriod}</FieldLabel>
        <div className="sv-period-row">
          {([['7', t.reportLast7], ['30', t.reportLast30], ['90', t.reportLast90], ['all', t.reportAllTime]] as ['7'|'30'|'90'|'all', string][]).map(([v, label]) => (
            <button key={v} onClick={() => setReportPeriod(v)}
              className={`sv-period-btn${reportPeriod === v ? ' active' : ''}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="sv-report-stats">
        {[
          { label: t.statTotal,        value: filteredForReport.length,                                           color: DS.blue  },
          { label: t.statCrit,         value: filteredForReport.filter(p => p.gravidade === 3).length,            color: DS.red   },
          { label: t.statusResolvido,  value: filteredForReport.filter(p => p.status === 'resolvido').length,     color: DS.green },
        ].map((s, i) => (
          <div key={i} className="sv-report-stat">
            <span className="sv-report-stat-label">{s.label}</span>
            <span className="sv-report-stat-value" style={{ color: s.color }}><AnimatedNumber value={s.value} /></span>
          </div>
        ))}
      </div>

      <div className="sv-chart-card">
        <FieldLabel>Export</FieldLabel>
        <div className="sv-export-row">
          <button className="sv-btn sv-btn--ghost sv-btn--sm" onClick={handleExportCSV}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            {t.reportExportCSV}
          </button>
          <button className="sv-btn sv-btn--ghost sv-btn--sm" onClick={handleExportJSON}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            {t.reportExportJSON}
          </button>
          <button className="sv-btn sv-btn--primary sv-btn--sm" onClick={handleGenerateReport} disabled={generatingReport}
            style={reportGenerated ? { background: DS.green } : {}}>
            {generatingReport
              ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: 'sv-spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> {lang === 'pt' ? 'A gerar…' : 'Generating…'}</>
              : reportGenerated ? <>✓ {lang === 'pt' ? 'Gerado' : 'Done'}</>
              : t.reportGenerate}
          </button>
        </div>
      </div>

      <div className="sv-table-card">
        <div className="sv-table-head">{filteredForReport.length} {t.subProblems}</div>
        <div className="sv-report-list">
          {filteredForReport.length === 0 ? (
            <div className="sv-empty-state">{t.noResults}</div>
          ) : filteredForReport.map((p, i) => {
            const catCfg    = CAT_CFG[p.categoria ?? 'outro']
            const statusCfg = STATUS_CFG[p.status ?? 'ativo']
            return (
              <div key={p.id} className="sv-report-list-row" style={{ animationDelay: `${i * 0.02}s` }}>
                <span style={{ color: catCfg.color, fontSize: 10 }}>{catCfg.icon}</span>
                <span className="sv-report-list-name">{p.name}</span>
                <Tag label={statusLabel(p.status)} color={statusCfg.color} bg={statusCfg.bg} border={statusCfg.border} />
                <Tag label={sevLabel(p.gravidade)} color={p.gravidade === 3 ? DS.red : p.gravidade === 2 ? DS.amber : DS.green} bg={p.gravidade === 3 ? DS.redLight : p.gravidade === 2 ? DS.amberLight : DS.greenLight} border={p.gravidade === 3 ? DS.redBorder : p.gravidade === 2 ? DS.amberBorder : DS.greenBorder} />
                <span className="sv-report-list-time">{timeAgo(p.created_at, lang)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const SidebarContent = (
    <>
      <div className="sv-tabs">
        {([['todos', t.tabAll], ['meus', t.tabMine]] as [ViewMode, string][]).map(([k, label]) => (
          <button key={k} onClick={() => setViewMode(k)} className={`sv-tab${viewMode === k ? ' active' : ''}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="sv-stats-row">
        {[
          { label: t.statTotal, value: filtered.length,  sub: t.subProblems, color: DS.text  },
          { label: t.statConf,  value: totalConf,        sub: t.subVotes,    color: DS.green },
          { label: t.statCrit,  value: totalCrit,        sub: t.subHighRisk, color: DS.red   },
        ].map((s, i) => (
          <div key={s.label} className="sv-stat" style={{ borderRight: i < 2 ? `1px solid ${DS.borderLight}` : 'none' }}>
            <span className="sv-stat-label">{s.label}</span>
            <span className="sv-stat-num" style={{ color: s.color }}><AnimatedNumber value={s.value} /></span>
            <span className="sv-stat-sub">{s.sub}</span>
          </div>
        ))}
      </div>

      <div className="sv-filters-block">
        <div className="sv-search-wrap">
          <svg className="sv-search-icon" width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input className="sv-search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPh} />
          {search && <button className="sv-search-clear" onClick={() => setSearch('')}>×</button>}
        </div>

        <FilterRow label={t.severity}>
          <Segment
            value={activeFilter}
            onChange={v => setActiveFilter(v as Filter)}
            options={[
              { value: 'all', label: t.sevAll },
              { value: '3',   label: t.sevHigh, dot: DS.red   },
              { value: '2',   label: t.sevMed,  dot: DS.amber },
              { value: '1',   label: t.sevLow,  dot: DS.green },
            ]}
          />
        </FilterRow>

        <FilterRow label={t.category}>
          <select className="sv-select" value={catFilter} onChange={e => setCatFilter(e.target.value as Categoria | 'all')}>
            <option value="all">{t.catAll}</option>
            {(Object.keys(CAT_CFG) as Categoria[]).map(cat => (
              <option key={cat} value={cat}>{catLabel(cat)}</option>
            ))}
          </select>
        </FilterRow>

        <FilterRow label={t.status}>
          <select className="sv-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as Status | 'all')}>
            <option value="all">{t.statusAll}</option>
            <option value="ativo">{t.statusAtivo}</option>
            <option value="em_analise">{t.statusEmAnalise}</option>
            <option value="resolvido">{t.statusResolvido}</option>
          </select>
        </FilterRow>

        <FilterRow label={t.radius}>
          <div className="sv-radius-row">
            {radiusKm ? (
              <>
                <span className="sv-radius-val">{radiusKm} km</span>
                <button className="sv-radius-clear" onClick={() => setRadiusKm(null)}>{t.radiusClear}</button>
              </>
            ) : (
              <button className="sv-radius-toggle" onClick={() => setShowRadiusPicker(p => !p)}>
                {showRadiusPicker ? (lang === 'pt' ? 'Fechar' : 'Close') : (lang === 'pt' ? 'Definir' : 'Set')}
              </button>
            )}
          </div>
        </FilterRow>

        {showRadiusPicker && (
          <div className="sv-radius-picker">
            {!userLocation && <span className="sv-radius-warn">{t.noLocAuth}</span>}
            <input type="range" min={2} max={100} step={1} value={radiusKm ?? 10}
              onChange={e => setRadiusKm(Number(e.target.value))}
              className="sv-range" />
            <div className="sv-radius-presets">
              {[2, 5, 10, 25, 50].map(r => (
                <button key={r} onClick={() => { setRadiusKm(r); setShowRadiusPicker(false) }}
                  className={`sv-radius-preset${radiusKm === r ? ' active' : ''}`}>
                  {r}km
                </button>
              ))}
            </div>
          </div>
        )}

        <FilterRow label={t.sort}>
          <Segment
            value={sortKey}
            onChange={v => setSortKey(v as SortKey)}
            options={[
              { value: 'recente',      label: lang === 'pt' ? 'Recente' : 'Recent' },
              { value: 'gravidade',    label: lang === 'pt' ? 'Grav.'   : 'Sev.'   },
              { value: 'confirmacoes', label: lang === 'pt' ? 'Conf.'   : 'Conf.'  },
            ]}
          />
        </FilterRow>
      </div>

      <div className="sv-list">
        {loadingData && [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}

        {!loadingData && filtered.length === 0 && (
          <div className="sv-empty">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={DS.textMuted} strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <span className="sv-empty-title">
              {search || activeFilter !== 'all' || catFilter !== 'all' || statusFilter !== 'all' || radiusKm ? t.noResults : t.noOccurrences}
            </span>
            <span className="sv-empty-sub">
              {search || activeFilter !== 'all' || catFilter !== 'all' ? t.tryFilters : t.beFirst}
            </span>
            {!search && activeFilter === 'all' && catFilter === 'all' && (
              <button className="sv-btn sv-btn--primary sv-btn--sm" onClick={openCreate} style={{ marginTop: 8 }}>
                {t.createFirst}
              </button>
            )}
          </div>
        )}

        {!loadingData && filtered.map((p, idx) => {
          const vib              = getVibrancy(p)
          const isSelected       = selectedId === p.id
          const isExpanded       = expandedId === p.id
          const isOwner          = p.user_id === currentUserId
          const isHovered        = hoveredCard === p.id
          const catCfg           = CAT_CFG[p.categoria ?? 'outro']
          const statusCfg        = STATUS_CFG[p.status ?? 'ativo']
          const sevColor         = p.gravidade === 3 ? DS.red : p.gravidade === 2 ? DS.amber : DS.green
          const alreadyConfirmed = userConfirmations.includes(p.id)
          const distKm           = userLocation && p.latitude && p.longitude ? getDistanceKm(userLocation.lat, userLocation.lng, p.latitude, p.longitude) : null
          const ago              = timeAgo(p.created_at, lang)

          return (
            <div
              key={p.id}
              className={`sv-card${isSelected ? ' sv-card--selected' : ''}${isHovered ? ' sv-card--hovered' : ''}`}
              style={{ borderLeftColor: sevColor, animationDelay: `${idx * 0.012}s` }}
              onMouseEnter={() => setHoveredCard(p.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="sv-card-header" onClick={() => { setSelectedId(isSelected ? null : p.id); setExpandedId(isExpanded ? null : p.id) }}>
                <div className="sv-card-main">
                  <div className="sv-card-top">
                    <span className="sv-card-title">{p.name}</span>
                    <div className="sv-card-meta">
                      {distKm !== null && <span className="sv-card-dist">{formatDistanceLabel(distKm)}</span>}
                      {ago && <span className="sv-card-ago">{ago}</span>}
                    </div>
                  </div>
                  <div className="sv-card-tags">
                    <Tag label={catLabel(p.categoria)}  color={catCfg.color}    bg={catCfg.bg}    border={catCfg.border}    />
                    <Tag label={statusLabel(p.status)}  color={statusCfg.color} bg={statusCfg.bg} border={statusCfg.border} />
                    {isOwner && <Tag label={t.mineLabel} color={DS.blue} bg={DS.blueLight} border={DS.blueBorder} />}
                  </div>
                </div>
                <svg className={`sv-card-chevron${isExpanded ? ' rotated' : ''}`} width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {isExpanded && (
                <div className="sv-card-body">
                  <p className="sv-card-desc">{p.description}</p>
                  {p.photo_urls && p.photo_urls.length > 0 && (
                    <div className="sv-card-photos">
                      {p.photo_urls.slice(0, 3).map((url, i) => (
                        <img key={i} src={url} alt="" className="sv-card-photo" onClick={() => window.open(url, '_blank')} />
                      ))}
                    </div>
                  )}
                  <div className="sv-card-details">
                    <span className="sv-card-loc">
                      <svg width="9" height="9" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M8 2C5.24 2 3 4.24 3 7c0 4 5 8 5 8s5-4 5-8c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.5"/></svg>
                      {p.location ?? '—'}
                    </span>
                    <div className="sv-card-score">
                      <div className="sv-score-track"><div className="sv-score-bar" style={{ width: `${vib}%` }} /></div>
                      <span className="sv-score-val">{vib}</span>
                    </div>
                  </div>
                  <div className="sv-card-actions">
                    <button
                      className={`sv-btn sv-btn--sm${alreadyConfirmed ? ' sv-btn--confirmed' : ' sv-btn--ghost'}`}
                      onClick={e => { e.stopPropagation(); handleConfirm(p.id) }}
                      disabled={alreadyConfirmed}
                    >
                      {alreadyConfirmed ? t.btnConfirmed : t.btnConfirm}
                    </button>
                    {isOwner && (
                      <button className="sv-btn sv-btn--ghost sv-btn--sm" onClick={e => { e.stopPropagation(); openEdit(p) }}>
                        {t.btnEdit}
                      </button>
                    )}
                    {isOwner && (
                      <button className="sv-btn sv-btn--danger sv-btn--sm" onClick={e => { e.stopPropagation(); handleDelete(p.id) }}>
                        {t.btnRemove}
                      </button>
                    )}
                    {isOwner && (
                      <select
                        className="sv-status-select"
                        value={p.status ?? 'ativo'}
                        style={{ borderColor: STATUS_CFG[p.status ?? 'ativo'].border, color: STATUS_CFG[p.status ?? 'ativo'].color, background: STATUS_CFG[p.status ?? 'ativo'].bg }}
                        onClick={e => e.stopPropagation()}
                        onChange={e => { e.stopPropagation(); handleStatusChange(p.id, e.target.value as Status) }}
                      >
                        <option value="ativo">{t.statusAtivo}</option>
                        <option value="em_analise">{t.statusEmAnalise}</option>
                        <option value="resolvido">{t.statusResolvido}</option>
                      </select>
                    )}
                    <div className="sv-conf-count">
                      <svg width="9" height="9" viewBox="0 0 16 16" fill="none"><path d="M2 10l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      {p.confirmacoes}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )

  return (
    <div className="sv-root">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D8D6D0; border-radius: 2px; }

        @keyframes sv-shimmer  { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes sv-fadeUp   { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sv-fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes sv-slideIn  { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
        @keyframes sv-sheetUp  { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes sv-spin     { to{transform:rotate(360deg)} }
        @keyframes sv-toastIn  { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes sv-panelUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sv-pulse    { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .sv-root {
          display: flex; flex-direction: column; height: 100dvh;
          font-family: 'Inter', system-ui, sans-serif;
          background: #F5F4F0; color: #0D1117;
          -webkit-font-smoothing: antialiased;
          overflow: hidden;
        }

        /* ── Topbar ── */
        .sv-topbar {
          display: flex; align-items: center; gap: 12px;
          height: 56px; padding: 0 20px;
          background: rgba(245,244,240,0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid #E8E7E2;
          flex-shrink: 0; z-index: 50;
        }
        .sv-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; flex-shrink: 0; }
        .sv-logo-mark {
          width: 34px; height: 34px; border-radius: 8px; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          background: #F5F4F0; border: 1px solid #E8E7E2; flex-shrink: 0;
        }
        .sv-logo-mark img { height: 34px; display: block; }
        .sv-logo-name {
          font-family: 'DM Mono', monospace; font-size: 14px; font-weight: 500;
          letter-spacing: -0.01em; color: #0D1117; line-height: 1;
        }
        .sv-logo-name span { color: #0A2FFF; }
        .sv-logo-sub { font-size: 9px; color: #B8BFCC; letter-spacing: 0.07em; margin-top: 1px; font-family: 'DM Mono', monospace; }

        /* ── Nav ── */
        .sv-nav { flex: 1; display: flex; justify-content: center; }
        .sv-nav-inner {
          display: flex; gap: 1px; background: #F5F4F0;
          border: 1px solid #E8E7E2; border-radius: 9px; padding: 2px;
        }
        .sv-nav-btn {
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 400;
          padding: 5px 18px; border: none; border-radius: 7px;
          cursor: pointer; background: transparent; color: #5C6070;
          transition: all 0.15s ease; letter-spacing: -0.01em;
        }
        .sv-nav-btn.active { background: #0A2FFF; color: #fff; font-weight: 600; }
        .sv-nav-btn:not(.active):hover { background: #EDE9E3; color: #0D1117; }

        .sv-topbar-right { display: flex; align-items: center; gap: 8px; margin-left: auto; }
        .sv-lang-switch {
          display: flex; gap: 1px; background: #F5F4F0;
          border: 1px solid #E8E7E2; border-radius: 8px; padding: 1px;
        }
        .sv-lang-btn {
          font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 400;
          padding: 3px 8px; border: none; border-radius: 6px; cursor: pointer;
          background: transparent; color: #9098A8; transition: all 0.12s;
        }
        .sv-lang-btn.active { background: #fff; color: #0D1117; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        .sv-status-badge {
          display: flex; align-items: center; gap: 6px;
          font-family: 'DM Mono', monospace; font-size: 10px; color: #059669;
          background: #ECFDF5; border-radius: 20px; padding: 4px 10px;
          border: 1px solid #6EE7B7; letter-spacing: 0.01em;
        }
        .sv-report-btn {
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600;
          padding: 7px 16px; background: #0A2FFF; color: #fff;
          border: none; border-radius: 9px; cursor: pointer;
          transition: all 0.15s; letter-spacing: -0.01em;
          box-shadow: 0 2px 12px rgba(10,47,255,0.22);
        }
        .sv-report-btn:hover { background: #0822D4; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(10,47,255,0.28); }

        /* ── Body ── */
        .sv-body { display: flex; flex: 1; min-height: 0; position: relative; overflow: hidden; }

        /* ── Desktop Sidebar ── */
        .sv-sidebar {
          width: 360px; flex-shrink: 0;
          background: #FAFAF8; border-right: 1px solid #E8E7E2;
          display: flex; flex-direction: column; overflow: hidden;
          transition: width 0.22s ease;
        }
        .sv-sidebar.collapsed { width: 0; }
        .sv-sidebar-toggle {
          position: absolute; left: 360px; top: 50%; transform: translateY(-50%);
          z-index: 300; width: 18px; height: 40px;
          background: #FAFAF8; border: 1px solid #E8E7E2; border-left: none;
          border-radius: 0 8px 8px 0; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #9098A8; transition: left 0.22s ease;
        }
        .sv-sidebar-toggle.collapsed { left: 0; }
        .sv-sidebar-toggle:hover { background: #F0EFE9; }

        /* ── Tabs ── */
        .sv-tabs { display: flex; border-bottom: 1px solid #E8E7E2; flex-shrink: 0; padding: 0 4px; }
        .sv-tab {
          flex: 1; font-family: 'Inter', sans-serif; font-size: 13px;
          padding: 11px 0; border: none; background: transparent;
          cursor: pointer; color: #9098A8; letter-spacing: -0.01em;
          border-bottom: 2px solid transparent; margin-bottom: -1px;
          transition: all 0.12s; font-weight: 400;
        }
        .sv-tab.active { color: #0A2FFF; border-bottom-color: #0A2FFF; font-weight: 600; }

        /* ── Stats ── */
        .sv-stats-row { display: grid; grid-template-columns: 1fr 1fr 1fr; flex-shrink: 0; background: #fff; border-bottom: 1px solid #E8E7E2; }
        .sv-stat { padding: 12px 12px 10px; }
        .sv-stat-label { display: block; font-family: 'DM Mono', monospace; font-size: 8px; font-weight: 500; letter-spacing: 0.09em; text-transform: uppercase; color: #B8BFCC; margin-bottom: 4px; }
        .sv-stat-num { display: block; font-family: 'DM Mono', monospace; font-size: 20px; font-weight: 500; line-height: 1; }
        .sv-stat-sub { display: block; font-family: 'DM Mono', monospace; font-size: 9px; color: #B8BFCC; margin-top: 2px; }

        /* ── Filters ── */
        .sv-filters-block {
          padding: 10px 12px; border-bottom: 1px solid #E8E7E2;
          display: flex; flex-direction: column; gap: 0; flex-shrink: 0;
          background: #FAFAF8;
        }
        .sv-search-wrap { position: relative; margin-bottom: 8px; }
        .sv-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #B8BFCC; pointer-events: none; }
        .sv-search-input {
          width: 100%; font-family: 'Inter', sans-serif; font-size: 13px;
          padding: 8px 30px 8px 30px; border: 1px solid #E8E7E2; border-radius: 8px;
          background: #fff; color: #0D1117; outline: none;
          transition: border-color 0.12s, box-shadow 0.12s; letter-spacing: -0.01em;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }
        .sv-search-input:focus { border-color: #0A2FFF; box-shadow: 0 0 0 3px rgba(10,47,255,0.08); }
        .sv-search-input::placeholder { color: #B8BFCC; }
        .sv-search-clear { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #9098A8; font-size: 16px; line-height: 1; padding: 0; }
        .sv-filter-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 6px 0; border-bottom: 1px solid #F0EFE9; gap: 8px;
        }
        .sv-filter-row:last-child { border-bottom: none; }
        .sv-filter-label { font-family: 'DM Mono', monospace; font-size: 10px; color: #9098A8; letter-spacing: 0.02em; flex-shrink: 0; white-space: nowrap; }
        .sv-filter-controls { display: flex; align-items: center; gap: 4px; }

        /* ── Segment ── */
        .sv-segment {
          display: flex; gap: 1px; background: #F0EFE9;
          border: 1px solid #E8E7E2; border-radius: 7px; padding: 2px;
        }
        .sv-segment-btn {
          font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 400;
          padding: 3px 8px; border: none; border-radius: 5px; cursor: pointer;
          background: transparent; color: #9098A8; transition: all 0.12s;
          display: flex; align-items: center; gap: 4px; letter-spacing: -0.01em; white-space: nowrap;
        }
        .sv-segment-btn.active { background: #fff; color: #0D1117; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.07); }
        .sv-segment-dot { width: 5px; height: 5px; border-radius: 50%; display: inline-block; flex-shrink: 0; transition: background 0.12s; }
        .sv-select {
          font-family: 'Inter', sans-serif; font-size: 12px;
          padding: 5px 9px; border: 1px solid #E8E7E2; border-radius: 7px;
          background: #fff; color: #5C6070; cursor: pointer; outline: none;
          transition: border-color 0.12s; box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }
        .sv-select:focus { border-color: #0A2FFF; }
        .sv-radius-row { display: flex; align-items: center; gap: 6px; }
        .sv-radius-val { font-family: 'DM Mono', monospace; font-size: 11px; color: #0A2FFF; }
        .sv-radius-clear, .sv-radius-toggle {
          font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500;
          background: none; border: 1px solid #E8E7E2; border-radius: 6px;
          padding: 3px 8px; cursor: pointer; color: #5C6070; transition: all 0.12s;
        }
        .sv-radius-clear:hover, .sv-radius-toggle:hover { background: #F0EFE9; }
        .sv-radius-picker {
          background: #F5F4F0; border: 1px solid #E8E7E2; border-radius: 10px;
          padding: 10px 12px; margin-bottom: 4px; animation: sv-fadeUp 0.15s ease;
        }
        .sv-radius-warn { font-family: 'DM Mono', monospace; font-size: 10px; color: #DC2626; display: block; margin-bottom: 6px; }
        .sv-range { width: 100%; accent-color: #0A2FFF; margin-bottom: 8px; }
        .sv-radius-presets { display: flex; gap: 4px; }
        .sv-radius-preset {
          font-family: 'DM Mono', monospace; font-size: 10px;
          padding: 2px 8px; border: 1px solid #E8E7E2; border-radius: 5px;
          background: #fff; color: #9098A8; cursor: pointer; transition: all 0.12s;
        }
        .sv-radius-preset.active, .sv-radius-preset:hover { border-color: #0A2FFF; color: #0A2FFF; background: #EEF2FF; }

        /* ── Card list ── */
        .sv-list {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          background: #F5F4F0;
        }

        /* ── Problem card ── */
        .sv-card {
          background: #fff; border: 1px solid #E8E7E2;
          border-left: 3px solid; border-radius: 10px;
          overflow: visible;
          transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
          animation: sv-slideIn 0.15s ease both;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          position: relative;
        }
        .sv-card--hovered { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-1px); border-color: #D4D2CC; }
        .sv-card--selected { background: #F5F8FF; border-color: #C7D2FE !important; }
        .sv-card-header { padding: 11px 13px; cursor: pointer; display: flex; align-items: flex-start; gap: 8px; }
        .sv-card-main { flex: 1; min-width: 0; }
        .sv-card-top {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 6px; margin-bottom: 6px;
        }
        .sv-card-title {
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600;
          color: #0D1117; line-height: 1.3; letter-spacing: -0.01em;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
        }
        .sv-card-meta { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
        .sv-card-dist { font-family: 'DM Mono', monospace; font-size: 9px; color: #0A2FFF; background: #EEF2FF; border-radius: 5px; padding: 1px 5px; border: 1px solid #C7D2FE; white-space: nowrap; }
        .sv-card-ago { font-family: 'DM Mono', monospace; font-size: 9px; color: #B8BFCC; white-space: nowrap; }
        .sv-card-tags { display: flex; gap: 4px; flex-wrap: wrap; }
        .sv-card-chevron { color: #B8BFCC; flex-shrink: 0; margin-top: 3px; transition: transform 0.18s ease; }
        .sv-card-chevron.rotated { transform: rotate(180deg); }

        /* ── Card body ── */
        .sv-card-body {
          padding: 0 13px 13px;
          border-top: 1px solid #F0EFE9;
          animation: sv-fadeUp 0.15s ease;
          overflow: visible;
        }
        .sv-card-desc {
          font-family: 'Inter', sans-serif; font-size: 12px; color: #5C6070;
          line-height: 1.65; margin: 9px 0 8px;
          word-break: break-word;
          white-space: normal;
        }
        .sv-card-photos { display: flex; gap: 5px; margin-bottom: 9px; flex-wrap: wrap; }
        .sv-card-photo { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #E8E7E2; cursor: zoom-in; transition: opacity 0.12s, transform 0.12s; flex-shrink: 0; }
        .sv-card-photo:hover { opacity: 0.88; transform: scale(1.03); }
        .sv-card-details { display: flex; align-items: center; justify-content: space-between; margin-bottom: 9px; gap: 8px; }
        .sv-card-loc { font-family: 'DM Mono', monospace; font-size: 10px; color: #9098A8; display: flex; align-items: center; gap: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0; }
        .sv-card-score { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .sv-score-track { width: 44px; height: 3px; background: #F0EFE9; border-radius: 2px; overflow: hidden; }
        .sv-score-bar { height: 100%; background: #0A2FFF; border-radius: 2px; }
        .sv-score-val { font-family: 'DM Mono', monospace; font-size: 9px; color: #B8BFCC; }
        /* ── Card actions — wrap on mobile ── */
        .sv-card-actions {
          display: flex; gap: 4px; align-items: center;
          flex-wrap: wrap;
          row-gap: 6px;
        }
        .sv-conf-count { font-family: 'DM Mono', monospace; font-size: 10px; color: #9098A8; border: 1px solid #F0EFE9; border-radius: 6px; padding: 3px 7px; display: flex; align-items: center; gap: 2px; margin-left: auto; background: #FAFAF8; }

        /* ── Empty state ── */
        .sv-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 44px 20px; gap: 8px; text-align: center; }
        .sv-empty-title { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; color: #5C6070; letter-spacing: -0.01em; }
        .sv-empty-sub { font-family: 'Inter', sans-serif; font-size: 12px; color: #9098A8; }

        /* ── Tag ── */
        .sv-tag { font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 500; border: 1px solid; border-radius: 4px; padding: 1px 6px; letter-spacing: 0.01em; white-space: nowrap; flex-shrink: 0; }

        /* ── Dot ── */
        .sv-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; }
        .sv-dot-pulse { animation: sv-pulse 2s ease-in-out infinite; }

        /* ── Buttons ── */
        .sv-btn {
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600;
          padding: 9px 18px; border-radius: 9px; cursor: pointer;
          display: inline-flex; align-items: center; gap: 5px;
          transition: all 0.15s; letter-spacing: -0.01em; white-space: nowrap;
        }
        .sv-btn--primary { background: #0A2FFF; color: #fff; border: none; box-shadow: 0 2px 12px rgba(10,47,255,0.22); }
        .sv-btn--primary:hover:not(:disabled) { background: #0822D4; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(10,47,255,0.28); }
        .sv-btn--primary:active { transform: scale(0.98); }
        .sv-btn--primary:disabled { background: #93BBFD; cursor: not-allowed; box-shadow: none; }
        .sv-btn--ghost { background: #fff; border: 1px solid #E8E7E2; color: #5C6070; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .sv-btn--ghost:hover { background: #FAFAF8; border-color: #D4D2CC; color: #0D1117; }
        .sv-btn--danger { background: #fff; border: 1px solid #E8E7E2; color: #5C6070; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .sv-btn--danger:hover { background: #FEF2F2; border-color: #FCA5A5; color: #DC2626; }
        .sv-btn--confirmed { background: #ECFDF5; border: 1px solid #6EE7B7; color: #059669; cursor: not-allowed; }
        .sv-btn--sm { font-size: 11px; padding: 5px 11px; border-radius: 7px; }
        .sv-status-select {
          font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600;
          padding: 4px 8px; border: 1px solid; border-radius: 6px;
          cursor: pointer; outline: none; transition: all 0.12s;
        }

        /* ── Main ── */
        .sv-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
        .sv-subbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 6px 16px; background: #FAFAF8; border-bottom: 1px solid #E8E7E2; flex-shrink: 0;
        }
        .sv-subbar-loc { font-family: 'DM Mono', monospace; font-size: 11px; color: #B8BFCC; }
        .sv-subbar-loc span { color: #5C6070; }
        .sv-subbar-status {
          font-family: 'DM Mono', monospace; font-size: 11px;
          background: #F5F4F0; border: 1px solid #E8E7E2; border-radius: 20px; padding: 3px 10px;
          transition: all 0.15s; letter-spacing: 0.01em;
        }
        .sv-subbar-status.active { background: #EEF2FF; border-color: #C7D2FE; color: #0A2FFF; }
        .sv-map-wrap { flex: 1; overflow: hidden; position: relative; min-height: 0; }
        .sv-detail-bar { position: relative; flex-shrink: 0; background: #fff; border-top: 1px solid #E8E7E2; }
        .sv-detail-inner { height: 160px; padding: 14px 18px; overflow-y: auto; }
        .sv-detail-hint { display: flex; align-items: center; justify-content: center; height: 100%; font-family: 'DM Mono', monospace; font-size: 11px; color: #B8BFCC; }
        .sv-detail-content { animation: sv-fadeUp 0.15s ease; }
        .sv-detail-top { display: flex; align-items: center; gap: 9px; margin-bottom: 6px; flex-wrap: wrap; }
        .sv-detail-name { font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 700; color: #0D1117; letter-spacing: -0.02em; }
        .sv-detail-desc { font-family: 'Inter', sans-serif; font-size: 12.5px; color: #5C6070; line-height: 1.6; margin-bottom: 10px; letter-spacing: -0.005em; }
        .sv-detail-photos { display: flex; gap: 6px; margin-bottom: 10px; }
        .sv-detail-photo { width: 52px; height: 52px; object-fit: cover; border-radius: 8px; border: 1px solid #E8E7E2; cursor: zoom-in; transition: transform 0.12s; }
        .sv-detail-photo:hover { transform: scale(1.05); }
        .sv-detail-fields { display: flex; gap: 20px; flex-wrap: wrap; }
        .sv-detail-field-label { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.07em; text-transform: uppercase; color: #B8BFCC; margin-bottom: 3px; display: block; }
        .sv-detail-field-val { font-family: 'Inter', sans-serif; font-size: 13px; color: #0D1117; letter-spacing: -0.01em; font-weight: 500; }
        .sv-detail-score-wrap { display: flex; align-items: center; gap: 7px; }
        .sv-detail-score-track { width: 60px; height: 3px; background: #F0EFE9; border-radius: 2px; overflow: hidden; }
        .sv-detail-score-bar { height: 100%; background: #0A2FFF; border-radius: 2px; }
        .sv-detail-score-val { font-family: 'DM Mono', monospace; font-size: 11px; color: #5C6070; }

        /* ── Icon tray ── */
        .sv-icon-tray {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          z-index: 10; display: flex; flex-direction: column; gap: 2px;
          background: #fff; border: 1px solid #E8E7E2; border-radius: 10px;
          padding: 4px; box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        .sv-icon-btn {
          width: 32px; height: 32px; border-radius: 7px; border: none;
          background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: #9098A8; transition: all 0.12s; position: relative;
        }
        .sv-icon-btn.active { background: #EEF2FF; color: #0A2FFF; }
        .sv-icon-btn:hover:not(.active) { background: #F5F4F0; }
        .sv-icon-divider { height: 1px; background: #F0EFE9; margin: 1px 2px; }
        .sv-notif-badge {
          position: absolute; top: 2px; right: 2px; width: 14px; height: 14px;
          border-radius: 50%; background: #DC2626; border: 2px solid #fff;
          font-size: 7px; font-family: 'DM Mono', monospace; font-weight: 600;
          color: #fff; display: flex; align-items: center; justify-content: center;
        }
        .sv-avatar {
          width: 22px; height: 22px; border-radius: 50%; background: #0A2FFF;
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; font-family: 'DM Mono', monospace;
        }

        /* ── Right panel ── */
        .sv-right-panel { animation: sv-panelUp 0.18s ease; display: flex; flex-direction: column; max-height: 400px; overflow: hidden; }
        .sv-panel-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid #F0EFE9; flex-shrink: 0; }
        .sv-panel-toolbar-title { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; color: #0D1117; letter-spacing: -0.01em; }
        .sv-icon-close { background: none; border: none; cursor: pointer; color: #9098A8; font-size: 20px; line-height: 1; padding: 0 2px; transition: color 0.12s; }
        .sv-icon-close:hover { color: #0D1117; }
        .sv-panel-body { flex: 1; overflow-y: auto; }

        /* ── Notifications ── */
        .sv-notif-item { display: flex; gap: 10px; align-items: flex-start; padding: 10px 16px; border-bottom: 1px solid #F0EFE9; cursor: pointer; transition: background 0.12s; }
        .sv-notif-item:hover { background: #FAFAF8; }
        .sv-notif-item.unread { background: #F5F8FF; }
        .sv-notif-icon { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .sv-notif-title { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; color: #0D1117; margin-bottom: 2px; letter-spacing: -0.01em; }
        .sv-notif-msg { font-family: 'Inter', sans-serif; font-size: 11px; color: #5C6070; line-height: 1.45; }
        .sv-notif-time { font-family: 'DM Mono', monospace; font-size: 10px; color: #B8BFCC; margin-top: 3px; }
        .sv-notif-unread-dot { width: 6px; height: 6px; border-radius: 50%; background: #0A2FFF; flex-shrink: 0; margin-top: 4px; }
        .sv-notif-empty { padding: 32px 16px; text-align: center; font-family: 'Inter', sans-serif; font-size: 13px; color: #9098A8; }
        .sv-notif-mark-all { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; color: #0A2FFF; background: none; border: none; cursor: pointer; padding: 8px 16px; width: 100%; text-align: left; border-bottom: 1px solid #F0EFE9; transition: background 0.12s; }
        .sv-notif-mark-all:hover { background: #F5F8FF; }

        /* ── Profile ── */
        .sv-profile-content { padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }
        .sv-profile-card { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: #F5F4F0; border-radius: 10px; border: 1px solid #E8E7E2; }
        .sv-profile-avatar { width: 40px; height: 40px; border-radius: 50%; background: #0A2FFF; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; font-family: 'DM Mono', monospace; flex-shrink: 0; box-shadow: 0 2px 10px rgba(10,47,255,0.22); }
        .sv-profile-name { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; color: #0D1117; letter-spacing: -0.01em; }
        .sv-profile-email { font-family: 'DM Mono', monospace; font-size: 11px; color: #9098A8; margin-top: 1px; }
        .sv-profile-count { font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500; color: #0A2FFF; background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 20px; padding: 2px 9px; flex-shrink: 0; }
        .sv-menu-item { display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 10px; background: none; border: none; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 13px; color: #5C6070; border-radius: 7px; transition: all 0.12s; text-align: left; letter-spacing: -0.01em; font-weight: 400; }
        .sv-menu-item:hover { background: #F5F4F0; color: #0D1117; }
        .sv-signout-btn { display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 10px; background: none; border: 1px solid #FCA5A5; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 13px; color: #DC2626; border-radius: 9px; transition: all 0.12s; text-align: left; letter-spacing: -0.01em; font-weight: 500; }
        .sv-signout-btn:hover { background: #FEF2F2; }

        /* ── Desktop form drawer ── */
        .sv-form-drawer {
          position: absolute; left: 360px; bottom: 0; width: 350px; z-index: 400;
          background: #fff; border-top: 1px solid #E8E7E2; border-right: 1px solid #E8E7E2;
          box-shadow: 6px -4px 28px rgba(0,0,0,0.08);
          padding: 18px 16px 28px; display: flex; flex-direction: column; gap: 14px;
          animation: sv-fadeUp 0.18s ease; max-height: 88vh; overflow-y: auto;
          border-radius: 0 14px 0 0;
        }
        .sv-form-drawer.collapsed-sidebar { left: 18px; }
        .sv-form-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid #F0EFE9; }
        .sv-form-title { font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 700; color: #0D1117; letter-spacing: -0.02em; }
        .sv-input {
          width: 100%; font-family: 'Inter', sans-serif; font-size: 13px;
          padding: 10px 12px; border: 1px solid #E8E7E2; border-radius: 9px;
          background: #FAFAF8; color: #0D1117; outline: none;
          transition: border-color 0.12s, background 0.12s, box-shadow 0.12s; letter-spacing: -0.01em;
        }
        .sv-input:focus { border-color: #0A2FFF; background: #fff; box-shadow: 0 0 0 3px rgba(10,47,255,0.08); }
        .sv-textarea { resize: vertical; line-height: 1.55; }
        .sv-cat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
        .sv-cat-btn {
          display: flex; align-items: center; gap: 7px; padding: 8px 10px;
          border: 1px solid #E8E7E2; border-radius: 8px; background: #fff;
          color: #5C6070; cursor: pointer; font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 400; transition: all 0.12s; text-align: left; letter-spacing: -0.01em;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }
        .sv-cat-btn:hover:not(.active) { background: #F5F4F0; border-color: #D4D2CC; }
        .sv-cat-icon { font-size: 9px; flex-shrink: 0; }
        .sv-sev-row { display: flex; gap: 5px; }
        .sv-sev-btn {
          flex: 1; padding: 8px 0; border: 1px solid #E8E7E2; border-radius: 8px;
          background: #FAFAF8; color: #9098A8; cursor: pointer;
          font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500;
          transition: all 0.12s; letter-spacing: -0.01em;
        }
        .sv-sev-btn:hover:not(.active) { background: #F0EFE9; }
        .sv-loc-display {
          padding: 10px 12px; border: 1.5px dashed #E8E7E2; border-radius: 9px;
          background: #FAFAF8; font-size: 12px; font-family: 'DM Mono', monospace;
          color: #B8BFCC; min-height: 40px; display: flex; align-items: center; gap: 6px;
          transition: all 0.15s;
        }
        .sv-loc-display--set { border-color: #6EE7B7; background: #ECFDF5; color: #059669; border-style: solid; }
        .sv-loc-coords { flex: 1; font-size: 11px; }
        .sv-loc-clear { background: none; border: none; cursor: pointer; color: #059669; font-size: 16px; line-height: 1; padding: 0; }
        .sv-loc-use-me { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; color: #0A2FFF; background: none; border: none; cursor: pointer; padding: 5px 0 0; letter-spacing: -0.01em; transition: text-decoration 0.12s; }
        .sv-loc-use-me:hover { text-decoration: underline; }
        .sv-photo-grid { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 8px; }
        .sv-photo-thumb { position: relative; width: 76px; height: 76px; border-radius: 8px; overflow: hidden; border: 1px solid #E8E7E2; }
        .sv-photo-thumb--new { border-color: #0A2FFF; border-width: 2px; }
        .sv-photo-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .sv-photo-remove { position: absolute; top: 3px; right: 3px; width: 18px; height: 18px; border-radius: 50%; background: rgba(0,0,0,0.5); color: #fff; border: none; cursor: pointer; font-size: 11px; display: flex; align-items: center; justify-content: center; transition: background 0.12s; }
        .sv-photo-remove:hover { background: rgba(0,0,0,0.7); }
        .sv-photo-add { display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 12px; border: 1.5px dashed #E8E7E2; border-radius: 9px; background: #FAFAF8; color: #9098A8; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 400; transition: all 0.12s; }
        .sv-photo-add:hover { border-color: #0A2FFF; color: #0A2FFF; background: #EEF2FF; }
        .sv-photo-count { margin-left: auto; font-family: 'DM Mono', monospace; font-size: 9px; color: #B8BFCC; }
        .sv-photo-max { font-family: 'DM Mono', monospace; font-size: 10px; color: #9098A8; padding: 4px 0; }
        .sv-anon-check { display: flex; align-items: center; gap: 8px; font-family: 'Inter', sans-serif; font-size: 12px; color: #5C6070; cursor: pointer; }
        .sv-anon-check input { width: 14px; height: 14px; cursor: pointer; accent-color: #0A2FFF; }
        .sv-form-actions { display: flex; gap: 8px; padding-top: 4px; }
        .sv-form-actions .sv-btn--ghost { flex: 1; justify-content: center; }
        .sv-form-actions .sv-btn--primary { flex: 2; justify-content: center; }
        .sv-field-label { font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #9098A8; margin-bottom: 6px; }

        /* ── Analytics/Reports panels ── */
        .sv-panel-scroll { flex: 1; overflow-y: auto; padding: 22px 24px; display: flex; flex-direction: column; gap: 18px; background: #F5F4F0; -webkit-overflow-scrolling: touch; }
        .sv-panel-header { padding-bottom: 4px; }
        .sv-panel-title { font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 800; color: #0D1117; letter-spacing: -0.03em; }
        .sv-panel-sub { font-family: 'Inter', sans-serif; font-size: 13px; color: #9098A8; margin-top: 3px; letter-spacing: -0.01em; font-weight: 400; }
        .sv-kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
        .sv-kpi { background: #fff; border: 1px solid #E8E7E2; border-radius: 12px; padding: 16px 16px 14px; position: relative; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.04); transition: box-shadow 0.15s, transform 0.15s; }
        .sv-kpi:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); transform: translateY(-1px); }
        .sv-kpi-accent { position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 12px 12px 0 0; }
        .sv-kpi-label { display: block; font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #B8BFCC; margin-bottom: 8px; margin-top: 6px; }
        .sv-kpi-value { display: block; font-family: 'DM Mono', monospace; font-size: 28px; font-weight: 500; line-height: 1; }
        .sv-charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .sv-chart-card { background: #fff; border: 1px solid #E8E7E2; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        .sv-chart-card--center { align-items: center; }
        .sv-chart-title { font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #9098A8; margin-bottom: 10px; }
        .sv-ring-center { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
        .sv-ring-sub { font-family: 'DM Mono', monospace; font-size: 11px; color: #9098A8; }
        .sv-sev-row-stat { margin-bottom: 9px; display: grid; grid-template-columns: 44px 1fr 24px; align-items: center; gap: 8px; }
        .sv-sev-stat-label { font-family: 'Inter', sans-serif; font-size: 11px; color: #5C6070; letter-spacing: -0.01em; }
        .sv-progress-track { height: 4px; background: #F0EFE9; border-radius: 3px; overflow: hidden; }
        .sv-progress-bar { height: 100%; border-radius: 3px; transition: width 0.6s cubic-bezier(0.34,1.56,0.64,1); }
        .sv-sev-stat-count { font-family: 'DM Mono', monospace; font-size: 10px; color: #9098A8; text-align: right; }
        .sv-cat-legend-row { display: flex; align-items: center; gap: 5px; }
        .sv-cat-legend-name { font-family: 'Inter', sans-serif; font-size: 10px; color: #5C6070; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sv-cat-legend-pct { font-family: 'DM Mono', monospace; font-size: 9px; color: #9098A8; }
        .sv-donut-label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
        .sv-table-card { background: #fff; border: 1px solid #E8E7E2; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        .sv-table-head { padding: 11px 16px; border-bottom: 1px solid #F0EFE9; font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #9098A8; }
        .sv-table-row { display: flex; align-items: center; gap: 10px; padding: 9px 16px; border-bottom: 1px solid #F0EFE9; animation: sv-slideIn 0.15s ease both; transition: background 0.12s; }
        .sv-table-row:last-child { border-bottom: none; }
        .sv-table-row:hover { background: #FAFAF8; }
        .sv-table-rank { font-family: 'DM Mono', monospace; font-size: 10px; color: #B8BFCC; width: 18px; text-align: right; flex-shrink: 0; }
        .sv-table-dot { font-size: 9px; flex-shrink: 0; }
        .sv-table-name { flex: 1; font-family: 'Inter', sans-serif; font-size: 13px; color: #0D1117; letter-spacing: -0.01em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
        .sv-table-conf { font-family: 'DM Mono', monospace; font-size: 10px; color: #9098A8; flex-shrink: 0; }
        .sv-period-row { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 4px; }
        .sv-period-btn { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; padding: 6px 14px; border: 1px solid #E8E7E2; border-radius: 20px; background: #fff; color: #9098A8; cursor: pointer; transition: all 0.12s; letter-spacing: -0.01em; }
        .sv-period-btn.active { background: #EEF2FF; border-color: #C7D2FE; color: #0A2FFF; font-weight: 600; }
        .sv-report-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
        .sv-report-stat { background: #fff; border: 1px solid #E8E7E2; border-radius: 12px; padding: 14px 14px 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        .sv-report-stat-label { display: block; font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #B8BFCC; margin-bottom: 6px; }
        .sv-report-stat-value { display: block; font-family: 'DM Mono', monospace; font-size: 24px; font-weight: 500; line-height: 1; }
        .sv-export-row { display: flex; gap: 7px; flex-wrap: wrap; margin-top: 4px; }
        .sv-report-list { max-height: 300px; overflow-y: auto; }
        .sv-report-list-row { display: flex; align-items: center; gap: 8px; padding: 9px 16px; border-bottom: 1px solid #F0EFE9; animation: sv-fadeIn 0.15s ease both; transition: background 0.12s; }
        .sv-report-list-row:last-child { border-bottom: none; }
        .sv-report-list-row:hover { background: #FAFAF8; }
        .sv-report-list-name { flex: 1; font-family: 'Inter', sans-serif; font-size: 12px; color: #0D1117; letter-spacing: -0.01em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
        .sv-report-list-time { font-family: 'DM Mono', monospace; font-size: 10px; color: #B8BFCC; flex-shrink: 0; }
        .sv-empty-state { padding: 24px; text-align: center; font-family: 'Inter', sans-serif; font-size: 13px; color: #9098A8; }

        /* ── Toast ── */
        .sv-toast {
          position: fixed; top: 18px; right: 18px; z-index: 9999;
          border-radius: 12px; padding: 10px 16px;
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
          display: flex; align-items: center; gap: 8px; animation: sv-toastIn 0.2s ease;
          max-width: 300px; box-shadow: 0 4px 20px rgba(0,0,0,0.10);
          letter-spacing: -0.01em;
        }
        .sv-toast--success { background: #ECFDF5; border: 1px solid #6EE7B7; color: #059669; }
        .sv-toast--error   { background: #FEF2F2; border: 1px solid #FCA5A5; color: #DC2626; }
        .sv-toast--info    { background: #EEF2FF; border: 1px solid #C7D2FE; color: #0A2FFF; }

        /* ── Skeleton ── */
        .sv-skeleton-card { background: #fff; border-radius: 10px; padding: 12px 13px; border: 1px solid #E8E7E2; box-shadow: 0 1px 4px rgba(0,0,0,0.03); }
        .sv-skel { background: #ECEAE4; border-radius: 5px; animation: sv-shimmer 1.5s ease-in-out infinite; }
        .sv-skel-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 3px; flex-shrink: 0; }

        /* ── FAB ── */
        .sv-fab {
          position: fixed; bottom: 22px; right: 18px; z-index: 600;
          width: 50px; height: 50px; border-radius: 50%;
          background: #0A2FFF; color: #fff; border: none; cursor: pointer;
          box-shadow: 0 4px 18px rgba(10,47,255,0.32);
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .sv-fab:hover  { transform: scale(1.06); box-shadow: 0 6px 22px rgba(10,47,255,0.38); }
        .sv-fab:active { transform: scale(0.95); }

        /* ── Mobile bottom nav sheet (Dashboard/Análise/Relatórios) ── */
        .sv-mobile-nav-sheet {
          position: fixed; left: 0; right: 0; bottom: 0; z-index: 750;
          background: #fff; border-radius: 16px 16px 0 0;
          box-shadow: 0 -4px 28px rgba(0,0,0,0.14);
          padding: 8px 12px calc(20px + env(safe-area-inset-bottom, 0px));
          animation: sv-sheetUp 0.22s cubic-bezier(0.32,0.72,0,1);
        }
        .sv-mobile-nav-item {
          display: flex; align-items: center; gap: 12px; width: 100%;
          padding: 13px 10px; background: none; border: none; cursor: pointer;
          font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500;
          color: #5C6070; border-radius: 10px; transition: background 0.12s;
          text-align: left;
        }
        .sv-mobile-nav-item.active { color: #0A2FFF; background: #EEF2FF; font-weight: 600; }
        .sv-mobile-nav-item:active { background: #F5F4F0; }
        .sv-mobile-nav-icon { width: 30px; height: 30px; border-radius: 8px; background: #F5F4F0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #9098A8; }
        .sv-mobile-nav-item.active .sv-mobile-nav-icon { background: #fff; color: #0A2FFF; }

        /* ── Mobile sidebar ── */
        .sv-mobile-sidebar {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 85%;
          max-width: 360px;
          background: #FAFAF8;
          z-index: 700;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 4px 0 28px rgba(0,0,0,0.12);
          transform: translateX(-100%);
          transition: transform 0.24s cubic-bezier(0.32,0.72,0,1);
        }
        .sv-mobile-sidebar.open { transform: translateX(0); }

        .sv-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.22); z-index: 699; opacity: 0; pointer-events: none; transition: opacity 0.2s ease; }
        .sv-overlay.open { opacity: 1; pointer-events: all; }
        .sv-mobile-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #E8E7E2; flex-shrink: 0; }
        .sv-mobile-title { font-family: 'DM Mono', monospace; font-size: 14px; font-weight: 500; color: #0D1117; }
        .sv-mobile-title span { color: #0A2FFF; }

        /* ── Mobile top bar for Análise/Relatórios ── */
        .sv-mobile-panel-topbar {
          display: none;
          align-items: center; gap: 10px;
          padding: 10px 14px; background: #fff; border-bottom: 1px solid #E8E7E2;
          flex-shrink: 0;
        }
        .sv-mobile-panel-back {
          width: 30px; height: 30px; border-radius: 8px; border: 1px solid #E8E7E2;
          background: #fff; display: flex; align-items: center; justify-content: center;
          color: #5C6070; cursor: pointer; flex-shrink: 0;
        }
        .sv-mobile-panel-topbar-title { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; color: #0D1117; letter-spacing: -0.01em; }

        /* ── Bottom sheet ── */
        .sv-bottom-sheet {
          position: fixed; left: 0; right: 0; bottom: 0; z-index: 600;
          background: #fff; border-radius: 16px 16px 0 0;
          box-shadow: 0 -4px 28px rgba(0,0,0,0.12);
          padding: 14px 16px 36px;
          display: flex; flex-direction: column; gap: 14px;
          max-height: 92dvh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          animation: sv-sheetUp 0.24s cubic-bezier(0.32,0.72,0,1);
        }
        .sv-sheet-handle { width: 32px; height: 3px; border-radius: 2px; background: #E8E7E2; margin: -4px auto 2px; flex-shrink: 0; }

        /* ── Stats modal ── */
        .sv-modal-backdrop { position: fixed; inset: 0; z-index: 800; background: rgba(0,0,0,0.18); display: flex; align-items: center; justify-content: center; animation: sv-fadeIn 0.12s ease; padding: 16px; }
        .sv-modal { background: #fff; border-radius: 16px; border: 1px solid #E8E7E2; padding: 24px; width: 100%; max-width: 460px; animation: sv-fadeUp 0.16s ease; max-height: 90vh; overflow-y: auto; box-shadow: 0 12px 44px rgba(0,0,0,0.12); }
        .sv-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .sv-modal-title { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 700; color: #0D1117; letter-spacing: -0.02em; }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .sv-topbar { padding: 0 14px; height: 52px; }
          .sv-nav { display: none; }
          .sv-topbar-right { display: none; }
          .sv-logo-sub { display: none; }
          .sv-sidebar { display: none; }
          .sv-sidebar-toggle { display: none; }
          .sv-body { flex-direction: column; }
          .sv-detail-bar { display: none; }
          .sv-form-drawer { display: none; }

          .sv-mobile-sidebar { display: flex !important; }

          .sv-mobile-sidebar .sv-list {
            flex: 1;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
            min-height: 0;
          }
          .sv-mobile-sidebar .sv-card { overflow: visible; }
          .sv-mobile-sidebar .sv-card-body { overflow: visible; }
          .sv-mobile-sidebar .sv-card-title { white-space: normal; word-break: break-word; }
          .sv-mobile-sidebar .sv-card-top { flex-wrap: wrap; }
          .sv-mobile-sidebar .sv-card-actions { flex-wrap: wrap; gap: 5px; }
          .sv-mobile-sidebar .sv-btn--sm { font-size: 12px; padding: 7px 13px; }
          .sv-mobile-sidebar .sv-filters-block { flex-shrink: 0; overflow-y: auto; }

          /* Analytics / Reports full-screen on mobile */
          .sv-main-panels {
            display: flex !important;
            position: fixed;
            inset: 0;
            z-index: 60;
            background: #F5F4F0;
            flex-direction: column;
          }
          .sv-mobile-panel-topbar { display: flex; }
          .sv-panel-scroll { padding: 14px 14px calc(24px + env(safe-area-inset-bottom, 0px)); gap: 12px; }
          .sv-panel-title { font-size: 17px; }
          .sv-panel-sub { font-size: 12px; }

          /* Collapse multi-column grids to 1 column */
          .sv-kpi-row { grid-template-columns: 1fr 1fr; gap: 8px; }
          .sv-kpi { padding: 13px 13px 11px; }
          .sv-kpi-value { font-size: 22px; }
          .sv-charts-row { grid-template-columns: 1fr; gap: 8px; }
          .sv-report-stats { grid-template-columns: 1fr; gap: 7px; }
          .sv-report-stat-value { font-size: 20px; }
          .sv-export-row .sv-btn { flex: 1; justify-content: center; }
          .sv-period-row { gap: 6px; }
          .sv-period-btn { padding: 6px 12px; font-size: 11px; flex: 1 0 auto; text-align: center; }
          .sv-table-row, .sv-report-list-row { padding: 10px 12px; }
        }

        @media (min-width: 769px) {
          .sv-mobile-new-btn   { display: none; }
          .sv-bottom-sheet     { display: none; }
          .sv-mobile-sidebar   { display: none !important; }
          .sv-mobile-nav-sheet { display: none !important; }
          .sv-overlay          { display: none; }
          .sv-fab              { display: none; }
          .sv-sheet-overlay    { display: none; }
          .sv-mobile-panel-topbar { display: none !important; }
        }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div className={`sv-toast sv-toast--${toast.type}`}>
          <span>{toast.type === 'error' ? '✕' : toast.type === 'info' ? 'ℹ' : '✓'}</span>
          {toast.msg}
        </div>
      )}

      {/* TOP BAR */}
      <div className="sv-topbar">
        <a href="/" className="sv-logo">
          <div className="sv-logo-mark">
            <img src="/logo.png" alt="StreetViz"
              onError={e => {
                (e.currentTarget as HTMLImageElement).style.display = 'none'
                const p = e.currentTarget.parentElement
                if (p) {
                  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
                  s.setAttribute('width', '16'); s.setAttribute('height', '16'); s.setAttribute('viewBox', '0 0 16 16'); s.setAttribute('fill', 'none')
                  s.innerHTML = '<rect x="2" y="9" width="3" height="5" rx="1" fill="#0A2FFF"/><rect x="6.5" y="5" width="3" height="9" rx="1" fill="#0A2FFF"/><rect x="11" y="2" width="3" height="12" rx="1" fill="#0A2FFF"/>'
                  p.appendChild(s)
                }
              }}
            />
          </div>
          <div>
            <div className="sv-logo-name">Street<span>Viz</span></div>
            <div className="sv-logo-sub">{t.tagline}</div>
          </div>
        </a>

        <div className="sv-nav">
          <div className="sv-nav-inner">
            {(['dashboard', 'analytics', 'reports'] as ActiveNav[]).map(k => (
              <button key={k} onClick={() => setActiveNav(k)} className={`sv-nav-btn${activeNav === k ? ' active' : ''}`}>
                {k === 'dashboard' ? t.navDashboard : k === 'analytics' ? t.navAnalytics : t.navReports}
              </button>
            ))}
          </div>
        </div>

        <div className="sv-topbar-right">
          <div className="sv-lang-switch">
            {(['pt', 'en'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)} className={`sv-lang-btn${lang === l ? ' active' : ''}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="sv-status-badge">
            <StatusDot color="#059669" pulse />
            {t.systemActive}
          </div>
          <button className="sv-report-btn" onClick={openCreate}>+ {t.newProblem}</button>
        </div>

        {/* Mobile right */}
        <div className="sv-mobile-new-btn" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7 }}>
          <div className="sv-lang-switch">
            {(['pt', 'en'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)} className={`sv-lang-btn${lang === l ? ' active' : ''}`}>{l.toUpperCase()}</button>
            ))}
          </div>
          <button className="sv-report-btn" style={{ fontSize: 12, padding: '5px 12px' }} onClick={openCreate}>
            + {lang === 'pt' ? 'Novo' : 'New'}
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="sv-body">

        {/* Sidebar toggle (desktop) */}
        <button
          className={`sv-sidebar-toggle${sidebarCollapsed ? ' collapsed' : ''}`}
          onClick={() => setSidebarCollapsed(p => !p)}
          style={sidebarCollapsed ? { left: 0 } : { left: 360 }}
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" style={{ transform: sidebarCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.22s ease' }}>
            <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Desktop sidebar */}
        <div className={`sv-sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
          {!sidebarCollapsed && SidebarContent}
        </div>

        {/* Main */}
        <div className="sv-main">

          {activeNav === 'analytics' && (
            <div className="sv-main-panels" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="sv-mobile-panel-topbar">
                <button className="sv-mobile-panel-back" onClick={() => goToNav('dashboard')} aria-label="Voltar">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <span className="sv-mobile-panel-topbar-title">{t.analyticsTitle}</span>
              </div>
              {AnalyticsPanel}
            </div>
          )}

          {activeNav === 'reports' && (
            <div className="sv-main-panels" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="sv-mobile-panel-topbar">
                <button className="sv-mobile-panel-back" onClick={() => goToNav('dashboard')} aria-label="Voltar">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <span className="sv-mobile-panel-topbar-title">{t.reportsTitle}</span>
              </div>
              {ReportsPanel}
            </div>
          )}

          {activeNav === 'dashboard' && (
            <>
              <div className="sv-subbar">
                <span className="sv-subbar-loc">
                  Porto, PT <span style={{ color: '#E8E7E2' }}> / </span><span>{t.allZones}</span>
                  {radiusKm && userLocation && <span style={{ color: DS.blue }}> · {radiusKm}km</span>}
                </span>
                <span className={`sv-subbar-status${formMode ? ' active' : ''}`}>
                  {formMode ? (previewPin ? `✓ ${t.locMarked}` : t.clickHint) : `${filtered.length} ${t.occurrences}`}
                </span>
              </div>

              <div className="sv-map-wrap">
                <LeafletMapWrapper
                  problems={filtered}
                  onMapClick={handleMapClick}
                  clickEnabled={!!formMode}
                  previewPin={previewPin}
                />
              </div>

              <div className="sv-detail-bar">
                <div className="sv-icon-tray">
                  <button
                    className={`sv-icon-btn${rightPanel === 'notif' ? ' active' : ''}`}
                    onClick={() => setRightPanel(p => p === 'notif' ? null : 'notif')}
                    title={t.notifTitle}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    {unreadCount > 0 && <span className="sv-notif-badge">{unreadCount}</span>}
                  </button>
                  <div className="sv-icon-divider" />
                  <button
                    className={`sv-icon-btn${rightPanel === 'profile' ? ' active' : ''}`}
                    onClick={() => setRightPanel(p => p === 'profile' ? null : 'profile')}
                    title={currentUserName ?? 'Perfil'}
                  >
                    <div className="sv-avatar">{currentUserName?.charAt(0).toUpperCase() ?? '?'}</div>
                  </button>
                </div>

                {rightPanel && (
                  <div className="sv-right-panel">
                    <div className="sv-panel-toolbar">
                      <span className="sv-panel-toolbar-title">
                        {rightPanel === 'notif' ? t.notifTitle : currentUserName ?? 'Perfil'}
                      </span>
                      <button className="sv-icon-close" onClick={() => setRightPanel(null)}>×</button>
                    </div>
                    <div className="sv-panel-body">
                      {rightPanel === 'notif' && (
                        <>
                          {unreadCount > 0 && (
                            <button className="sv-notif-mark-all" onClick={markAllRead}>{t.notifMarkAll}</button>
                          )}
                          {notifications.length === 0 ? (
                            <div className="sv-notif-empty">{t.notifEmpty}</div>
                          ) : notifications.map((n) => (
                            <div key={n.id} className={`sv-notif-item${n.read ? '' : ' unread'}`} onClick={() => markRead(n.id)}>
                              <div className="sv-notif-icon" style={{ background: n.type === 'new' ? DS.blueLight : DS.greenLight, border: `1px solid ${n.type === 'new' ? DS.blueBorder : DS.greenBorder}` }}>
                                <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke={n.type === 'new' ? DS.blue : DS.green} strokeWidth="1.8" strokeLinecap="round">
                                  {n.type === 'new' ? <><circle cx="8" cy="7" r="3"/><path d="M8 2C5.24 2 3 4.24 3 7c0 4 5 8 5 8s5-4 5-8c0-2.76-2.24-5-5-5z"/></> : <path d="M2 8l4 4 8-8"/>}
                                </svg>
                              </div>
                              <div style={{ flex: 1 }}>
                                <div className="sv-notif-title">{n.title}</div>
                                <div className="sv-notif-msg">{n.message}</div>
                                <div className="sv-notif-time">{timeAgo(n.time, lang)}</div>
                              </div>
                              {!n.read && <span className="sv-notif-unread-dot" />}
                            </div>
                          ))}
                        </>
                      )}

                      {rightPanel === 'profile' && (
                        <div className="sv-profile-content">
                          <div className="sv-profile-card">
                            <div className="sv-profile-avatar">{currentUserName?.charAt(0).toUpperCase() ?? '?'}</div>
                            <div style={{ flex: 1 }}>
                              <div className="sv-profile-name">{currentUserName ?? 'Utilizador'}</div>
                              <div className="sv-profile-email">{currentUserEmail ?? ''}</div>
                            </div>
                            <div className="sv-profile-count">{problems.filter(p => p.user_id === currentUserId).length} {t.subProblems}</div>
                          </div>
                          <div>
                            {[
                              { label: t.myReports,    svgPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', action: () => { setViewMode('meus'); setRightPanel(null) } },
                              { label: t.statsTitle,   svgPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', action: () => { setShowStats(true); setRightPanel(null) } },
                              { label: t.navAnalytics, svgPath: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16', action: () => { goToNav('analytics'); setRightPanel(null) } },
                              { label: t.navReports,   svgPath: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8', action: () => { goToNav('reports'); setRightPanel(null) } },
                            ].map(item => (
                              <button key={item.label} className="sv-menu-item" onClick={item.action}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={item.svgPath}/></svg>
                                {item.label}
                              </button>
                            ))}
                          </div>
                          <button className="sv-signout-btn" onClick={handleSignOut}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                            {t.profileSignOut}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!rightPanel && (
                  <div className="sv-detail-inner">
                    {!selected ? (
                      <div className="sv-detail-hint">{t.selectHint}</div>
                    ) : (
                      <div className="sv-detail-content">
                        <div className="sv-detail-top">
                          <StatusDot color={selected.gravidade === 3 ? DS.red : selected.gravidade === 2 ? DS.amber : DS.green} />
                          <span className="sv-detail-name">{selected.name}</span>
                          <Tag label={catLabel(selected.categoria)} color={CAT_CFG[selected.categoria ?? 'outro'].color} bg={CAT_CFG[selected.categoria ?? 'outro'].bg} border={CAT_CFG[selected.categoria ?? 'outro'].border} />
                          <Tag label={statusLabel(selected.status)} color={STATUS_CFG[selected.status ?? 'ativo'].color} bg={STATUS_CFG[selected.status ?? 'ativo'].bg} border={STATUS_CFG[selected.status ?? 'ativo'].border} />
                        </div>
                        <div className="sv-detail-desc">{selected.description}</div>
                        {selected.photo_urls && selected.photo_urls.length > 0 && (
                          <div className="sv-detail-photos">
                            {selected.photo_urls.map((url, i) => (
                              <img key={i} src={url} alt="" className="sv-detail-photo" onClick={() => window.open(url, '_blank')} />
                            ))}
                          </div>
                        )}
                        <div className="sv-detail-fields">
                          {[
                            { label: t.detailLoc,  value: selected.location ?? '—' },
                            { label: t.detailConf, value: `${selected.confirmacoes} ${t.detailVotes}` },
                            { label: t.detailSev,  value: selected.gravidade === 3 ? t.sevHigh : selected.gravidade === 2 ? t.sevMed : t.sevLow },
                          ].map(f => (
                            <div key={f.label}>
                              <span className="sv-detail-field-label">{f.label}</span>
                              <span className="sv-detail-field-val">{f.value}</span>
                            </div>
                          ))}
                          <div>
                            <span className="sv-detail-field-label">{t.detailScore}</span>
                            <div className="sv-detail-score-wrap">
                              <div className="sv-detail-score-track">
                                <div className="sv-detail-score-bar" style={{ width: `${getVibrancy(selected)}%` }} />
                              </div>
                              <span className="sv-detail-score-val">{getVibrancy(selected)}/100</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {formMode && (
            <div className={`sv-form-drawer${sidebarCollapsed ? ' collapsed-sidebar' : ''}`}>
              {FormContent}
            </div>
          )}
        </div>
      </div>

      {/* FAB — opens mobile nav chooser */}
      <button className="sv-fab" onClick={() => setMobileNavOpen(true)} aria-label="Menu">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="8" y1="6"  x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6"  x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
      </button>

      {/* Mobile overlay + sidebar (list) */}
      <div className={`sv-overlay${mobileSidebarOpen ? ' open' : ''}`} onClick={() => setMobileSidebarOpen(false)} />
      <div className={`sv-mobile-sidebar${mobileSidebarOpen ? ' open' : ''}`}>
        <div className="sv-mobile-header">
          <span className="sv-mobile-title">Street<span>Viz</span></span>
          <button className="sv-icon-close" onClick={() => setMobileSidebarOpen(false)}>×</button>
        </div>
        {SidebarContent}
      </div>

      {/* Mobile nav chooser sheet: Dashboard / Análise / Relatórios */}
      {mobileNavOpen && (
        <>
          <div className="sv-sheet-overlay" onClick={() => setMobileNavOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 740, background: 'rgba(0,0,0,0.22)', animation: 'sv-fadeIn 0.15s ease' }} />
          <div className="sv-mobile-nav-sheet">
            <div className="sv-sheet-handle" />
            {([
              ['dashboard', t.navDashboard, 'M3 9l9-6 9 6v10a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 21V12h6v9'],
              ['analytics', t.navAnalytics, 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16'],
              ['reports',   t.navReports,   'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8'],
            ] as [ActiveNav, string, string][]).map(([nav, label, svgPath]) => (
              <button
                key={nav}
                className={`sv-mobile-nav-item${activeNav === nav ? ' active' : ''}`}
                onClick={() => {
                  if (nav === 'dashboard') { goToNav('dashboard'); setMobileSidebarOpen(true) }
                  else goToNav(nav)
                }}
              >
                <span className="sv-mobile-nav-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={svgPath}/></svg>
                </span>
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Mobile bottom sheet (form) */}
      {formMode && (
        <>
          <div className="sv-sheet-overlay" onClick={closeForm} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.22)', animation: 'sv-fadeIn 0.15s ease' }} />
          <div className="sv-bottom-sheet">
            <div className="sv-sheet-handle" />
            {FormContent}
          </div>
        </>
      )}

      {/* Stats modal */}
      {showStats && (
        <div className="sv-modal-backdrop" onClick={e => e.target === e.currentTarget && setShowStats(false)}>
          <div className="sv-modal">
            <div className="sv-modal-header">
              <span className="sv-modal-title">{t.statsTitle}</span>
              <button className="sv-icon-close" onClick={() => setShowStats(false)}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                { label: t.statTotal,    value: problems.length,                                                                                                   color: DS.blue,  bg: DS.blueLight  },
                { label: t.statsAvg,     value: problems.length ? (problems.reduce((a, p) => a + p.confirmacoes, 0) / problems.length).toFixed(1) : '0',            color: DS.green, bg: DS.greenLight },
                { label: t.statCrit,     value: problems.filter(p => p.gravidade === 3).length,                                                                    color: DS.red,   bg: DS.redLight   },
                { label: t.statsHighPct, value: problems.length ? Math.round(problems.filter(p => p.gravidade === 3).length / problems.length * 100) + '%' : '0%', color: DS.amber, bg: DS.amberLight },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '14px', border: `1px solid ${s.color}20` }}>
                  <div style={{ fontFamily: DS.mono, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: s.color, marginBottom: 7, opacity: 0.8, fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontFamily: DS.mono, fontSize: 26, fontWeight: 500, color: s.color, lineHeight: 1 }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div className="sv-chart-title" style={{ marginBottom: 10 }}>{t.statsByCat}</div>
              {(Object.keys(CAT_CFG) as Categoria[]).map(cat => {
                const count = problems.filter(p => p.categoria === cat).length
                const pct   = problems.length ? Math.round(count / problems.length * 100) : 0
                const cfg   = CAT_CFG[cat]
                return (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 9, color: cfg.color }}>{cfg.icon}</span>
                    <span style={{ width: 70, fontFamily: DS.body, fontSize: 11, color: DS.textSub, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{catLabel(cat)}</span>
                    <div className="sv-progress-track" style={{ flex: 1 }}>
                      <div className="sv-progress-bar" style={{ width: `${pct}%`, background: cfg.color }} />
                    </div>
                    <span style={{ width: 16, fontFamily: DS.mono, fontSize: 10, color: DS.textMuted, textAlign: 'right' as const, flexShrink: 0 }}>{count}</span>
                  </div>
                )
              })}
            </div>

            <div style={{ marginBottom: 8 }}>
              <div className="sv-chart-title" style={{ marginBottom: 10 }}>{t.statsBySev}</div>
              {([[3, t.sevHigh, DS.red], [2, t.sevMed, DS.amber], [1, t.sevLow, DS.green]] as [number, string, string][]).map(([g, label, color]) => {
                const count = problems.filter(p => p.gravidade === g).length
                const pct   = problems.length ? Math.round(count / problems.length * 100) : 0
                return (
                  <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 40, fontFamily: DS.body, fontSize: 11, color: DS.textSub, flexShrink: 0 }}>{label}</span>
                    <div className="sv-progress-track" style={{ flex: 1 }}>
                      <div className="sv-progress-bar" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span style={{ width: 16, fontFamily: DS.mono, fontSize: 10, color: DS.textMuted, textAlign: 'right' as const, flexShrink: 0 }}>{count}</span>
                  </div>
                )
              })}
            </div>

            <button className="sv-btn sv-btn--ghost" onClick={() => setShowStats(false)} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              {t.statsClose}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}