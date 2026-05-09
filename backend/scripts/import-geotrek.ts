/**
 * Import des balades VTT Cussy depuis l'API Geotrek du Parc du Morvan.
 *
 * Source : https://geotrek.parcdumorvan.org/api/v2/
 *
 * Pour chaque trek :
 *   - télécharge la 1ère photo (attachment de type image) + upload Strapi
 *   - télécharge le fichier GPX + upload Strapi
 *   - crée 1 chemin
 *   - crée 1 balade liée à ce chemin
 *
 * Idempotent : skip si le slug de la balade existe déjà.
 *
 * Usage :
 *   STRAPI_TOKEN=xxx npx tsx scripts/import-geotrek.ts
 *
 * Variables :
 *   STRAPI_URL    (default http://localhost:1337)
 *   STRAPI_TOKEN  (full access)
 *   GEOTREK_URL   (default https://geotrek.parcdumorvan.org)
 *   GEOTREK_QUERY (default "Cussy")
 *   GEOTREK_PRACTICE (default 1 = VTT)
 *   PUBLISH       (1 pour publier directement, sinon draft)
 */
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337'
const TOKEN = process.env.STRAPI_TOKEN
if (!TOKEN) {
  console.error('Manque STRAPI_TOKEN. Usage : STRAPI_TOKEN=xxx npx tsx scripts/import-geotrek.ts')
  process.exit(1)
}
const GEOTREK_URL = process.env.GEOTREK_URL || 'https://geotrek.parcdumorvan.org'
const QUERY = process.env.GEOTREK_QUERY || 'Cussy'
const PRACTICE = process.env.GEOTREK_PRACTICE || '1'
const PUBLISH = process.env.PUBLISH === '1' || process.env.PUBLISH === 'true'

const HEADERS_AUTH = { Authorization: `Bearer ${TOKEN}` }
const HEADERS_JSON = { ...HEADERS_AUTH, 'Content-Type': 'application/json' }

interface MediaUploaded {
  id: number
  url: string
  name: string
}

interface GeotrekAttachment {
  type: string
  url: string
  author: string | null
  legend: string | null
  license: string | null
}

interface GeotrekTrek {
  id: number
  name: string
  description: string
  description_teaser: string
  ambiance: string
  advice: string
  departure: string
  difficulty: number
  length_2d: number
  ascent: number
  gpx: string
  geometry: { coordinates: [number, number, number?][] }
  attachments: GeotrekAttachment[]
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Geotrek : 1=très facile, 2=facile, 3=intermédiaire, 4=difficile, 5=très difficile
function mapDifficulte(d: number): 'famille' | 'intermediaire' | 'expert' {
  if (d <= 2) return 'famille'
  if (d === 3) return 'intermediaire'
  return 'expert'
}

// Estimation VTT : 12 km/h moyen, +1h par 600m D+
function estimerDuree(distanceM: number, denivele: number): string {
  const heures = distanceM / 1000 / 12 + denivele / 600
  const h = Math.floor(heures)
  const m = Math.round((heures - h) * 60)
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${m.toString().padStart(2, '0')}`
}

async function uploadBuffer(
  buf: Uint8Array,
  filename: string,
  mime: string,
): Promise<MediaUploaded> {
  const fd = new FormData()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fd.append('files', new Blob([buf as any], { type: mime }), filename)
  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: HEADERS_AUTH,
    body: fd,
  })
  if (!res.ok) throw new Error(`Upload ${filename} failed: ${res.status} ${await res.text()}`)
  const json = (await res.json()) as MediaUploaded[]
  return json[0]
}

async function fetchBuffer(url: string): Promise<Uint8Array> {
  const res = await fetch(url, { headers: { 'User-Agent': 'sitecussy-import/1.0' } })
  if (!res.ok) throw new Error(`Download ${url} failed: ${res.status}`)
  return new Uint8Array(await res.arrayBuffer())
}

async function findExistingBalade(slug: string): Promise<boolean> {
  const res = await fetch(
    `${STRAPI_URL}/api/balades?filters[slug][$eq]=${encodeURIComponent(slug)}`,
    { headers: HEADERS_JSON },
  )
  if (!res.ok) return false
  const json = (await res.json()) as { data: unknown[] }
  return json.data.length > 0
}

async function createEntry<T = unknown>(
  resource: string,
  data: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${STRAPI_URL}/api/${resource}`, {
    method: 'POST',
    headers: HEADERS_JSON,
    body: JSON.stringify({ data }),
  })
  if (!res.ok) {
    throw new Error(`POST /${resource} failed: ${res.status} ${await res.text()}`)
  }
  const json = (await res.json()) as { data: T }
  return json.data
}

async function listTreks(): Promise<{ id: number; name: string }[]> {
  const url = `${GEOTREK_URL}/api/v2/trek?format=json&language=fr&practices=${PRACTICE}&q=${encodeURIComponent(QUERY)}&fields=id,name`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`List treks failed: ${res.status}`)
  const json = (await res.json()) as { results: { id: number; name: string }[] }
  return json.results
}

async function fetchTrek(id: number): Promise<GeotrekTrek> {
  const res = await fetch(`${GEOTREK_URL}/api/v2/trek/${id}/?language=fr`)
  if (!res.ok) throw new Error(`Fetch trek ${id} failed: ${res.status}`)
  return (await res.json()) as GeotrekTrek
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildDescription(t: GeotrekTrek): string {
  const parts: string[] = []
  const teaser = (t.description_teaser || '').trim()
  const ambiance = (t.ambiance || '').trim()
  const desc = (t.description || '').trim()
  if (teaser) parts.push(teaser.startsWith('<') ? teaser : `<p>${teaser}</p>`)
  if (ambiance && ambiance !== teaser)
    parts.push(ambiance.startsWith('<') ? ambiance : `<p>${ambiance}</p>`)
  if (desc) parts.push(desc.startsWith('<') ? desc : `<p>${desc}</p>`)
  if (!parts.length) {
    parts.push(
      `<p>Circuit VTT au départ de Cussy-en-Morvan, balisé par le Parc naturel régional du Morvan.</p>`,
    )
  }
  parts.push(
    `<p><em>Source : <a href="${GEOTREK_URL}" target="_blank" rel="noopener">Parc naturel régional du Morvan</a>.</em></p>`,
  )
  return parts.join('\n')
}

async function importTrek(id: number): Promise<void> {
  const trek = await fetchTrek(id)
  const slug = slugify(trek.name)

  if (await findExistingBalade(slug)) {
    console.log(`  ⊘ balade "${slug}" existe déjà, skip`)
    return
  }

  console.log(`  → ${trek.name} (id=${id})`)

  // Photo
  let photoMedia: MediaUploaded | null = null
  const firstImage = trek.attachments?.find((a) => a.type === 'image' && a.url)
  if (firstImage) {
    const ext = firstImage.url.split('.').pop()?.split('?')[0] || 'jpg'
    const filename = `geotrek-${id}-${slug}.${ext}`
    const buf = await fetchBuffer(firstImage.url)
    photoMedia = await uploadBuffer(buf, filename, `image/${ext === 'jpg' ? 'jpeg' : ext}`)
    console.log(`    ↑ photo id=${photoMedia.id}`)
  } else {
    console.warn(`    ⚠ pas de photo pour ${trek.name} — skip (champ required)`)
    return
  }

  // GPX
  const gpxBuf = await fetchBuffer(trek.gpx)
  const gpxFilename = `geotrek-${id}-${slug}.gpx`
  const gpxMedia = await uploadBuffer(gpxBuf, gpxFilename, 'application/gpx+xml')
  console.log(`    ↑ gpx id=${gpxMedia.id}`)

  // Chemin
  // Chemin (publié immédiatement si PUBLISH, pour que la relation soit valide
  // côté version publiée de la balade)
  const now = new Date().toISOString()
  const chemin = (await createEntry<{ id: number }>('chemins', {
    nom: trek.name,
    description_courte:
      stripHtml(trek.description_teaser || trek.description || trek.name).slice(0, 250) ||
      trek.name,
    fichier_gpx: gpxMedia.id,
    distance_km: Math.round((trek.length_2d / 1000) * 10) / 10,
    denivele_m: Math.round(trek.ascent),
    type_surface: 'foret',
    statut: 'ouvert',
    ...(PUBLISH ? { publishedAt: now } : {}),
  })) as { id: number }
  console.log(`    ✓ chemin id=${chemin.id}${PUBLISH ? ' (publié)' : ''}`)

  // Conseils + crédit
  const credits: string[] = []
  if (firstImage.author) credits.push(`Photo : © ${firstImage.author}`)
  credits.push(`Source des données : Parc naturel régional du Morvan (${GEOTREK_URL})`)
  const conseils = [trek.advice ? stripHtml(trek.advice) : '', credits.join('\n')]
    .filter(Boolean)
    .join('\n\n')

  // Balade
  const balade = (await createEntry<{ id: number; slug: string }>('balades', {
    titre: trek.name,
    slug,
    description: buildDescription(trek),
    difficulte: mapDifficulte(trek.difficulty),
    duree_estimee: estimerDuree(trek.length_2d, trek.ascent),
    point_depart: trek.departure || 'Cussy-en-Morvan',
    conseils,
    photo_mise_en_avant: photoMedia.id,
    chemins: [chemin.id],
    ...(PUBLISH ? { publishedAt: now } : {}),
  })) as { id: number; slug: string }
  console.log(`    ✓ balade id=${balade.id} slug=${balade.slug}${PUBLISH ? ' (publié)' : ''}`)
}

async function main() {
  console.log(`→ Recherche treks Geotrek (practice=${PRACTICE}, q="${QUERY}")`)
  const treks = await listTreks()
  console.log(`  ${treks.length} trek(s) trouvé(s) :`)
  treks.forEach((t) => console.log(`    - ${t.id} ${t.name}`))

  for (const t of treks) {
    try {
      await importTrek(t.id)
    } catch (e) {
      console.error(`  ✗ erreur sur trek ${t.id}:`, e instanceof Error ? e.message : e)
    }
  }

  console.log('\n✅ Import terminé.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
