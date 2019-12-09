import Sharp, { SharpOptions } from 'sharp'
const ColorParse = require('color-parse')

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
  maxColumns: number = -1
  margin: Margin = new Margin({ top: 0, right: 0, bottom: 0, left: 0 })
  gap: number = 0

  align: 'top'|'bottom' = 'top'
  indent: number = 0
  outdent: number = 0

  backgroundColor: string = '#0000'
  borderColor: string = '#000'
  borderWidth: number = 0

  constructor(values: Partial<ImageColumnizer> = {}) {
    Object.assign(this, values)
  }

  maxOriginalHeight(originalWidth: number, maxWidth: number = -1) {
    if (maxWidth < 0) return Infinity
    const maxColumns = this.maxColumns < 1 ? Infinity : this.maxColumns

    const maxHeight = this.height - this.margin.vertical() - this.borderWidth * 2

    const heights: Array<number> = [ maxHeight - this.outdent ]
    const widthes: number[] = []
    let width = originalWidth + this.margin.horizontal()
    widthes.push(width)
    const widthStep = originalWidth + this.gap + this.borderWidth * 2
    while ( heights.length < maxColumns && width + widthStep <= maxWidth ) {
      heights.push(maxHeight - this.indent)
      width += widthStep
      widthes.push(width)
    }

    return heights.reduce((sum, h) => sum + h, 0)
  }

  mapping(originalWidth: number, originalHeight: number): Array<Projection> {
    if (originalWidth == 0 || originalHeight == 0) {
      return [] as Array<Projection>
    }
    const maxColumns = this.maxColumns < 1 ? Infinity : this.maxColumns

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
    while( mapping.length < maxColumns && last.offsetBottom() < originalHeight ) {
      const column = new Projection({
        top: this.margin.top + this.indent,
        left: last.right() + this.gap,
        width: originalWidth,
        height: this.height - this.margin.vertical() - this.indent,
        offsetTop: last.offsetBottom(),
      })

      if (column.offsetBottom() > originalHeight) {
        column.height = originalHeight - column.offsetTop
        if (this.align == 'bottom') column.top = this.height - this.margin.bottom - column.height
      }

      mapping.push(column)
      last = column
    }

    return mapping
  }

  openImageFile(path: string) {
    return Sharp(path)
  }

  newCanvas(width: number, height: number, color: string) {
    const parsed: { space: string, values: [number, number, number], alpha: number} = ColorParse(color)
    if (parsed.space != 'rgb') throw new Error(`Color ${color} is not RGB color space`)

    const canvas = Sharp({
      create: {
        width,
        height,
        channels: 4,
        background: {
          r: parsed.values[0],
          g: parsed.values[1],
          b: parsed.values[2],
          alpha: parsed.alpha,
        }
      }
    })

    return canvas
  }

  async border(src: Sharp.Sharp): Promise<Sharp.Sharp> {
    if (this.borderWidth < 1) return src

    const meta = await src.metadata()
    const canvas = this.newCanvas(
      (meta.width || 0) + this.borderWidth * 2,
      (meta.height || 0) + this.borderWidth * 2,
      this.borderColor
    )

    const bordered = await canvas.composite([
      {
        input: await src.toBuffer(),
        left: this.borderWidth,
        top: this.borderWidth,
        blend: 'over'
      }
    ])

    return Sharp(await bordered.png().toBuffer())
  }

  async composite(src: Sharp.Sharp): Promise<Sharp.Sharp> {
    // border
    const bordered = await this.border(src)

    const meta = await bordered.metadata()
    const mapping = this.mapping(meta.width || 0, meta.height || 0)
    if (mapping.length == 0) throw new Error('Invalid bordered src')

    // crop
    const composites: Array<Sharp.OverlayOptions> = await Promise.all(mapping.map(projection => {
      return bordered.extract({
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
    const canvas = this.newCanvas(
      last.right() + this.margin.right,
      this.height,
      this.backgroundColor
    )

    return canvas.composite(composites)
  }
}