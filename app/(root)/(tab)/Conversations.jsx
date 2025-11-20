import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Avatar from "../../../components/avatar";
import { useGlobalContext } from "../../../lib/GlobalProvider";
import { getChatConversations } from "../../../lib/supabase";

const ChatList = () => {
  const { user: currentUser } = useGlobalContext();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.id) {
      loadConversations();
    }
  }, [currentUser?.id]);

  const loadConversations = async () => {
    if (!currentUser?.id) return;

    setIsLoading(true);
    try {
      const results = await getChatConversations(currentUser.id);
      setConversations(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error("Error loading conversations:", error);
      Alert.alert("Error", "Could not load conversations");
    } finally {
      setIsLoading(false);
    }
  };

  const getLastMessagePreview = (content) => {
    if (!content) return "No messages yet";
    return content.length > 40 ? content.substring(0, 40) + "..." : content;
  };

  const formatName = (user) => {
    return user?.name || user?.email?.split("@")[0] || "Unknown User";
  };

  const renderConversation = ({ item }) => {
    const otherUser = item.other_user;
    const lastMessage = item.last_message;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/(Chats)/${otherUser.id}`)}
        className="flex-row items-center p-4 border-b border-gray-100 bg-white"
      >
        <Avatar uri={otherUser?.image} size={60} />

        <View className="flex-1 ml-3">
          <Text className="text-lg font-semibold text-gray-900">
            {formatName(otherUser)}
          </Text>

          {lastMessage && (
            <Text className="text-gray-600 text-sm mt-1">
              {getLastMessagePreview(lastMessage.content)}
            </Text>
          )}

          {lastMessage && (
            <Text className="text-gray-400 text-xs mt-1">
              {moment(lastMessage.createdat).format("MMM D, h:mm A")}
            </Text>
          )}
        </View>

        <Feather name="chevron-right" size={20} color="#9ca3af" />
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="pt-16 pb-4 px-5 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Messages</Text>
        <Text className="text-gray-500 mt-1">Your conversations</Text>
      </View>

      {/* Conversations List */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-500 mt-2">Loading conversations...</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.other_user.id.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-20">
              <Feather name="message-circle" size={60} color="#d1d5db" />
              <Text className="text-gray-500 mt-4 text-lg">
                No conversations yet
              </Text>
              <Text className="text-gray-400 text-sm mt-2 text-center px-10">
                Start a conversation by visiting someone's profile and tapping
                the message button
              </Text>
            </View>
          }
          refreshing={isLoading}
          onRefresh={loadConversations}
        />
      )}
    </View>
  );
};

export default ChatList;
