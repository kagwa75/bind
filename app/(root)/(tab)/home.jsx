import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import ProfilePic from "../../../components/ProfilePic";
import SimplePostCard from "../../../components/SimplePostCard";
import { useGlobalContext } from "../../../lib/GlobalProvider";
import { fetchPosts, supabase } from "../../../lib/supabase";

const Home = () => {
  const { user } = useGlobalContext();
  const [posts, setPosts] = useState([]);
  const [limit, setLimit] = useState(10); // Moved limit to state
  const router = useRouter();

  useEffect(() => {
    let postChannel;

    async function setupRealtime() {
      postChannel = supabase
        .channel("posts")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "posts" },
          (payload) => {
            console.log("Change received!", payload);
            // You should handle the realtime updates here
            // For example, refetch posts or update specific post
            fetchData(); // Refetch when changes occur
          },
        )
        .subscribe();
    }

    async function fetchData() {
      let res = await fetchPosts(limit);
      if (res.success) {
        //console.log("postItem", res.data);
        setPosts(res.data);
      } else if (res.error) {
        Alert.alert("Failed", "Could not fetch posts now, try again later");
      }
    }

    setupRealtime();
    fetchData();

    return () => {
      if (postChannel) {
        supabase.removeChannel(postChannel);
      }
    };
  }, [limit, posts]); // Added limit as dependency

  return (
    <View className="flex-1 bg-orange-300 pt-8">
      <View className="flex flex-row justify-between gap-4 items-center">
        <Text className="text-3xl pl-1 text-orange-600 font-bold">
          Messenger
        </Text>
        <View className="flex flex-row items-center gap-4 space-x-3 p-2">
          <Pressable onPress={() => router.push("/(pressables)/notifications")}>
            <Feather name="bell" size={22} color="black" />
          </Pressable>
          <Pressable onPress={() => router.push("/(pressables)/createPost")}>
            <Feather name="plus-square" size={22} color="black" />
          </Pressable>
          <ProfilePic
            uri={user?.image}
            onPress={() => router.push("/(pressables)/profile")}
            style={"w-10 h-10"}
          />
        </View>
      </View>
      <FlatList
        data={posts}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <SimplePostCard item={item} currentUser={user} router={router} />
        )}
        onEndReached={() => setLimit((prev) => prev + 10)} // Load more when scrolling to end
        onEndReachedThreshold={0.5} // Trigger when 50% from the end
      />
    </View>
  );
};

export default Home;
