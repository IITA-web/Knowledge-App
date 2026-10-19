import {
  AiHeader,
  AiIcon,
  IconTile,
  SectionTitle,
  Dropdown,
  ErrorState,
  errorDetail,
  errorText,
  k,
  PrimaryButton,
  T,
} from "@/components/ai/AiKit";
import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import { forecastFromWfpCsv } from "@/utils/aiApi";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HDX_URL = "https://data.humdata.org/dataset/?q=wfp%20food%20prices";
const HORIZONS = [3, 6, 12];
const COMMODITIES = ["Maize", "Cassava", "Rice", "Yam", "Cowpeas", "Sorghum", "Gari"];

const monthLabel = (ym: string) =>
  new Date(`${ym}-01`).toLocaleDateString(i18n.locale || "en", { month: "short", year: "2-digit" });

const money = (v: number) => Number(v).toLocaleString(i18n.locale || "en", { maximumFractionDigits: 2 });

export default function MarketPricesScreen() {
  const router = useRouter();
  const { language } = useLanguage();
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [commodity, setCommodity] = useState("Maize");
  const [market, setMarket] = useState("");
  const [horizon, setHorizon] = useState(6);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ["text/csv", "text/comma-separated-values", "application/vnd.ms-excel", "*/*"],
      copyToCacheDirectory: true,
    });
    if (res.canceled || !res.assets?.[0]) return;
    setFile(res.assets[0]);
    setResult(null);
    setError(null);
  };

  const forecast = async () => {
    if (!file || !commodity.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(
        await forecastFromWfpCsv(
          { uri: file.uri, name: file.name || "prices.csv", type: file.mimeType || "text/csv" },
          { commodity: commodity.trim(), market: market.trim() || undefined, horizon_months: horizon }
        )
      );
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  };

  const points = result?.forecast ?? [];
  const maxPrice = Math.max(1, ...points.map((p: any) => p.high_80), result?.last_observed?.price ?? 0);
  const unit = [result?.currency, result?.unit && `/ ${result.unit}`].filter(Boolean).join(" ");
  const trend = result?.trend_percent_per_year;

  return (
    <SafeAreaView style={k.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg0} />
      <AiHeader titleKey="ai.market.title" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Text style={k.intro}>{language && i18n.t("ai.market.intro")}</Text>
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/inappbrowser", params: { url: HDX_URL } })}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginHorizontal: 16, marginTop: 6 }}>
            <AiIcon name="link-variant" size={16} color={T.blue} />
            <Text style={[k.intro, { color: T.blue, marginTop: 0, marginHorizontal: 0, flex: 1 }]}>
              {i18n.t("ai.market.getData")}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[k.card, { marginTop: 16 }]} onPress={pickFile} activeOpacity={0.8}>
          <View style={k.cardTop}>
            <IconTile name="file-delimited-outline" />
            <View style={{ flex: 1 }}>
              <Text style={k.cardTitle} numberOfLines={1}>
                {file ? file.name : i18n.t("ai.market.chooseFile")}
              </Text>
              <Text style={k.mutedSmall}>wfp_food_prices_&lt;country&gt;.csv</Text>
            </View>
{file ? (
              <Text style={k.secondaryBtnText}>{i18n.t("ai.radio.change")}</Text>
            ) : (
              <AiIcon name="plus-circle-outline" size={22} />
            )}
          </View>
        </TouchableOpacity>

        <Dropdown
          label={i18n.t("ai.market.commodity")}
          value={commodity}
          onChange={setCommodity}
          placeholder={commodity}
          options={COMMODITIES.map((c) => ({ value: c, label: c }))}
        />
        <TextInput
          style={k.input}
          value={commodity}
          onChangeText={setCommodity}
          placeholder={i18n.t("ai.market.commodity")}
          placeholderTextColor={T.mutedDark}
        />

        <Text style={k.label}>{i18n.t("ai.market.market")}</Text>
        <TextInput
          style={k.input}
          value={market}
          onChangeText={setMarket}
          placeholder={i18n.t("ai.market.marketPlaceholder")}
          placeholderTextColor={T.mutedDark}
        />

        <Dropdown
          label={i18n.t("ai.market.horizon")}
          value={horizon}
          onChange={setHorizon}
          options={HORIZONS.map((h) => ({ value: h, label: i18n.t("ai.market.months", { count: h }) }))}
        />

        <PrimaryButton
          label={i18n.t("ai.market.forecast")}
          onPress={forecast}
          disabled={!file || !commodity.trim()}
          loading={loading}
        />

        {error && <ErrorState icon="cash-multiple" error={errorText(error)} detail={errorDetail(error)} />}

        {result && (
          <>
            <View style={[k.card, { flexDirection: "row" }]}>
              <View style={{ flex: 1 }}>
                <Text style={k.mutedSmall}>
                  {i18n.t("ai.market.lastPrice", { month: monthLabel(result.last_observed.month) })}
                </Text>
                <Text style={s.big}>{money(result.last_observed.price)}</Text>
                <Text style={k.mutedSmall}>{unit}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={k.mutedSmall}>{i18n.t("ai.market.trend")}</Text>
                <Text style={[s.big, { color: trend > 0 ? T.red : T.green }]}>
                  {trend > 0 ? "+" : ""}
                  {trend}%
                </Text>
                <Text style={k.mutedSmall}>{i18n.t("ai.market.perYear")}</Text>
              </View>
            </View>

            <SectionTitle icon="chart-line">{i18n.t("ai.market.forecastTitle")}</SectionTitle>
            <View style={k.card}>
              {points.map((p: any) => (
                <View key={p.month} style={s.row}>
                  <Text style={s.month}>{monthLabel(p.month)}</Text>
                  <View style={s.track}>
                    {/* 80% range */}
                    <View
                      style={[
                        s.range,
                        {
                          left: `${(p.low_80 / maxPrice) * 100}%`,
                          width: `${((p.high_80 - p.low_80) / maxPrice) * 100}%`,
                        },
                      ]}
                    />
                    {/* expected price */}
                    <View style={[s.dot, { left: `${(p.price / maxPrice) * 100}%` }]} />
                  </View>
                  <Text style={s.price}>{money(p.price)}</Text>
                </View>
              ))}
              <Text style={[k.mutedSmall, { marginTop: 8 }]}>{i18n.t("ai.market.legend")}</Text>
            </View>

            <Text style={k.footnote}>
              {[
                result.market,
                i18n.t("ai.market.history", { count: result.history_months }),
                result.backtest &&
                  i18n.t("ai.market.backtest", { pct: result.backtest.mape_percent }),
              ]
                .filter(Boolean)
                .join(" · ")}
              {"\n\n"}
              {i18n.t("ai.market.disclaimer")}
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  big: { color: T.text, fontSize: 24, fontWeight: "800", marginVertical: 2 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 6, gap: 10 },
  month: { width: 54, color: T.text, fontSize: 12, fontWeight: "600" },
  track: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  range: {
    position: "absolute",
    height: 12,
    borderRadius: 6,
    backgroundColor: T.accentDimBorder,
  },
  dot: {
    position: "absolute",
    width: 12,
    height: 12,
    marginLeft: -6,
    borderRadius: 6,
    backgroundColor: T.accent,
  },
  price: { width: 70, textAlign: "right", color: T.text, fontSize: 12, fontWeight: "700" },
});
