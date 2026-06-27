import GlobalRadio from "@/components/GlobalRadio";
import { LanguageProvider } from "@/context/LanguageContext";
import { RadioProvider } from "@/context/RadioContext";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <RadioProvider>
      <LanguageProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="welcome"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="home"
              options={{
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="news"
              options={{
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="projects"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="technology"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="publications"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="events"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="databases"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="datasets"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="photosalbum"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="videos"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="videoplaylist"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="videoplaylistitems"
              options={{
                headerShown: false,
              }}
            />

            {/* <Stack.Screen
          name="otherapps"
          options={{
            headerShown: false,
          }}
        /> */}
            <Stack.Screen
              name="digitaltools"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="tv"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="radio"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="tvplaylistitems"
              options={{
                headerShown: false,
              }}
            />

            {/* <Stack.Screen
          name="ireport"
          options={{
            headerShown: false,
          }}
        /> */}
            <Stack.Screen
              name="publicationcollection"
              options={{
                title: "Publication Collection",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="newscontent"
              options={{
                title: "News",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="eventscontent"
              options={{
                title: "Events",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="publicationscontent"
              options={{
                title: "Publications",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="projectscontent"
              options={{
                title: "Project",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="inappbrowser"
              options={{
                title: "In App Browser",
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="videoplay"
              options={{
                title: "Play Video",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="photos"
              options={{ title: "Photos", headerShown: false }}
            />
            <Stack.Screen
              name="datafile"
              options={{
                title: "Datafile",
                headerShown: false,
              }}
            />
            {/* <Stack.Screen
          name="ireportPhotosDetails"
          options={{
            title: "iReport Photos Details",
            headerShown: false,
          }}
        /> */}
            {/* <Stack.Screen
          name="ireportVideosDetails"
          options={{
            title: "iReport Videos Details",
            headerShown: false,
          }}
        /> */}
            {/* <Stack.Screen
          name="technologycontent"
          options={{
            title: "Technology",
            headerShown: false,
          }}
        /> */}
            <Stack.Screen
              name="digitaltoolscontent"
              options={{
                title: "Digital Tools",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="publicationcollectioncontent"
              options={{
                title: "Publication Collection Content",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="publicationpdfpreview"
              options={{
                title: "Publications",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="weather"
              options={{
                title: "Weather",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="cropdetails"
              options={{
                title: "Crop Details",
                headerShown: false,
              }}
            />

            {/* <Stack.Screen name="+not-found" /> */}
          </Stack>

          {/* <LanguageSwitcher /> */}
          <GlobalRadio />
        </ThemeProvider>
      </LanguageProvider>
    </RadioProvider>
  );
}
