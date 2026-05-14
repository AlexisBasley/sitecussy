<script setup lang="ts">
/**
 * Page Patrimoine — carte plein écran avec tous les POIs du PNR Morvan
 * filtrable par type. Charge les POIs côté serveur, rend les marqueurs
 * en impératif via un LayerGroup Leaflet pour rester fluide à 1600+ POIs.
 */
useSeoMeta({
  title: 'Patrimoine du Morvan — VTT Cussy-en-Morvan',
  description:
    "Découvrez les points d'intérêt patrimoniaux du Parc naturel régional du Morvan : édifices, paysages, faune, flore, archéologie.",
});

const { safeStrict } = useSanitize();

interface Poi {
  id: number;
  name: { fr: string | null };
  description: { fr: string | null };
  geometry: { coordinates: [number, number, number?] };
  type: number;
  type_label: { fr: string | null };
  type_pictogram: string | null;
}

interface PoiType {
  id: number;
  label: { fr: string | null };
  pictogram: string | null;
}

const { data: typesData } = await useAsyncData('poi-types', () =>
  $fetch<{ results: PoiType[] }>('/api/geotrek/poi-types'),
);
const types = computed(() => typesData.value?.results ?? []);

const activeTypes = ref<Set<number>>(new Set());
watchEffect(() => {
  if (activeTypes.value.size === 0 && types.value.length > 0) {
    activeTypes.value = new Set(types.value.map((t) => t.id));
  }
});

const { data: poisData, pending } = await useAsyncData('all-pois', async () => {
  const all: Poi[] = [];
  let page = 1;
  while (true) {
    const res = await $fetch<{ results: Poi[]; next: string | null }>('/api/geotrek/pois', {
      query: { page, page_size: 500 },
    });
    all.push(...res.results);
    if (!res.next || page >= 10) break;
    page++;
  }
  return all;
});

const countByType = computed(() => {
  const map = new Map<number, number>();
  for (const p of poisData.value ?? []) {
    map.set(p.type, (map.get(p.type) ?? 0) + 1);
  }
  return map;
});

function toggleType(id: number) {
  const next = new Set(activeTypes.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  activeTypes.value = next;
}
function selectAll() {
  activeTypes.value = new Set(types.value.map((t) => t.id));
}
function selectNone() {
  activeTypes.value = new Set();
}

// === Leaflet impératif (1600+ marqueurs Vue plombent l'init) ===
const mapEl = ref<HTMLDivElement | null>(null);
let map: import('leaflet').Map | null = null;
let layerGroup: import('leaflet').LayerGroup | null = null;
const iconCache = new Map<string, import('leaflet').Icon>();
let LRef: typeof import('leaflet') | null = null;

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}

function renderMarkers() {
  if (!map || !layerGroup || !LRef) return;
  layerGroup.clearLayers();
  const bounds = map.getBounds();
  const pois = poisData.value ?? [];
  for (const poi of pois) {
    if (!activeTypes.value.has(poi.type)) continue;
    const [lng, lat] = poi.geometry.coordinates;
    if (!bounds.contains([lat, lng])) continue;

    let icon: import('leaflet').Icon | undefined;
    if (poi.type_pictogram) {
      const cached = iconCache.get(poi.type_pictogram);
      if (cached) {
        icon = cached;
      } else {
        icon = LRef.icon({
          iconUrl: poi.type_pictogram,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        });
        iconCache.set(poi.type_pictogram, icon);
      }
    }

    const marker = LRef.marker([lat, lng], icon ? { icon } : {});
    const name = poi.name.fr ?? '';
    const typeLabel = poi.type_label.fr ?? '';
    const desc = poi.description.fr ?? '';
    marker.bindPopup(
      `<div style="max-width:18rem;font-size:0.875rem">
        <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.05em;color:#78716c">${escapeHtml(typeLabel)}</div>
        <div style="font-weight:600;color:#0a0e0a;margin-top:0.125rem">${escapeHtml(name)}</div>
        ${desc ? `<div style="margin-top:0.25rem;color:#44403c">${safeStrict(desc)}</div>` : ''}
      </div>`,
    );
    marker.addTo(layerGroup);
  }
}

watch(activeTypes, () => renderMarkers(), { deep: true });
watch(poisData, () => renderMarkers());

onMounted(async () => {
  const L = await import('leaflet');
  LRef = L.default ?? L;
  if (!mapEl.value) return;

  map = LRef.map(mapEl.value, {
    center: [47.0167, 4.1833], // Cussy-en-Morvan
    zoom: 12,
  });

  const ignPlan = LRef.tileLayer(
    'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png',
    { attribution: '&copy; <a href="https://www.ign.fr/">IGN</a>', maxZoom: 18 },
  );
  const ignPhoto = LRef.tileLayer(
    'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg',
    { attribution: '&copy; <a href="https://www.ign.fr/">IGN</a>', maxZoom: 19 },
  );
  const osm = LRef.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  });
  osm.addTo(map);
  LRef.control
    .layers(
      { OpenStreetMap: osm, 'IGN Plan': ignPlan, 'IGN Photos aériennes': ignPhoto },
      undefined,
      { position: 'topright' },
    )
    .addTo(map);

  layerGroup = LRef.layerGroup().addTo(map);
  map.on('moveend', renderMarkers);
  renderMarkers();
});

onBeforeUnmount(() => {
  map?.remove();
  map = null;
  layerGroup = null;
  iconCache.clear();
});
</script>

<template>
  <div>
    <section class="bg-cream-dark border-b border-stone-200">
      <div class="container-page py-10 md:py-14 max-w-3xl">
        <p class="uppercase tracking-[0.2em] text-xs text-foret mb-3">Patrimoine</p>
        <h1 class="mb-3">Les trésors du Parc naturel régional du Morvan.</h1>
        <p class="text-stone-700 leading-relaxed">
          Plus de 1600 points d'intérêt recensés par le PNR Morvan : édifices, vestiges
          archéologiques, paysages, faune et flore remarquables. Naviguez sur la carte et cliquez
          sur un picto pour en savoir plus.
        </p>
      </div>
    </section>

    <section class="container-page py-8">
      <div class="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-semibold m-0">Filtrer par type</h2>
            <div class="flex gap-2 text-xs">
              <button type="button" class="text-foret hover:underline" @click="selectAll">
                Tout
              </button>
              <span class="text-stone-300">|</span>
              <button type="button" class="text-foret hover:underline" @click="selectNone">
                Aucun
              </button>
            </div>
          </div>
          <ul class="space-y-1 max-h-[60vh] lg:max-h-[70vh] overflow-y-auto pr-1">
            <li v-for="t in types" :key="t.id">
              <label
                class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-cream-dark cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  :checked="activeTypes.has(t.id)"
                  class="accent-foret"
                  @change="toggleType(t.id)"
                />
                <img v-if="t.pictogram" :src="t.pictogram" alt="" class="w-5 h-5 shrink-0" />
                <span class="flex-1">{{ t.label.fr }}</span>
                <span class="text-xs text-stone-500">{{ countByType.get(t.id) ?? 0 }}</span>
              </label>
            </li>
          </ul>
        </aside>

        <div
          class="relative isolate z-0 h-[70vh] lg:h-[80vh] rounded-lg overflow-hidden border border-stone-200 bg-stone-100"
        >
          <div
            v-if="pending"
            class="absolute inset-0 flex items-center justify-center text-stone-600 z-10 pointer-events-none"
          >
            Chargement des points d'intérêt...
          </div>
          <ClientOnly>
            <div ref="mapEl" class="w-full h-full" />
          </ClientOnly>
        </div>
      </div>

      <p class="text-xs text-stone-500 mt-4">
        Données :
        <a
          href="https://geotrek.parcdumorvan.org/"
          target="_blank"
          rel="noopener noreferrer"
          class="underline hover:text-foret"
        >
          Geotrek — Parc naturel régional du Morvan
        </a>
      </p>
    </section>
  </div>
</template>
