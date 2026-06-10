import { getPublicApiBaseUrl } from '@/app/lib/config/publicEnv'

type RouteParams = {
  params: Promise<{
    spotId: string
    photoId: string
  }>
}

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: RouteParams) {
  const { spotId, photoId } = await params
  const upstreamUrl = new URL(`/spots/${spotId}/photos/${photoId}`, getPublicApiBaseUrl())

  const upstreamResponse = await fetch(upstreamUrl, {
    method: 'GET',
    cache: 'no-store',
  })

  if (!upstreamResponse.ok || !upstreamResponse.body) {
    return new Response('Photo introuvable', {
      status: upstreamResponse.status || 502,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }

  const headers = new Headers()
  const contentType = upstreamResponse.headers.get('content-type')
  const cacheControl = upstreamResponse.headers.get('cache-control')
  const contentLength = upstreamResponse.headers.get('content-length')
  const etag = upstreamResponse.headers.get('etag')
  const lastModified = upstreamResponse.headers.get('last-modified')

  if (contentType) headers.set('Content-Type', contentType)
  if (cacheControl) headers.set('Cache-Control', cacheControl)
  if (contentLength) headers.set('Content-Length', contentLength)
  if (etag) headers.set('ETag', etag)
  if (lastModified) headers.set('Last-Modified', lastModified)

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers,
  })
}
