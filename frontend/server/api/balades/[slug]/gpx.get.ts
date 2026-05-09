/**
 * Téléchargement GPX fusionné — concatène les fichiers GPX de tous les chemins
 * d'une balade en un seul .gpx servi en attachment.
 */
import type { Balade } from '~/types/balade';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug manquant' });
  }

  const config = useRuntimeConfig();
  const strapiUrl = config.strapiUrl.replace(/\/$/, '');
  const headers: Record<string, string> = {};
  if (config.strapiApiToken) {
    headers.Authorization = `Bearer ${config.strapiApiToken}`;
  }

  // 1. Récupérer la balade avec ses chemins et fichiers GPX
  const res = await $fetch<{ data: Balade[] }>(
    `${strapiUrl}/api/balades?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[chemins][populate]=fichier_gpx`,
    { headers },
  );

  const balade = res.data?.[0];
  if (!balade) {
    throw createError({ statusCode: 404, statusMessage: 'Balade introuvable' });
  }

  const cheminsAvecGpx = (balade.chemins ?? []).filter((c) => c.fichier_gpx?.url);
  if (!cheminsAvecGpx.length) {
    throw createError({ statusCode: 404, statusMessage: 'Aucun fichier GPX disponible' });
  }

  // 2. Récupérer chaque fichier GPX en parallèle
  const xmls = await Promise.all(
    cheminsAvecGpx.map((c) => {
      const url = c.fichier_gpx.url.startsWith('http')
        ? c.fichier_gpx.url
        : `${strapiUrl}${c.fichier_gpx.url}`;
      return $fetch<string>(url, { responseType: 'text' });
    }),
  );

  // 3. Extraire les <trk>…</trk> et <rte>…</rte> de chaque GPX et les fusionner
  const trackBlocks: string[] = [];
  xmls.forEach((xml, i) => {
    const trks = xml.match(/<trk\b[\s\S]*?<\/trk>/g) ?? [];
    const rtes = xml.match(/<rte\b[\s\S]*?<\/rte>/g) ?? [];
    const nom = cheminsAvecGpx[i].nom;
    if (!trks.length && !rtes.length) {
      // Pas de track : on tente d'extraire les wpt
      const wpts = xml.match(/<wpt\b[\s\S]*?<\/wpt>/g) ?? [];
      trackBlocks.push(...wpts);
    } else {
      // Insérer/forcer un <name> dans chaque trk pour identifier le segment
      trks.forEach((trk) => {
        if (/<name>/.test(trk)) {
          trackBlocks.push(trk);
        } else {
          trackBlocks.push(
            trk.replace(/<trk\b[^>]*>/, (m) => `${m}\n    <name>${escapeXml(nom)}</name>`),
          );
        }
      });
      trackBlocks.push(...rtes);
    }
  });

  const merged = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="VTT Cussy-en-Morvan" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(balade.titre)}</name>
  </metadata>
  ${trackBlocks.join('\n  ')}
</gpx>
`;

  const filename = `${slug}.gpx`;
  setHeader(event, 'Content-Type', 'application/gpx+xml; charset=utf-8');
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`);
  setHeader(event, 'Cache-Control', 'public, max-age=3600');
  return merged;
});

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
