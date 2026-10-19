import * as FileSystem from 'expo-file-system/legacy';

function safeName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9.\-_]/g, '_').slice(0, 80);
  return cleaned || 'arquivo';
}

export async function keepFile(cadastroId: string, fileId: string, fromUri: string, name: string): Promise<string> {
  const folder = `${FileSystem.documentDirectory}cadastros/${cadastroId}/`;
  await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
  const dest = `${folder}${fileId}-${safeName(name)}`;
  await FileSystem.copyAsync({ from: fromUri, to: dest });
  return dest;
}

export async function deleteCadastroFiles(cadastroId: string): Promise<void> {
  await FileSystem.deleteAsync(`${FileSystem.documentDirectory}cadastros/${cadastroId}`, { idempotent: true });
}

export async function fileSize(uri: string): Promise<number> {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists || !('size' in info)) return 0;
  return info.size ?? 0;
}
