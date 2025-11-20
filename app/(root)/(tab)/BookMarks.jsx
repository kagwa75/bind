import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import Goback from "../../../components/goback";
import SimplePostCard from "../../../components/SimplePostCard";
import { useGlobalContext } from "../../../lib/GlobalProvider";
import { FetchBookMarks, supabase } from "../../../lib/supabase";

const BookmarksScreen = () => {
  const router = useRouter();
  const { user } = useGlobalContext();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUserBookmarks = async () => {
    setLoading(true);
    const res = await FetchBookMarks(user?.id);
    if (res.success) {
      console.log("bookmarks:", res.data);
      setBookmarks(res.data);
    } else {
      console.error(res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    let postChannel;

    async function setupRealtime() {
      postChannel = supabase
        .channel("bookmarks")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "bookmarks" },
          (payload) => {
            console.log("Change received!", payload);
            // You should handle the realtime updates here
            // For example, refetch posts or update specific post
            // Refetch when changes occur
          },
        )
        .subscribe();
    }
    setupRealtime();
    getUserBookmarks();

    return () => {
      if (postChannel) {
        supabase.removeChannel(postChannel);
      }
    };
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-3 text-gray-500">Loading your bookmarks...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      {bookmarks.length > 0 ? (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <SimplePostCard
              item={item.posts}
              currentUser={item.users}
              router={router}
              hasShadow
            />
          )}
          ListHeaderComponent={() => (
            <View>
              <Goback title="Your Bookmarked Posts" router={router} />
            </View>
          )}
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">
            You have no bookmarked posts yet.
          </Text>
        </View>
      )}
    </View>
  );
};

export default BookmarksScreen;
