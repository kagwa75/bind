import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import ProfilePic from "../../../components/ProfilePic";
import SimplePostCard from "../../../components/SimplePostCard";
import { useGlobalContext } from "../../../lib/GlobalProvider";
import { fetchPosts, supabase } from "../../../lib/supabase";

const Home = () => {
  const { user } = useGlobalContext();
  const [posts, setPosts] = useState([]);
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const hasSubscribed = useRef(false); // prevents duplicate subscriptions

  // Subscribe to realtime ONLY once
  useEffect(() => {
    if (hasSubscribed.current) return;

    const channel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => {
          fetchData(); // refetch posts on any change
        },
      )
      .subscribe();

    hasSubscribed.current = true;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  return (
    <View className="flex-1 bg-[#FAFAFA] pt-4">
      {/* Top Header */}
      <View className="flex flex-row justify-between items-center px-2 mb-3">
        <Text className="text-3xl text-orange-600 font-extrabold">Bind</Text>

        <View className="flex flex-row items-center gap-4 p-2">
          <Pressable onPress={() => router.push("/(pressables)/notifications")}>
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
        onRefresh={() => {
          setLimit(10); // reset pagination on refresh
          fetchData();
        }}
        onEndReached={() => setLimit((prev) => prev + 10)}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

export default Home;
