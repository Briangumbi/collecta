import * as FileSystem from 'expo-file-system/legacy';

import { supabase } from '@/lib/supabase';

/** Uploads a local file URI to the `attachments` bucket under `${projectId}/...` and returns a signed URL. */
export async function uploadProjectFile(projectId: string, localUri: string, fileName: string) {
  const base64 = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
  const path = `${projectId}/${Date.now()}-${fileName}`;
  const arrayBuffer = base64ToArrayBuffer(base64);

  const { error: uploadError } = await supabase.storage.from('attachments').upload(path, arrayBuffer, {
    contentType: guessContentType(fileName),
  });
  if (uploadError) throw uploadError;

  const { data, error: signError } = await supabase.storage.from('attachments').createSignedUrl(path, 60 * 60 * 24 * 365);
  if (signError) throw signError;

  return data.signedUrl;
}

function base64ToArrayBuffer(base64: string) {
  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function guessContentType(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'pdf') return 'application/pdf';
  return 'image/jpeg';
}
