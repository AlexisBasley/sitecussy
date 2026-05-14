import DOMPurify from 'isomorphic-dompurify';

/**
 * useSanitize — sanitization HTML pour les contenus rich-text affichés via v-html.
 *
 * Couvre deux usages :
 *  - `safe(html)` : pour le HTML produit par Strapi (admin de confiance) — config large.
 *  - `safeStrict(html)` : pour le HTML tiers (API Geotrek) — config restrictive.
 */
const STRAPI_ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'a',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'code',
  'pre',
  'img',
  'figure',
  'figcaption',
];

const STRICT_ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li'];

const COMMON_ATTR = ['href', 'title', 'target', 'rel', 'src', 'alt'];

export function useSanitize() {
  function safe(html: string | null | undefined): string {
    if (!html) return '';
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: STRAPI_ALLOWED_TAGS,
      ALLOWED_ATTR: COMMON_ATTR,
    });
  }

  function safeStrict(html: string | null | undefined): string {
    if (!html) return '';
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: STRICT_ALLOWED_TAGS,
      ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    });
  }

  return { safe, safeStrict };
}
