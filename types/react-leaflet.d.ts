// types/react-leaflet.d.ts
declare module 'react-leaflet' {
  import type { ComponentType } from 'react'
  import type { MapContainerProps, TileLayerProps, MarkerProps, PopupProps } from 'leaflet'

  export const MapContainer: ComponentType<MapContainerProps & { children?: React.ReactNode }>
  export const TileLayer: ComponentType<TileLayerProps>
  export const Marker: ComponentType<MarkerProps & { children?: React.ReactNode }>
  export const Popup: ComponentType<{ children?: React.ReactNode }>
}