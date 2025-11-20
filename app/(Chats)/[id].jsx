import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Avatar from "../../components/avatar";
import { useGlobalContext } from "../../lib/GlobalProvider";
import {
  getChats,
  getChatsBetweenUsers,
  getUser,
  PostChats,
  PostNotifications,
  supabase,
} from "../../lib/supabase";

const ChatRoom = () => {
  const { user: currentUser } = useGlobalContext();
  const { id } = useLocalSearchParams();
  const [newChat, setNewChat] = useState();
  const [isSubmittingChat, setIsSubmittingChats] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [Chats, setChats] = useState();
  const [user, setUser] = useState();

  //useEffects
  useEffect(() => {
    if (!currentUser?.id || !id) return;

    // Subscribe to new messages
    const subscription = supabase
      .channel("chat-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chats",
          filter: `or(and(senderid.eq.${currentUser.id},receiverid.eq.${id}),and(senderid.eq.${id},receiverid.eq.${currentUser.id}))`,
        },
        (payload) => {
          setChats((prev) => [...prev, payload.new]);
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser?.id, id]);
  useEffect(() => {
    GetProfile();
    openChats();
  }, []);

  {
    /**functions */
  }
  const GetProfile = async () => {
    try {
      const result = await getUser(id);
      if (result) {
        setUser(result);
      } else {
        Alert.alert("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      Alert.alert("An error occurred while fetching the user");
    }
  };
  const openChats1 = async () => {
    setIsLoadingChats(true);
    try {
      const results = await getChats(currentUser?.id);
      setChats(Array.isArray(results) ? results : []);
    } catch (e) {
      Alert.alert("Error", "Could not load chats");
    } finally {
      setIsLoadingChats(false);
    }
  };
  const openChats = async () => {
    if (!currentUser?.id || !id) return;

    setIsLoadingChats(true);
    try {
      const results = await getChatsBetweenUsers(currentUser.id, id);
      setChats(Array.isArray(results) ? results : []);
    } catch (e) {
      console.error("Chat loading error:", e);
      Alert.alert("Error", "Could not load chats");
    } finally {
      setIsLoadingChats(false);
    }
  };
  const submitChats = async () => {
    if (!newChat.trim()) return;
    setIsSubmittingChats(true);
    try {
      const result = await PostChats({
        receiverid: id,
        senderid: currentUser?.id,
        content: newChat.trim(),
      });

      if (result.success) {
        const newChatObj = {
          id: result.id,
          content: newChat.trim(),
          createdat: new Date().toISOString(),
          users: {
            id: currentUser?.id,
            name: currentUser?.name || "User",
            image: currentUser?.image,
          },
        };
        setChats((prev) => [...prev, newChatObj]);
        setNewChat("");

        if (currentUser.id !== id) {
          await PostNotifications({
            senderid: currentUser.id,
            receiveid: id,
            title: "sent you a message",
            createdat: new Date().toISOString(),
            data: JSON.stringify({
              receiverid: id,
              chatId: result.id,
              type: "message",
            }),
          });
        }
      }
    } catch (err) {
      Alert.alert("Error", "Could not post message");
      console.error("failed to submit", err);
    } finally {
      setIsSubmittingChats(false);
    }
  };
  const getInitials = (email) => {
    const EX = "U";
    if (!email) return EX;
    const namePart = email.split("@")[0];
    return namePart
      .split(/[._]/)
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };
  const formatName = (email) => {
    if (!email) return "User";
    const namePart = email.split("@")[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };
  const renderChats = ({ item: chat }) => {
    const isCurrentUser = chat.senderid === currentUser?.id;

    return (
      <View
        className={`flex-row mb-4 px-2 ${isCurrentUser ? "justify-end" : "justify-start"}`}
      >
        {/* Received message (left side) */}
        {!isCurrentUser && (
          <View className="flex-row items-end max-w-[80%]">
            <Avatar size={32} uri={user?.image} />
            <View className="ml-2 bg-gray-100 p-3 rounded-2xl rounded-bl-none">
              <Text className="text-gray-800">{chat.content}</Text>
              <Text className="text-gray-500 text-xs mt-1">
                {moment(chat.createdat).format("h:mm A")}
              </Text>
            </View>
          </View>
        )}

        {/* Sent message (right side) */}
        {isCurrentUser && (
          <View className="flex-row items-end max-w-[80%]">
            <View className="bg-blue-500 p-3 rounded-2xl rounded-br-none">
              <Text className="text-white">{chat.content}</Text>
              <Text className="text-blue-100 text-xs mt-1">
                {moment(chat.createdat).format("h:mm A")}
              </Text>
            </View>
            <Avatar size={32} uri={currentUser?.image} />
          </View>
        )}
      </View>
    );
  };
  return (
    <View className="py-5">
      <View className="px-5 pt-5 py-5">
        <Text className="text-lg font-bold text-center mb-4">Chats</Text>
        {/**the person youre talkin to header */}
        <View className="relative items-center mb-4">
          {user?.image ? (
            <Avatar
              uri={user?.image}
              size={100}
              style={{ borderWidth: 4, borderColor: "white" }}
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center border-4 border-gray-700">
              <Text className="text-3xl font-bold text-gray-900">
                {getInitials(user?.email)}
              </Text>
            </View>
          )}
          <View>
            <Text className="text-gray-500 text-2xl font-bold mb-1">
              {user?.name || formatName(user?.email)}
            </Text>
          </View>
        </View>
        {isLoadingChats ? (
          <ActivityIndicator size="large" color="#3b82f6" />
        ) : (
          <FlatList
            data={Chats}
            renderItem={renderChats}
            keyExtractor={(item) => item.id?.toString()}
            ListEmptyComponent={
              <View className="justify-center items-center py-10">
                <Feather name="message-circle" size={40} color="#d1d5db" />
                <Text className="text-gray-500 mt-2">No Chats yet</Text>
              </View>
            }
          />
        )}
        {/* message input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="border-t border-gray-200 pt-3 pb-5"
        >
          <View className="flex-row items-center">
            <Avatar size={40} uri={currentUser?.image} />
            <TextInput
              value={newChat}
              onChangeText={setNewChat}
              placeholder="Start a conversation..."
              className="flex-1 ml-3 bg-gray-100 rounded-full px-4 py-2"
              multiline
            />
            <TouchableOpacity
              onPress={submitChats}
              disabled={isSubmittingChat}
              className="ml-2 p-2"
            >
              {isSubmittingChat ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <Feather
                  name="send"
                  size={20}
                  color={newChat ? "#3b82f6" : "#9ca3af"}
                />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

export default ChatRoom;
