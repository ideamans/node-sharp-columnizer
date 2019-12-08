"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
class Margin {
    constructor(values = {}) {
        this.top = 0;
        this.bottom = 0;
        this.left = 0;
        this.right = 0;
        Object.assign(this, values);
    }
    vertical() {
        return this.top + this.bottom;
    }
    horizontal() {
        return this.left + this.right;
    }
}
exports.Margin = Margin;
class Projection {
    constructor(values = {}) {
        this.top = 0;
        this.left = 0;
        this.width = 0;
        this.height = 0;
        this.offsetTop = 0;
        Object.assign(this, values);
    }
    right() {
        return this.left + this.width;
    }
    bottom() {
        return this.top + this.height;
    }
    offsetBottom() {
        return this.offsetTop + this.height;
    }
}
exports.Projection = Projection;
class ImageColumnizer {
    constructor(values = {}) {
        this.height = 800;
        this.maxWidth = Infinity;
        this.margin = new Margin({ top: 0, right: 0, bottom: 0, left: 0 });
        this.gap = 0;
        this.indent = 0;
        this.outdent = 0;
        this.background = '';
        Object.assign(this, values);
    }
    static zeroMargin() {
        return this.margin(0, 0, 0, 0);
    }
    static margin(top = 0, right = 0, bottom = 0, left = 0) {
        return new Margin({ top, right, bottom, left });
    }
    maxOriginalHeight(originalWidth, maxWidth) {
        maxWidth = maxWidth || this.maxWidth;
        if (maxWidth === Infinity)
            return Infinity;
        const heights = [this.height - this.margin.vertical() - this.outdent];
        let width = originalWidth + this.margin.horizontal();
        while (width + originalWidth + this.gap <= maxWidth) {
            heights.push(this.height - this.margin.vertical() - this.indent);
            width += originalWidth + this.gap;
        }
        return heights.reduce((sum, h) => sum + h, 0);
    }
    mapping(originalWidth, originalHeight) {
        if (originalWidth == 0 || originalHeight == 0) {
            return [];
        }
        // Column 0
        const first = new Projection({
            top: this.margin.top,
            left: this.margin.left,
            width: originalWidth,
            height: this.height - this.margin.vertical() - this.outdent,
            offsetTop: 0,
        });
        if (first.height > originalHeight)
            first.height = originalHeight;
        const mapping = [first];
        let last = first;
        while (last.offsetBottom() < originalHeight) {
            const column = new Projection({
                top: this.margin.top + this.indent,
                left: last.right() + this.gap,
                width: originalWidth,
                height: this.height - this.margin.vertical() - this.indent,
                offsetTop: last.offsetBottom(),
            });
            if (column.offsetBottom() > originalHeight)
                column.height = originalHeight - column.offsetTop;
            mapping.push(column);
            last = column;
        }
        return mapping;
    }
    openImageFile(path) {
        return sharp_1.default(path);
    }
    async composite(src) {
        const meta = await src.metadata();
        const mapping = this.mapping(meta.width || 0, meta.height || 0);
        if (mapping.length == 0)
            throw new Error('Invalid src');
        // crop
        const composites = await Promise.all(mapping.map(projection => {
            return src.extract({
                left: 0,
                top: projection.offsetTop,
                width: projection.width,
                height: projection.height
            })
                .toBuffer()
                .then(buffer => {
                const overlay = {};
                overlay.input = buffer;
                overlay.left = projection.left;
                overlay.top = projection.top;
                overlay.blend = 'over';
                return overlay;
            });
        }));
        const last = mapping[mapping.length - 1];
        const canvas = sharp_1.default({
            create: {
                width: last.right() + this.margin.right,
                height: this.height,
                channels: 4,
                background: {
                    r: 0, g: 0, b: 0, alpha: 0,
                },
            }
        });
        return canvas.composite(composites);
    }
}
exports.ImageColumnizer = ImageColumnizer;
