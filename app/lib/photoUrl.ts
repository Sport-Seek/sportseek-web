export const buildPhotoUrl = (path?: string | null): string | null => {
  if (!path) return null

  const trimmed = path.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed)
      if (parsed.pathname.startsWith('/spots/')) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`
      }
    } catch {
      return trimmed
    }

    return trimmed
  }

  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  if (normalizedPath.startsWith('/spots/')) {
    return normalizedPath
  }

  return null
}
