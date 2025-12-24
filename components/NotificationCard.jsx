import { Text, TouchableOpacity, View } from "react-native";
import { markAllMessagesAsRead, markNotificationAsRead } from "../lib/supabase";
import Avatar from "./avatar";

const NotificationCard = ({ item, router }) => {
  const userName = item?.users?.name || "Unknown User";
  const title = item?.title || "No title";

  let notificationData = {};
  try {
    notificationData =
      typeof item?.data === "string" ? JSON.parse(item.data) : item?.data || {};
  } catch {}

  const createdAt = new Date(item?.createdat).toLocaleString();
  const isRead = item?.isRead;

  const handlePress = async () => {
    if (!item?.id) return;

    await markNotificationAsRead(item.id);

    if (notificationData?.postId) {
      router.push(`/(Notificationpost)/${notificationData.postId}`);
      return;
    }

    if (notificationData?.chatId || notificationData?.receiverid) {
      router.push(`/(Chats)/${item.senderid}`);

      await markAllMessagesAsRead(notificationData.receiverid, item.senderid);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`flex-row items-center gap-4 bg-white ${isRead ? "border-orange-500" : "border-green-500"} border-orange-500 p-4 rounded-2xl border-2 mt-5`}
    >
      <Avatar uri={item?.users?.image} size={20} />

      <View className="flex-1">
        <Text className="font-semibold">{userName}</Text>
        <Text className="text-gray-600">{title}</Text>
      </View>

      <Text className="text-gray-400 text-xs">{createdAt}</Text>
    </TouchableOpacity>
  );
};
export default NotificationCard;
