/** Yongdam: worker assets are colocated under /neural/. */
export function publicUrl(path: string): string { return new URL(path, import.meta.url).href; }
