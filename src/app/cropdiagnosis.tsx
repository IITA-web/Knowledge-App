import {
  AiHeader,
  IconLabel,
  IconTile,
  CropPicker,
  ErrorState,
  errorDetail,
  errorText,
  k,
  Loading,
  PrimaryButton,
  T,
} from "@/components/ai/AiKit";
import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import { apiCrop, diagnoseLeaf, fetchDiagnosisModels } from "@/utils/aiApi";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CropDiagnosisScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { language } = useLanguage();

  const [models, setModels] = useState<string[] | null>(null);
  const [modelsError, setModelsError] = useState<any>(null);
  const [crop, setCrop] = useState(String(params?.cropKey || "cassava"));
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadModels = () => {
    setModelsError(null);
    fetchDiagnosisModels()
      .then((r) => {
        const crops: string[] = r.crops ?? [];
        setModels(crops);
        if (crops.length && !crops.includes(apiCrop(crop))) {
          // Pick the first crop that has a model
          const first = crops[0] === "banana" ? "banana_plantain" : crops[0];
          setCrop(first);
        }
      })
      .catch(setModelsError);
  };

  useEffect(loadModels, []);

  const hasModel = (key: string) => !!models?.includes(apiCrop(key));

  const pick = async (source: "camera" | "library") => {
    const perm =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setNotice(i18n.t("ai.diagnosis.permission"));
      return;
    }
    setNotice(null);
    const opts: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    };
    const res =
      source === "camera"
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);
    if (!res.canceled && res.assets?.[0]) {
      setPhoto(res.assets[0]);
      setResult(null);
      setError(null);
    }
  };

  const diagnose = async () => {
    if (!photo) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(
        await diagnoseLeaf(crop, {
          uri: photo.uri,
          name: photo.fileName || "leaf.jpg",
          type: photo.mimeType || "image/jpeg",
        }),
      );
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  };

  // Predictions with a usable confidence; an empty list is treated like a low-confidence result.
  const predictions: any[] = (result?.predictions ?? []).filter(
    (p: any) => p && Number.isFinite(Number(p.confidence)),
  );
  const top = predictions[0];
  const unsure = !top || !!result?.low_confidence;
  const pct = (p: any) =>
    Math.max(0, Math.min(100, Math.round(Number(p.confidence) * 100)));
  const predName = (p: any) => p.name || p.label || "—";

  return (
    <SafeAreaView style={k.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg0} />
      <AiHeader titleKey="ai.diagnosis.title" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={k.intro}>{language && i18n.t("ai.diagnosis.intro")}</Text>

        {modelsError ? (
          <ErrorState
            icon="microscope"
            error={errorText(modelsError)}
            onRetry={loadModels}
          />
        ) : models === null ? (
          <Loading />
        ) : models.length === 0 ? (
          <ErrorState icon="microscope" error={i18n.t("ai.diagnosis.noModels")} />
        ) : (
          <>
            <CropPicker
              style={{ marginTop: 12 }}
              value={crop}
              isEnabled={hasModel}
              onChange={(c) => {
                setCrop(c);
                setResult(null);
              }}
            />

            {/* Photo */}
            <View style={k.card}>
              {photo ? (
                <Image
                  source={{ uri: photo.uri }}
                  style={{ width: "100%", aspectRatio: 1, borderRadius: 10 }}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={{
                    aspectRatio: 1.6,
                    borderRadius: 10,
                    backgroundColor: T.bg0,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 20,
                  }}
                >
                  <IconTile name="leaf" size={64} />
                  <Text
                    style={[
                      k.mutedSmall,
                      { textAlign: "center", marginTop: 8 },
                    ]}
                  >
                    {i18n.t("ai.diagnosis.tips")}
                  </Text>
                </View>
              )}
              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                <TouchableOpacity
                  style={[k.secondaryBtn, { flex: 1 }]}
                  onPress={() => pick("camera")}
                >
                  <IconLabel
                    icon="camera-outline"
                    label={i18n.t("ai.diagnosis.takePhoto")}
                    textStyle={k.secondaryBtnText}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[k.secondaryBtn, { flex: 1 }]}
                  onPress={() => pick("library")}
                >
                  <IconLabel
                    icon="image-outline"
                    label={i18n.t("ai.diagnosis.choosePhoto")}
                    textStyle={k.secondaryBtnText}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <PrimaryButton
              label={i18n.t("ai.diagnosis.diagnose")}
              onPress={diagnose}
              disabled={!photo || !hasModel(crop)}
              loading={loading}
            />

            {notice && <ErrorState icon="camera-off-outline" error={notice} />}
            {error && (
              <ErrorState
                error={errorText(error)}
                detail={errorDetail(error)}
              />
            )}

            {result && (
              <>
                <View
                  style={[
                    k.card,
                    { borderColor: (unsure ? T.gold : T.green) + "55" },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "800",
                      color: unsure ? T.gold : T.green,
                    }}
                  >
                    {unsure
                      ? i18n.t("ai.diagnosis.notSure")
                      : i18n.t("ai.diagnosis.mostLikely", {
                          name: predName(top),
                        })}
                  </Text>
                  {unsure && (
                    <Text style={k.cardText}>
                      {i18n.t("ai.diagnosis.retake")}
                    </Text>
                  )}
                </View>

                {predictions.length > 0 && (
                  <>
                    <Text style={k.sectionTitle}>
                      {i18n.t("ai.diagnosis.possible")}
                    </Text>
                    <View style={k.card}>
                      {predictions.map((p: any, i: number) => (
                        <View
                          key={p.label ?? i}
                          style={{
                            marginBottom: i < predictions.length - 1 ? 12 : 0,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text style={[k.cardTitle, { flex: 1 }]}>
                              {predName(p)}
                            </Text>
                            <Text style={k.mutedSmall}>{pct(p)}%</Text>
                          </View>
                          <View style={k.barBg}>
                            <View
                              style={[
                                k.barFill,
                                {
                                  width: `${pct(p)}%`,
                                  backgroundColor:
                                    i === 0 ? T.accent : T.mutedDark,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {/* "Ask IITA how to manage it" is hidden until a proper IITA assistant is built.
                {!unsure && !/healthy/i.test(top.label) && (
                  <TouchableOpacity
                    style={[k.secondaryBtn, { marginHorizontal: 16 }]}
                    onPress={() =>
                      router.push({
                        pathname: "/assistant",
                        params: {
                          cropKey: crop,
                          question: i18n.t("ai.diagnosis.askQuestion", {
                            name: top.name,
                            crop: i18n.t(
                              crop === "banana_plantain" ? "bananaPlantain" : crop
                            ),
                          }),
                        },
                      })
                    }
                  >
                    <IconLabel icon="chat-outline" label={i18n.t("ai.diagnosis.askHow")} textStyle={k.secondaryBtnText} />
                  </TouchableOpacity>
                )}
                */}

                <Text style={k.footnote}>
                  {i18n.t("ai.diagnosis.disclaimer")}
                </Text>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
