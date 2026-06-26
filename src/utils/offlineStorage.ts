import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import * as FileSystem from "expo-file-system";
import initialData from "../../assets/data/digital-tools.json"; // ← Important

const CACHE_KEY = "digital_tools_cache";
const CACHE_TIMESTAMP = "digital_tools_timestamp";
const IMAGES_DIR = `${FileSystem.cacheDirectory}digital_tools_images/`;

// Initialize and seed initial data
export const initializeData = async () => {
  try {
    const existing = await AsyncStorage.getItem(CACHE_KEY);
    if (!existing) {
      console.log("Seeding initial data...");
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(initialData));
      await AsyncStorage.setItem(CACHE_TIMESTAMP, Date.now().toString());
    }
  } catch (e) {
    console.error("Failed to seed initial data", e);
  }
};

export const initCacheDirectory = async () => {
  const dirInfo = await FileSystem.getInfoAsync(IMAGES_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
  }
};

export const cacheImage = async (url: string): Promise<string | null> => {
  if (!url) return null;
  try {
    await initCacheDirectory();
    const filename =
      url
        .split("/")
        .pop()
        ?.replace(/[^a-zA-Z0-9._-]/g, "_") || "img.jpg";
    const localUri = `${IMAGES_DIR}${filename}`;

    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (fileInfo.exists) return localUri;

    const download = await FileSystem.downloadAsync(url, localUri);
    return download.uri;
  } catch (e) {
    console.log("Image cache failed:", e);
    return null;
  }
};

export const saveToCache = async (data: any) => {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    await AsyncStorage.setItem(CACHE_TIMESTAMP, Date.now().toString());
  } catch (e) {
    console.log(e);
  }
};

export const getCachedData = async () => {
  try {
    const data = await AsyncStorage.getItem(CACHE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const checkInternet = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return !!state.isConnected && state.isInternetReachable !== false;
};
