import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

const goback = ({ title, router, font }) => {
  return (
    <View className="flex flex-row gap-4 justify-start items-center px-4 py-8">
      <TouchableOpacity
        className="mt-4 bg-blue-500 px-2 py-2 rounded-full"
        onPress={() => router.back()}
      >
        <Feather name="arrow-left" size={24} color="black" />
      </TouchableOpacity>
      <Text
        className={`text-gray-500 mt-2  ${font ? font : "text-lg font-semibold"}`}
      >
        {title}
      </Text>
    </View>
  );
};

export default goback;
