import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useGlobalContext } from "../lib/GlobalProvider";
import { fetchPostDetails } from "../lib/supabase";
import PostCard from "./PostCard";
import ScreenWrapper from "./ScreenWrapper";

const edit = () => {
  const { id } = useLocalSearchParams();
  console.log("idedproperty:", id[0]);
  useEffect(() => {
    const data = fetchPostDetails(id[0]);
    if (data) {
      setPost(data);
    }
    return;
  }, [id]);
  const [post, setPost] = useState();
  const router = useRouter();
  const { user } = useGlobalContext();
  return (
    <ScreenWrapper>
      <View className="flex-1 bg-orange-300">
        <View className="flex flex-row justify-between gap-4 items-center">
          <Text className="text-3xl pl-1 text-orange-600 font-bold">
            Messenger
          </Text>
        </View>
        <FlatList
          data={post}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PostCard item={item} currentUser={user} router={router} />
          )}
          onEndReachedThreshold={0.5} // Trigger when 50% from the end
        />
      </View>
    </ScreenWrapper>
  );
};

export default edit;
