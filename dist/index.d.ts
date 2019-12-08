import Sharp from 'sharp';
export declare class Margin {
    top: number;
    bottom: number;
    left: number;
    right: number;
    constructor(values?: Partial<Margin>);
    vertical(): number;
    horizontal(): number;
}
export declare class Projection {
    top: number;
    left: number;
    width: number;
    height: number;
    offsetTop: number;
    constructor(values?: Partial<Projection>);
    right(): number;
    bottom(): number;
    offsetBottom(): number;
}
export declare class ImageColumnizer {
    static zeroMargin(): Margin;
    static margin(top?: number, right?: number, bottom?: number, left?: number): Margin;
    height: number;
    maxWidth: number;
    margin: Margin;
    gap: number;
    indent: number;
    outdent: number;
    background: string;
    constructor(values?: Partial<ImageColumnizer>);
    maxOriginalHeight(originalWidth: number, maxWidth?: number): number;
    mapping(originalWidth: number, originalHeight: number): Array<Projection>;
    openImageFile(path: string): Sharp.Sharp;
    composite(src: Sharp.Sharp): Promise<Sharp.Sharp>;
}
