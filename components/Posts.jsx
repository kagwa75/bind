import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { useGlobalContext } from "../lib/GlobalProvider";
import { fetchPosts } from "../lib/supabase";
import PostCardWUser from "./PostCardWUser";

const Posts = () => {
  const { user } = useGlobalContext();
  const [posts, setPosts] = useState([]);
  const [limit, setLimit] = useState(5);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      let res = await fetchPosts(limit, user?.id);
      if (res.success) {
        setPosts(res.data);
      } else if (res.error) {
        Alert.alert("Failed", "Could not fetch posts now, try again later");
      }
    }
    fetchData();
  }, [limit]);
  return (
    <View>
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
    </View>
  );
};

export default Posts;
