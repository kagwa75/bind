import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import ProfilePic from "../../../components/ProfilePic";
import SimplePostCard from "../../../components/SimplePostCard";
import { useGlobalContext } from "../../../lib/GlobalProvider";
import {
  fetchNotificationsLength,
  fetchPosts,
  supabase,
} from "../../../lib/supabase";

const Home = () => {
  const { user } = useGlobalContext();
  const [posts, setPosts] = useState([]);
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const hasSubscribed = useRef(false); // prevents duplicate subscriptions
  const [unreadCount, setUnreadCount] = useState(0);

  // Subscribe to realtime ONLY once
  useEffect(() => {
    if (hasSubscribed.current) return;

    const channel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => {
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE"
          ) {
            // Refresh posts
            fetchData();
          }
        },
      )
      .subscribe();

    hasSubscribed.current = true;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  //notification realtime update
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("notification-count")
      .on(
        "postgres_changes",
        {
          event: "INSERT,UPDATE",
          schema: "public",
          table: "notifications",
          filter: `receiveid=eq.${user.id}`,
        },
        async () => {
          const res = await fetchNotificationsLength(user.id);
          if (res.success) setUnreadCount(res.data);
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  // Fetch posts WHEN limit changes
  useEffect(() => {
    fetchData();
  }, [limit]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const res = await fetchPosts(limit);

      if (res.success) {
        setPosts(res.data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert("Failed", "Could not fetch posts now, try again later");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!user?.id) return;

    const getNotificationsCount = async () => {
      const res = await fetchNotificationsLength(user.id);
      if (res.success) {
        setUnreadCount(res.data);
      }
    };

    getNotificationsCount();
  }, [user]);

  return (
    <View className="flex-1 bg-[#FAFAFA] pt-4">
      {/* Top Header */}
      <View className="flex flex-row justify-between items-center px-2 mb-3">
        <Text className="text-3xl text-orange-600 font-extrabold">Bind</Text>

        <View className="flex flex-row items-center gap-4 p-2">
          <Pressable onPress={() => router.push("/(pressables)/notifications")}>
            {unreadCount > 0 && (
              <View
                className="absolute -top-1 -right-3 min-w-[18px] h-[18px] px-1
                 bg-orange-600 rounded-full items-center justify-center"
              >
                <Text className="text-white text-xs font-bold">
                  {unreadCount}
                </Text>
              </View>
            )}
            <Feather name="bell" size={22} color="black" />
          </Pressable>

          <ProfilePic
            uri={user?.image}
            onPress={() => router.push("/(pressables)/profile")}
            style={"w-10 h-10"}
          />
        </View>
      </View>

      {/* Posts */}
      <FlatList
        data={posts}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <SimplePostCard item={item} currentUser={user} router={router} />
        )}
        refreshing={isLoading}
        onRefresh={fetchData}
        onEndReached={() => setLimit((prev) => prev + 10)}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

export default Home;
