import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { mimeFromName } from '../lib/benefits';
import { fileSize } from './files';

export type PickedFile = {
  name: string;
  mime: string;
  uri: string;
  size: number;
};

async function picked(
  name: string | null | undefined,
  mime: string | null | undefined,
  uri: string,
  size?: number | null,
): Promise<PickedFile> {
  const safeName = name?.trim() || 'arquivo';
  return {
    name: safeName,
    mime: mime || mimeFromName(safeName),
    uri,
    size: size && size > 0 ? size : await fileSize(uri),
  };
}

export async function pickFromCamera(): Promise<PickedFile | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) throw new Error('Permita o uso da câmera para fotografar o documento.');
  const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return await picked(asset.fileName, asset.mimeType, asset.uri, asset.fileSize);
}

export async function pickFromLibrary(): Promise<PickedFile | null> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return await picked(asset.fileName, asset.mimeType, asset.uri, asset.fileSize);
}

export async function pickDocument(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'image/jpeg', 'image/png'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return await picked(asset.name, asset.mimeType, asset.uri, asset.size);
}
