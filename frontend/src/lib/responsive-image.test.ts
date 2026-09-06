import { describe, expect, it } from 'vitest'
import { optimizeImageUrl, responsiveImageProps } from './responsive-image'

describe('responsive images', () => {
  it('resizes and compresses Unsplash images', () => {
    const result = optimizeImageUrl(
      'https://images.unsplash.com/photo-example',
      640,
    )

    expect(result).toContain('auto=format')
    expect(result).toContain('fit=crop')
    expect(result).toContain('w=640')
    expect(result).toContain('q=80')
  })

  it('keeps arbitrary workshop image URLs unchanged', () => {
    expect(
      responsiveImageProps('https://example.com/workshop.jpg', '100vw'),
    ).toEqual({
      src: 'https://example.com/workshop.jpg',
    })
  })
})
