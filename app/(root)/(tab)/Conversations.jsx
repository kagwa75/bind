import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Modalize } from "react-native-modalize";
import Avatar from "../../../components/avatar";
import { useGlobalContext } from "../../../lib/GlobalProvider";
import {
  getAllUsers,
  getChatConversations,
  supabase,
  updateChats,
} from "../../../lib/supabase";

const ChatList = () => {
  const { user: currentUser } = useGlobalContext();
  const router = useRouter();
  const [users, setUsers] = useState();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const usersRef = useRef(null);

  useEffect(() => {
    if (currentUser?.id) {
      loadConversations();
    }
    // Subscribe to new changes
    const subscription = supabase
      .channel("chat-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chats",
          filter: `or(senderid.eq.${currentUser.id},receiverid.eq.${currentUser.id})`,
        },
        (payload) => {
          loadConversations();
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser?.id, usersRef]);
  //modal
  const openModal = () => {
    usersRef.current?.open();

    fetchUsers();
  };

  const fetchUsers = async () => {
    try {
      const results = await getAllUsers();
      if (results) {
        setUsers(results);
      } else {
        Alert.alert("Failed to fetch users", error.message || "Unknown error");
      }
    } catch (error) {
      console.error("Fetch users error:", error);
      Alert.alert("Error", "Could not load users");
    }
  };

  const loadConversations = async () => {
    if (!currentUser?.id) return;

    setIsLoading(true);
    try {
      const results = await getChatConversations(currentUser.id);
      console.log("results:", results);
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
  const openChat = async (otherUser, lastMessage) => {
    try {
      // Navigate to chat first (user experience)
      router.push(`/(Chats)/${otherUser.id}`);
      if (lastMessage.senderid == currentUser?.id) {
        return;
      }
      // Only update if message is unread
      if (!lastMessage.isread) {
        const update = {
          isread: true,
          updatedat: new Date().toISOString(),
        };
        const result = await updateChats(lastMessage.id, update);
        if (result.success) {
          console.log("Chat updated:", result.data);
        } else {
          console.error("Failed to update chat:", result.error);
        }
      }
    } catch (error) {
      console.error("Error in openChat:", error);
    }
  };

  const renderConversation = ({ item }) => {
    const otherUser = item.other_user;
    const lastMessage = item.last_message;
    const unreadCount = item.unread_count || 0;
    const sender = item.last_message.senderid === currentUser?.id;
    const isLastMessageFromCurrentUser =
      item.last_message.senderid === currentUser?.id;

    return (
      <TouchableOpacity
        onPress={() => openChat(otherUser, lastMessage)}
        className="flex-row items-center p-4 border-b border-gray-100 bg-white"
      >
        <Avatar uri={otherUser?.image} size={60} />
        <View className="absolute top-4 left-16 w-3 h-3 bg-green-500 rounded-full border border-white"></View>

        <View className="flex-1 ml-3">
          <Text className="text-lg font-semibold text-gray-900">
            {formatName(otherUser)}
          </Text>

          {lastMessage && (
            <Text
              className={`${sender ? "text-blue-600" : "text-gray-600"} text-sm mt-1`}
            >
              {getLastMessagePreview(lastMessage.content)}
            </Text>
          )}

          {lastMessage && (
            <Text className="text-gray-400 text-xs mt-1">
              {moment(lastMessage.createdat).format("MMM D, h:mm A")}
            </Text>
          )}
        </View>

        {/* Right side indicators */}
        <View className="flex-row items-center">
          {/* Single tick icon for messages sent by current user */}
          {isLastMessageFromCurrentUser && unreadCount === 0 && (
            <View className="mr-1">
              {/* You can use an icon library or custom SVG */}
              {/* Option 1: Using Ionicons (common in React Native) */}
              <Feather
                name="check"
                size={16}
                color={lastMessage.isread ? "#4F46E5" : "#9ca3af"}
              />

              {/* Option 2: Using FontAwesome for double ticks */}
              {/* <Icon 
                  name={lastMessage.isread ? "check-double" : "check"} 
                  size={16} 
                  color={lastMessage.isread ? "#4F46E5" : "#9ca3af"} 
                /> */}
            </View>
          )}
        </View>
        {/* Unread count badge */}
        {!isLastMessageFromCurrentUser && unreadCount > 0 && (
          <View className="bg-orange-500 min-w-5 h-5 rounded-full items-center justify-center">
            <Text className="text-white text-xs font-bold px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        )}
        {/*
        {unreadCount === 0 && (
          <Feather name="chevron-right" size={20} color="#9ca3af" />
        )}*/}
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
      {/**floating plus button */}
      <TouchableOpacity
        onPress={openModal}
        className="absolute bg-orange-400 p-4 w-20 h-20 rounded-full bottom-7 right-7 justify-center items-center"
        style={{ zIndex: 999, elevation: 20 }}
      >
        <Feather name="plus" size={24} color={"black"} />
      </TouchableOpacity>

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
      <Modalize
        ref={usersRef}
        modalHeight={600}
        scrollViewProps={{
          showsVerticalScrollIndicator: false,
          scrollEnabled: false,
        }}
      >
        <View className="p-4">
          <Text className="text-xl font-semibold mb-4">Start New Chat</Text>

          {!users ? (
            <View className="items-center py-10">
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <FlatList
              data={users.filter((u) => u.id !== currentUser?.id)} // remove current user
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row items-center p-3 border-b border-gray-100"
                  onPress={() => {
                    usersRef.current?.close();
                    router.push(`/(Chats)/${item.id}`);
                  }}
                >
                  <Avatar uri={item?.image} size={55} />

                  <View className="ml-3 flex-1">
                    <Text className="text-lg font-semibold">
                      {item.name || item.email?.split("@")[0]}
                    </Text>

                    <Text className="text-gray-500 text-sm">{item.email}</Text>
                  </View>

                  <Feather name="chevron-right" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="items-center py-10">
                  <Text className="text-gray-500">No users found</Text>
                </View>
              }
            />
          )}
        </View>
      </Modalize>
    </View>
  );
};

export default ChatList;
