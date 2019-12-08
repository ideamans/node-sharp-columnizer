import Sharp from 'sharp'

export class Margin {
  top: number = 0
  bottom: number = 0
  left: number = 0
  right: number = 0

  constructor(values: Partial<Margin> = {}) {
    Object.assign(this, values)
  }

  vertical() {
    return this.top + this.bottom
  }

  horizontal() {
    return this.left + this.right
  }
}

export class Projection {
  top: number = 0
  left: number = 0
  width: number = 0
  height: number = 0
  offsetTop: number = 0

  constructor(values: Partial<Projection> = {}) {
    Object.assign(this, values)
  }

  right() {
    return this.left + this.width
  }

  bottom() {
    return this.top + this.height
  }

  offsetBottom() {
    return this.offsetTop + this.height
  }
}

export class ImageColumnizer {
  static zeroMargin() {
    return this.margin(0, 0, 0, 0)
  }

  static margin(top = 0, right = 0, bottom = 0, left = 0) {
    return new Margin({ top, right, bottom, left })
  }

  height: number = 800
  maxWidth: number = Infinity
  margin: Margin = new Margin({ top: 0, right: 0, bottom: 0, left: 0 })
  gap: number = 0
  indent: number = 0
  outdent: number = 0

  constructor(values: Partial<ImageColumnizer> = {}) {
    Object.assign(this, values)
  }

  maxOriginalHeight(originalWidth: number, maxWidth?: number) {
    maxWidth = maxWidth || this.maxWidth
    if (maxWidth === Infinity) return Infinity

    const heights: Array<number> = [ this.height - this.margin.vertical() - this.outdent ]
    let width = originalWidth + this.margin.horizontal()
    while ( width + originalWidth + this.gap <= maxWidth ) {
      heights.push(this.height - this.margin.vertical() - this.indent)
      width += originalWidth + this.gap
    }

    return heights.reduce((sum, h) => sum + h, 0)
  }

  mapping(originalWidth: number, originalHeight: number): Array<Projection> {
    if (originalWidth == 0 || originalHeight == 0) {
      return [] as Array<Projection>
    }
    // Column 0
    const first = new Projection({
      top: this.margin.top,
      left: this.margin.left,
      width: originalWidth,
      height: this.height - this.margin.vertical() - this.outdent,
      offsetTop: 0,
    })
    if (first.height > originalHeight) first.height = originalHeight

    const mapping: Array<Projection> = [first]
    let last = first
    while( last.offsetBottom() < originalHeight ) {
      const column = new Projection({
        top: this.margin.top + this.indent,
        left: last.right() + this.gap,
        width: originalWidth,
        height: this.height - this.margin.vertical() - this.indent,
        offsetTop: last.offsetBottom(),
      })
      if (column.offsetBottom() > originalHeight) column.height = originalHeight - column.offsetTop

      mapping.push(column)
      last = column
    }

    return mapping
  }

  openImageFile(path: string) {
    return Sharp(path)
  }

  async composite(src: Sharp.Sharp): Promise<Sharp.Sharp> {
    const meta = await src.metadata()
    const mapping = this.mapping(meta.width || 0, meta.height || 0)
    if (mapping.length == 0) throw new Error('Invalid src')

    // crop
    const composites: Array<Sharp.OverlayOptions> = await Promise.all(mapping.map(projection => {
      return src.extract({
        left: 0,
        top: projection.offsetTop,
        width: projection.width,
        height: projection.height
      })
      .toBuffer()
      .then(buffer => {
        const overlay: Sharp.OverlayOptions = {}
        overlay.input = buffer
        overlay.left = projection.left
        overlay.top = projection.top
        overlay.blend = 'over'
        return overlay
      })
    }))

    const last = mapping[mapping.length - 1]
    const canvas = Sharp({
      create: {
        width: last.right() + this.margin.right,
        height: this.height,
        channels: 4,
        background: {
          r: 0, g: 0, b: 0, alpha: 0,
        },
      }
    })

    return canvas.composite(composites)
  }
}