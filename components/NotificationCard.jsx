import moment from "moment";
import { Text, TouchableOpacity, View } from "react-native";
import Avatar from "./avatar";

const NotificationCard = ({ item, router }) => {
  const createdAt = moment(item?.createdat).format("MMM d");

  // Safe data extraction with fallbacks
  const userName = item?.users?.name || "Unknown User";

  const title = item?.title || "No title";

  const handlePress = () => {
    if (item?.data?.postId) {
      router.push(`/(editpost)/${item.data.postId}`);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex-1 flex-row items-center justify-between gap-12 bg-white border-black p-8 rounded-2xl border-2"
    >
      <Avatar uri={item?.users?.image} />
      <View className="flex flex-col">
        <Text className="font-semibold">{userName}</Text>
        <Text className="text-gray-600">{title}</Text>
      </View>
      <Text className="text-gray-400 text-xs">{createdAt}</Text>
    </TouchableOpacity>
  );
};

export default NotificationCard;
