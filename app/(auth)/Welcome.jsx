import { router } from "expo-router";
import { Text, View } from "react-native";
import Button from "../../components/Button";
import ScreenWrapper from "../../components/ScreenWrapper";
import "../../global.css";

const Welcome = () => {
  return (
    <ScreenWrapper bg={"blue-950"}>
      <View className={`flex-auto items-center justify-center bg-blue-950`}>
        <Text className="text-6xl font-extrabold text-blue-500 dark:text-blue-300">
          BIND
        </Text>
      </View>
      {/*
      <View className="gap-5 flex flex-col justify-center">
        <Text className="text-2xl font-bold text-center text-white">
          Let's Linkup
        </Text>
        <Text className="text-xl font-medium text-center text-white">
          where every thought finds a home and every image tells a story.
        </Text>
      </View>*/}
      {/*footer*/}
      <View className="flex justify-center items-center mt-5">
        <Button
          onPress={() => router.push("/login")}
          title={"Let's Linkup"}
          textStyle={"text-2xl font-extrabold"}
          buttonStyle={`bg-orange-400 p-4`}
        />
      </View>
    </ScreenWrapper>
  );
};

export default Welcome;
