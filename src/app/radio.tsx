import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import CustomHeaderII from "../components/CustomHeaderII";

const radio = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* header */}
      <CustomHeaderII title={"Previous Programmes"} />

      <WebView
        containerStyle={{ flex: 1 }}
        source={{
          // uri: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/305910911&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true",
          // uri: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/iita-297430631/&amp;",
          // uri: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/radioiita/sets/peoples-assembly-1/&amp;",
          // uri: `https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/${username}/${playlist.permalink}`,
          uri: "https://soundcloud.com/radioiita",
        }}
        style={{ fontSIze: 16 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </SafeAreaView>
  );
};
export default radio;
