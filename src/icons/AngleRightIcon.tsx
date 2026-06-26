import { Path, Svg } from "react-native-svg";

const AngleRightIcon = ({ color }: { color: string }) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18C9 18 15 13.5811 15 12C15 10.4188 9 6 9 6"
        stroke={color ? color : "#A8A8A8"}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};

export default AngleRightIcon;
