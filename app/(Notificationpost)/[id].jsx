import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SimplePostCard from "../../components/SimplePostCard";
import { useGlobalContext } from "../../lib/GlobalProvider";
import { fetchSinglePost } from "../../lib/supabase";

const NotificationPost = () => {
  const { id } = useLocalSearchParams();
  const { user } = useGlobalContext();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (id) getPost();
  }, [id]);

  const getPost = async () => {
    try {
      const result = await fetchSinglePost(id);
      if (result.success) {
        setPost(result.data);
      } else {
        Alert.alert("Error", result.error || "Unable to fetch post");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      Alert.alert("Error", "An error occurred while fetching the post");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (email) => {
    if (!email) return "U";
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="bg-blue-600 rounded-b-3xl pb-8 pt-4 px-6">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-white/20 p-3 rounded-full"
          >
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>

          <Text className="text-white text-xl font-bold">
            Notification Post
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/settings")}
            className="bg-white/20 p-3 rounded-full"
          >
            <Feather name="settings" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* BODY */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Profile Section */}
        <View className="items-center mt-4">
          {user?.image ? (
            <Image
              source={{ uri: user.image }}
              className="w-24 h-24 rounded-full border-4 border-blue-600"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center border-4 border-blue-600">
              <Text className="text-3xl font-bold text-blue-800">
                {getInitials(user?.email)}
              </Text>
            </View>
          )}

          <Text className="text-gray-900 text-xl font-bold mt-2">
            {user?.name || formatName(user?.email)}
          </Text>
          <Text className="text-blue-500 text-md font-semibold">
            {user?.address || "Add your address"}
          </Text>
        </View>

        {/* Post Section */}
        <View className="mt-8">
          {loading ? (
            <ActivityIndicator size="large" color="#3b82f6" />
          ) : post ? (
            <SimplePostCard item={post} currentUser={user} router={router} />
          ) : (
            <Text className="text-center text-gray-400 mt-6">
              No post found.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationPost;
