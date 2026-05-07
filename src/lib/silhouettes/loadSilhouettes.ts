import { SILHOUETTES } from './silhouettes'

const cache = new Map<string, HTMLImageElement>()

/**
 * Get a cached silhouette image for a furniture type.
 * Returns null if not loaded yet.
 */
export function getSilhouetteImage(type: string): HTMLImageElement | null {
  return cache.get(type) ?? null
}

/**
 * Preload all silhouettes by rasterizing SVG paths to HTMLImageElement textures.
 * Should be called at app initialization.
 */
export function preloadSilhouettes(): void {
  const svgNS = 'http://www.w3.org/2000/svg'
  
  for (const [type, pathData] of Object.entries(SILHOUETTES)) {
    try {
      // Create an offscreen canvas (2x resolution for retina)
      const canvas = document.createElement('canvas')
      const size = 200 // 100px at 2x resolution
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      
      if (!ctx) continue
      
      // Create SVG string with the path
      const svgString = `
        <svg xmlns="${svgNS}" width="${size}" height="${size}" viewBox="0 0 100 100">
          <path d="${pathData}" fill="#000000" />
        </svg>
      `
      
      // Create image from SVG
      const img = new Image()
      img.onload = () => {
        // Draw SVG to canvas
        ctx.clearRect(0, 0, size, size)
        ctx.drawImage(img, 0, 0, size, size)
        
        // Create new image from canvas data
        const finalImg = new Image()
        finalImg.src = canvas.toDataURL('image/png')
        cache.set(type, finalImg)
      }
      
      img.src = `data:image/svg+xml;base64,${btoa(svgString)}`
    } catch (error) {
      console.warn(`Failed to preload silhouette for ${type}:`, error)
    }
  }
}