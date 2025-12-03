declare module '@exodus/crypto/hash' {
  export function hashSync(
    algo: string,
    data: Buffer | Uint8Array | string,
    format?: string
  ): Buffer | Uint8Array | string
}

declare module '@exodus/ethereumjs/util' {
  export function toBuffer(data: unknown): Buffer
  export function bufferToHex(data: Buffer): string
}
