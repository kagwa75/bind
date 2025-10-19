import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../../components/Button";
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
    <ScrollView className="p-4 bg-white flex-1">
      <View className="flex flex-row items-center justify-between mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gray-100 p-2 rounded-full"
        >
          <Feather name="arrow-left" size={22} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black">Create Post</Text>
        <View style={{ width: 40 }} />
      </View>

      <View className="flex-row items-start mb-6">
        <ProfilePic
          uri={user?.image}
          initials={getInitials(user?.email)}
          size={50}
        />
        <View className="ml-3 mt-2">
          <Text className="text-blue-500 font-medium">{user?.name}</Text>
        </View>
      </View>

      <View className="mb-24">
        <TextEditor
          editorRef={editorRef}
          onChange={(body) => (bodyRef.current = body)}
          placeholder="What's on your mind?"
        />
      </View>

      {/* Media preview */}
      {file && (
        <View className="flex mt-16 rounded-lg overflow-hidden p-8 bg-gray-100">
          {fileType === "video" ? (
            <VideoView
              player={player}
              allowsFullscreen
              allowsPictureInPicture
              style={{ width: 350, height: 275 }}
            />
          ) : (
            <Image
              source={{ uri: file.uri }}
              className="w-full h-64"
              resizeMode="cover"
            />
          )}
          <Pressable
            onPress={removeFile}
            className="absolute top-2 right-2 p-2 rounded-full bg-red-500"
          >
            <Feather name="x" size={18} color={"white"} />
          </Pressable>
        </View>
      )}

      {/* Add media options */}
      <View className="flex-row justify-between items-center p-4 border-t mt-20 elevation-md border-gray-200">
        <Text className="text-lg font-medium text-gray-700">
          Add to your post
        </Text>
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={() => onPick("image")}
            className="p-2 rounded-full bg-blue-100"
          >
            <Feather name="image" size={22} color={"#3B82F6"} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onPick("video")}
            className="p-2 rounded-full bg-blue-100"
          >
            <Feather name="video" size={22} color={"#EF4444"} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-8">
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
