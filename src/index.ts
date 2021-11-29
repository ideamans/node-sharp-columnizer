import Sharp, { SharpOptions } from 'sharp'
import Color from 'color'
import { cpuUsage } from 'process'
import { threadId } from 'worker_threads'

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

  isFirst: boolean = false
  isLast: boolean = false

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

export type BeforeCompositeCallback = (
  canvas: Sharp.Sharp,
  compositions: Sharp.OverlayOptions[]
) => Promise<Sharp.Sharp>

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

  align: 'top' | 'bottom' = 'top'
  indent: number = 0
  outdent: number = 0

  backgroundColor: string = '#0000'
  borderColor: string = '#000'
  borderWidth: number = 0

  beforeComposite?: BeforeCompositeCallback

  constructor(values: Partial<ImageColumnizer> = {}) {
    Object.assign(this, values)
  }

  maxOriginalHeight(originalWidth: number, maxWidth: number = -1) {
    if (maxWidth < 0) return Infinity
    const maxColumns = this.maxColumns < 1 ? Infinity : this.maxColumns

    const maxHeight = this.height - this.margin.vertical() - this.borderWidth * 2

    const heights: Array<number> = [maxHeight - this.outdent]
    const widthes: number[] = []
    let width = originalWidth + this.margin.horizontal()
    widthes.push(width)
    const widthStep = originalWidth + this.gap + this.borderWidth * 2
    while (heights.length < maxColumns && width + widthStep <= maxWidth) {
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
      isFirst: true,
    })
    if (first.height > originalHeight) first.height = originalHeight

    const mapping: Array<Projection> = [first]
    let last = first
    while (mapping.length < maxColumns && last.offsetBottom() < originalHeight) {
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

    last.isLast = true

    return mapping
  }

  openImageFile(path: string) {
    return Sharp(path)
  }

  newCanvas(width: number, height: number, color: string) {
    const c = Color(color)

    const canvas = Sharp({
      create: {
        width,
        height,
        channels: 4,
        background: color,
      },
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
        blend: 'over',
      },
    ])

    return Sharp(await bordered.tiff().toBuffer())
  }

  async composite(src: Sharp.Sharp): Promise<Sharp.Sharp> {
    const rawMeta = await src.metadata()
    if (!rawMeta.width || !rawMeta.height) throw new Error('invalid metrics')

    const bordered = this.borderWidth > 0

    const dimension = {
      width: rawMeta.width,
      height: rawMeta.height,
    }

    if (bordered) {
      dimension.width += this.borderWidth * 2
      dimension.height += this.borderWidth * 2
    }

    const mapping = this.mapping(dimension.width, dimension.height)
    if (mapping.length == 0) throw new Error('Invalid bordered src')

    // border background
    let borders: Array<Sharp.OverlayOptions> = []
    if (bordered) {
      borders = mapping.map((projection) => {
        return {
          input: {
            create: {
              width: projection.width,
              height: projection.height,
              channels: 4,
              background: this.borderColor,
            },
          },
          left: projection.left,
          top: projection.top,
          blend: 'over',
        }
      })
    }

    // crop
    let overlays: Array<Sharp.OverlayOptions> = await Promise.all(
      mapping.map((projection) => {
        const region = {
          left: 0,
          top: projection.offsetTop,
          width: rawMeta.width || 1,
          height: projection.height,
        }

        if (bordered) {
          if (projection.isFirst) {
            region.height -= this.borderWidth
          } else {
            region.top -= this.borderWidth
          }
          if (projection.isLast) {
            region.height -= this.borderWidth
          }
        }

        return src
          .extract(region)
          .raw()
          .toBuffer()
          .then((buffer) => {
            const overlay: Sharp.OverlayOptions = {}
            overlay.input = buffer
            overlay.left = projection.left
            overlay.top = projection.top
            overlay.blend = 'over'
            overlay.raw = {
              width: region.width,
              height: region.height,
              channels: rawMeta.channels || 4,
            }

            if (bordered) {
              overlay.left += this.borderWidth
              if (projection.isFirst) {
                overlay.top += this.borderWidth
              }
            }

            return overlay
          })
      })
    )

    const last = mapping[mapping.length - 1]
    let canvas = this.newCanvas(last.right() + this.margin.right, this.height, this.backgroundColor)

    const compositions = [...borders, ...overlays]

    if (this.beforeComposite) {
      canvas = await this.beforeComposite(canvas, compositions)
    }

    return canvas.composite(compositions)
  }
}
