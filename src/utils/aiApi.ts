// ─── IITA Knowledge AI API (FastAPI backend in ../iita-knowledge-ai-api) ──────
// Defaults to the deployed Vercel API. To test against a local backend, set
// EXPO_PUBLIC_AI_API_URL (e.g. http://192.168.x.x:8000) in .env.
const DEFAULT_AI_API_URL = "https://iita-knowledge-ai-api.vercel.app";

export const AI_API_URL: string = (
  process.env.EXPO_PUBLIC_AI_API_URL || DEFAULT_AI_API_URL
).replace(/\/+$/, "");

export class AiApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const toQuery = (params: Record<string, any>) =>
  Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");

const request = async (
  method: "GET" | "POST",
  path: string,
  params: Record<string, any> = {},
  body?: any
) => {
  const query = toQuery(params);
  let res: Response;
  try {
    res = await fetch(`${AI_API_URL}${path}${query ? `?${query}` : ""}`, {
      method,
      ...(body instanceof FormData
        ? { body }
        : body !== undefined
        ? { body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }
        : {}),
    });
  } catch {
    throw new AiApiError("network", 0);
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = Array.isArray(json?.detail)
      ? json.detail.map((d: any) => d.msg).join("; ")
      : json?.detail;
    throw new AiApiError(detail || `HTTP ${res.status}`, res.status);
  }
  return json;
};

const getJson = (path: string, params: Record<string, any> = {}) =>
  request("GET", path, params);

const postJson = (path: string, body: any, params: Record<string, any> = {}) =>
  request("POST", path, params, body);

// A picked file (image, audio, CSV) as React Native's FormData expects it.
export type UploadFile = { uri: string; name: string; type: string };

const postFile = (
  path: string,
  field: string,
  file: UploadFile,
  params: Record<string, any> = {}
) => {
  const form = new FormData();
  form.append(field, file as any);
  return request("POST", path, params, form);
};

// Languages the AI text features support; anything else falls back to English.
export const AI_LANGUAGES = ["en", "yo", "ha", "ig", "fr", "sw", "pt"];
export const aiLanguage = (locale?: string) => {
  const code = (locale || "en").split("-")[0].toLowerCase();
  return AI_LANGUAGES.includes(code) ? code : "en";
};

// The app's crop keys (home.tsx MANDATE_CROPS) → the API's crop keys.
export const apiCrop = (key: string) =>
  key === "banana_plantain" ? "banana" : key;

// ─── Health ───────────────────────────────────────────────────────────────────
export const fetchHealth = () => getJson("/health");

// ─── Climate risk ─────────────────────────────────────────────────────────────
export type ClimateHorizon = "short" | "seasonal" | "long";

export const fetchClimateRisk = (args: {
  lat: number;
  lon: number;
  crop: string;
  horizon: ClimateHorizon;
  explain?: boolean;
  language?: string;
}) => getJson("/v1/climate/risk", args);

// ─── Crop disease diagnosis ───────────────────────────────────────────────────
export const fetchDiagnosisModels = () => getJson("/v1/diagnosis/models");

export const diagnoseLeaf = (crop: string, image: UploadFile) =>
  postFile(`/v1/diagnosis/${encodeURIComponent(apiCrop(crop))}`, "image", image, {
    top_k: 3,
  });

// ─── Yield prediction ─────────────────────────────────────────────────────────
// Prefer the HarvestStat-trained weather/soil model (/v1/yield/weather); fall
// back to the general model (/v1/yield) on deployments that don't have it.
export type YieldEngine = "weather" | "general";
const YIELD_PATHS: Record<YieldEngine, string> = {
  weather: "/v1/yield/weather",
  general: "/v1/yield",
};

export const fetchYieldModel = async () => {
  try {
    const m = await getJson(`${YIELD_PATHS.weather}/model`);
    if (m?.installed) return { ...m, engine: "weather" as YieldEngine };
  } catch (e) {
    if (!(e instanceof AiApiError && e.status === 404)) throw e;
  }
  const m = await getJson(`${YIELD_PATHS.general}/model`);
  return { ...m, engine: "general" as YieldEngine };
};

// Weather scenario mode (crop_yield_api.md): "year" needs `year`, a past year.
export type YieldWeather = "auto" | "seasonal" | "climatology" | "year";

export const predictYield = (
  engine: YieldEngine,
  args: {
    crop: string;
    lat: number;
    lon: number;
    planting_date?: string;
    weather?: YieldWeather;
    year?: number;
  }
) => postJson(`${YIELD_PATHS[engine]}/predict`, { ...args, crop: apiCrop(args.crop) });

// ─── Soil advice ──────────────────────────────────────────────────────────────
export const fetchSoilAdvice = (args: { lat: number; lon: number; crop: string }) =>
  getJson("/v1/soil/recommendation", { ...args, crop: apiCrop(args.crop) });

// ─── Search & Q&A assistant ───────────────────────────────────────────────────
export type ContentType = "news" | "project" | "publication";

export const searchContent = (q: string, type?: ContentType, limit = 20) =>
  getJson("/v1/search", { q, type, limit });

export const fetchSimilar = (docId: string, limit = 5) =>
  getJson(`/v1/search/similar/${docId}`, { limit });

export const askAssistant = (args: {
  question: string;
  language?: string;
  crop?: string;
}) =>
  postJson("/v1/assistant/ask", {
    ...args,
    crop: args.crop ? apiCrop(args.crop) : undefined,
  });

// ─── Translation ──────────────────────────────────────────────────────────────
export const translateTexts = (texts: string[], target: string, source?: string) =>
  postJson("/v1/translate", { texts, target, source });

// ─── Radio transcription ──────────────────────────────────────────────────────
export const transcribeAudio = (
  audio: UploadFile,
  opts: { language?: string; summarize?: boolean; summary_language?: string } = {}
) => postFile("/v1/radio/transcribe", "audio", audio, opts);

// ─── Breeding data (BrAPI) ────────────────────────────────────────────────────
export type BreedingDb = "cassavabase" | "yambase" | "musabase";

export const fetchStudies = (db: BreedingDb, search?: string, page = 0) =>
  getJson(`/v1/breeding/${db}/studies`, { search, page, page_size: 100 });

export const fetchStudyTraits = (db: BreedingDb, studyId: string) =>
  getJson(`/v1/breeding/${db}/studies/${encodeURIComponent(studyId)}/traits`);

export const fetchTraitRanking = (
  db: BreedingDb,
  studyId: string,
  trait: string,
  higherIsBetter = true
) =>
  getJson(`/v1/breeding/${db}/studies/${encodeURIComponent(studyId)}/rank`, {
    trait,
    higher_is_better: higherIsBetter,
    top: 20,
  });

// ─── Market price forecast ────────────────────────────────────────────────────
export const forecastFromWfpCsv = (
  file: UploadFile,
  opts: { commodity: string; market?: string; horizon_months?: number }
) => postFile("/v1/market/forecast/wfp-csv", "file", file, opts);

export const forecastFromSeries = (args: {
  series: { date: string; price: number }[];
  horizon_months?: number;
  commodity?: string;
  market?: string;
  unit?: string;
}) => postJson("/v1/market/forecast", args);
