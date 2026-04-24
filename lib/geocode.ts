export async function geocodeLocation(query: string): Promise<{
  lat: number
  lng: number
  display_name: string
} | null> {

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent': 'StreetViz-App'
        }
      }
    )

    if (!res.ok) {
      console.log('Geocode HTTP error:', res.status)
      return null
    }

    const data = await res.json()

    if (!data || data.length === 0) return null

    const best = data[0]

    return {
      lat: parseFloat(best.lat),
      lng: parseFloat(best.lon),
      display_name: best.display_name
    }

  } catch (err) {
    console.log('Geocode crash:', err)
    return null
  }
}