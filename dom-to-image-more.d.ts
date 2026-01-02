declare module 'dom-to-image-more' {
  export interface Options {
    quality?: number;
    width?: number;
    height?: number;
    bgcolor?: string;
    style?: Partial<CSSStyleDeclaration>;
    filter?: (node: HTMLElement) => boolean;
    imagePlaceholder?: string;
    cacheBust?: boolean;
  }

  export function toSvg(node: HTMLElement, options?: Options): Promise<string>;
  export function toPng(node: HTMLElement, options?: Options): Promise<string>;
  export function toJpeg(node: HTMLElement, options?: Options): Promise<string>;
  export function toBlob(node: HTMLElement, options?: Options): Promise<Blob>;
  export function toPixelData(node: HTMLElement, options?: Options): Promise<Uint8ClampedArray>;
}
