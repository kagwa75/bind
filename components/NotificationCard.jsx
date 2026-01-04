import { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { markAllMessagesAsRead, markNotificationAsRead } from "../lib/supabase";
import Avatar from "./avatar";

const NotificationCard = ({ item, router }) => {
  const [isRead, setIsRead] = useState(item?.isRead);
  const userName = item?.users?.name || "Unknown User";
  const title = item?.title || "No title";

  let notificationData = {};
  try {
    notificationData =
      typeof item?.data === "string" ? JSON.parse(item.data) : item?.data || {};
  } catch {}

  const createdAt = new Date(item?.createdat).toLocaleString();

  const handlePress = async () => {
    if (!item?.id) return;
    // Update local state immediately for instant feedback
    setIsRead(true);

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
      className={`flex-row items-center ${Platform.OS === "web" && "min-w-min"} gap-4 bg-white ${isRead ? "border-gray-300" : "border-green-400"} p-4 rounded-2xl border-2 mt-5`}
    >
      <Avatar uri={item?.users?.image} size={20} />

      <View className="flex-1">
        <Text className="font-semibold">{userName}</Text>
        <Text className="text-gray-600">{title}</Text>
      </View>

      <Text className="text-gray-400 text-xs">{createdAt}</Text>
      {/* Visual indicator for unread notifications */}
      {!isRead && <View className="w-2 h-2 rounded-full bg-green-400 ml-2" />}
    </TouchableOpacity>
  );
};
export default NotificationCard;
