/**
 * useGpx — parsing minimaliste de fichiers GPX 1.1.
 *
 * Extrait les points de trace (trkpt) en [lat, lng] pour Leaflet.
 * Pas de dépendance externe : DOMParser natif (navigateur) ou
 * fallback regex côté serveur.
 */

export interface GpxData {
  points: [number, number][];
  bounds: [[number, number], [number, number]] | null;
  start: [number, number] | null;
  end: [number, number] | null;
}

function parseWithDom(xml: string): [number, number][] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const trkpts = Array.from(doc.getElementsByTagName('trkpt'));
  // Fallback : certains fichiers n'ont que des waypoints
  const nodes = trkpts.length > 0 ? trkpts : Array.from(doc.getElementsByTagName('rtept'));
  return nodes
    .map((n) => {
      const lat = Number.parseFloat(n.getAttribute('lat') || '');
      const lon = Number.parseFloat(n.getAttribute('lon') || '');
      return [lat, lon] as [number, number];
    })
    .filter(([lat, lon]) => Number.isFinite(lat) && Number.isFinite(lon));
}

function parseWithRegex(xml: string): [number, number][] {
  const re = /<(?:trkpt|rtept)\s+[^>]*lat="([-\d.]+)"\s+lon="([-\d.]+)"/g;
  const out: [number, number][] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const lat = Number.parseFloat(m[1]);
    const lon = Number.parseFloat(m[2]);
    if (Number.isFinite(lat) && Number.isFinite(lon)) out.push([lat, lon]);
  }
  return out;
}

function computeBounds(points: [number, number][]): [[number, number], [number, number]] | null {
  if (points.length === 0) return null;
  let minLat = points[0][0];
  let maxLat = points[0][0];
  let minLng = points[0][1];
  let maxLng = points[0][1];
  for (const [lat, lng] of points) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
}

export function useGpx() {
  /** Parse une chaîne XML GPX. */
  function parse(xml: string): GpxData {
    const points = typeof DOMParser !== 'undefined' ? parseWithDom(xml) : parseWithRegex(xml);
    return {
      points,
      bounds: computeBounds(points),
      start: points[0] ?? null,
      end: points[points.length - 1] ?? null,
    };
  }

  /** Télécharge puis parse un GPX depuis une URL. */
  async function fetchAndParse(url: string): Promise<GpxData> {
    const xml = await $fetch<string>(url, { responseType: 'text' });
    return parse(xml);
  }

  return { parse, fetchAndParse };
}
