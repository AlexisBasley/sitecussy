/**
 * Seed Strapi avec données de test pour Cussy-en-Morvan.
 *
 * Prérequis : Strapi tourne en local + token full access dans STRAPI_TOKEN.
 *
 * Ordre des opérations :
 *   1. upload des 3 fichiers GPX
 *   2. download de 4 photos depuis Lorem Picsum + upload Strapi
 *   3. création des 3 chemins (avec relation media)
 *   4. création des 2 balades (avec relations chemins + photo)
 *   5. création des 3 actualités
 *
 * Idempotence : non. Lance-le sur une base fraîche
 * (ou supprime manuellement les entrées avant relance).
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337'
const TOKEN = process.env.STRAPI_TOKEN
if (!TOKEN) {
  console.error('Manque STRAPI_TOKEN. Usage : STRAPI_TOKEN=xxx npx tsx scripts/seed.ts')
  process.exit(1)
}

const HEADERS_AUTH = { Authorization: `Bearer ${TOKEN}` }
const HEADERS_JSON = { ...HEADERS_AUTH, 'Content-Type': 'application/json' }

const ASSETS = join(__dirname, 'seed-assets')

interface MediaUploaded {
  id: number
  url: string
  name: string
}

async function uploadFile(path: string, mime: string): Promise<MediaUploaded> {
  const buf = readFileSync(path)
  const filename = path.split('/').pop()!
  const fd = new FormData()
  fd.append('files', new Blob([buf], { type: mime }), filename)

  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: HEADERS_AUTH,
    body: fd,
  })
  if (!res.ok) throw new Error(`Upload ${filename} failed: ${res.status} ${await res.text()}`)
  const json = (await res.json()) as MediaUploaded[]
  console.log(`  ↑ ${filename} → id=${json[0].id}`)
  return json[0]
}

async function downloadImage(url: string, dest: string): Promise<void> {
  if (existsSync(dest)) return
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (seed-cussy)' },
  })
  if (!res.ok) throw new Error(`Download ${url} failed: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(dest, buf)
}

async function createEntry<T = unknown>(
  resource: string,
  data: Record<string, unknown>
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

async function main() {
  console.log('→ Upload GPX')
  const gpx1 = await uploadFile(join(ASSETS, 'boucle-foret-cussy.gpx'), 'application/gpx+xml')
  const gpx2 = await uploadFile(join(ASSETS, 'crete-mont-dard.gpx'), 'application/gpx+xml')
  const gpx3 = await uploadFile(join(ASSETS, 'piste-etang-fouche.gpx'), 'application/gpx+xml')

  console.log('→ Download + upload photos')
  // Photos ciblées Unsplash (libres de droits)
  // - foret : sous-bois de feuillus (type Morvan)
  // - crete : single VTT technique en sous-bois
  // - etang : étang en forêt, ambiance calme
  // - actu  : VTT en action sur sentier
  const photos: { dest: string; url: string }[] = [
    {
      dest: join(ASSETS, 'photo-foret.jpg'),
      url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&h=800&fit=crop',
    },
    {
      dest: join(ASSETS, 'photo-crete.jpg'),
      url: 'https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=1200&h=800&fit=crop',
    },
    {
      dest: join(ASSETS, 'photo-etang.jpg'),
      url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop',
    },
    {
      dest: join(ASSETS, 'photo-actu.jpg'),
      url: 'https://images.unsplash.com/photo-1591741535018-d042766c62eb?w=1200&h=800&fit=crop',
    },
  ]
  const uploadedPhotos: MediaUploaded[] = []
  for (const p of photos) {
    if (!existsSync(p.dest)) {
      await downloadImage(p.url, p.dest)
    }
    uploadedPhotos.push(await uploadFile(p.dest, 'image/jpeg'))
    await new Promise((r) => setTimeout(r, 300))
  }
  const [photoForet, photoCrete, photoEtang, photoActu] = uploadedPhotos

  console.log('→ Création des chemins')
  interface CheminCreated {
    id: number
    documentId: string
  }
  const cheminForet = await createEntry<CheminCreated>('chemins', {
    nom: 'Sentier de la forêt de Cussy',
    description_courte:
      'Boucle ombragée sous les chênes et hêtres, idéale par temps chaud.',
    fichier_gpx: gpx1.id,
    distance_km: 7.5,
    denivele_m: 120,
    type_surface: 'foret',
    statut: 'ouvert',
    photos: [photoForet.id],
  })
  console.log(`  ✓ chemin foret id=${cheminForet.id}`)

  const cheminCrete = await createEntry<CheminCreated>('chemins', {
    nom: 'Crête du Mont Dard',
    description_courte: 'Single technique sur la ligne de crête, vues sur le Morvan.',
    fichier_gpx: gpx2.id,
    distance_km: 12.3,
    denivele_m: 360,
    type_surface: 'piste',
    statut: 'deconseille',
    photos: [photoCrete.id],
  })
  console.log(`  ✓ chemin crête id=${cheminCrete.id}`)

  const cheminEtang = await createEntry<CheminCreated>('chemins', {
    nom: 'Tour de l\'étang de Fouché',
    description_courte: 'Piste plate autour de l\'étang, parfaite pour s\'initier.',
    fichier_gpx: gpx3.id,
    distance_km: 4.2,
    denivele_m: 50,
    type_surface: 'piste',
    statut: 'ouvert',
    photos: [photoEtang.id],
  })
  console.log(`  ✓ chemin étang id=${cheminEtang.id}`)

  console.log('→ Création des balades')
  interface BaladeCreated {
    id: number
    documentId: string
    slug: string
  }
  const baladeFamille = await createEntry<BaladeCreated>('balades', {
    titre: 'Balade familiale autour de l\'étang',
    slug: 'balade-familiale-etang',
    description:
      '<p>Une boucle facile et accessible aux enfants à partir de 8 ans, autour de l\'étang de Fouché. Le sentier est plat, sans difficulté technique.</p><p>Possibilité de pique-niquer en bord d\'eau au point de départ.</p>',
    difficulte: 'famille',
    duree_estimee: '1h30',
    point_depart: 'Parking de l\'étang de Fouché, Cussy-en-Morvan',
    conseils:
      'Casque obligatoire pour les enfants. Prévoir de l\'eau et de la crème solaire en été. Le sentier peut être boueux après la pluie.',
    photo_mise_en_avant: photoEtang.id,
    chemins: [cheminEtang.id],
  })
  console.log(`  ✓ balade famille slug=${baladeFamille.slug}`)

  const baladeExpert = await createEntry<BaladeCreated>('balades', {
    titre: 'Traversée du Mont Dard',
    slug: 'traversee-mont-dard',
    description:
      '<p>Une sortie engagée pour vététistes confirmés, mêlant single technique sur la crête et descente en sous-bois. Comptez environ 800 m de dénivelé positif cumulé sur la journée.</p><p>L\'itinéraire combine deux chemins : la traversée de la forêt en chauffe, puis l\'arête du Mont Dard pour le morceau de bravoure.</p>',
    difficulte: 'expert',
    duree_estimee: '4h',
    point_depart: 'Place de l\'église, Cussy-en-Morvan',
    conseils:
      'VTT tout-suspendu recommandé. Protections (genouillères, coudières) conseillées sur la crête. Vérifier les conditions météo : la crête est exposée. Emporter ravitaillement pour 4h, pas de point d\'eau sur le parcours.',
    photo_mise_en_avant: photoCrete.id,
    chemins: [cheminForet.id, cheminCrete.id],
  })
  console.log(`  ✓ balade expert slug=${baladeExpert.slug}`)

  console.log('→ Création des actualités')
  await createEntry('actualites', {
    titre: 'Ouverture de la saison VTT 2026',
    contenu:
      '<p>Tous les chemins sont désormais ouverts pour la saison printemps-été. La météo s\'annonce clémente ce week-end : profitez-en !</p>',
    date: '2026-04-15',
    categorie: 'nouveaute',
    image: photoActu.id,
  })
  console.log('  ✓ actu nouveauté')

  await createEntry('actualites', {
    titre: 'Crête du Mont Dard : passage technique endommagé',
    contenu:
      '<p>Suite aux orages de la semaine dernière, un passage de la crête est partiellement effondré sur 5 mètres. Le chemin est <strong>déconseillé</strong> aux pratiquants peu expérimentés en attendant la remise en état par les bénévoles.</p>',
    date: '2026-05-02',
    categorie: 'conditions',
    balade: baladeExpert.id,
  })
  console.log('  ✓ actu conditions')

  await createEntry('actualites', {
    titre: 'Rappel : respect des propriétés privées',
    contenu:
      '<p>Plusieurs riverains ont signalé des passages sur des terrains privés. Merci de rester strictement sur les chemins balisés indiqués sur les traces GPX.</p>',
    date: '2026-04-28',
    categorie: 'info',
  })
  console.log('  ✓ actu info')

  console.log('\n✅ Seed terminé. Va voir http://localhost:3000')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
