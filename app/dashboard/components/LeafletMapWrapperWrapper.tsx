'use client'

import dynamic from 'next/dynamic'
import { Problem } from '@/types/problem'

// 🔥 IMPORT DINÂMICO (RESOLVE window undefined)
const LeafletMap = dynamic(
  () => import('./LeafletMapWrapper'),
  { ssr: false }
)

interface Props {
  problems: Problem[]
}

export default function LeafletMapWrapperWrapper({ problems }: Props) {
  return (
    <div className="w-full h-full">
      <LeafletMap problems={problems} />
    </div>
  )
}