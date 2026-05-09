<script setup lang="ts">
/**
 * BaladeMap — affiche un ou plusieurs tracés GPX sur une carte Leaflet.
 *
 * Reçoit la liste des chemins de la balade, télécharge chaque GPX via
 * le proxy Nuxt /api/gpx/[documentId], parse les points et trace les
 * polylines colorées selon la difficulté.
 *
 * Le composant doit être enveloppé dans <ClientOnly> par le parent.
 */
import type { Chemin } from '~/types/chemin';
import type { Difficulte } from '~/types/balade';
import type { GpxData } from '~/composables/useGpx';

const props = defineProps<{
  chemins: Chemin[];
  difficulte: Difficulte;
}>();

const { fetchAndParse } = useGpx();

const couleur = computed(() => {
  switch (props.difficulte) {
    case 'famille':
      return '#16a34a'; // vert
    case 'intermediaire':
      return '#d97706'; // orange
    case 'expert':
      return '#dc2626'; // rouge
    default:
      return '#16a34a';
  }
});

interface CheminTrace {
  chemin: Chemin;
  data: GpxData;
}

interface Poi {
  id: number;
  name: { fr: string | null };
  description: { fr: string | null };
  geometry: { coordinates: [number, number, number?] };
  type_label: { fr: string | null };
  type_pictogram: string | null;
}

const traces = ref<CheminTrace[]>([]);
const pois = ref<Poi[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Charge tous les GPX en parallèle
onMounted(async () => {
  try {
    const results = await Promise.all(
      props.chemins.map(async (c) => ({
        chemin: c,
        data: await fetchAndParse(`/api/gpx/${c.documentId}`),
      })),
    );
    traces.value = results.filter((r) => r.data.points.length > 0);
    await loadPois();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erreur de chargement des traces';
  } finally {
    loading.value = false;
  }
});

// Charge les POIs Geotrek dans la bbox élargie (~500m de marge)
async function loadPois() {
  if (!globalBounds.value) return;
  const [[minLat, minLng], [maxLat, maxLng]] = globalBounds.value;
  const margin = 0.005; // ~500m
  const bbox = [minLng - margin, minLat - margin, maxLng + margin, maxLat + margin].join(',');
  try {
    const data = await $fetch<{ results: Poi[] }>('/api/geotrek/pois', {
      query: { bbox, page_size: 200 },
    });
    pois.value = data.results;
  } catch {
    // Silencieux : les POIs sont un bonus, pas un bloquant
  }
}

// Calcule les bounds globaux pour cadrer la carte sur toutes les traces
const globalBounds = computed<[[number, number], [number, number]] | null>(() => {
  const allPoints = traces.value.flatMap((t) => t.data.points);
  if (allPoints.length === 0) return null;
  let minLat = allPoints[0][0];
  let maxLat = allPoints[0][0];
  let minLng = allPoints[0][1];
  let maxLng = allPoints[0][1];
  for (const [lat, lng] of allPoints) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
});

// Centre par défaut : Cussy-en-Morvan (47.0167, 4.1833)
const fallbackCenter: [number, number] = [47.0167, 4.1833];

// Center calculé depuis les bounds (Leaflet exige toujours center + zoom)
const center = computed<[number, number]>(() => {
  if (!globalBounds.value) return fallbackCenter;
  const [[minLat, minLng], [maxLat, maxLng]] = globalBounds.value;
  return [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
});
</script>

<template>
  <div class="relative w-full h-[500px] rounded-lg overflow-hidden border border-stone-200">
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-600"
    >
      Chargement de la carte...
    </div>
    <div
      v-else-if="error"
      class="absolute inset-0 flex items-center justify-center bg-red-50 text-red-700 text-sm p-4 text-center"
    >
      {{ error }}
    </div>
    <LMap
      v-else
      :zoom="13"
      :center="center"
      :bounds="globalBounds ?? undefined"
      :use-global-leaflet="false"
      style="height: 100%; width: 100%"
    >
      <LControlLayers position="topright" />

      <LTileLayer
        url="https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png"
        attribution='&copy; <a href="https://www.ign.fr/">IGN</a>'
        layer-type="base"
        name="IGN Plan"
        :max-zoom="18"
      />
      <LTileLayer
        url="https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg"
        attribution='&copy; <a href="https://www.ign.fr/">IGN</a>'
        layer-type="base"
        name="IGN Photos aériennes"
        :max-zoom="19"
      />
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        layer-type="base"
        name="OpenStreetMap"
        visible
      />

      <template v-for="trace in traces" :key="trace.chemin.id">
        <LPolyline :lat-lngs="trace.data.points" :color="couleur" :weight="4" :opacity="0.85" />
        <LMarker v-if="trace.data.start" :lat-lng="trace.data.start">
          <LTooltip>Départ — {{ trace.chemin.nom }}</LTooltip>
        </LMarker>
      </template>

      <LMarker
        v-for="poi in pois"
        :key="`poi-${poi.id}`"
        :lat-lng="[poi.geometry.coordinates[1], poi.geometry.coordinates[0]]"
      >
        <LIcon
          v-if="poi.type_pictogram"
          :icon-url="poi.type_pictogram"
          :icon-size="[28, 28]"
          :icon-anchor="[14, 14]"
          class-name="poi-pictogram"
        />
        <LPopup>
          <div class="text-sm max-w-xs">
            <div class="text-xs uppercase tracking-wide text-stone-500">
              {{ poi.type_label.fr }}
            </div>
            <div class="font-semibold text-ink mt-0.5">{{ poi.name.fr }}</div>
            <div
              v-if="poi.description.fr"
              class="mt-1 text-stone-700 line-clamp-4"
              v-html="poi.description.fr"
            />
          </div>
        </LPopup>
      </LMarker>
    </LMap>
  </div>
</template>
