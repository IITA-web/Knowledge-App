import React from "react";
import { Text } from "react-native";
import Svg, { Ellipse, G, Path } from "react-native-svg";

// Mandate-crop glyph: the crop's emoji, or a drawn icon where no emoji exists
// (there is no coffee bean / coffee plant emoji, only a cup).
export default function CropIcon({
  crop,
  size = 22,
}: {
  crop: { key: string; emoji?: string };
  size?: number;
}) {
  if (crop.key === "coffee") return <CoffeeBean size={size * 1.15} />;
  return <Text style={{ fontSize: size }}>{crop.emoji}</Text>;
}

function CoffeeBean({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G rotation={35} origin="12, 12">
        <Ellipse cx={12} cy={12} rx={6.6} ry={9.4} fill="#4E2A12" />
        <Ellipse cx={10} cy={9} rx={2.2} ry={3.6} fill="#7A4626" opacity={0.6} />
        <Path
          d="M12 3 C 9 7.5, 15 16.5, 12 21"
          stroke="#E8C39E"
          strokeWidth={1.7}
          strokeLinecap="round"
          fill="none"
        />
      </G>
    </Svg>
  );
}
