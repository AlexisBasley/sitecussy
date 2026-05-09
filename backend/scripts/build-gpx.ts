/**
 * Génère 3 fichiers GPX synthétiques autour de Cussy-en-Morvan.
 * Trajets en boucle, légers reliefs, ~5 à 15 km.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const OUT_DIR = join(__dirname, 'seed-assets')
mkdirSync(OUT_DIR, { recursive: true })

interface Track {
  filename: string
  name: string
  center: [number, number]
  radiusKm: number
  points: number
  baseElev: number
  elevAmp: number
}

const tracks: Track[] = [
  {
    filename: 'boucle-foret-cussy.gpx',
    name: 'Boucle de la forêt de Cussy',
    center: [47.018, 4.185],
    radiusKm: 1.2,
    points: 80,
    baseElev: 480,
    elevAmp: 60,
  },
  {
    filename: 'crete-mont-dard.gpx',
    name: 'Crête du Mont Dard',
    center: [47.005, 4.165],
    radiusKm: 2.0,
    points: 120,
    baseElev: 520,
    elevAmp: 180,
  },
  {
    filename: 'piste-etang-fouche.gpx',
    name: "Piste de l'étang de Fouché",
    center: [47.025, 4.205],
    radiusKm: 0.8,
    points: 60,
    baseElev: 460,
    elevAmp: 25,
  },
]

function buildGpx({ name, center, radiusKm, points, baseElev, elevAmp }: Track): string {
  // 1° latitude ≈ 111 km ; 1° longitude ≈ 75 km à 47°N
  const dLat = radiusKm / 111
  const dLon = radiusKm / 75

  const trkpts: string[] = []
  for (let i = 0; i < points; i++) {
    const t = (i / points) * Math.PI * 2
    // ellipse + petite perturbation pour réalisme
    const lat = center[0] + Math.sin(t) * dLat + Math.sin(t * 5) * dLat * 0.05
    const lon = center[1] + Math.cos(t) * dLon + Math.cos(t * 3) * dLon * 0.05
    const ele = baseElev + Math.sin(t * 2) * elevAmp
    trkpts.push(
      `      <trkpt lat="${lat.toFixed(6)}" lon="${lon.toFixed(6)}"><ele>${ele.toFixed(1)}</ele></trkpt>`
    )
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="seed-cussy" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${name}</name>
    <trkseg>
${trkpts.join('\n')}
    </trkseg>
  </trk>
</gpx>
`
}

for (const track of tracks) {
  const xml = buildGpx(track)
  writeFileSync(join(OUT_DIR, track.filename), xml, 'utf-8')
  console.log(`✓ ${track.filename}`)
}
