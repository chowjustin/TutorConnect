import api from '@/lib/api';

/** Trigger a browser download from a Blob with the given filename. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** GET a binary endpoint and return its Blob. */
export async function fetchBlob(path: string): Promise<Blob> {
  const res = await api.get(path, { responseType: 'blob' });
  return res.data as Blob;
}

/** Convenience: fetch a binary endpoint and trigger download. */
export async function downloadFromPath(
  path: string,
  filename: string,
): Promise<void> {
  const blob = await fetchBlob(path);
  downloadBlob(blob, filename);
}
