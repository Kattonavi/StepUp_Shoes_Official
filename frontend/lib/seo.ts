/**
 * Centralized SEO helpers for StepUp.
 *
 * Anything that builds a <head> tag, Open Graph payload, canonical URL or
 * sitemap entry should go through here so the defaults stay consistent.
 *
 * All inputs are treated as untrusted (they may come from the admin DB, the
 * store settings or a product description). HTML is stripped and lengths are
 * capped before the value lands in metadata.
 */
import type { Metadata } from 'next'

// ─── Public env / defaults ──────────────────────────────────────────────────

/** Public URL of the storefront. Must include protocol, no trailing slash. */
export const APP_URL: string = (
  process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
).replace(/\/+$/, '')

export const APP_NAME: string = process.env.NEXT_PUBLIC_APP_NAME ?? 'Nómada'

export const DEFAULT_TITLE =
  'Nómada | Estilo urbano, ropa, zapatos y accesorios'

export const DEFAULT_DESCRIPTION =
  'Explora ropa, zapatos y accesorios seleccionados. Consulta disponibilidad, tallas y productos por WhatsApp de forma rápida.'

/**
 * Default Open Graph / social-share image. SVG is portable and small.
 * NOTE: some platforms (Facebook, Twitter) prefer PNG/JPG. Replace this with
 * a real PNG when a designer ships one.
 */
export const DEFAULT_OG_IMAGE = '/og-default.svg'

export const DEFAULT_LOCALE = 'es_CO'

// ─── Text helpers ───────────────────────────────────────────────────────────

/**
 * Strips HTML tags and collapses whitespace. Safe for metadata.
 * Does NOT decode HTML entities — keeps things simple.
 */
export function stripHtml(input: string | null | undefined): string {
  if (!input) return ''
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Truncates a description for meta tags. Cuts on word boundary when possible
 * and adds an ellipsis. Default cap 160 is the safe ceiling for Google snippets.
 */
export function truncateSeoDescription(
  text: string | null | undefined,
  max = 160
): string {
  if (!text) return ''
  const clean = stripHtml(text)
  if (clean.length <= max) return clean
  // Cut at the last space within the limit so we don't break a word.
  const slice = clean.slice(0, max - 1)
  const lastSpace = slice.lastIndexOf(' ')
  return (lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice).trim() + '…'
}

/** Truncates a title to ~70 chars (search-result safe). */
export function truncateSeoTitle(
  text: string | null | undefined,
  max = 70
): string {
  if (!text) return ''
  const clean = stripHtml(text)
  if (clean.length <= max) return clean
  const slice = clean.slice(0, max - 1)
  const lastSpace = slice.lastIndexOf(' ')
  return (lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice).trim() + '…'
}

// ─── URL helpers ────────────────────────────────────────────────────────────

/**
 * Returns an absolute URL based on APP_URL. Accepts paths ("/catalogo"),
 * absolute URLs (returned as-is if http/https), or null (returns APP_URL).
 *
 * Unsafe schemes (javascript:, data:, file:, …) are replaced with APP_URL so
 * social crawlers can't be tricked into rendering a hostile href.
 */
export function ensureAbsoluteUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl) return APP_URL
  const trimmed = pathOrUrl.trim()
  if (!trimmed) return APP_URL

  if (/^https?:\/\//i.test(trimmed)) return trimmed

  // Reject any other scheme (javascript:, data:, file:, mailto:, …)
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return APP_URL

  // Path — prepend APP_URL
  if (trimmed.startsWith('/')) return `${APP_URL}${trimmed}`
  return `${APP_URL}/${trimmed}`
}

/** Builds a canonical URL for the given path (must start with /). */
export function buildCanonicalUrl(path: string): string {
  if (!path) return APP_URL
  return path.startsWith('/') ? `${APP_URL}${path}` : `${APP_URL}/${path}`
}

/**
 * Returns a safe image URL for social cards. Accepts external http/https URLs
 * or relative paths. Falls back to DEFAULT_OG_IMAGE when the candidate is
 * missing or uses an unsafe scheme.
 */
export function getSafeImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return ensureAbsoluteUrl(DEFAULT_OG_IMAGE)
  }
  const trimmed = imageUrl.trim()
  if (!trimmed) return ensureAbsoluteUrl(DEFAULT_OG_IMAGE)

  if (trimmed.startsWith('/')) return ensureAbsoluteUrl(trimmed)
  if (/^https?:\/\//i.test(trimmed)) return trimmed

  // Any other scheme — fall back.
  return ensureAbsoluteUrl(DEFAULT_OG_IMAGE)
}

// ─── Metadata builders ──────────────────────────────────────────────────────

export interface BuildMetadataOptions {
  title?: string | null
  description?: string | null
  /** Absolute path starting with "/" — used for canonical and og:url. */
  path?: string
  /** Override the OG/Twitter image. Defaults to DEFAULT_OG_IMAGE. */
  image?: string | null
  /** Image alt text — defaults to title or APP_NAME. */
  imageAlt?: string | null
  /** If true, marks the page noindex,nofollow. */
  noindex?: boolean
  /** Override Open Graph type. Defaults to 'website'. */
  ogType?: 'website' | 'article' | 'profile'
}

/**
 * Single entry point for page-level metadata. Returns a Metadata object that
 * Next.js merges with the root layout's defaults.
 */
export function buildPageMetadata(opts: BuildMetadataOptions = {}): Metadata {
  const rawTitle = opts.title ? stripHtml(opts.title).trim() : ''
  const title = rawTitle ? truncateSeoTitle(rawTitle) : undefined
  const description =
    truncateSeoDescription(opts.description, 160) || DEFAULT_DESCRIPTION

  const canonical = opts.path ? buildCanonicalUrl(opts.path) : APP_URL
  const image = getSafeImageUrl(opts.image)
  const imageAlt = opts.imageAlt ?? rawTitle ?? APP_NAME

  return {
    title,
    description,
    alternates: { canonical },
    robots: opts.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: opts.ogType ?? 'website',
      siteName: APP_NAME,
      locale: DEFAULT_LOCALE,
      url: canonical,
      title: title ?? DEFAULT_TITLE,
      description,
      images: [{ url: image, alt: imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: title ?? DEFAULT_TITLE,
      description,
      images: [image],
    },
  }
}
