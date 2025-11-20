import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useRef, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../../components/Button";
import Goback from "../../../components/goback";
import ProfilePic from "../../../components/ProfilePic";
import TextEditor from "../../../components/TextEditor";
import { uploadFile } from "../../../constants/ImageService";
import { useGlobalContext } from "../../../lib/GlobalProvider";
import { NewPost } from "../../../lib/supabase";

const CreatePost = () => {
  const { user } = useGlobalContext();
  const bodyRef = useRef("");
  const editorRef = useRef(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null); // Track file type separately

  const getInitials = (email) => {
    if (!email) return "U";
    const namePart = email.split("@")[0];
    return namePart
      .split(/[._]/)
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const onPick = async (mediaType) => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Sorry, we need camera roll permissions to select media.",
        );
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType === "image" ? ["images"] : ["videos"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        console.log("selected Asset:", selectedAsset);
        setFile(selectedAsset);

        // Determine file type based on URI or asset properties
        if (
          selectedAsset.type === "video" ||
          selectedAsset.uri.match(/\.(mp4|mov|avi|wmv|flv|mkv)$/i)
        ) {
          setFileType("video");
        } else {
          setFileType("image");
        }
      }
    } catch (error) {
      console.error("Media picker error:", error);
      Alert.alert("Error", "Failed to pick media");
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileType(null);
  };

  const onSubmit = async () => {
    if (!bodyRef.current || bodyRef.current.trim() === "") {
      Alert.alert("Error", "Please write something to post");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      let media_url = null;

      let isImage = fileType == "video" ? false : true;
      let folderName = isImage ? "profileImage" : "profileVideo";
      // Upload file if one was selected
      if (file && typeof file === "object") {
        media_url = (await uploadFile(folderName, file.uri, isImage, user?.id))
          .url;
      }
      console.log("media_url:", media_url);
      const uploadData = {
        body: bodyRef.current.replace(/<[^>]*>?/gm, ""),
        file: media_url,
        userid: user.id,
        createdat: new Date().toISOString(),
      };
      // Insert post into database
      const { data, error } = await NewPost(uploadData);
      console.log("updated data", data);
      if (error) {
        throw error;
      }

      // Success
      setLoading(false);
      setFile(null);
      bodyRef.current = "";
      editorRef.current = "";

      Alert.alert("Success", "Your post has been published!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Failed to create post. Please try again.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };
  const player = useVideoPlayer(file?.uri, (player) => {
    player.loop = true;
    player.play();
  });
  return (
    <ScrollView className="flex-1 bg-white p-4">
      {/* Header */}
      <Goback
        title="Create Post"
        router={router}
        font="font-semibold text-2xl"
      />

      {/* User Info */}
      <View className="flex-row items-center mt-4 mb-6">
        <ProfilePic
          uri={user?.image}
          initials={getInitials(user?.email)}
          size={50}
        />
        <Text className="ml-3 text-blue-500 text-lg font-bold">
          {user?.name}
        </Text>
      </View>

      {/* Post Body */}
      <View className="mb-10">
        <TextEditor
          editorRef={editorRef}
          onChange={(body) => (bodyRef.current = body)}
          placeholder="What's on your mind?"
        />
      </View>

      {/* Media Preview */}
      {file && file.uri && (
        <View className="relative mt-4 mb-8 rounded-lg overflow-hidden bg-gray-100">
          {fileType === "video" ? (
            <VideoView
              player={player}
              fullscreenOptions
              style={{ width: "100%", height: 250 }}
            />
          ) : (
            <Image
              source={{ uri: file.uri }}
              style={{ width: "100%", height: 250 }}
              resizeMode="cover"
            />
          )}
          <TouchableOpacity
            onPress={removeFile}
            className="absolute top-2 right-2 bg-red-500 p-2 rounded-full"
          >
            <Feather name="x" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Add Media Buttons */}
      <View className="flex-row justify-between items-center p-4 border-t border-gray-200">
        <Text className="text-gray-700 text-lg font-medium">
          Add to your post
        </Text>
        <View className="flex-row space-x-4">
          <TouchableOpacity
            onPress={() => onPick("image")}
            className="p-2 rounded-full bg-blue-100"
          >
            <Feather name="image" size={22} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onPick("video")}
            className="p-2 rounded-full bg-red-100"
          >
            <Feather name="video" size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Upload progress */}
      {loading && (
        <View className="my-4">
          <Text className="text-center text-gray-500">
            Uploading... {uploadProgress}%
          </Text>
        </View>
      )}

      {/* Post Button */}
      <View className="mt-6 mb-10">
        <Button
          title={loading ? "Posting..." : "Post"}
          onPress={onSubmit}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
};

export default CreatePost;
