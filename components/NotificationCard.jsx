import moment from "moment";
import { Text, TouchableOpacity, View } from "react-native";
import Avatar from "./avatar";

const NotificationCard = ({ item, router }) => {
  const createdAt = moment(item?.createdat).format("MMM d");

  // Safe data extraction with fallbacks
  const userName = item?.users?.name || "Unknown User";

  const title = item?.title || "No title";
  const notificationData =
    typeof item?.data === "string"
      ? JSON.parse(item?.data || "{}")
      : item?.data || {};

  const handlePress = () => {
    if (item?.data?.postId) {
      router.push(`/(Notificationpost)/${item.data.postId}`);
    } else if (notificationData.chatId || notificationData.receiverid) {
      // Navigate to chat with the sender
      router.push(`/(Chats)/${item.senderid}`);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        className="flex-1 flex-row items-center justify-between gap-4 bg-white border-orange-500 p-4 rounded-2xl border-2 mt-5"
      >
        <Avatar uri={item?.users?.image} size={20} />
        <View className="flex flex-col">
          <Text className="font-semibold">{userName}</Text>
          <Text className="text-gray-600">{title}</Text>
        </View>
        <Text className="text-gray-400 text-xs">{createdAt}</Text>
      </TouchableOpacity>
    </>
  );
};

export default NotificationCard;
