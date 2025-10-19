import { Feather } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import * as Sharing from "expo-sharing";
import { useVideoPlayer, VideoView } from "expo-video";
import moment from "moment";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { downloadFile } from "../constants/ImageService";
import {
  addComment,
  deleteComment,
  deletePost,
  getPostComments,
  PostLikes,
  removeLikes,
} from "../lib/supabase";
import Avatar from "./avatar";

const PostCardWUser = ({ item, router, currentUser, hasShadow }) => {
  // Fix: Initialize liked state based on whether current user has liked the post
  const [liked, setLiked] = useState(
    item?.postlikes?.some((like) => like.userid === currentUser?.id) || false,
  );
  // Fix: Initialize with correct property name (postlikes instead of likes)
  const [likesCount, setLikesCount] = useState(item?.postlikes.length || 0);
  const [sharesCount] = useState(item?.shares?.length || 0);
  // State for comments functionality
  const [commentsCount, setCommentsCount] = useState(
    item?.comments?.length || 0,
  );
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const playerRef = useRef(null);
  const bottomSheetRef = useRef(null);
  const commentSheetRef = useRef(null);
  const actionSheetRef = useRef(null);
  const shadowStyles = {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  };

  const createdAt = moment(item?.createdat).format("MMM D");

  // Initialize video player only for video files
  const player = useVideoPlayer(
    item?.file?.includes("mp4") ? item.file : "",
    (player) => {
      player.loop = true;
      playerRef.current = player;
    },
  );
  //handle real-time comment changes
  /*useEffect(() => {
    let postChannel;

    async function setupRealtime() {
      postChannel = supabase
        .channel("comments")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "comments" },
          (payload) => {
            console.log("Change received!", payload);

            fetchData(); // Refetch when changes occur
          },
        )
        .subscribe();
    }

    async function fetchData() {
      let res = await getPostComments(item?.id);
      console.log("fetched data:", res.data);
      if (res) {
        setComments((prev) => [res.data, ...prev]);
        setCommentsCount((prev) => prev + 1);
      } else if (res.error) {
        Alert.alert("Failed", "Could not fetch comments now, try again later");
      }
    }

    setupRealtime();
    fetchData();

    return () => {
      if (postChannel) {
        supabase.removeChannel(postChannel);
      }
    };
  }, []);*/

  const handleLike = async () => {
    // Check if already liked to determine whether to add or remove
    const alreadyLiked = item?.postlikes?.some(
      (like) => like.userid === currentUser?.id,
    );

    if (alreadyLiked) {
      // Remove like
      const res = await removeLikes(currentUser?.id, item?.id);
      console.log("removeLike Status:", res);
      if (res.success) {
        setLiked(false);
        setLikesCount((prev) => Math.max(prev - 1, 0));
      }
    } else {
      // Add like
      const data = {
        postid: item?.id,
        userid: currentUser?.id,
        createdat: new Date().toISOString(),
      };
      const res = await PostLikes(data);
      console.log("postLike Status:", res);
      if (res.success) {
        setLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    }
  };

  const snapPoints = useMemo(() => ["50%", "90%"], []);
  const actionSnapPoints = useMemo(() => ["25%", "40%"], []);

  const openActions = () => {
    actionSheetRef.current?.expand();
  };

  const openComments = async () => {
    // Open the bottom sheet
    bottomSheetRef.current?.expand();

    // Load comments for this post
    setIsLoadingComments(true);
    try {
      const postComments = await getPostComments(item?.id);
      setComments(postComments);
    } catch (error) {
      console.error("Error loading comments:", error);
      Alert.alert("Error", "Could not load comments");
    } finally {
      setIsLoadingComments(false);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const commentData = {
        postid: item?.id,
        userid: currentUser?.id,
        text: newComment.trim(),
      };

      const result = await addComment(commentData);

      if (result.success) {
        // Add the new comment to the list
        const newCommentObj = {
          id: result.id,
          text: newComment.trim(),
          createdat: new Date().toISOString(),
          users: {
            id: currentUser?.id,
            name: currentUser?.name,
            image: currentUser?.image,
          },
        };

        setComments((prev) => [newCommentObj, ...prev]);
        setCommentsCount((prev) => prev + 1);
        setNewComment("");
      } else {
        Alert.alert("Error", "Could not post comment");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      Alert.alert("Error", "Could not post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };
  const DeleteComment = (comment) => {
    if (currentUser.id === comment.users.id) {
      Alert.alert("Confirm", "Are you sure you want to delete this message?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            const res = await deleteComment(comment.id);
            if (res.success) {
              setComments((prev) => prev.filter((c) => c.id !== comment.id));
              setCommentsCount((prev) => Math.max(prev - 1, 0));
            } else {
              Alert.alert("Error", "Failed to delete comment");
            }
          },
          style: "destructive",
        },
      ]);
    } else {
      Alert.alert("You can't delete this comment");
    }
  };

  const shareOptions = async () => {
    try {
      if (item?.file) {
        // Determine file type
        const isVideo = item.file.includes("mp4");
        const mimeType = isVideo ? "video/mp4" : "image/jpeg";
        const uti = isVideo ? "public.video" : "public.image";

        setLoading(true);
        const localFileUri = await downloadFile(item.file);
        setLoading(false);

        if (localFileUri) {
          // Share downloaded image or video
          await Sharing.shareAsync(localFileUri, {
            mimeType,
            dialogTitle: item?.body || "Share Post",
            UTI: uti,
          });
          return;
        }
      }

      // Fallback to text-only sharing if:
      // - No file
      // - Download failed
      await Share.share({
        message: item?.body || "Check out this post!",
        title: "Share Post",
        url: item?.file || undefined, // fallback original URL if available
      });
    } catch (error) {
      setLoading(false);
      console.error("Error sharing:", error);
      Alert.alert("Error", "Failed to share post");
    }
  };

  // Render individual comment item
  const renderComment = ({ item: comment }) => (
    <View className="flex-row gap-3 mb-4">
      <Avatar size={36} uri={comment?.users?.image} />
      <View className="flex-1 bg-gray-100 p-3 rounded-2xl">
        <Text className="font-semibold text-sm">
          {comment?.users?.name || "Unknown User"}
        </Text>
        <Text className="text-gray-800 mt-1">{comment.text}</Text>
        <Text className="text-gray-500 text-xs mt-1">
          {moment(comment.createdat).format("MMM d")}
        </Text>
      </View>
      <View className="bg-gray-100 p-2 rounded-2xl">
        {currentUser.id === comment.userid && (
          <TouchableOpacity onPress={() => DeleteComment(comment)}>
            <Feather size={20} color={"red"} name={"trash-2"} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <>
      <View
        className={`bg-gray-300 border border-gray-200 ${
          hasShadow ? "shadow-lg" : ""
        } gap-6 mb-6 rounded-xl p-5`}
        style={hasShadow ? shadowStyles : {}}
      >
        {/*post media */}
        {item?.file && (
          <View className="justify-center items-center mb-4">
            {item.file.includes("mp4") ? (
              <VideoView
                player={player}
                allowsFullscreen
                allowsPictureInPicture
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
        {/*post content */}
        {item?.body && (
          <View>
            <Text className="text-gray-800">{item.body}</Text>
          </View>
        )}

        {/* Interaction buttons */}
        <View className="flex-row items-center justify-around border-t border-gray-100 pt-3">
          {/** Like button */}
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

          {/** Comment button */}
          <TouchableOpacity
            className="flex-row items-center gap-1"
            onPress={openComments}
          >
            <Feather name="message-circle" size={20} color={"#9ca3af"} />
            <Text className="text-gray-600 text-sm">{commentsCount}</Text>
          </TouchableOpacity>

          {/** Share button */}
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
        </View>
      </View>
      {/* Comments Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1} // Start closed
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: "white" }}
      >
        <BottomSheetView style={{ flex: 1 }}>
          <View className="flex-1 px-5">
            {/* Header */}
            <View className="border-b border-gray-200 pb-4 mb-4">
              <Text className="text-lg font-bold text-center">Comments</Text>
            </View>

            {/* Comments List */}
            {isLoadingComments ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
              </View>
            ) : (
              <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item) => item.id}
                inverted={false}
                className="flex-1"
                ListEmptyComponent={
                  <View className="flex-1 justify-center items-center py-10">
                    <Feather name="message-circle" size={40} color="#d1d5db" />
                    <Text className="text-gray-500 mt-2">No comments yet</Text>
                    <Text className="text-gray-400 text-sm">
                      Be the first to comment!
                    </Text>
                  </View>
                }
              />
            )}

            {/* Comment Input */}
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
                  maxLength={500}
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
        </BottomSheetView>
      </BottomSheet>
      {/* Action Bottom Sheet */}
      <BottomSheet
        ref={actionSheetRef}
        snapPoints={actionSnapPoints}
        index={-1}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: "white" }}
      >
        <BottomSheetView style={{ padding: 20 }}>
          {currentUser?.id === item?.users?.id ? (
            <>
              {/* Edit Button */}
              <TouchableOpacity
                className="flex-row items-center gap-3 mb-4"
                onPress={() => {
                  actionSheetRef.current?.close();
                  // navigate to edit post screen
                  router.push(`/(editpost)/${item.id}`);
                }}
              >
                <Feather name="edit-2" size={20} color="#3b82f6" />
                <Text className="text-base">Edit Post</Text>
              </TouchableOpacity>

              {/* Delete Button */}
              <TouchableOpacity
                className="flex-row items-center gap-3 mb-4"
                onPress={() => {
                  actionSheetRef.current?.close();
                  Alert.alert(
                    "Delete Post",
                    "Are you sure you want to delete this post?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                          const result = await deletePost(item?.id);
                          if (result.success) {
                            Alert.alert("Deleted your Post");
                          }
                          Alert.alert(result.error);
                        },
                      },
                    ],
                  );
                }}
              >
                <Feather name="trash-2" size={20} color="red" />
                <Text className="text-base text-red-500">Delete Post</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* About this Account */}
              <TouchableOpacity
                className="flex-row items-center gap-3 mb-4"
                onPress={() => {
                  actionSheetRef.current?.close();
                  router.push(`/profile/${item.users.id}`);
                }}
              >
                <Feather name="user" size={20} color="#6b7280" />
                <Text className="text-base">About this Account</Text>
              </TouchableOpacity>

              {/* Bookmark */}
              <TouchableOpacity
                className="flex-row items-center gap-3 mb-4"
                onPress={() => {
                  actionSheetRef.current?.close();
                  console.log("Bookmark post:", item.id);
                }}
              >
                <Feather name="bookmark" size={20} color="#6b7280" />
                <Text className="text-base">Bookmark</Text>
              </TouchableOpacity>

              {/* Report */}
              <TouchableOpacity
                className="flex-row items-center gap-3"
                onPress={() => {
                  commentSheetRef.current?.close();
                  Alert.alert("Report Post", "Thanks, we’ll review this post.");
                }}
              >
                <Feather name="flag" size={20} color="#ef4444" />
                <Text className="text-base text-red-500">Report</Text>
              </TouchableOpacity>
            </>
          )}
        </BottomSheetView>
      </BottomSheet>
    </>
  );
};

export default PostCardWUser;
