import type { ShareSheet } from '../models/shareSheet';
import { STORAGE_KEYS } from '../constants/storageVersion';
import { loadLocal, saveLocal } from '../utils/storage';

export const shareApi = {
  list: () => loadLocal<ShareSheet[]>(STORAGE_KEYS.shareSheets, []),
  save: (items: ShareSheet[]) => saveLocal(STORAGE_KEYS.shareSheets, items),
};
