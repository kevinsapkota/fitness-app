export type Problem = {
  id: string

  // BASICO
  name: string
  description: string

  // 🔥 NOVO
  location: string

  // COORDENADAS (para mapa)
  latitude: number
  longitude: number

  // SISTEMA
  gravidade: 1 | 2 | 3
  confirmacoes: number
  validated_level: number

  tipo: 'Problemas' | 'Sugestões' | 'Alertas'
}