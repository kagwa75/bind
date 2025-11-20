import { Feather } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import { useVideoPlayer, VideoView } from "expo-video";
import moment from "moment";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Modalize } from "react-native-modalize"; // ✅ NEW
import ViewShot from "react-native-view-shot";
import {
  addComment,
  CreateBookmark,
  deleteComment,
  deletePost,
  getPostComments,
  PostLikes,
  PostNotifications,
  removeBookmark,
  removeLikes,
} from "../lib/supabase";
import Avatar from "./avatar";

const SimplePostCard = ({ item, router, currentUser, hasShadow }) => {
  const safePostLikes = Array.isArray(item?.postlikes) ? item.postlikes : [];
  const safeComments = Array.isArray(item?.comments) ? item.comments : [];
  const safeBookmarks = Array.isArray(item?.bookmarks) ? item.bookmarks : [];

  const [liked, setLiked] = useState(
    safePostLikes.some((like) => like.userid === currentUser?.id),
  );
  const [likesCount, setLikesCount] = useState(safePostLikes.length);
  const [sharesCount] = useState(
    Array.isArray(item?.shares) ? item.shares.length : 0,
  );
  const [bookMarkCount, setBookMarkCount] = useState(
    Array.isArray(item?.bookmarks) ? item.bookmarks.length : 0,
  );
  const [bookmarked, setBookmarked] = useState(
    safeBookmarks.some((b) => b.userid === currentUser?.id),
  );

  const [commentsCount, setCommentsCount] = useState(safeComments.length);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const viewShotRef = useRef(null);
  const playerRef = useRef(null);
  const commentModalRef = useRef(null); // ✅ replaced bottomSheetRef
  const actionModalRef = useRef(null); // ✅ replaced actionSheetRef

  const shadowStyles = {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  };

  const createdAt = item?.createdat
    ? moment(item.createdat).format("MMM D")
    : "Recently";

  const isVideo = item?.file?.includes("mp4");
  const player = useVideoPlayer(
    isVideo && item.file ? item.file : null,
    (p) => (playerRef.current = p ? { ...p, loop: true } : null),
  );

  const handleLike = async () => {
    const alreadyLiked = safePostLikes.some(
      (like) => like.userid === currentUser?.id,
    );

    if (alreadyLiked) {
      const res = await removeLikes(currentUser?.id, item?.id);
      if (res.success) {
        setLiked(false);
        setLikesCount((prev) => Math.max(prev - 1, 0));
      }
    } else {
      const res = await PostLikes({
        postid: item?.id,
        userid: currentUser?.id,
        createdat: new Date().toISOString(),
      });
      if (res.success) {
        setLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    }
  };

  const openActions = () => actionModalRef.current?.open();
  const openComments = async () => {
    commentModalRef.current?.open();
    setIsLoadingComments(true);
    try {
      const postComments = await getPostComments(item?.id);
      setComments(Array.isArray(postComments) ? postComments : []);
    } catch (e) {
      Alert.alert("Error", "Could not load comments");
    } finally {
      setIsLoadingComments(false);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      const result = await addComment({
        postid: item?.id,
        userid: currentUser?.id,
        text: newComment.trim(),
      });

      if (result.success) {
        const newCommentObj = {
          id: result.id,
          text: newComment.trim(),
          createdat: new Date().toISOString(),
          users: {
            id: currentUser?.id,
            name: currentUser?.name || "User",
            image: currentUser?.image,
          },
        };
        setComments((prev) => [newCommentObj, ...prev]);
        setCommentsCount((prev) => prev + 1);
        setNewComment("");

        if (currentUser.id !== item.users.id) {
          await PostNotifications({
            senderid: currentUser.id,
            receiveid: item.users?.id,
            title: "commented on your post",
            createdat: new Date().toISOString(),
            data: JSON.stringify({ postId: item.id, commentId: result.id }),
          });
        }
      }
    } catch (err) {
      Alert.alert("Error", "Could not post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const DeleteComment = (comment) => {
    if (currentUser.id === comment.users.id) {
      Alert.alert("Confirm", "Delete this comment?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const res = await deleteComment(comment.id);
            if (res.success) {
              setComments((prev) => prev.filter((c) => c.id !== comment.id));
              setCommentsCount((prev) => Math.max(prev - 1, 0));
            }
          },
        },
      ]);
    }
  };

  const shareOptions = async () => {
    try {
      setLoading(true);

      // 1️⃣ Capture the post as an image
      const uri = await viewShotRef.current.capture();

      // 3️⃣ Share via Expo Sharing API
      await Sharing.shareAsync(uri, {
        mimeType: "image/jpeg",
        dialogTitle: "Share Post",
        UTI: "public.image",
      });

      setLoading(false);
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert("Error", "Failed to share post");
      setLoading(false);
    }
  };

  const handleBookmarks = async () => {
    const alreadyBookmarked = safeBookmarks.some(
      (bookmark) => bookmark.userid === currentUser?.id,
    );
    if (alreadyBookmarked) {
      const { success, error } = await removeBookmark(
        currentUser?.id,
        item?.id,
      );
      if (success) {
        setBookmarked(false);
        setBookMarkCount((prev) => Math.max(prev - 1, 0));
      } else {
        Alert.alert("Error", "Failed to remove bookmark");
        console.error(error);
      }
    } else {
      const { data, error } = await CreateBookmark({
        postid: item?.id,
        userid: currentUser?.id,
        created_at: new Date().toISOString(),
      });
      if (error) {
        console.error(error);
        Alert.alert("Error", "Failed to bookmark post");
      } else {
        console.log(data);
        setBookmarked(true);
        setBookMarkCount((prev) => prev + 1);

        Alert.alert("success", "bookmarked post");
      }
    }
  };
  const renderComment = ({ item: comment }) => (
    <View className="flex-row gap-3 mb-4">
      <Avatar size={36} uri={comment?.users?.image} />
      <View className="flex-1 bg-gray-100 p-3 rounded-2xl">
        <Text className="font-semibold text-sm">
          {comment?.users?.name || "Unknown User"}
        </Text>
        <Text className="text-gray-800 mt-1">{comment.text}</Text>
        <Text className="text-gray-500 text-xs mt-1">
          {moment(comment.createdat).format("MMM D")}
        </Text>
      </View>
      {currentUser.id === comment.userid && (
        <TouchableOpacity
          className="bg-gray-100 p-2 rounded-2xl"
          onPress={() => DeleteComment(comment)}
        >
          <Feather size={20} color={"red"} name={"trash-2"} />
        </TouchableOpacity>
      )}
    </View>
  );

  if (!item) return null;

  return (
    <>
      {/* Post content */}
      <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
        <View
          className={`bg-gray-300 border border-gray-200 ${
            hasShadow ? "shadow-lg" : ""
          } gap-6 mb-6 rounded-xl p-5`}
          style={hasShadow ? shadowStyles : {}}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-3">
              <Avatar size={40} uri={item?.users?.image} />
              <View>
                <Text className="font-semibold text-base">
                  {item?.users?.name}
                </Text>
                <Text className="text-gray-500 text-xs">{createdAt}</Text>
              </View>
            </View>
            <TouchableOpacity className="p-2" onPress={openActions}>
              <Feather name="more-horizontal" size={20} color={"#6b7280"} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          {item?.body && <Text className="text-gray-800">{item.body}</Text>}

          {/* Media */}
          {item?.file && (
            <View className="justify-center items-center mb-4">
              {isVideo ? (
                <VideoView
                  player={player}
                  fullscreenOptions={{
                    enabled: true, // replaces allowsFullscreen
                    presentationStyle: "fullscreen", // optional
                  }}
                  style={{ width: "100%", height: 250, borderRadius: 12 }}
                />
              ) : (
                <Image
                  source={{ uri: item.file }}
                  resizeMode="cover"
                  className="w-full h-64 rounded-xl"
                />
              )}
            </View>
          )}

          {/* Buttons */}
          <View className="flex-row items-center justify-around border-t border-gray-100 pt-3">
            <TouchableOpacity
              className="flex-row items-center gap-1"
              onPress={handleLike}
            >
              <Feather
                name="heart"
                size={20}
                color={liked ? "#ef4444" : "#9ca3af"}
                fill={liked ? "#ef4444" : "transparent"}
              />
              <Text className="text-gray-600 text-sm">{likesCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center gap-1"
              onPress={openComments}
            >
              <Feather name="message-circle" size={20} color={"#9ca3af"} />
              <Text className="text-gray-600 text-sm">{commentsCount}</Text>
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator color={"orange"} />
            ) : (
              <TouchableOpacity
                className="flex-row items-center gap-1"
                onPress={shareOptions}
              >
                <Feather name="share" size={20} color={"#9ca3af"} />
                <Text className="text-gray-600 text-sm">{sharesCount}</Text>
              </TouchableOpacity>
            )}
            {currentUser?.id !== item?.users?.id && (
              <TouchableOpacity
                className="flex-row items-center gap-1"
                onPress={handleBookmarks}
              >
                <Feather
                  name="bookmark"
                  size={20}
                  color={bookmarked ? "#3b82f6" : "#9ca3af"}
                  fill={bookmarked ? "#3b82f6" : "transparent"}
                />
                <Text className="text-gray-600 text-sm">{bookMarkCount}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Comments Modalize */}
        <Modalize ref={commentModalRef} modalHeight={600}>
          <View className="px-5 pt-5">
            <Text className="text-lg font-bold text-center mb-4">Comments</Text>
            {isLoadingComments ? (
              <ActivityIndicator size="large" color="#3b82f6" />
            ) : (
              <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item) => item.id?.toString()}
                ListEmptyComponent={
                  <View className="justify-center items-center py-10">
                    <Feather name="message-circle" size={40} color="#d1d5db" />
                    <Text className="text-gray-500 mt-2">No comments yet</Text>
                  </View>
                }
              />
            )}
            {/* Comment input */}
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="border-t border-gray-200 pt-3 pb-5"
            >
              <View className="flex-row items-center">
                <Avatar size={40} uri={currentUser?.image} />
                <TextInput
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholder="Write a comment..."
                  className="flex-1 ml-3 bg-gray-100 rounded-full px-4 py-2"
                  multiline
                />
                <TouchableOpacity
                  onPress={submitComment}
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="ml-2 p-2"
                >
                  {isSubmittingComment ? (
                    <ActivityIndicator size="small" color="#3b82f6" />
                  ) : (
                    <Feather
                      name="send"
                      size={20}
                      color={newComment.trim() ? "#3b82f6" : "#9ca3af"}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modalize>

        {/* Actions Modalize */}
        <Modalize ref={actionModalRef} adjustToContentHeight>
          <View className="p-5">
            {currentUser?.id === item?.users?.id ? (
              <>
                <TouchableOpacity
                  className="flex-row items-center gap-3 mb-4"
                  onPress={() => {
                    actionModalRef.current?.close();
                    router.push(`/(editpost)/${item.id}`);
                  }}
                >
                  <Feather name="edit-2" size={20} color="#3b82f6" />
                  <Text className="text-base">Edit Post</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center gap-3 mb-4"
                  onPress={() => {
                    actionModalRef.current?.close();
                    Alert.alert("Delete Post", "Are you sure?", [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                          const result = await deletePost(item?.id);
                          if (result.success) Alert.alert("Deleted your post");
                        },
                      },
                    ]);
                  }}
                >
                  <Feather name="trash-2" size={20} color="red" />
                  <Text className="text-base text-red-500">Delete Post</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  className="flex-row items-center gap-3 mb-4"
                  onPress={() => {
                    actionModalRef.current?.close();
                    router.push(`/(profile)/${item.users.id}`);
                  }}
                >
                  <Feather name="user" size={20} color="#6b7280" />
                  <Text className="text-base">About this Account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-row items-center gap-3 mb-4"
                  onPress={() => {
                    actionModalRef.current?.close();
                    handleBookmarks();
                  }}
                >
                  <Feather name="bookmark" size={20} color="#6b7280" />
                  <Text className="text-base">Bookmark</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Modalize>
      </ViewShot>
    </>
  );
};

export default SimplePostCard;
