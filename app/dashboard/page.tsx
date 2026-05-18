'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import { Problem } from '@/types/problem'

const LeafletMapWrapper = dynamic(
  () => import('./components/LeafletMapWrapper'),
  { ssr: false }
)

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
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
  id:        string
  type:      'confirm' | 'new' | 'resolved' | 'comment'
  title:     string
  message:   string
  time:      string
  read:      boolean
  problemId?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const DS = {
  blue:        '#1A56DB',
  blueDark:    '#1648C0',
  blueLight:   '#EFF6FF',
  blueBorder:  '#BFDBFE',
  red:         '#DC2626',
  redLight:    '#FEF2F2',
  redBorder:   '#FCA5A5',
  amber:       '#D97706',
  amberLight:  '#FFFBEB',
  amberBorder: '#FCD34D',
  green:       '#059669',
  greenLight:  '#ECFDF5',
  greenBorder: '#6EE7B7',
  purple:      '#7C3AED',
  purpleLight: '#F5F3FF',
  purpleBorder:'#C4B5FD',
  bg:          '#F8F9FB',
  surface:     '#FFFFFF',
  border:      '#EBEBEB',
  borderLight: '#F3F4F6',
  text:        '#111827',
  textSub:     '#6B7280',
  textMuted:   '#9CA3AF',
  textFaint:   '#C4C9D4',
  mono:        "'DM Mono', monospace",
  body:        "'DM Sans', sans-serif",
  rSm:         8,
  rMd:         10,
  rLg:         14,
  rXl:         18,
  shadowSm:    '0 1px 4px rgba(0,0,0,0.06)',
  shadowMd:    '0 4px 20px rgba(0,0,0,0.08)',
  shadowLg:    '0 8px 40px rgba(0,0,0,0.12)',
  trans:       'all 0.18s ease',
  transFast:   'all 0.12s ease',
}

// ─────────────────────────────────────────────────────────────────────────────
// I18N
// ─────────────────────────────────────────────────────────────────────────────
const STRINGS = {
  pt: {
    tagline:          'MELHORA A TUA CIDADE',
    systemActive:     'sistema ativo',
    navDashboard:     'Dashboard',
    navAnalytics:     'Análise',
    navReports:       'Relatórios',
    newProblem:       'Novo problema',
    tabAll:           'Todos',
    tabMine:          'Os meus',
    statTotal:        'Total',
    statConf:         'Confirmações',
    statCrit:         'Críticos',
    subProblems:      'problemas',
    subVotes:         'votos',
    subHighRisk:      'alto risco',
    searchPh:         'Pesquisar ocorrências...',
    radiusLabel:      'Raio',
    radiusClear:      'Limpar',
    sevAll:           'Todos',
    sevHigh:          'Alto',
    sevMed:           'Médio',
    sevLow:           'Baixo',
    catAll:           'Todas',
    statusAll:        'Todos',
    sortLabel:        'Ordenar',
    sortRecent:       'Recente',
    sortSev:          'Gravidade',
    sortConf:         'Confirmações',
    noResults:        'Sem resultados para os filtros aplicados',
    noOccurrences:    'Ainda não há ocorrências nesta área',
    tryFilters:       'Tenta ajustar os filtros',
    beFirst:          'Sê o primeiro a reportar um problema',
    createFirst:      'Criar primeira ocorrência',
    selectHint:       'Seleciona uma ocorrência para ver os detalhes',
    detailLoc:        'Localização',
    detailConf:       'Confirmações',
    detailSev:        'Gravidade',
    detailScore:      'Vibrancy Score',
    detailVotes:      'votos',
    btnConfirm:       'Confirmar',
    btnConfirmed:     'Confirmado',
    btnEdit:          'Editar',
    btnRemove:        'Remover',
    anonLabel:        'Anónimo',
    mineLabel:        'meu',
    timeAgoSuffix:    'atrás',
    formCreate:       'Reportar ocorrência',
    formEdit:         'Editar ocorrência',
    fieldCat:         'Categoria',
    fieldName:        'Nome',
    fieldDesc:        'Descrição',
    fieldLoc:         'Localização',
    fieldSev:         'Gravidade',
    fieldStatus:      'Estado',
    fieldPhotos:      'Fotos (máx. 3)',
    namePh:           'ex: Buraco no passeio',
    descPh:           'Descreve o problema em detalhe...',
    locPh:            'Clica no mapa para marcar o local',
    locMarked:        'Localização marcada',
    clickHint:        'Clica no mapa para marcar',
    useMyLoc:         'Usar a minha localização',
    addPhoto:         'Adicionar foto',
    maxPhotos:        'Máximo de 3 fotos atingido',
    publishAnon:      'Publicar como anónimo',
    btnCancel:        'Cancelar',
    btnSave:          'Guardar alterações',
    btnRegister:      'Registar ocorrência',
    btnMarkFirst:     'Marca o local no mapa',
    saving:           'A guardar...',
    uploading:        'A enviar fotos...',
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
    deleteConfirm:    'Tens a certeza que queres remover esta ocorrência?',
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
    noLocAuth:        'sem localização ativa',
    notifTitle:       'Notificações',
    notifEmpty:       'Sem notificações novas',
    notifMarkAll:     'Marcar todas como lidas',
    analyticsTitle:   'Análise de Dados',
    analyticsDesc:    'Estatísticas detalhadas das ocorrências reportadas',
    reportsTitle:     'Relatórios',
    reportsDesc:      'Exporta e gera relatórios das ocorrências',
    reportGenerate:   'Gerar Relatório',
    reportExportCSV:  'Exportar CSV',
    reportExportJSON: 'Exportar JSON',
    reportPeriod:     'Período',
    reportLast7:      'Últimos 7 dias',
    reportLast30:     'Últimos 30 dias',
    reportLast90:     'Últimos 90 dias',
    reportAllTime:    'Todo o tempo',
    trendUp:          'aumento',
    trendDown:        'redução',
    avgResTime:       'Tempo médio de resolução',
    topAreas:         'Zonas com mais ocorrências',
    heatmapTitle:     'Distribuição por hora',
    weeklyTitle:      'Ocorrências por semana',
    resolutionRate:   'Taxa de resolução',
    activeReporters:  'Reportadores ativos',
  },
  en: {
    tagline:          'IMPROVE YOUR CITY',
    systemActive:     'system active',
    navDashboard:     'Dashboard',
    navAnalytics:     'Analytics',
    navReports:       'Reports',
    newProblem:       'New report',
    tabAll:           'All',
    tabMine:          'Mine',
    statTotal:        'Total',
    statConf:         'Confirmations',
    statCrit:         'Critical',
    subProblems:      'reports',
    subVotes:         'votes',
    subHighRisk:      'high risk',
    searchPh:         'Search reports...',
    radiusLabel:      'Radius',
    radiusClear:      'Clear',
    sevAll:           'All',
    sevHigh:          'High',
    sevMed:           'Medium',
    sevLow:           'Low',
    catAll:           'All',
    statusAll:        'All',
    sortLabel:        'Sort',
    sortRecent:       'Recent',
    sortSev:          'Severity',
    sortConf:         'Confirmations',
    noResults:        'No results for the applied filters',
    noOccurrences:    'No reports in this area yet',
    tryFilters:       'Try adjusting the filters',
    beFirst:          'Be the first to report a problem',
    createFirst:      'Create first report',
    selectHint:       'Select a report to see details',
    detailLoc:        'Location',
    detailConf:       'Confirmations',
    detailSev:        'Severity',
    detailScore:      'Vibrancy Score',
    detailVotes:      'votes',
    btnConfirm:       'Confirm',
    btnConfirmed:     'Confirmed',
    btnEdit:          'Edit',
    btnRemove:        'Remove',
    anonLabel:        'Anonymous',
    mineLabel:        'mine',
    timeAgoSuffix:    'ago',
    formCreate:       'Report an issue',
    formEdit:         'Edit report',
    fieldCat:         'Category',
    fieldName:        'Name',
    fieldDesc:        'Description',
    fieldLoc:         'Location',
    fieldSev:         'Severity',
    fieldStatus:      'Status',
    fieldPhotos:      'Photos (max 3)',
    namePh:           'e.g. Broken pavement',
    descPh:           'Describe the problem in detail...',
    locPh:            'Click the map to mark the location',
    locMarked:        'Location marked',
    clickHint:        'Click the map to mark location',
    useMyLoc:         'Use my location',
    addPhoto:         'Add photo',
    maxPhotos:        'Maximum 3 photos reached',
    publishAnon:      'Publish anonymously',
    btnCancel:        'Cancel',
    btnSave:          'Save changes',
    btnRegister:      'Submit report',
    btnMarkFirst:     'Mark location on map first',
    saving:           'Saving...',
    uploading:        'Uploading photos...',
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
    deleteConfirm:    'Are you sure you want to remove this report?',
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
    noLocAuth:        'no location active',
    notifTitle:       'Notifications',
    notifEmpty:       'No new notifications',
    notifMarkAll:     'Mark all as read',
    analyticsTitle:   'Data Analytics',
    analyticsDesc:    'Detailed statistics of reported issues',
    reportsTitle:     'Reports',
    reportsDesc:      'Export and generate issue reports',
    reportGenerate:   'Generate Report',
    reportExportCSV:  'Export CSV',
    reportExportJSON: 'Export JSON',
    reportPeriod:     'Period',
    reportLast7:      'Last 7 days',
    reportLast30:     'Last 30 days',
    reportLast90:     'Last 90 days',
    reportAllTime:    'All time',
    trendUp:          'increase',
    trendDown:        'reduction',
    avgResTime:       'Avg resolution time',
    topAreas:         'Top areas with reports',
    heatmapTitle:     'Distribution by hour',
    weeklyTitle:      'Reports per week',
    resolutionRate:   'Resolution rate',
    activeReporters:  'Active reporters',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const CAT_CFG: Record<Categoria, { color: string; bg: string; border: string; dot: string; icon: string }> = {
  buraco:     { color: DS.red,    bg: DS.redLight,    border: DS.redBorder,    dot: DS.red,    icon: 'B' },
  iluminacao: { color: DS.amber,  bg: DS.amberLight,  border: DS.amberBorder,  dot: DS.amber,  icon: 'I' },
  lixo:       { color: '#065F46', bg: '#ECFDF5',      border: '#6EE7B7',       dot: '#059669', icon: 'L' },
  agua:       { color: '#0369A1', bg: '#EFF6FF',      border: '#93C5FD',       dot: '#0284C7', icon: 'A' },
  vandalismo: { color: '#6D28D9', bg: '#F5F3FF',      border: '#C4B5FD',       dot: '#7C3AED', icon: 'V' },
  vegetacao:  { color: '#166534', bg: '#F0FDF4',      border: '#86EFAC',       dot: '#16A34A', icon: 'G' },
  outro:      { color: DS.textSub,bg: DS.bg,          border: DS.border,       dot: DS.textMuted, icon: 'O' },
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<Status, { color: string; bg: string; border: string }> = {
  ativo:      { color: DS.red,   bg: DS.redLight,   border: DS.redBorder },
  em_analise: { color: DS.amber, bg: DS.amberLight, border: DS.amberBorder },
  resolvido:  { color: DS.green, bg: DS.greenLight, border: DS.greenBorder },
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
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
  if (diff < 60)    return lang === 'pt' ? 'agora mesmo' : 'just now'
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

function generateWeeklyData(problems: ProblemExt[]) {
  const weeks: { label: string; count: number; resolved: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d     = new Date()
    d.setDate(d.getDate() - i * 7)
    const label = `${d.getDate()}/${d.getMonth() + 1}`
    const count = Math.floor(Math.random() * 8) + 1
    weeks.push({ label, count, resolved: Math.floor(count * 0.4) })
  }
  return weeks
}

function generateHourlyData() {
  return Array.from({ length: 24 }, (_, h) => ({
    hour:  h,
    count: h >= 7 && h <= 20 ? Math.floor(Math.random() * 12) + 1 : Math.floor(Math.random() * 3),
  }))
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON CARD
// ─────────────────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: DS.surface, borderRadius: DS.rMd, padding: '13px 14px', border: `1px solid ${DS.borderLight}`, animation: 'sv-shimmer 1.6s ease-in-out infinite' }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: DS.borderLight, marginTop: 4, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 12, background: DS.borderLight, borderRadius: 4, marginBottom: 7, width: '62%' }} />
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ height: 17, width: 54, background: DS.bg, borderRadius: 20 }} />
            <div style={{ height: 17, width: 44, background: DS.bg, borderRadius: 20 }} />
          </div>
        </div>
      </div>
      <div style={{ height: 9, background: DS.bg, borderRadius: 4, marginBottom: 5 }} />
      <div style={{ height: 9, background: DS.bg, borderRadius: 4, width: '70%' }} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PILL BUTTON
// ─────────────────────────────────────────────────────────────────────────────
interface PillProps {
  label:   string
  active:  boolean
  color?:  string
  bg?:     string
  border?: string
  dot?:    string
  onClick: () => void
}

function Pill({ label, active, color = DS.blue, bg = DS.blueLight, border = DS.blueBorder, dot, onClick }: PillProps) {
  return (
    <button
      onClick={onClick}
      style={{ fontFamily: DS.body, fontSize: 11, fontWeight: active ? 500 : 400, padding: '3px 10px', borderRadius: 20, border: `1px solid ${active ? border : DS.border}`, background: active ? bg : DS.surface, color: active ? color : DS.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: DS.transFast, flexShrink: 0, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}
    >
      {dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: active ? dot : DS.textFaint, display: 'inline-block', flexShrink: 0, transition: DS.transFast }} />}
      {label}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────────────────────────────────────
interface BadgeProps { label: string; color: string; bg: string; border: string }

function Badge({ label, color, bg, border }: BadgeProps) {
  return (
    <span style={{ fontFamily: DS.mono, fontSize: 9, fontWeight: 500, color, background: bg, border: `1px solid ${border}`, borderRadius: 4, padding: '1px 6px', letterSpacing: '0.01em', whiteSpace: 'nowrap', flexShrink: 0 }}>
      {label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FIELD LABEL
// ─────────────────────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, letterSpacing: '0.07em', textTransform: 'uppercase', color: DS.textMuted, marginBottom: 6, fontFamily: DS.mono }}>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MINI BAR CHART
// ─────────────────────────────────────────────────────────────────────────────
interface MiniBarProps {
  data:        { label: string; value: number; color?: string }[]
  height?:     number
  showLabels?: boolean
}

function MiniBarChart({ data, height = 80, showLabels = true }: MiniBarProps) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height, paddingBottom: showLabels ? 18 : 0, position: 'relative' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 3 : 0, background: d.color ?? DS.blue, borderRadius: '3px 3px 0 0', transition: 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)', animation: `sv-barGrow 0.5s ease ${i * 0.05}s both`, opacity: 0.85 }} />
          {showLabels && (
            <span style={{ fontSize: 8, fontFamily: DS.mono, color: DS.textFaint, position: 'absolute', bottom: 0, whiteSpace: 'nowrap', transform: 'translateX(-50%)', left: `calc(${(i / data.length) * 100}% + ${100 / data.length / 2}%)` }}>
              {d.label}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DONUT CHART
// ─────────────────────────────────────────────────────────────────────────────
interface DonutProps {
  segments: { value: number; color: string; label: string }[]
  size?:    number
  label?:   string
}

function DonutChart({ segments, size = 100, label }: DonutProps) {
  const total  = segments.reduce((s, d) => s + d.value, 0) || 1
  const stroke = size * 0.18
  const r      = (size - stroke) / 2
  const circ   = 2 * Math.PI * r
  let   offset = 0

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {segments.map((s, i) => {
          const pct  = s.value / total
          const dash = pct * circ
          const gap  = circ - dash
          const el   = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={stroke} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset * circ} strokeLinecap="round" opacity={0.85} style={{ transition: 'stroke-dasharray 0.6s ease' }} />
          )
          offset += pct
          return el
        })}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={DS.borderLight} strokeWidth={stroke} />
      </svg>
      {label && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: DS.mono, fontSize: size * 0.18, fontWeight: 500, color: DS.text, lineHeight: 1 }}>{label}</span>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TREND BADGE
// ─────────────────────────────────────────────────────────────────────────────
function TrendBadge({ value, lang }: { value: number; lang: Lang }) {
  const t  = STRINGS[lang]
  const up = value >= 0
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, fontFamily: DS.mono, fontWeight: 500, color: up ? DS.red : DS.green, background: up ? DS.redLight : DS.greenLight, border: `1px solid ${up ? DS.redBorder : DS.greenBorder}`, borderRadius: 20, padding: '1px 7px' }}>
      {up ? '↑' : '↓'} {Math.abs(value)}% {up ? t.trendUp : t.trendDown}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED NUMBER
// ─────────────────────────────────────────────────────────────────────────────
function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
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

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS RING
// ─────────────────────────────────────────────────────────────────────────────
function ProgressRing({ pct, color, size = 56 }: { pct: number; color: string; size?: number }) {
  const stroke = 5
  const r      = (size - stroke) / 2
  const circ   = 2 * Math.PI * r
  const dash   = (pct / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={DS.borderLight} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)' }} />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
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

  const [formMode,          setFormMode]         = useState<FormMode>(null)
  const [editingId,         setEditingId]        = useState<string | null>(null)
  const [saving,            setSaving]           = useState(false)
  const [uploadingPhotos,   setUploadingPhotos]  = useState(false)
  const [previewPin,        setPreviewPin]       = useState<{ lat: number; lng: number } | null>(null)
  const [photoFiles,        setPhotoFiles]       = useState<File[]>([])
  const [photoPreviews,     setPhotoPreviews]    = useState<string[]>([])
  const [photoUrlsExisting, setPhotoUrlsExisting]= useState<string[]>([])
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
  const [activeNav,         setActiveNav]        = useState<ActiveNav>('dashboard')
  const [sidebarCollapsed,  setSidebarCollapsed] = useState(false)
  const [radiusKm,          setRadiusKm]         = useState<number | null>(null)
  const [showRadiusPicker,  setShowRadiusPicker] = useState(false)
  const [userLocation,      setUserLocation]     = useState<{ lat: number; lng: number } | null>(null)
  const [reportPeriod,      setReportPeriod]     = useState<'7' | '30' | '90' | 'all'>('30')
  const [generatingReport,  setGeneratingReport] = useState(false)
  const [reportGenerated,   setReportGenerated]  = useState(false)
  const [hoveredCard,       setHoveredCard]      = useState<string | null>(null)
  const [toast,             setToast]            = useState<{ msg: string; type: 'success'|'error'|'info' } | null>(null)

  const showToast = useCallback((msg: string, type: 'success'|'error'|'info' = 'success') => {
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
          title:   lang === 'pt' ? 'Nova ocorrência reportada' : 'New report added',
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

  const weeklyData    = useMemo(() => generateWeeklyData(problems), [problems])
  const hourlyData    = useMemo(() => generateHourlyData(), [])
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
  const removeExistingPhoto = (i: number) => { setPhotoUrlsExisting(p => p.filter((_, j) => j !== i)) }
  const totalPhotos = photoUrlsExisting.length + photoPreviews.length

  const handleCreate = async () => {
    if (form.name.trim().length < 3)         { showToast(lang === 'pt' ? 'Nome demasiado curto' : 'Name too short', 'error'); return }
    if (form.description.trim().length < 10) { showToast(lang === 'pt' ? 'Descrição muito curta' : 'Description too short', 'error'); return }
    if (!form.lat || !form.lng)              { showToast(lang === 'pt' ? 'Clica no mapa para escolher a localização.' : 'Click the map to choose a location.', 'error'); return }
    setSaving(true)
    let photoUrls: string[] = []
    if (photoFiles.length > 0) { setUploadingPhotos(true); photoUrls = await uploadPhotos(photoFiles); setUploadingPhotos(false) }
    const locationName = await reverseGeocode(form.lat, form.lng)
    const payload = { name: form.name.trim(), description: form.description.trim(), location: locationName, latitude: form.lat, longitude: form.lng, gravidade: form.gravidade, confirmacoes: 0, validated_level: 1, user_id: currentUserId, user_name: form.is_anonymous ? null : (currentUserName ?? null), is_anonymous: form.is_anonymous, photo_urls: photoUrls, categoria: form.categoria, status: form.status }
    const { data, error } = await supabase.from('problems').insert([payload]).select()
    if (error) { console.error(error); showToast('Erro: ' + (error?.message || 'unknown'), 'error'); setSaving(false); return }
    if (data) setProblems(prev => [(data[0] as ProblemExt), ...prev])
    showToast(lang === 'pt' ? 'Ocorrência registada com sucesso!' : 'Report submitted successfully!', 'success')
    setSaving(false)
    closeForm()
  }

  const handleEdit = async () => {
    if (!editingId || !form.name.trim() || !form.description.trim()) { showToast(lang === 'pt' ? 'Preenche o nome e a descrição.' : 'Fill in name and description.', 'error'); return }
    setSaving(true)
    let newUrls: string[] = []
    if (photoFiles.length > 0) { setUploadingPhotos(true); newUrls = await uploadPhotos(photoFiles); setUploadingPhotos(false) }
    const allPhotoUrls = [...photoUrlsExisting, ...newUrls]
    const updates: Partial<ProblemExt> = { name: form.name.trim(), description: form.description.trim(), gravidade: form.gravidade, photo_urls: allPhotoUrls, categoria: form.categoria, status: form.status }
    if (form.lat && form.lng) { updates.latitude = form.lat; updates.longitude = form.lng; updates.location = await reverseGeocode(form.lat, form.lng) }
    const { error } = await supabase.from('problems').update(updates).eq('id', editingId)
    if (error) { console.error(error); showToast('Erro ao guardar', 'error'); setSaving(false); return }
    setProblems(prev => prev.map(p => p.id === editingId ? { ...p, ...updates } : p))
    showToast(lang === 'pt' ? 'Alterações guardadas!' : 'Changes saved!', 'success')
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
    showToast(lang === 'pt' ? 'Confirmação registada!' : 'Confirmation registered!', 'success')
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

  const handleExportCSV = () => { downloadFile(generateCSV(filteredForReport), `streetviz-report-${Date.now()}.csv`, 'text/csv'); showToast('CSV exportado com sucesso!', 'success') }
  const handleExportJSON = () => { downloadFile(JSON.stringify(filteredForReport, null, 2), `streetviz-report-${Date.now()}.json`, 'application/json'); showToast('JSON exportado com sucesso!', 'success') }

  const handleGenerateReport = async () => {
    setGeneratingReport(true)
    await new Promise(r => setTimeout(r, 1800))
    setGeneratingReport(false)
    setReportGenerated(true)
    showToast(lang === 'pt' ? 'Relatório gerado com sucesso!' : 'Report generated successfully!', 'success')
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

  const inputSt: React.CSSProperties = {
    width: '100%', fontFamily: DS.body, fontSize: 14, padding: '10px 13px', border: `1px solid ${DS.border}`, borderRadius: DS.rSm, background: DS.bg, color: DS.text, outline: 'none', resize: 'none' as const, lineHeight: 1.55, transition: DS.transFast, letterSpacing: '-0.01em',
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PHOTO SECTION
  // ─────────────────────────────────────────────────────────────────────────
  const PhotoSection = (
    <div>
      <FieldLabel>{t.fieldPhotos}</FieldLabel>
      {(photoUrlsExisting.length > 0 || photoPreviews.length > 0) && (
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 9 }}>
          {photoUrlsExisting.map((url, i) => (
            <div key={`ex-${i}`} style={{ position: 'relative', width: 74, height: 74, borderRadius: DS.rSm, overflow: 'hidden', border: `1px solid ${DS.border}`, animation: 'sv-fadeIn 0.2s ease' }}>
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <button onClick={() => removeExistingPhoto(i)} style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>×</button>
            </div>
          ))}
          {photoPreviews.map((url, i) => (
            <div key={`new-${i}`} style={{ position: 'relative', width: 74, height: 74, borderRadius: DS.rSm, overflow: 'hidden', border: `2px solid ${DS.blue}`, animation: 'sv-fadeIn 0.2s ease' }}>
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <button onClick={() => removeNewPhoto(i)} style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      )}
      {totalPhotos < 3 ? (
        <>
          <input ref={photoInputRef} type="file" accept="image/*" capture="environment" multiple style={{ display: 'none' }} onChange={handlePhotoSelect} />
          <button onClick={() => photoInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 13px', border: `1.5px dashed ${DS.border}`, borderRadius: DS.rSm, background: DS.bg, color: DS.textMuted, cursor: 'pointer', fontFamily: DS.body, fontSize: 13, transition: DS.transFast, letterSpacing: '-0.01em' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            {t.addPhoto}
            <span style={{ marginLeft: 'auto', fontFamily: DS.mono, fontSize: 10, color: DS.border }}>{totalPhotos}/3</span>
          </button>
        </>
      ) : (
        <div style={{ fontSize: 11, color: DS.textMuted, fontFamily: DS.mono, padding: '6px 0' }}>{t.maxPhotos}</div>
      )}
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // FORM CONTENT
  // ─────────────────────────────────────────────────────────────────────────
  const FormContent = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: `1px solid ${DS.borderLight}`, marginBottom: 2 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: DS.text, letterSpacing: '-0.02em' }}>{formMode === 'criar' ? t.formCreate : t.formEdit}</div>
        <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: DS.textMuted, fontSize: 22, lineHeight: 1, padding: '0 2px', borderRadius: DS.rSm, transition: DS.transFast }}>×</button>
      </div>

      <div>
        <FieldLabel>{t.fieldCat}</FieldLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
          {(Object.keys(CAT_CFG) as Categoria[]).map(cat => {
            const cfg = CAT_CFG[cat]; const active = form.categoria === cat
            return (
              <button key={cat} onClick={() => setForm(f => ({ ...f, categoria: cat }))} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: DS.rSm, border: `1px solid ${active ? cfg.border : DS.border}`, background: active ? cfg.bg : DS.surface, color: active ? cfg.color : DS.textSub, cursor: 'pointer', fontFamily: DS.body, fontSize: 12, fontWeight: active ? 500 : 400, transition: DS.transFast, textAlign: 'left' as const, letterSpacing: '-0.01em' }}>
                <span style={{ fontFamily: DS.mono, fontSize: 9, fontWeight: 700, letterSpacing: '0.04em', color: 'inherit', opacity: 0.7 }}>{cfg.icon}</span>
                {catLabel(cat)}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <FieldLabel>{t.fieldName}</FieldLabel>
        <input placeholder={t.namePh} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputSt} className="sv-input" autoFocus />
      </div>

      <div>
        <FieldLabel>{t.fieldDesc}</FieldLabel>
        <textarea rows={3} placeholder={t.descPh} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={inputSt} className="sv-input" />
      </div>

      <div>
        <FieldLabel>{t.fieldLoc}</FieldLabel>
        <div style={{ padding: '9px 12px', border: `1.5px solid ${previewPin ? DS.green : DS.border}`, borderRadius: DS.rSm, background: previewPin ? DS.greenLight : DS.bg, fontSize: 12, fontFamily: DS.mono, color: previewPin ? DS.green : DS.textMuted, minHeight: 40, display: 'flex', alignItems: 'center', gap: 6, transition: DS.trans }}>
          {previewPin ? (
            <><span style={{ flex: 1 }}>{previewPin.lat.toFixed(5)}, {previewPin.lng.toFixed(5)}</span><button onClick={() => { setPreviewPin(null); setForm(p => ({ ...p, lat: null, lng: null, location: '' })) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: DS.green, fontSize: 16, lineHeight: 1, padding: 0 }}>×</button></>
          ) : <span>{t.locPh}</span>}
        </div>
        <button onClick={handleUseMyLocation} style={{ marginTop: 5, fontSize: 12, color: DS.blue, background: 'none', border: 'none', cursor: 'pointer', fontFamily: DS.body, padding: 0, letterSpacing: '-0.01em' }}>{t.useMyLoc}</button>
      </div>

      <div>
        <FieldLabel>{t.fieldSev}</FieldLabel>
        <div style={{ display: 'flex', gap: 5 }}>
          {([[1, t.sevLow, DS.green, DS.greenLight, DS.greenBorder], [2, t.sevMed, DS.amber, DS.amberLight, DS.amberBorder], [3, t.sevHigh, DS.red, DS.redLight, DS.redBorder]] as [Gravidade, string, string, string, string][]).map(([v, label, color, bg, border]) => (
            <button key={v} onClick={() => setForm({ ...form, gravidade: v })} style={{ flex: 1, padding: '8px 0', borderRadius: DS.rSm, border: `1px solid ${form.gravidade === v ? border : DS.border}`, background: form.gravidade === v ? bg : DS.surface, color: form.gravidade === v ? color : DS.textMuted, cursor: 'pointer', fontFamily: DS.body, fontSize: 13, fontWeight: form.gravidade === v ? 500 : 400, transition: DS.transFast, letterSpacing: '-0.01em' }}>{label}</button>
          ))}
        </div>
      </div>

      {formMode === 'editar' && (
        <div>
          <FieldLabel>{t.fieldStatus}</FieldLabel>
          <div style={{ display: 'flex', gap: 5 }}>
            {(['ativo', 'em_analise', 'resolvido'] as Status[]).map(s => {
              const cfg = STATUS_CFG[s]; const active = form.status === s
              return <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))} style={{ flex: 1, padding: '8px 0', borderRadius: DS.rSm, border: `1px solid ${active ? cfg.border : DS.border}`, background: active ? cfg.bg : DS.surface, color: active ? cfg.color : DS.textMuted, cursor: 'pointer', fontFamily: DS.body, fontSize: 12, fontWeight: active ? 500 : 400, transition: DS.transFast, letterSpacing: '-0.01em' }}>{statusLabel(s)}</button>
            })}
          </div>
        </div>
      )}

      {PhotoSection}

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: DS.textSub, cursor: 'pointer', fontFamily: DS.body }}>
        <input type="checkbox" checked={form.is_anonymous} onChange={e => setForm({ ...form, is_anonymous: e.target.checked })} style={{ width: 14, height: 14, cursor: 'pointer', accentColor: DS.blue }} />
        {t.publishAnon}
      </label>

      <div style={{ display: 'flex', gap: 7, paddingTop: 4 }}>
        <button onClick={closeForm} style={{ flex: 1, padding: '10px 0', fontFamily: DS.body, fontSize: 13, border: `1px solid ${DS.border}`, borderRadius: DS.rMd, background: DS.surface, color: DS.textSub, cursor: 'pointer', transition: DS.transFast, letterSpacing: '-0.01em' }}>{t.btnCancel}</button>
        <button onClick={formMode === 'criar' ? handleCreate : handleEdit} disabled={saving || (formMode === 'criar' && !previewPin)} style={{ flex: 2, padding: '10px 0', fontFamily: DS.body, fontSize: 13, fontWeight: 600, border: 'none', borderRadius: DS.rMd, background: saving || (formMode === 'criar' && !previewPin) ? '#93BBFD' : DS.blue, color: '#ffffff', cursor: saving || (formMode === 'criar' && !previewPin) ? 'not-allowed' : 'pointer', transition: DS.transFast, letterSpacing: '-0.01em' }}>
          {uploadingPhotos ? t.uploading : saving ? t.saving : formMode === 'editar' ? t.btnSave : !previewPin ? t.btnMarkFirst : t.btnRegister}
        </button>
      </div>
    </>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // ANALYTICS PANEL
  // ─────────────────────────────────────────────────────────────────────────
  const AnalyticsPanel = (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontFamily: DS.mono, fontSize: 17, fontWeight: 500, color: DS.text, margin: 0, letterSpacing: '-0.02em' }}>{t.analyticsTitle}</h2>
        <p style={{ fontFamily: DS.body, fontSize: 12, color: DS.textMuted, margin: '4px 0 0', letterSpacing: '-0.01em' }}>{t.analyticsDesc}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { label: t.statTotal,      value: problems.length,                                           color: DS.blue,  bg: DS.blueLight,  trend: 12 },
          { label: t.statConf,       value: problems.reduce((a, p) => a + p.confirmacoes, 0),          color: DS.green, bg: DS.greenLight, trend: 8  },
          { label: t.statCrit,       value: problems.filter(p => p.gravidade === 3).length,            color: DS.red,   bg: DS.redLight,   trend: -3 },
          { label: t.resolutionRate, value: `${resolutionPct}%`,                                       color: DS.amber, bg: DS.amberLight, trend: 5  },
        ].map((kpi, i) => (
          <div key={i} className="sv-kpi-card" style={{ background: DS.surface, border: `1px solid ${DS.borderLight}`, borderRadius: DS.rLg, padding: '16px 16px 14px', position: 'relative', overflow: 'hidden', animation: `sv-fadeUp 0.3s ease ${i * 0.07}s both` }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: kpi.color, borderRadius: '14px 14px 0 0', opacity: 0.7 }} />
            <div style={{ fontSize: 10, fontFamily: DS.mono, color: DS.textFaint, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>{kpi.label}</div>
            <div style={{ fontFamily: DS.mono, fontSize: 28, fontWeight: 500, color: kpi.color, lineHeight: 1, marginBottom: 8 }}>{typeof kpi.value === 'number' ? <AnimatedNumber value={kpi.value} /> : kpi.value}</div>
            <TrendBadge value={kpi.trend} lang={lang} />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ background: DS.surface, border: `1px solid ${DS.borderLight}`, borderRadius: DS.rLg, padding: '16px 16px 10px' }}>
          <div style={{ fontSize: 11, fontFamily: DS.mono, color: DS.textSub, letterSpacing: '0.04em', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ textTransform: 'uppercase' }}>{t.weeklyTitle}</span>
            <span style={{ color: DS.textFaint }}>({lang === 'pt' ? 'semanas' : 'weeks'})</span>
          </div>
          <MiniBarChart data={weeklyData.map(w => ({ label: w.label, value: w.count, color: DS.blue }))} height={90} />
        </div>
        <div style={{ background: DS.surface, border: `1px solid ${DS.borderLight}`, borderRadius: DS.rLg, padding: '16px 16px 10px' }}>
          <div style={{ fontSize: 11, fontFamily: DS.mono, color: DS.textSub, letterSpacing: '0.04em', marginBottom: 12, textTransform: 'uppercase' }}>{t.statsByCat}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <DonutChart segments={(Object.keys(CAT_CFG) as Categoria[]).map(cat => ({ value: problems.filter(p => p.categoria === cat).length, color: CAT_CFG[cat].dot, label: catLabel(cat) }))} size={90} label={`${problems.length}`} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {(Object.keys(CAT_CFG) as Categoria[]).slice(0, 5).map(cat => {
                const count = problems.filter(p => p.categoria === cat).length
                const pct   = problems.length ? Math.round(count / problems.length * 100) : 0
                return (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: CAT_CFG[cat].dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: DS.textSub, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: DS.body }}>{catLabel(cat)}</span>
                    <span style={{ fontSize: 9, fontFamily: DS.mono, color: DS.textMuted }}>{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: DS.surface, border: `1px solid ${DS.borderLight}`, borderRadius: DS.rLg, padding: '16px 16px 14px' }}>
        <div style={{ fontSize: 11, fontFamily: DS.mono, color: DS.textSub, letterSpacing: '0.04em', marginBottom: 14, textTransform: 'uppercase' }}>{t.heatmapTitle}</div>
        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 60 }}>
          {hourlyData.map((h, i) => {
            const maxH = Math.max(...hourlyData.map(d => d.count), 1)
            const pct  = h.count / maxH
            const isActive = new Date().getHours() === h.hour
            return (
              <div key={i} title={`${h.hour}h: ${h.count}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', height: `${pct * 85 + 5}%`, background: isActive ? DS.blue : `${DS.blue}${Math.round(pct * 200).toString(16).padStart(2, '0')}`, borderRadius: '2px 2px 0 0', transition: DS.trans, outline: isActive ? `2px solid ${DS.blue}` : 'none', outlineOffset: 1 }} />
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {[0, 6, 12, 18, 23].map(h => <span key={h} style={{ fontFamily: DS.mono, fontSize: 8, color: DS.textFaint }}>{h}h</span>)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ background: DS.surface, border: `1px solid ${DS.borderLight}`, borderRadius: DS.rLg, padding: '16px' }}>
          <div style={{ fontSize: 11, fontFamily: DS.mono, color: DS.textSub, letterSpacing: '0.04em', marginBottom: 14, textTransform: 'uppercase' }}>{t.statsBySev}</div>
          {([[3, t.sevHigh, DS.red], [2, t.sevMed, DS.amber], [1, t.sevLow, DS.green]] as [number, string, string][]).map(([g, label, color]) => {
            const count = problems.filter(p => p.gravidade === g).length
            const pct   = problems.length ? Math.round(count / problems.length * 100) : 0
            return (
              <div key={g} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: DS.textSub, fontFamily: DS.body, letterSpacing: '-0.01em' }}>{label}</span>
                  <span style={{ fontSize: 10, fontFamily: DS.mono, color: DS.textMuted }}>{count}</span>
                </div>
                <div style={{ height: 6, background: DS.borderLight, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.7s cubic-bezier(0.34,1.56,0.64,1)' }} />
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ background: DS.surface, border: `1px solid ${DS.borderLight}`, borderRadius: DS.rLg, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={{ fontSize: 11, fontFamily: DS.mono, color: DS.textSub, letterSpacing: '0.04em', textTransform: 'uppercase', alignSelf: 'flex-start' }}>{t.resolutionRate}</div>
          <div style={{ position: 'relative' }}>
            <ProgressRing pct={resolutionPct} color={DS.green} size={80} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontFamily: DS.mono, fontSize: 18, fontWeight: 500, color: DS.green }}>{resolutionPct}%</span>
            </div>
          </div>
          <div style={{ fontFamily: DS.body, fontSize: 11, color: DS.textMuted, textAlign: 'center', letterSpacing: '-0.01em' }}>{problems.filter(p => p.status === 'resolvido').length} / {problems.length} {t.subProblems}</div>
        </div>
      </div>

      <div style={{ background: DS.surface, border: `1px solid ${DS.borderLight}`, borderRadius: DS.rLg, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px 12px', borderBottom: `1px solid ${DS.borderLight}` }}>
          <span style={{ fontSize: 11, fontFamily: DS.mono, color: DS.textSub, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{t.topAreas}</span>
        </div>
        {(Object.keys(CAT_CFG) as Categoria[])
          .map(cat => ({ cat, count: problems.filter(p => p.categoria === cat).length, conf: problems.filter(p => p.categoria === cat).reduce((a, p) => a + p.confirmacoes, 0) }))
          .sort((a, b) => b.count - a.count).slice(0, 5)
          .map((row, i) => {
            const cfg = CAT_CFG[row.cat]
            return (
              <div key={row.cat} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: i < 4 ? `1px solid ${DS.borderLight}` : 'none', animation: `sv-slideIn 0.2s ease ${i * 0.06}s both` }}>
                <span style={{ fontFamily: DS.mono, fontSize: 10, color: DS.textFaint, width: 14, textAlign: 'right', flexShrink: 0 }}>#{i + 1}</span>
                <span style={{ fontFamily: DS.mono, fontSize: 9, fontWeight: 700, letterSpacing: '0.04em', color: 'inherit', opacity: 0.7 }}>{cfg.icon}</span>
                <span style={{ flex: 1, fontFamily: DS.body, fontSize: 13, color: DS.text, letterSpacing: '-0.01em' }}>{catLabel(row.cat)}</span>
                <Badge label={`${row.count}`} color={cfg.color} bg={cfg.bg} border={cfg.border} />
                <span style={{ fontFamily: DS.mono, fontSize: 10, color: DS.textMuted }}>{row.conf} ✓</span>
              </div>
            )
          })}
      </div>
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // REPORTS PANEL
  // ─────────────────────────────────────────────────────────────────────────
  const ReportsPanel = (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontFamily: DS.mono, fontSize: 17, fontWeight: 500, color: DS.text, margin: 0, letterSpacing: '-0.02em' }}>{t.reportsTitle}</h2>
        <p style={{ fontFamily: DS.body, fontSize: 12, color: DS.textMuted, margin: '4px 0 0', letterSpacing: '-0.01em' }}>{t.reportsDesc}</p>
      </div>

      <div style={{ background: DS.surface, border: `1px solid ${DS.borderLight}`, borderRadius: DS.rLg, padding: '16px' }}>
        <FieldLabel>{t.reportPeriod}</FieldLabel>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {([['7', t.reportLast7], ['30', t.reportLast30], ['90', t.reportLast90], ['all', t.reportAllTime]] as ['7'|'30'|'90'|'all', string][]).map(([v, label]) => (
            <button key={v} onClick={() => setReportPeriod(v)} style={{ fontFamily: DS.body, fontSize: 12, padding: '6px 14px', borderRadius: 20, border: `1px solid ${reportPeriod === v ? DS.blueBorder : DS.border}`, background: reportPeriod === v ? DS.blueLight : DS.surface, color: reportPeriod === v ? DS.blue : DS.textMuted, cursor: 'pointer', transition: DS.transFast, fontWeight: reportPeriod === v ? 500 : 400, letterSpacing: '-0.01em' }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { label: t.statTotal,       value: filteredForReport.length,                                            color: DS.blue  },
          { label: t.statCrit,        value: filteredForReport.filter(p => p.gravidade === 3).length,             color: DS.red   },
          { label: t.statusResolvido, value: filteredForReport.filter(p => p.status === 'resolvido').length,      color: DS.green },
        ].map((s, i) => (
          <div key={i} style={{ background: DS.surface, border: `1px solid ${DS.borderLight}`, borderRadius: DS.rMd, padding: '14px 14px 12px' }}>
            <div style={{ fontSize: 9, fontFamily: DS.mono, color: DS.textFaint, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: DS.mono, fontSize: 22, fontWeight: 500, color: s.color }}><AnimatedNumber value={s.value} /></div>
          </div>
        ))}
      </div>

      <div style={{ background: DS.surface, border: `1px solid ${DS.borderLight}`, borderRadius: DS.rLg, padding: '16px' }}>
        <FieldLabel>Export</FieldLabel>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={handleExportCSV} className="sv-btn-export" style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: DS.body, fontSize: 13, fontWeight: 500, padding: '9px 16px', border: `1px solid ${DS.border}`, borderRadius: DS.rMd, background: DS.surface, color: DS.textSub, cursor: 'pointer', transition: DS.transFast, letterSpacing: '-0.01em' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            {t.reportExportCSV}
          </button>
          <button onClick={handleExportJSON} className="sv-btn-export" style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: DS.body, fontSize: 13, fontWeight: 500, padding: '9px 16px', border: `1px solid ${DS.border}`, borderRadius: DS.rMd, background: DS.surface, color: DS.textSub, cursor: 'pointer', transition: DS.transFast, letterSpacing: '-0.01em' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            {t.reportExportJSON}
          </button>
          <button onClick={handleGenerateReport} disabled={generatingReport} style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: DS.body, fontSize: 13, fontWeight: 600, padding: '9px 18px', border: 'none', borderRadius: DS.rMd, background: reportGenerated ? DS.green : generatingReport ? '#93BBFD' : DS.blue, color: '#ffffff', cursor: generatingReport ? 'not-allowed' : 'pointer', transition: DS.trans, letterSpacing: '-0.01em', boxShadow: `0 2px 8px ${reportGenerated ? DS.greenBorder : DS.blueBorder}` }}>
            {generatingReport ? (<><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: 'sv-spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>{lang === 'pt' ? 'A gerar...' : 'Generating...'}</>) : reportGenerated ? <>✓ {lang === 'pt' ? 'Gerado!' : 'Generated!'}</> : (<><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>{t.reportGenerate}</>)}
          </button>
        </div>
      </div>

      <div style={{ background: DS.surface, border: `1px solid ${DS.borderLight}`, borderRadius: DS.rLg, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${DS.borderLight}` }}>
          <span style={{ fontSize: 11, fontFamily: DS.mono, color: DS.textSub, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{filteredForReport.length} {t.subProblems}</span>
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {filteredForReport.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: DS.textMuted, fontSize: 13, fontFamily: DS.body }}>{t.noResults}</div>
          ) : filteredForReport.map((p, i) => {
            const catCfg    = CAT_CFG[p.categoria ?? 'outro']
            const statusCfg = STATUS_CFG[p.status ?? 'ativo']
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: i < filteredForReport.length - 1 ? `1px solid ${DS.borderLight}` : 'none', animation: `sv-fadeIn 0.15s ease ${i * 0.02}s both` }}>
                <span style={{ fontFamily: DS.mono, fontSize: 9, fontWeight: 700, color: 'inherit', opacity: 0.7 }}>{catCfg.icon}</span>
                <span style={{ flex: 1, fontFamily: DS.body, fontSize: 12, color: DS.text, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                <Badge label={statusLabel(p.status)} color={statusCfg.color} bg={statusCfg.bg} border={statusCfg.border} />
                <Badge label={sevLabel(p.gravidade)} color={p.gravidade === 3 ? DS.red : p.gravidade === 2 ? DS.amber : DS.green} bg={p.gravidade === 3 ? DS.redLight : p.gravidade === 2 ? DS.amberLight : DS.greenLight} border={p.gravidade === 3 ? DS.redBorder : p.gravidade === 2 ? DS.amberBorder : DS.greenBorder} />
                <span style={{ fontFamily: DS.mono, fontSize: 10, color: DS.textMuted, flexShrink: 0 }}>{timeAgo(p.created_at, lang)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // SIDEBAR CONTENT
  // ─────────────────────────────────────────────────────────────────────────
  const SidebarContent = (
    <>
      <div style={{ display: 'flex', borderBottom: `1px solid ${DS.border}`, flexShrink: 0, background: DS.surface }}>
        {([['todos', t.tabAll], ['meus', t.tabMine]] as [ViewMode, string][]).map(([k, label]) => (
          <button key={k} onClick={() => setViewMode(k)} style={{ flex: 1, fontFamily: DS.body, fontSize: 13, fontWeight: 400, padding: '11px 0', border: 'none', cursor: 'pointer', background: 'transparent', color: viewMode === k ? DS.blue : DS.textMuted, borderBottom: viewMode === k ? `2px solid ${DS.blue}` : '2px solid transparent', marginBottom: -1, transition: DS.transFast, letterSpacing: '-0.01em' }}>{label}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: `1px solid ${DS.borderLight}`, flexShrink: 0, background: DS.surface }}>
        {[
          { label: t.statTotal, value: filtered.length, sub: t.subProblems, color: DS.text  },
          { label: t.statConf,  value: totalConf,       sub: t.subVotes,    color: DS.green },
          { label: t.statCrit,  value: totalCrit,       sub: t.subHighRisk, color: DS.red   },
        ].map((s, i) => (
          <div key={s.label} className="sv-stat-cell" style={{ padding: '12px 10px 10px', borderRight: i < 2 ? `1px solid ${DS.borderLight}` : 'none' }}>
            <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: DS.textFaint, marginBottom: 3, fontFamily: DS.mono }}>{s.label}</div>
            <div className="sv-stat-num" style={{ fontFamily: DS.mono, fontSize: 20, fontWeight: 500, color: s.color, lineHeight: 1 }}><AnimatedNumber value={s.value} /></div>
            <div style={{ fontSize: 10, color: DS.textFaint, marginTop: 2, fontFamily: DS.mono }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="sv-filters" style={{ padding: '10px 12px', borderBottom: `1px solid ${DS.borderLight}`, display: 'flex', flexDirection: 'column', gap: 7, flexShrink: 0, background: DS.surface }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: DS.textFaint, pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPh} style={{ ...inputSt, paddingLeft: 30, fontSize: 12, padding: '8px 12px 8px 30px' }} className="sv-input" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Pill label={radiusKm ? `${radiusKm} km` : t.radiusLabel} active={!!radiusKm} onClick={() => setShowRadiusPicker(p => !p)} />
          {radiusKm && <Pill label={t.radiusClear} active={false} onClick={() => { setRadiusKm(null); setShowRadiusPicker(false) }} />}
        </div>

        {showRadiusPicker && (
          <div style={{ background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: DS.rMd, padding: '10px 12px', animation: 'sv-fadeUp 0.15s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: DS.mono, fontSize: 10, color: DS.textSub }}>{radiusKm ?? 10} km</span>
              {!userLocation && <span style={{ fontFamily: DS.mono, fontSize: 10, color: DS.red }}>{t.noLocAuth}</span>}
            </div>
            <input type="range" min={2} max={100} step={1} value={radiusKm ?? 10} onChange={e => setRadiusKm(Number(e.target.value))} style={{ width: '100%', accentColor: DS.blue }} />
            <div style={{ display: 'flex', gap: 4, marginTop: 7, flexWrap: 'wrap' }}>
              {[2, 5, 10, 25, 50].map(r => (
                <button key={r} onClick={() => { setRadiusKm(r); setShowRadiusPicker(false) }} style={{ fontFamily: DS.mono, fontSize: 10, padding: '2px 8px', borderRadius: DS.rSm, border: `1px solid ${radiusKm === r ? DS.blue : DS.border}`, background: radiusKm === r ? DS.blueLight : DS.surface, color: radiusKm === r ? DS.blue : DS.textMuted, cursor: 'pointer' }}>{r}km</button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Pill label={t.sevAll}  active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
          <Pill label={t.sevHigh} active={activeFilter === '3'} color={DS.red}   bg={DS.redLight}   border={DS.redBorder}   dot={DS.red}   onClick={() => setActiveFilter('3')} />
          <Pill label={t.sevMed}  active={activeFilter === '2'} color={DS.amber} bg={DS.amberLight} border={DS.amberBorder} dot={DS.amber} onClick={() => setActiveFilter('2')} />
          <Pill label={t.sevLow}  active={activeFilter === '1'} color={DS.green} bg={DS.greenLight} border={DS.greenBorder} dot={DS.green} onClick={() => setActiveFilter('1')} />
        </div>

        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Pill label={t.catAll} active={catFilter === 'all'} onClick={() => setCatFilter('all')} />
          {(Object.keys(CAT_CFG) as Categoria[]).map(cat => {
            const cfg = CAT_CFG[cat]
            return <Pill key={cat} label={catLabel(cat)} active={catFilter === cat} color={cfg.color} bg={cfg.bg} border={cfg.border} dot={cfg.dot} onClick={() => setCatFilter(cat)} />
          })}
        </div>

        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Pill label={t.statusAll} active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
          {(['ativo', 'em_analise', 'resolvido'] as Status[]).map(s => {
            const cfg = STATUS_CFG[s]
            return <Pill key={s} label={statusLabel(s)} active={statusFilter === s} color={cfg.color} bg={cfg.bg} border={cfg.border} onClick={() => setStatusFilter(s)} />
          })}
        </div>

        <div className="sv-sort-row" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: DS.mono, fontSize: 10, color: DS.textFaint, flexShrink: 0, letterSpacing: '0.04em' }}>{t.sortLabel}</span>
          <div style={{ display: 'flex', gap: 3 }}>
            {([['recente', t.sortRecent], ['gravidade', t.sortSev], ['confirmacoes', t.sortConf]] as [SortKey, string][]).map(([k, label]) => (
              <button key={k} onClick={() => setSortKey(k)} style={{ fontFamily: DS.body, fontSize: 11, padding: '3px 8px', borderRadius: 6, border: `1px solid ${DS.border}`, background: sortKey === k ? DS.borderLight : DS.surface, color: sortKey === k ? DS.text : DS.textMuted, cursor: 'pointer', transition: DS.transFast, letterSpacing: '-0.01em', fontWeight: sortKey === k ? 500 : 400 }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: 5, background: DS.bg }}>
        {loadingData && [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}

        {!loadingData && filtered.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: 10, textAlign: 'center' }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: DS.borderLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DS.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: DS.textSub, letterSpacing: '-0.01em' }}>{search || activeFilter !== 'all' || catFilter !== 'all' || statusFilter !== 'all' || radiusKm ? t.noResults : t.noOccurrences}</div>
            <div style={{ fontSize: 12, color: DS.textMuted }}>{search || activeFilter !== 'all' || catFilter !== 'all' ? t.tryFilters : t.beFirst}</div>
            {!search && activeFilter === 'all' && catFilter === 'all' && (
              <button onClick={openCreate} style={{ marginTop: 6, fontFamily: DS.body, fontSize: 12, fontWeight: 500, padding: '7px 16px', background: DS.blue, color: '#ffffff', border: 'none', borderRadius: DS.rSm, cursor: 'pointer', letterSpacing: '-0.01em', transition: DS.transFast }}>{t.createFirst}</button>
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
          const authorLabel      = p.is_anonymous ? t.anonLabel : (p.user_name ?? null)
          const ago              = timeAgo(p.created_at, lang)

          return (
            <div key={p.id} className="sv-card" onMouseEnter={() => setHoveredCard(p.id)} onMouseLeave={() => setHoveredCard(null)} style={{ background: isSelected ? '#F0F7FF' : DS.surface, borderTop: `1px solid ${isSelected ? DS.blueBorder : isHovered ? '#DDEAF7' : DS.borderLight}`, borderRight: `1px solid ${isSelected ? DS.blueBorder : isHovered ? '#DDEAF7' : DS.borderLight}`, borderBottom: `1px solid ${isSelected ? DS.blueBorder : isHovered ? '#DDEAF7' : DS.borderLight}`, borderLeft: `3px solid ${sevColor}`, borderRadius: DS.rMd, overflow: 'hidden', animation: `sv-slideIn 0.15s ease ${idx * 0.012}s both`, transition: DS.trans, transform: isHovered && !isSelected ? 'translateY(-1px)' : 'translateY(0)', boxShadow: isHovered ? DS.shadowSm : 'none' }}>
              <div onClick={() => { setSelectedId(isSelected ? null : p.id); setExpandedId(isExpanded ? null : p.id) }} style={{ padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: DS.text, lineHeight: 1.25, letterSpacing: '-0.01em', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                    {distKm !== null && <span style={{ fontFamily: DS.mono, fontSize: 9, color: DS.blue, background: DS.blueLight, borderRadius: 4, padding: '1px 5px', border: `1px solid ${DS.blueBorder}`, flexShrink: 0 }}>{formatDistanceLabel(distKm)}</span>}
                    {ago && <span style={{ fontFamily: DS.mono, fontSize: 9, color: DS.textFaint, flexShrink: 0 }}>{ago}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Badge label={catLabel(p.categoria)}  color={catCfg.color}    bg={catCfg.bg}    border={catCfg.border} />
                    <Badge label={statusLabel(p.status)}  color={statusCfg.color} bg={statusCfg.bg} border={statusCfg.border} />
                    {isOwner && <Badge label={t.mineLabel} color={DS.blue} bg={DS.blueLight} border={DS.blueBorder} />}
                    {authorLabel && !isOwner && <Badge label={authorLabel} color={DS.textMuted} bg={DS.bg} border={DS.border} />}
                  </div>
                </div>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ color: DS.textFaint, flexShrink: 0, marginTop: 3, transition: 'transform 0.2s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {isExpanded && (
                <div style={{ padding: '0 12px 12px', borderTop: `1px solid ${DS.borderLight}`, animation: 'sv-fadeUp 0.16s ease' }}>
                  <p style={{ fontSize: 12, color: DS.textSub, lineHeight: 1.65, margin: '10px 0 9px', letterSpacing: '-0.005em' }}>{p.description}</p>
                  {p.photo_urls && p.photo_urls.length > 0 && (
                    <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
                      {p.photo_urls.slice(0, 3).map((url, i) => <img key={i} src={url} alt="" onClick={() => window.open(url, '_blank')} style={{ width: 58, height: 58, objectFit: 'cover', borderRadius: DS.rSm, border: `1px solid ${DS.border}`, cursor: 'zoom-in', transition: DS.transFast }} />)}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: DS.mono, fontSize: 10, color: DS.textMuted, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <svg width="9" height="9" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M8 2C5.24 2 3 4.24 3 7c0 4 5 8 5 8s5-4 5-8c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.5"/></svg>
                      {p.location ?? '—'}
                    </span>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 42, height: 3, background: DS.borderLight, borderRadius: 2, overflow: 'hidden' }}><div style={{ width: `${vib}%`, height: '100%', background: DS.blue, borderRadius: 2 }} /></div>
                      <span style={{ fontFamily: DS.mono, fontSize: 9, color: DS.textFaint }}>{vib}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="sv-btn-confirm" onClick={e => { e.stopPropagation(); handleConfirm(p.id) }} disabled={alreadyConfirmed} style={{ fontFamily: DS.body, fontSize: 11, fontWeight: 500, padding: '5px 11px', borderRadius: DS.rSm, border: `1px solid ${alreadyConfirmed ? DS.greenBorder : DS.border}`, background: alreadyConfirmed ? DS.greenLight : DS.surface, color: alreadyConfirmed ? DS.green : DS.textSub, cursor: alreadyConfirmed ? 'not-allowed' : 'pointer', transition: DS.transFast, letterSpacing: '-0.01em' }}>{alreadyConfirmed ? t.btnConfirmed : t.btnConfirm}</button>
                    {isOwner && <button className="sv-btn-edit" onClick={e => { e.stopPropagation(); openEdit(p) }} style={{ fontFamily: DS.body, fontSize: 11, padding: '5px 11px', borderRadius: DS.rSm, border: `1px solid ${DS.border}`, background: DS.surface, color: DS.textSub, cursor: 'pointer', transition: DS.transFast, letterSpacing: '-0.01em' }}>{t.btnEdit}</button>}
                    {isOwner && <button className="sv-btn-delete" onClick={e => { e.stopPropagation(); handleDelete(p.id) }} style={{ fontFamily: DS.body, fontSize: 11, padding: '5px 11px', borderRadius: DS.rSm, border: `1px solid ${DS.border}`, background: DS.surface, color: DS.textSub, cursor: 'pointer', transition: DS.transFast, letterSpacing: '-0.01em' }}>{t.btnRemove}</button>}
                    {isOwner && (
                      <select value={p.status ?? 'ativo'} onClick={e => e.stopPropagation()} onChange={e => { e.stopPropagation(); handleStatusChange(p.id, e.target.value as Status) }} style={{ fontFamily: DS.body, fontSize: 11, padding: '5px 8px', borderRadius: DS.rSm, border: `1px solid ${STATUS_CFG[p.status ?? 'ativo'].border}`, background: STATUS_CFG[p.status ?? 'ativo'].bg, color: STATUS_CFG[p.status ?? 'ativo'].color, cursor: 'pointer', letterSpacing: '-0.01em', fontWeight: 500 }}>
                        <option value="ativo">{t.statusAtivo}</option>
                        <option value="em_analise">{t.statusEmAnalise}</option>
                        <option value="resolvido">{t.statusResolvido}</option>
                      </select>
                    )}
                    <div style={{ fontFamily: DS.mono, fontSize: 10, padding: '4px 8px', borderRadius: 6, background: DS.bg, color: DS.textMuted, border: `1px solid ${DS.borderLight}`, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
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

  // ─────────────────────────────────────────────────────────────────────────
  // ICON BAR
  // ─────────────────────────────────────────────────────────────────────────
  const IconBar = (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      gap:           3,
      background:    DS.surface,
      border:        `1px solid ${DS.border}`,
      borderRadius:  DS.rMd,
      padding:       '5px',
      boxShadow:     DS.shadowMd,
    }}>
      <button
        className="sv-icon-btn"
        onClick={() => setRightPanel(p => p === 'notif' ? null : 'notif')}
        title={t.notifTitle}
        style={{ position: 'relative', width: 32, height: 32, borderRadius: DS.rSm, border: 'none', background: rightPanel === 'notif' ? DS.blueLight : 'transparent', color: rightPanel === 'notif' ? DS.blue : DS.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: DS.transFast }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: 3, right: 3, width: 14, height: 14, borderRadius: '50%', background: DS.red, border: `2px solid ${DS.surface}`, fontSize: 7, fontFamily: DS.mono, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'sv-bounce 0.4s ease' }}>
            {unreadCount}
          </span>
        )}
      </button>
      <div style={{ height: 1, background: DS.borderLight, margin: '0 3px' }} />
      <button
        className="sv-icon-btn"
        onClick={() => setRightPanel(p => p === 'profile' ? null : 'profile')}
        title={currentUserName ?? 'Perfil'}
        style={{ width: 32, height: 32, borderRadius: DS.rSm, border: 'none', background: rightPanel === 'profile' ? DS.blueLight : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: DS.transFast }}
      >
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: DS.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, fontFamily: DS.mono }}>
          {currentUserName?.charAt(0).toUpperCase() ?? '?'}
        </div>
      </button>
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // RIGHT PANEL BODY
  // ─────────────────────────────────────────────────────────────────────────
  const RightPanelBody = (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {rightPanel === 'notif' && (
        <>
          {unreadCount > 0 && (
            <div style={{ padding: '9px 16px', borderBottom: `1px solid ${DS.borderLight}` }}>
              <button onClick={markAllRead} style={{ fontFamily: DS.body, fontSize: 12, color: DS.blue, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{t.notifMarkAll}</button>
            </div>
          )}
          {notifications.length === 0 ? (
            <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 13, color: DS.textMuted, fontFamily: DS.body }}>{t.notifEmpty}</div>
          ) : notifications.map((n, i) => (
            <div key={n.id} onClick={() => markRead(n.id)} style={{ padding: '11px 16px', borderBottom: i < notifications.length - 1 ? `1px solid ${DS.borderLight}` : 'none', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start', background: n.read ? DS.surface : DS.blueLight, transition: DS.transFast }}
              onMouseEnter={e => (e.currentTarget.style.background = DS.bg)}
              onMouseLeave={e => (e.currentTarget.style.background = n.read ? DS.surface : DS.blueLight)}
            >
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: n.type === 'new' ? DS.blueLight : DS.greenLight, border: `1px solid ${n.type === 'new' ? DS.blueBorder : DS.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke={n.type === 'new' ? DS.blue : DS.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {n.type === 'new' ? <><circle cx="8" cy="7" r="3"/><path d="M8 2C5.24 2 3 4.24 3 7c0 4 5 8 5 8s5-4 5-8c0-2.76-2.24-5-5-5z"/></> : <path d="M2 8l4 4 8-8"/>}
                </svg>
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: DS.text, marginBottom: 2, letterSpacing: '-0.01em' }}>{n.title}</div>
                <div style={{ fontSize: 11, color: DS.textSub, lineHeight: 1.45 }}>{n.message}</div>
                <div style={{ fontSize: 10, color: DS.textFaint, fontFamily: DS.mono, marginTop: 3 }}>{timeAgo(n.time, lang)}</div>
              </div>
              {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: DS.blue, flexShrink: 0, marginTop: 4 }} />}
            </div>
          ))}
        </>
      )}

      {rightPanel === 'profile' && (
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px', background: DS.bg, borderRadius: DS.rMd, border: `1px solid ${DS.borderLight}` }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: DS.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, fontFamily: DS.mono, flexShrink: 0 }}>
              {currentUserName?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: DS.text, letterSpacing: '-0.01em' }}>{currentUserName ?? 'Utilizador'}</div>
              <div style={{ fontSize: 11, color: DS.textMuted, fontFamily: DS.mono, marginTop: 1 }}>{currentUserEmail ?? ''}</div>
            </div>
            <div style={{ fontFamily: DS.mono, fontSize: 11, fontWeight: 500, color: DS.blue, background: DS.blueLight, border: `1px solid ${DS.blueBorder}`, borderRadius: 6, padding: '2px 8px', flexShrink: 0 }}>
              {problems.filter(p => p.user_id === currentUserId).length} {t.subProblems}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[
              { label: t.myReports,    svgPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', action: () => { setViewMode('meus'); setRightPanel(null) } },
              { label: t.statsTitle,   svgPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', action: () => { setShowStats(true); setRightPanel(null) } },
              { label: t.navAnalytics, svgPath: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16', action: () => { setActiveNav('analytics'); setRightPanel(null) } },
              { label: t.navReports,   svgPath: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8', action: () => { setActiveNav('reports'); setRightPanel(null) } },
            ].map(item => (
              <button key={item.label} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 10px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: DS.body, fontSize: 13, color: DS.textSub, borderRadius: DS.rSm, transition: DS.transFast, textAlign: 'left', letterSpacing: '-0.01em' }} onMouseEnter={e => (e.currentTarget.style.background = DS.bg)} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={item.svgPath}/></svg>
                {item.label}
              </button>
            ))}
          </div>

          <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 10px', background: 'none', border: `1px solid ${DS.redBorder}`, cursor: 'pointer', fontFamily: DS.body, fontSize: 13, color: DS.red, borderRadius: DS.rSm, transition: DS.transFast, letterSpacing: '-0.01em' }} onMouseEnter={e => (e.currentTarget.style.background = DS.redLight)} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            {t.profileSignOut}
          </button>
        </div>
      )}
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', fontFamily: DS.body, background: DS.bg, color: DS.text }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }

        @keyframes sv-shimmer  { 0%,100%{opacity:1} 50%{opacity:0.42} }
        @keyframes sv-pulse    { 0%,100%{opacity:1} 50%{opacity:0.28} }
        @keyframes sv-fadeUp   { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sv-fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes sv-slideIn  { from{opacity:0;transform:translateX(-5px)} to{opacity:1;transform:translateX(0)} }
        @keyframes sv-sheetUp  { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes sv-spin     { to{transform:rotate(360deg)} }
        @keyframes sv-barGrow  { from{transform:scaleY(0);transform-origin:bottom} to{transform:scaleY(1)} }
        @keyframes sv-toastIn  { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes sv-notifPop { from{opacity:0;transform:translateY(-8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes sv-bounce   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
        @keyframes sv-panelUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sv-fabPulse { 0%,100%{box-shadow:0 4px 18px rgba(26,86,219,0.35)} 50%{box-shadow:0 4px 28px rgba(26,86,219,0.55)} }

        .sv-card { transition: border-color 0.18s, background 0.18s, transform 0.18s, box-shadow 0.18s; }
        .sv-card:hover { box-shadow: 0 2px 14px rgba(0,0,0,0.06) !important; }

        .sv-btn-confirm:hover:not(:disabled) { background: ${DS.greenLight} !important; border-color: ${DS.greenBorder} !important; color: ${DS.green} !important; }
        .sv-btn-edit:hover   { background: ${DS.blueLight} !important; border-color: ${DS.blueBorder} !important; color: ${DS.blue} !important; }
        .sv-btn-delete:hover { background: ${DS.redLight}  !important; border-color: ${DS.redBorder}  !important; color: ${DS.red}  !important; }
        .sv-btn-export:hover { background: ${DS.blueLight} !important; border-color: ${DS.blueBorder} !important; color: ${DS.blue} !important; }
        .sv-input:focus { border-color: ${DS.blue} !important; background: ${DS.surface} !important; box-shadow: 0 0 0 3px rgba(26,86,219,0.08) !important; }
        .sv-topbar-nav:hover  { background: ${DS.borderLight} !important; }
        .sv-kpi-card { transition: transform 0.18s, box-shadow 0.18s; }
        .sv-kpi-card:hover { transform: translateY(-2px); box-shadow: ${DS.shadowMd}; }
        .sv-icon-btn:hover { background: ${DS.borderLight} !important; }

        .sv-fab {
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
          animation: sv-fabPulse 3s ease-in-out infinite;
        }
        .sv-fab:hover  { transform: scale(1.08) translateY(-2px) !important; animation: none; box-shadow: 0 8px 28px rgba(26,86,219,0.45) !important; }
        .sv-fab:active { transform: scale(0.94) !important; }

        .sv-mobile-sidebar {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: 82%; max-width: 340px;
          background: ${DS.surface}; z-index: 700;
          display: flex; flex-direction: column; overflow: hidden;
          box-shadow: 4px 0 28px rgba(0,0,0,0.12);
          transform: translateX(-100%);
          transition: transform 0.26s cubic-bezier(0.32,0.72,0,1);
        }
        .sv-mobile-sidebar.open { transform: translateX(0); }
        .sv-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.28); z-index: 699; opacity: 0; pointer-events: none; transition: opacity 0.22s ease; }
        .sv-overlay.open { opacity: 1; pointer-events: all; }

        /* ── MOBILE RESPONSIVE ── */
        @media (max-width: 768px) {
          .sv-topbar           { padding: 0 12px !important; height: 50px !important; }
          .sv-logo-sub         { display: none !important; }
          .sv-sidebar-desktop  { display: none !important; }
          .sv-sidebar-toggle   { display: none !important; }
          /* KEY FIX: ensure body fills height and columns have correct sizing */
          .sv-body             { flex-direction: column !important; height: 100% !important; min-height: 0 !important; }
          .sv-main             { height: 100% !important; min-height: 0 !important; }
          .sv-dashboard-wrap   { min-height: 0 !important; height: 100% !important; }
          .sv-right-desktop    { display: none !important; }
          .sv-desktop-drawer   { display: none !important; }
          .sv-mobile-topright  { display: flex !important; }
          .sv-main-panels      { display: flex !important; }
          .sv-detail-bar       { display: block !important; }
        }
        @media (min-width: 769px) {
          .sv-mobile-new-btn       { display: none !important; }
          .sv-mobile-topright      { display: none !important; }
          .sv-mobile-sheet-overlay { display: none !important; }
          .sv-mobile-bottom-sheet  { display: none !important; }
          .sv-mobile-sidebar       { display: none !important; }
          .sv-overlay              { display: none !important; }
          .sv-fab                  { display: none !important; }
          .sv-mobile-right-panel   { display: none !important; }
        }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: toast.type === 'error' ? DS.redLight : toast.type === 'info' ? DS.blueLight : DS.greenLight, border: `1px solid ${toast.type === 'error' ? DS.redBorder : toast.type === 'info' ? DS.blueBorder : DS.greenBorder}`, color: toast.type === 'error' ? DS.red : toast.type === 'info' ? DS.blue : DS.green, borderRadius: DS.rLg, padding: '10px 16px', fontFamily: DS.body, fontSize: 13, fontWeight: 500, boxShadow: DS.shadowMd, display: 'flex', alignItems: 'center', gap: 8, animation: 'sv-toastIn 0.25s ease', letterSpacing: '-0.01em', maxWidth: 320 }}>
          <span>{toast.type === 'error' ? '✕' : toast.type === 'info' ? 'ℹ' : '✓'}</span>
          {toast.msg}
        </div>
      )}

      {/* TOP BAR */}
      <div className="sv-topbar" style={{ display: 'flex', alignItems: 'center', padding: '0 20px', height: 56, background: DS.surface, borderBottom: `1px solid ${DS.border}`, flexShrink: 0, gap: 10, zIndex: 50, boxShadow: DS.shadowSm }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0, textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, borderRadius: DS.rSm, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: DS.bg, border: `1px solid ${DS.border}` }}>
            <img src="/logo.png" style={{ height: 34, display: 'block' }} alt="StreetViz"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none'
                const p = e.currentTarget.parentElement
                if (p) {
                  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
                  s.setAttribute('width', '18'); s.setAttribute('height', '18'); s.setAttribute('viewBox', '0 0 16 16'); s.setAttribute('fill', 'none')
                  s.innerHTML = '<rect x="2" y="9" width="3" height="5" rx="1" fill="#1A56DB"/><rect x="6.5" y="5" width="3" height="9" rx="1" fill="#1A56DB"/><rect x="11" y="2" width="3" height="12" rx="1" fill="#1A56DB"/>'
                  p.appendChild(s)
                }
              }}
            />
          </div>
          <div>
            <div style={{ fontFamily: DS.mono, fontSize: 15, fontWeight: 500, letterSpacing: '0.01em', lineHeight: 1.1, color: DS.text }}>Street<span style={{ color: DS.blue }}>Viz</span></div>
            <div className="sv-logo-sub" style={{ fontFamily: DS.mono, fontSize: 9, color: DS.textFaint, letterSpacing: '0.06em' }}>{t.tagline}</div>
          </div>
        </a>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 1, background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: DS.rMd, padding: 3 }}>
            {([['dashboard', t.navDashboard], ['analytics', t.navAnalytics], ['reports', t.navReports]] as [ActiveNav, string][]).map(([k, label]) => (
              <button key={k} className="sv-topbar-nav" onClick={() => setActiveNav(k)} style={{ fontFamily: DS.body, fontSize: 13, fontWeight: 400, padding: '5px 14px', border: 'none', borderRadius: DS.rSm, cursor: 'pointer', background: activeNav === k ? DS.blue : 'transparent', color: activeNav === k ? '#ffffff' : DS.textSub, transition: DS.transFast, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{label}</button>
            ))}
          </div>
        </div>

        <div className="sv-right-desktop" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 1, background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: DS.rSm, padding: 2 }}>
            {(['pt', 'en'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ fontFamily: DS.mono, fontSize: 10, padding: '3px 8px', border: 'none', borderRadius: 5, cursor: 'pointer', background: lang === l ? DS.surface : 'transparent', color: lang === l ? DS.text : DS.textMuted, fontWeight: lang === l ? 500 : 400, transition: DS.transFast, boxShadow: lang === l ? DS.shadowSm : 'none' }}>{l.toUpperCase()}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: DS.mono, fontSize: 11, color: DS.green, background: DS.greenLight, borderRadius: 20, padding: '4px 10px', border: `1px solid ${DS.greenBorder}` }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: DS.green, display: 'inline-block', animation: 'sv-pulse 2s infinite' }} />
            {t.systemActive}
          </div>
          <button onClick={openCreate} style={{ fontFamily: DS.body, fontSize: 13, fontWeight: 600, padding: '7px 16px', background: DS.blue, color: '#ffffff', border: 'none', borderRadius: DS.rSm, cursor: 'pointer', transition: DS.transFast, letterSpacing: '-0.01em', flexShrink: 0, boxShadow: `0 2px 8px rgba(26,86,219,0.22)` }} onMouseEnter={e => (e.currentTarget.style.background = DS.blueDark)} onMouseLeave={e => (e.currentTarget.style.background = DS.blue)}>
            + {t.newProblem}
          </button>
        </div>

        <div className="sv-mobile-topright" style={{ display: 'none', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 1, background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: DS.rSm, padding: 2 }}>
            {(['pt', 'en'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ fontFamily: DS.mono, fontSize: 9, padding: '2px 6px', border: 'none', borderRadius: 4, cursor: 'pointer', background: lang === l ? DS.surface : 'transparent', color: lang === l ? DS.text : DS.textMuted, fontWeight: lang === l ? 500 : 400 }}>{l.toUpperCase()}</button>
            ))}
          </div>
          <button onClick={openCreate} style={{ fontFamily: DS.body, fontSize: 12, fontWeight: 600, padding: '6px 12px', background: DS.blue, color: '#ffffff', border: 'none', borderRadius: DS.rSm, cursor: 'pointer', letterSpacing: '-0.01em', boxShadow: `0 2px 8px rgba(26,86,219,0.22)` }}>
            +
          </button>
        </div>
      </div>

      {/* BODY — KEY FIX: added minHeight: 0 */}
      <div className="sv-body" style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>

        <button className="sv-sidebar-toggle" onClick={() => setSidebarCollapsed(p => !p)} style={{ position: 'absolute', left: sidebarCollapsed ? 8 : 372, top: '50%', transform: 'translateY(-50%)', zIndex: 300, width: 20, height: 44, background: DS.surface, border: `1px solid ${DS.border}`, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: DS.textMuted, boxShadow: DS.shadowSm, transition: 'left 0.24s ease', flexShrink: 0 }}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{ transform: sidebarCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.24s ease' }}>
            <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="sv-sidebar-desktop" style={{ width: sidebarCollapsed ? 0 : 380, flexShrink: 0, background: DS.surface, borderRight: `1px solid ${DS.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'width 0.24s ease' }}>
          {!sidebarCollapsed && SidebarContent}
        </div>

        {/* Main content — KEY FIX: minHeight: 0 added */}
        <div className="sv-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: 0 }}>

          {activeNav === 'analytics' && (
            <div className="sv-main-panels" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: DS.bg, animation: 'sv-fadeIn 0.2s ease' }}>
              {AnalyticsPanel}
            </div>
          )}

          {activeNav === 'reports' && (
            <div className="sv-main-panels" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: DS.bg, animation: 'sv-fadeIn 0.2s ease' }}>
              {ReportsPanel}
            </div>
          )}

          {activeNav === 'dashboard' && (
            /* KEY FIX: wrapper with minHeight: 0 and explicit flex column fill */
            <div className="sv-dashboard-wrap" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
              {/* Subbar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 14px', background: DS.surface, borderBottom: `1px solid ${DS.border}`, flexShrink: 0 }}>
                <div style={{ fontFamily: DS.mono, fontSize: 11, color: DS.textFaint, letterSpacing: '0.01em' }}>
                  Porto, PT <span style={{ color: DS.border }}> › </span><span style={{ color: DS.textSub }}>{t.allZones}</span>
                  {radiusKm && userLocation && <span style={{ color: DS.blue }}> · {radiusKm}km</span>}
                </div>
                <div style={{ fontFamily: DS.mono, fontSize: 11, color: formMode ? DS.blue : DS.textMuted, background: formMode ? DS.blueLight : DS.bg, border: `1px solid ${formMode ? DS.blueBorder : DS.border}`, borderRadius: 6, padding: '3px 10px', transition: DS.trans, letterSpacing: '0.01em' }}>
                  {formMode ? (previewPin ? `✓ ${t.locMarked}` : t.clickHint) : `${filtered.length} ${t.occurrences}`}
                </div>
              </div>

              {/* Map — KEY FIX: flex: 1 with minHeight: 0 so it fills remaining space */}
              <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0 }}>
                <LeafletMapWrapper
                  problems={filtered}
                  onMapClick={handleMapClick}
                  clickEnabled={!!formMode}
                  previewPin={previewPin}
                />
              </div>

              {/* Detail bar */}
              <div className="sv-detail-bar" style={{ position: 'relative', flexShrink: 0, background: DS.surface, borderTop: `1px solid ${DS.border}` }}>
                <div style={{
                  position:  'absolute',
                  right:     12,
                  top:       rightPanel ? 14 : '50%',
                  transform: rightPanel ? 'none' : 'translateY(-50%)',
                  zIndex:    10,
                }}>
                  {IconBar}
                </div>

                {rightPanel && (
                  <div style={{ animation: 'sv-panelUp 0.2s ease', display: 'flex', flexDirection: 'column', maxHeight: 420, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${DS.borderLight}`, flexShrink: 0 }}>
                      <span style={{ fontFamily: DS.mono, fontSize: 13, fontWeight: 500, color: DS.text }}>
                        {rightPanel === 'notif' ? t.notifTitle : currentUserName ?? 'Perfil'}
                      </span>
                      <button onClick={() => setRightPanel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: DS.textMuted, fontSize: 20, lineHeight: 1, padding: '0 2px' }}>×</button>
                    </div>
                    {RightPanelBody}
                  </div>
                )}

                {!rightPanel && (
                  <div style={{ minHeight: 80, padding: '12px 60px 12px 18px', overflowY: 'auto' }}>
                    {!selected ? (
                      <div style={{ display: 'flex', alignItems: 'center', height: 56, fontSize: 12, color: DS.textFaint, fontFamily: DS.mono, letterSpacing: '0.01em' }}>
                        {t.selectHint}
                      </div>
                    ) : (
                      <div style={{ animation: 'sv-fadeUp 0.18s ease' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: selected.gravidade === 3 ? DS.red : selected.gravidade === 2 ? DS.amber : DS.green, display: 'inline-block', flexShrink: 0 }} />
                          <div style={{ fontSize: 14, fontWeight: 500, color: DS.text, letterSpacing: '-0.01em' }}>{selected.name}</div>
                          <Badge label={catLabel(selected.categoria)} color={CAT_CFG[selected.categoria ?? 'outro'].color} bg={CAT_CFG[selected.categoria ?? 'outro'].bg} border={CAT_CFG[selected.categoria ?? 'outro'].border} />
                          <Badge label={statusLabel(selected.status)} color={STATUS_CFG[selected.status ?? 'ativo'].color} bg={STATUS_CFG[selected.status ?? 'ativo'].bg} border={STATUS_CFG[selected.status ?? 'ativo'].border} />
                        </div>
                        <div style={{ fontSize: 12, color: DS.textSub, marginBottom: 8, lineHeight: 1.6, letterSpacing: '-0.005em' }}>{selected.description}</div>
                        {selected.photo_urls && selected.photo_urls.length > 0 && (
                          <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
                            {selected.photo_urls.map((url, i) => <img key={i} src={url} alt="" onClick={() => window.open(url, '_blank')} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: DS.rSm, border: `1px solid ${DS.border}`, cursor: 'zoom-in' }} />)}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', rowGap: 8 }}>
                          {[
                            { label: t.detailLoc,  value: selected.location ?? '—' },
                            { label: t.detailConf, value: `${selected.confirmacoes} ${t.detailVotes}` },
                            { label: t.detailSev,  value: sevLabel(selected.gravidade) },
                          ].map(f => (
                            <div key={f.label}>
                              <div style={{ fontSize: 9, letterSpacing: '0.07em', textTransform: 'uppercase', color: DS.textFaint, fontFamily: DS.mono, marginBottom: 3 }}>{f.label}</div>
                              <div style={{ fontSize: 13, color: DS.text, letterSpacing: '-0.01em' }}>{f.value}</div>
                            </div>
                          ))}
                          <div>
                            <div style={{ fontSize: 9, letterSpacing: '0.07em', textTransform: 'uppercase', color: DS.textFaint, fontFamily: DS.mono, marginBottom: 5 }}>{t.detailScore}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <div style={{ width: 56, height: 3, background: DS.borderLight, borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{ width: `${getVibrancy(selected)}%`, height: '100%', background: DS.blue, borderRadius: 2 }} />
                              </div>
                              <span style={{ fontSize: 12, fontFamily: DS.mono, color: DS.textSub }}>{getVibrancy(selected)}/100</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Desktop form drawer */}
          {formMode && (
            <div className="sv-desktop-drawer" style={{ position: 'absolute', left: sidebarCollapsed ? 30 : 380, bottom: 0, width: 345, zIndex: 400, background: DS.surface, borderTop: `1px solid ${DS.border}`, borderRight: `1px solid ${DS.border}`, boxShadow: `4px -4px 28px rgba(0,0,0,0.08)`, padding: '18px 16px 24px', display: 'flex', flexDirection: 'column', gap: 13, animation: 'sv-fadeUp 0.2s ease', maxHeight: '85vh', overflowY: 'auto' }}>
              {FormContent}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        className="sv-fab"
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Abrir lista"
        style={{
          position:      'fixed',
          bottom:        24,
          right:         20,
          zIndex:        600,
          width:         56,
          height:        56,
          borderRadius:  '16px',
          background:    `linear-gradient(135deg, ${DS.blue} 0%, ${DS.blueDark} 100%)`,
          color:         '#ffffff',
          border:        'none',
          cursor:        'pointer',
          boxShadow:     `0 4px 18px rgba(26,86,219,0.35)`,
          display:       'flex',
          alignItems:    'center',
          justifyContent:'center',
          flexDirection: 'column',
          gap:           2,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="7"  x2="20" y2="7"/>
          <line x1="4" y1="12" x2="20" y2="12"/>
          <line x1="4" y1="17" x2="14" y2="17"/>
        </svg>
        {filtered.length > 0 && (
          <span style={{ position: 'absolute', top: -4, left: -4, minWidth: 18, height: 18, borderRadius: 9, background: DS.red, border: `2px solid ${DS.surface}`, fontSize: 9, fontFamily: DS.mono, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
            {filtered.length > 99 ? '99+' : filtered.length}
          </span>
        )}
      </button>

      {/* Mobile sidebar overlay */}
      <div className={`sv-overlay${mobileSidebarOpen ? ' open' : ''}`} onClick={() => setMobileSidebarOpen(false)} />

      {/* Mobile sidebar */}
      <div className={`sv-mobile-sidebar${mobileSidebarOpen ? ' open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: `1px solid ${DS.border}`, flexShrink: 0, background: DS.surface }}>
          <div style={{ fontFamily: DS.mono, fontSize: 13, fontWeight: 500, color: DS.text }}>Street<span style={{ color: DS.blue }}>Viz</span></div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={openCreate} style={{ fontFamily: DS.body, fontSize: 12, fontWeight: 600, padding: '5px 12px', background: DS.blue, color: '#ffffff', border: 'none', borderRadius: DS.rSm, cursor: 'pointer', letterSpacing: '-0.01em' }}>+ {lang === 'pt' ? 'Novo' : 'New'}</button>
            <button onClick={() => setMobileSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: DS.textMuted, fontSize: 22, lineHeight: 1, padding: '0 2px' }}>×</button>
          </div>
        </div>
        {SidebarContent}
      </div>

      {/* Mobile right panel */}
      {rightPanel && (
        <div className="sv-mobile-right-panel" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 800, background: DS.surface, borderRadius: '16px 16px 0 0', boxShadow: `0 -4px 28px rgba(0,0,0,0.14)`, display: 'flex', flexDirection: 'column', maxHeight: '82vh', animation: 'sv-sheetUp 0.26s cubic-bezier(0.32,0.72,0,1)' }}>
          <div style={{ width: 32, height: 3, borderRadius: 2, background: DS.border, margin: '10px auto 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 10px', borderBottom: `1px solid ${DS.borderLight}`, flexShrink: 0 }}>
            <span style={{ fontFamily: DS.mono, fontSize: 13, fontWeight: 500, color: DS.text }}>
              {rightPanel === 'notif' ? t.notifTitle : currentUserName ?? 'Perfil'}
            </span>
            <button onClick={() => setRightPanel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: DS.textMuted, fontSize: 20, lineHeight: 1, padding: '0 2px' }}>×</button>
          </div>
          {RightPanelBody}
        </div>
      )}
      {rightPanel && (
        <div className="sv-mobile-right-panel" onClick={() => setRightPanel(null)} style={{ position: 'fixed', inset: 0, zIndex: 799, background: 'rgba(0,0,0,0.28)', animation: 'sv-fadeIn 0.18s ease' }} />
      )}

      {/* Mobile bottom sheet (form) */}
      {formMode && (
        <>
          <div className="sv-mobile-sheet-overlay" onClick={closeForm} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.28)', animation: 'sv-fadeIn 0.18s ease' }} />
          <div className="sv-mobile-bottom-sheet" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 600, background: DS.surface, borderRadius: '16px 16px 0 0', boxShadow: `0 -4px 28px rgba(0,0,0,0.12)`, padding: '14px 16px 32px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '92vh', overflowY: 'auto', animation: 'sv-sheetUp 0.26s cubic-bezier(0.32,0.72,0,1)' }}>
            <div style={{ width: 32, height: 3, borderRadius: 2, background: DS.border, margin: '-2px auto 2px' }} />
            {FormContent}
          </div>
        </>
      )}

      {/* Stats modal */}
      {showStats && (
        <div onClick={e => e.target === e.currentTarget && setShowStats(false)} style={{ position: 'fixed', inset: 0, zIndex: 800, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'sv-fadeIn 0.14s ease', padding: 16 }}>
          <div style={{ background: DS.surface, borderRadius: DS.rXl, border: `1px solid ${DS.border}`, padding: 24, width: '100%', maxWidth: 480, animation: 'sv-fadeUp 0.18s ease', maxHeight: '90vh', overflowY: 'auto', boxShadow: DS.shadowLg }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: DS.text, letterSpacing: '-0.02em' }}>{t.statsTitle}</div>
              <button onClick={() => setShowStats(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: DS.textMuted, fontSize: 22, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
              {[
                { label: t.statTotal,    value: problems.length,                                                                                                   color: DS.blue,  bg: DS.blueLight  },
                { label: t.statsAvg,     value: problems.length ? (problems.reduce((a, p) => a + p.confirmacoes, 0) / problems.length).toFixed(1) : '0',            color: DS.green, bg: DS.greenLight },
                { label: t.statCrit,     value: problems.filter(p => p.gravidade === 3).length,                                                                    color: DS.red,   bg: DS.redLight   },
                { label: t.statsHighPct, value: problems.length ? Math.round(problems.filter(p => p.gravidade === 3).length / problems.length * 100) + '%' : '0%', color: DS.amber, bg: DS.amberLight },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: DS.rLg, padding: '14px', border: `1px solid ${s.color}18` }}>
                  <div style={{ fontSize: 9, fontFamily: DS.mono, letterSpacing: '0.07em', textTransform: 'uppercase', color: s.color, marginBottom: 7, opacity: 0.75 }}>{s.label}</div>
                  <div style={{ fontFamily: DS.mono, fontSize: 26, fontWeight: 500, color: s.color, lineHeight: 1 }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, fontFamily: DS.mono, color: DS.textFaint, marginBottom: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t.statsByCat}</div>
              {(Object.keys(CAT_CFG) as Categoria[]).map(cat => {
                const count = problems.filter(p => p.categoria === cat).length
                const pct   = problems.length ? Math.round(count / problems.length * 100) : 0
                const cfg   = CAT_CFG[cat]
                return (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontFamily: DS.mono, fontSize: 9, fontWeight: 700, letterSpacing: '0.04em', color: 'inherit', opacity: 0.7 }}>{cfg.icon}</span>
                    <div style={{ width: 72, fontSize: 11, color: DS.textSub, fontFamily: DS.body, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{catLabel(cat)}</div>
                    <div style={{ flex: 1, height: 5, background: DS.borderLight, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: cfg.color, borderRadius: 4, transition: 'width 0.4s ease' }} />
                    </div>
                    <div style={{ width: 18, fontSize: 11, fontFamily: DS.mono, color: DS.textMuted, flexShrink: 0, textAlign: 'right' }}>{count}</div>
                  </div>
                )
              })}
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, fontFamily: DS.mono, color: DS.textFaint, marginBottom: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t.statsBySev}</div>
              {([[3, t.sevHigh, DS.red], [2, t.sevMed, DS.amber], [1, t.sevLow, DS.green]] as [number, string, string][]).map(([g, label, color]) => {
                const count = problems.filter(p => p.gravidade === g).length
                const pct   = problems.length ? Math.round(count / problems.length * 100) : 0
                return (
                  <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 44, fontSize: 11, color: DS.textSub, fontFamily: DS.body, flexShrink: 0, letterSpacing: '-0.01em' }}>{label}</div>
                    <div style={{ flex: 1, height: 5, background: DS.borderLight, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.4s ease' }} />
                    </div>
                    <div style={{ width: 18, fontSize: 11, fontFamily: DS.mono, color: DS.textMuted, flexShrink: 0, textAlign: 'right' }}>{count}</div>
                  </div>
                )
              })}
            </div>

            <button onClick={() => setShowStats(false)} style={{ width: '100%', marginTop: 8, padding: '10px 0', fontFamily: DS.body, fontSize: 13, border: `1px solid ${DS.border}`, borderRadius: DS.rMd, background: DS.surface, color: DS.textSub, cursor: 'pointer', letterSpacing: '-0.01em', transition: DS.transFast }}>
              {t.statsClose}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}