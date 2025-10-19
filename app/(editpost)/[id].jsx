import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"; // Adjust path as needed
import Avatar from "../../components/avatar";
import { uploadFile } from "../../constants/ImageService";
import { deletePost, fetchPostDetails, supabase } from "../../lib/supabase";

const EditPost = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Video player for preview
  const player = useVideoPlayer(video, (player) => {
    player.loop = true;
    player.muted = true;
  });

  useEffect(() => {
    if (id) {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    const postData = await fetchPostDetails(id);
    if (postData) {
      console.log("postData:", postData.data);
      const fetchData = postData.data;
      setPost(fetchData);
      setBody(fetchData.body || "");
      setImage(fetchData.file || null);
      setIsVideo(fetchData.file?.includes("mp4") || false);
      setLoading(false);
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission required",
          "Please allow access to your media library",
        );
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        console.log("selected Asset:", selectedAsset);
        if (selectedAsset.type === "image") {
          setIsImage(true);
          setImage(selectedAsset.uri);
          setVideo(null);
        } else if (selectedAsset.type === "video") {
          setIsVideo(true);
          setVideo(selectedAsset.uri);

          setImage(null);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // Remove current image
  const removeFile = () => {
    Alert.alert("Remove Media", "Are you sure you want to remove this media?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setImage(null);
          setVideo(null);
          setIsImage(false);
          setIsVideo(false);
        },
      },
    ]);
  };

  // Update post
  const updatePost = async () => {
    if (!body.trim() && !image) {
      Alert.alert("Error", "Post must have text or media");
      return;
    }

    try {
      setUpdating(true);

      let fileUrl = image ? image : video;

      // Upload new image if it's a local URI (not already a URL)
      if (image && image.startsWith("file://")) {
        let folderName = isImage ? "profileImage" : "profileVideo";
        fileUrl = (await uploadFile(folderName, fileUrl, isImage, post?.userid))
          .url;
      }

      const { error } = await supabase
        .from("posts")
        .update({
          body: body.trim(),
          file: fileUrl,
          updatedat: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      Alert.alert("Success", "Post updated successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update post");
    } finally {
      setUpdating(false);
    }
  };

  // Delete post
  const handleDelete = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: removePost,
        },
      ],
    );
  };

  const removePost = async () => {
    try {
      setUpdating(true);
      const { error } = await deletePost(post?.id);
      if (error) throw error;

      Alert.alert("Success", "Post deleted successfully", [
        {
          text: "OK",
          onPress: () => router.replace("/(tab)/home"),
        },
      ]);
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Failed to delete post");
    } finally {
      setUpdating(false);
    }
  };

  // Discard changes
  const handleDiscard = () => {
    const hasChanges = body !== post?.body || image !== post?.file;

    if (hasChanges) {
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard your changes?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ],
      );
    } else {
      router.back();
    }
  };
  const file = [image, video];

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-500 mt-2">Loading post...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Feather name="alert-circle" size={48} color="#ef4444" />
        <Text className="text-gray-500 mt-2 text-lg">Post not found</Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 px-6 py-2 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white py-7"
    >
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={handleDiscard}>
          <Text className="text-blue-500 text-lg">Cancel</Text>
        </TouchableOpacity>

        <Text className="text-lg font-semibold">Edit Post</Text>

        <TouchableOpacity
          onPress={updatePost}
          disabled={updating || uploading}
          className={`px-4 py-1 rounded-full ${
            updating || uploading ? "bg-blue-300" : "bg-blue-500"
          }`}
        >
          {updating ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-semibold">Update</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Author Info */}
        <View className="flex-row items-center p-4 border-b border-gray-100">
          <View className="w-10 h-10 bg-gray-300 rounded-full mr-3">
            <Avatar uri={post.users?.image} size={40} />
          </View>
          <View>
            <Text className="font-semibold">
              {post.users?.name || "Unknown User"}
            </Text>
            <Text className="text-gray-500 text-xs">Editing post</Text>
          </View>
        </View>

        {/* Text Input */}
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="What's on your mind?"
          multiline
          className="p-4 text-lg min-h-40"
          textAlignVertical="top"
          maxLength={2000}
        />

        {/* Character Counter */}
        <View className="px-4">
          <Text
            className={`text-right text-sm ${
              body.length > 1800 ? "text-red-500" : "text-gray-500"
            }`}
          >
            {body.length}/2000
          </Text>
        </View>

        {/* Media Preview */}
        {file && (
          <View className="mx-4 mb-4 rounded-xl overflow-hidden border border-gray-200">
            <View className="flex-row justify-between items-center p-2 bg-black/10">
              <Text className="text-gray-700 font-medium">
                {isVideo ? "Video Preview" : "Image Preview"}
              </Text>
              <TouchableOpacity onPress={removeFile}>
                <Feather name="x" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>

            {isVideo ? (
              <VideoView
                player={player}
                style={{ width: "100%", height: 250 }}
                allowsFullscreen
              />
            ) : (
              <Image
                source={{ uri: image }}
                style={{ width: "100%", height: 250 }}
                resizeMode="cover"
              />
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View className="p-4 border-t border-gray-100">
          <Text className="font-semibold mb-3">Media Options</Text>

          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={pickImage}
              disabled={uploading}
              className="flex-row items-center bg-gray-100 px-4 py-3 rounded-lg flex-1 mr-2"
            >
              <Feather
                name="image"
                size={20}
                color={uploading ? "#9ca3af" : "#3b82f6"}
              />
              <Text
                className={`ml-2 ${uploading ? "text-gray-400" : "text-gray-700"}`}
              >
                {uploading ? "Uploading..." : "Change Media"}
              </Text>
            </TouchableOpacity>

            {file && (
              <TouchableOpacity
                onPress={removeFile}
                className="flex-row items-center bg-red-50 px-4 py-3 rounded-lg"
              >
                <Feather name="trash-2" size={20} color="#ef4444" />
                <Text className="ml-2 text-red-600">Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Delete Post Section */}
        <View className="p-4 border-t border-gray-100 mt-4">
          <Text className="font-semibold mb-3 text-red-600">Danger Zone</Text>

          <TouchableOpacity
            onPress={handleDelete}
            disabled={updating}
            className="flex-row items-center justify-center bg-red-50 px-4 py-3 rounded-lg border border-red-200"
          >
            <Feather name="trash-2" size={18} color="#ef4444" />
            <Text className="ml-2 text-red-600 font-semibold">Delete Post</Text>
          </TouchableOpacity>

          <Text className="text-red-500 text-xs mt-2 text-center">
            This will permanently delete your post and all its interactions
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditPost;
