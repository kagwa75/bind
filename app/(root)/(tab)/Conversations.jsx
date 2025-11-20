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
import { getAllUsers, getChatConversations } from "../../../lib/supabase";

const ChatList = () => {
  const { user: currentUser } = useGlobalContext();
  const router = useRouter();
  const [users, setUsers] = useState();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const usersRef = useRef(null);

  //modal
  const openModal = () => {
    console.log("Button pressed"); // Check if this logs
    console.log("usersRef current:", usersRef.current); // Check if ref exists

    if (usersRef.current) {
      usersRef.current.open();
    } else {
      console.log("Modal ref is null");
    }
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

  useEffect(() => {
    if (currentUser?.id) {
      loadConversations();
    }
    fetchUsers();
  }, [currentUser?.id, usersRef]);

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
      {/**floating plus button */}
      <TouchableOpacity
        onPress={openModal}
        className="absolute bg-orange-400 p-4 w-20 h-20 rounded-full bottom-7 right-7 justify-center items-center"
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
      <Modalize ref={usersRef} modalHeight={600}>
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
