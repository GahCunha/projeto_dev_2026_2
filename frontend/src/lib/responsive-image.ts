const defaultWidths = [480, 720, 960, 1280]

function isUnsplashImage(url: string) {
  try {
    return new URL(url).hostname === 'images.unsplash.com'
  } catch {
    return false
  }
}

export function optimizeImageUrl(url: string, width: number) {
  if (!isUnsplashImage(url)) return url

  const optimizedUrl = new URL(url)
  optimizedUrl.searchParams.set('auto', 'format')
  optimizedUrl.searchParams.set('fit', 'crop')
  optimizedUrl.searchParams.set('w', String(width))
  optimizedUrl.searchParams.set('q', '80')
  return optimizedUrl.toString()
}

export function responsiveImageProps(
  url: string,
  sizes: string,
  widths = defaultWidths,
) {
  if (!isUnsplashImage(url)) return { src: url }

  return {
    src: optimizeImageUrl(url, widths.at(-1) ?? 1280),
    srcSet: widths
      .map((width) => `${optimizeImageUrl(url, width)} ${width}w`)
      .join(', '),
    sizes,
  }
}
