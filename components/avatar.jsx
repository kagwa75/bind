import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

const Avatar = ({ uri, style, size = 90 }) => {
  // Handle the image source properly
  const imageSource = uri
    ? { uri } // Use the URI directly
    : require("../assets/images/icon.png"); // Use fallback image

  return (
    <View>
      <Image
        source={imageSource}
        transition={100}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1,
            borderColor: "black",
          },
          StyleSheet.flatten(style),
        ]}
      />
    </View>
  );
};

export default Avatar;
