import React, { createContext, useContext, useEffect, useState } from "react";

import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";

type RadioContextType = {
  playing: boolean;
  trackTitle: string;
  play: () => void;
  pause: () => void;
  togglePlayback: () => void;
};

const RadioContext = createContext<RadioContextType>({
  playing: false,
  trackTitle: "",
  play: () => {},
  pause: () => {},
  togglePlayback: () => {},
});

const streamUrl = "https://s3.radio.co/sb3fb8fe8d/listen";

export const RadioProvider = ({ children }: { children: React.ReactNode }) => {
  const [trackTitle, setTrackTitle] = useState("");

  const player = useAudioPlayer({ uri: streamUrl });

  const status = useAudioPlayerStatus(player);

  const playing = status.playing;

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    });
  }, []);

  useEffect(() => {
    const fetchTrack = () => {
      fetch("https://ireport.iita.org/dontdelete.php")
        .then((res) => res.json())
        .then((json) => {
          if (json?.title) {
            setTrackTitle(json.title);
          }
        })
        .catch(console.error);
    };

    fetchTrack();

    const interval = setInterval(fetchTrack, 10000);

    return () => clearInterval(interval);
  }, []);

  const play = () => player.play();

  const pause = () => player.pause();

  const togglePlayback = () => {
    if (playing) {
      pause();
    } else {
      play();
    }
  };

  return (
    <RadioContext.Provider
      value={{
        playing,
        trackTitle,
        play,
        pause,
        togglePlayback,
      }}
    >
      {children}
    </RadioContext.Provider>
  );
};

export const useRadio = () => useContext(RadioContext);
