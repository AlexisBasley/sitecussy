<script setup lang="ts">
/**
 * Page Patrimoine — carte plein écran avec tous les POIs du PNR Morvan
 * filtrable par type. Utilise les endpoints proxy /api/geotrek/*.
 */
useSeoMeta({
  title: 'Patrimoine du Morvan — VTT Cussy-en-Morvan',
  description:
    "Découvrez les points d'intérêt patrimoniaux du Parc naturel régional du Morvan : édifices, paysages, faune, flore, archéologie.",
});

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

// Charge tous les types pour la légende et les filtres
const { data: typesData } = await useAsyncData('poi-types', () =>
  $fetch<{ results: PoiType[] }>('/api/geotrek/poi-types'),
);
const types = computed(() => typesData.value?.results ?? []);

// Sélection des types affichés (tous par défaut)
const activeTypes = ref<Set<number>>(new Set());
watchEffect(() => {
  if (activeTypes.value.size === 0 && types.value.length > 0) {
    activeTypes.value = new Set(types.value.map((t) => t.id));
  }
});

// Charge tous les POIs (page_size max 500). 1604 POIs total → 4 pages.
const { data: poisData, pending } = await useAsyncData('all-pois', async () => {
  const all: Poi[] = [];
  let page = 1;
  while (true) {
    const res = await $fetch<{ results: Poi[]; next: string | null }>('/api/geotrek/pois', {
      query: { page, page_size: 500 },
    });
    all.push(...res.results);
    if (!res.next) break;
    page++;
    if (page > 10) break; // garde-fou
  }
  return all;
});

const visiblePois = computed(() =>
  (poisData.value ?? []).filter((p) => activeTypes.value.has(p.type)),
);

// Compte par type pour afficher dans les filtres
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

// Centre par défaut : cœur du Morvan
const center: [number, number] = [47.15, 4.05];
</script>

<template>
  <div>
    <!-- Hero court -->
    <section class="bg-cream-dark border-b border-stone-200">
      <div class="container-page py-10 md:py-14 max-w-3xl">
        <p class="uppercase tracking-[0.2em] text-xs text-foret mb-3">Patrimoine</p>
        <h1 class="mb-3">Les trésors du Parc naturel régional du Morvan.</h1>
        <p class="text-stone-700 leading-relaxed">
          Plus de 1600 points d'intérêt recensés par le PNR Morvan : édifices, vestiges
          archéologiques, paysages, faune et flore remarquables. Cliquez sur un picto pour en savoir
          plus.
        </p>
      </div>
    </section>

    <!-- Carte + sidebar filtres -->
    <section class="container-page py-8">
      <div class="grid gap-6 lg:grid-cols-[280px_1fr]">
        <!-- Sidebar filtres -->
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
                <img v-if="t.pictogram" :src="t.pictogram" :alt="''" class="w-5 h-5 shrink-0" />
                <span class="flex-1">{{ t.label.fr }}</span>
                <span class="text-xs text-stone-500">{{ countByType.get(t.id) ?? 0 }}</span>
              </label>
            </li>
          </ul>
        </aside>

        <!-- Carte -->
        <div
          class="relative isolate z-0 h-[70vh] lg:h-[80vh] rounded-lg overflow-hidden border border-stone-200"
        >
          <div
            v-if="pending"
            class="absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-600 z-10"
          >
            Chargement des points d'intérêt...
          </div>
          <ClientOnly>
            <LMap
              :zoom="10"
              :center="center"
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

              <LMarker
                v-for="poi in visiblePois"
                :key="poi.id"
                :lat-lng="[poi.geometry.coordinates[1], poi.geometry.coordinates[0]]"
              >
                <LIcon
                  v-if="poi.type_pictogram"
                  :icon-url="poi.type_pictogram"
                  :icon-size="[28, 28]"
                  :icon-anchor="[14, 14]"
                />
                <LPopup>
                  <div class="text-sm max-w-xs">
                    <div class="text-xs uppercase tracking-wide text-stone-500">
                      {{ poi.type_label.fr }}
                    </div>
                    <div class="font-semibold text-ink mt-0.5">{{ poi.name.fr }}</div>
                    <div
                      v-if="poi.description.fr"
                      class="mt-1 text-stone-700 line-clamp-5"
                      v-html="poi.description.fr"
                    />
                  </div>
                </LPopup>
              </LMarker>
            </LMap>
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
