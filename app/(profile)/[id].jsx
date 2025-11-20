import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Avatar from "../../components/avatar";
import PostCardWUser from "../../components/PostCardWUser";
import { fetchPosts, getUser } from "../../lib/supabase";

const ProfileDetails = () => {
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState();
  const [posts, setPosts] = useState();
  const router = useRouter();
  const [limit, setLimit] = useState(5);
  useEffect(() => {
    if (id) {
      GetProfile();
      GetPosts();
    }
  }, [id]);

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
  const GetPosts = async () => {
    try {
      const result = await fetchPosts(limit, id);
      if (result.success) {
        setPosts(result.data);
      } else {
        Alert.alert(result.error);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert("An error occurred while fetching the user posts");
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
  return (
    <SafeAreaView className="flex-1 bg-white py-4">
      {/* Header with gradient */}
      <View className="bg-gradient-to-b from-blue-600 to-blue-500 pb-8 pt-2 px-6 rounded-b-3xl">
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity
            onPress={router.back}
            className="bg-white/20 p-3 rounded-full"
          >
            <Feather name="arrow-left" size={22} color="gray" />
          </TouchableOpacity>
          <Text className="text-gray-950 text-xl font-bold">Profile</Text>
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            className="bg-white/20 p-3 rounded-full"
          >
            <Feather name="settings" size={22} color="gray" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Profile section */}
      <View className="items-center">
        <View className="relative mb-4">
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
        </View>

        <Text className="text-gray-500 text-2xl font-bold mb-1">
          {user?.name || formatName(user?.email)}
        </Text>
        <Text className="text-blue-400 text-md font-bold">
          {user?.address || "Add your address"}
        </Text>
        <Text className="text-gray-500 text-md p-4 font-bold">
          {user?.bio || "No bio"}
        </Text>
      </View>

      <View className="flex items-center">
        <TouchableOpacity
          onPress={() => router.push(`/(Chats)/${id}`)}
          className="bg-slate-400 w-20  items-center rounded-xl p-4"
        >
          <Feather name="send" size={20} />
        </TouchableOpacity>
      </View>
      {/**profile posts */}
      <FlatList
        data={posts}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCardWUser item={item} currentUser={user} router={router} />
        )}
        onEndReached={() => setLimit((prev) => prev + 5)} // Load more when scrolling to end
        onEndReachedThreshold={0.5} // Trigger when 50% from the end
      />
    </SafeAreaView>
  );
};

export default ProfileDetails;
