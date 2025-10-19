import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../components/Button";
import ProfilePic from "../../components/ProfilePic";
import Input from "../../components/TextInput";
import { uploadFile } from "../../constants/ImageService";
import { useGlobalContext } from "../../lib/GlobalProvider";
import { updateUser } from "../../lib/supabase";

const EditProfile = () => {
  const { user: CurrentUser, setUserData } = useGlobalContext();
  const router = useRouter();
  const [user, setUser] = useState({
    name: "",
    email: "",
    phonenumber: "",
    image: "",
    bio: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [tempImage, setTempImage] = useState(null);

  useEffect(() => {
    if (CurrentUser) {
      setUser({
        name: CurrentUser.name || "",
        email: CurrentUser.email || "",
        phonenumber: CurrentUser.phonenumber || "",
        image: CurrentUser.image || "",
        bio: CurrentUser.bio || "",
        address: CurrentUser.address || "",
      });
    }
  }, [CurrentUser]);

  const getInitials = (email) => {
    if (!email) return "U";
    const namePart = email.split("@")[0];
    return namePart
      .split(/[._]/)
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const saveUpdates = async () => {
    if (loading) return;

    // Validate required fields
    if (!user.name || !user.email) {
      Alert.alert(
        "Error",
        "Please fill in all required fields (name and email)",
      );
      return;
    }

    setLoading(true);

    let updatedUserData = { ...user };

    // Handle image upload if a new image was selected
    if (typeof user.image === "string" && user.image.startsWith("file:")) {
      try {
        const imageResult = await uploadFile(
          "profiles",
          user.image,
          true,
          CurrentUser.id,
        );
        if (imageResult && imageResult.success) {
          updatedUserData.image = imageResult.url;
        } else {
          Alert.alert("Error", "Failed to upload image");
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Image upload error:", error);
        Alert.alert("Error", "Failed to upload image");
        setLoading(false);
        return;
      }
    }

    try {
      const { data, error } = await updateUser(CurrentUser.id, updatedUserData);
      console.log("updated data", data);

      if (error) {
        console.log("Update Error", error);
        Alert.alert(
          "Error",
          "We could not update your details now, please try later.",
        );
      } else {
        setUserData(data);
        Alert.alert("Success", "Profile updated successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error("saveUpdates error:", error.message);
      Alert.alert("Error", "An error occurred while updating profile.");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Sorry, we need camera roll permissions to select an image.",
        );
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], // Fixed mediaTypes
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;

        // Update local state
        setUser({ ...user, image: selectedImageUri });

        // Also update global context temporarily for immediate display
        setTempImage(selectedImageUri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick an image");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView className="p-4">
        <View className="flex flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-gray-100 p-2 rounded-full"
          >
            <Feather name="arrow-left" size={22} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-black">
            Edit Your Profile
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View className="items-center mb-6">
          <ProfilePic
            uri={tempImage || user.image}
            initials={getInitials(user.email)}
            onEdit={pickImage}
            size={120}
          />
          <TouchableOpacity onPress={pickImage} className="mt-2">
            <Text className="text-blue-500 font-medium">Change Photo</Text>
          </TouchableOpacity>
        </View>

        <Input
          placeholder="Your Name"
          value={user.name}
          onChangeText={(text) => setUser({ ...user, name: text })}
          icon={<Feather name="user" size={20} color="#666" />}
        />

        <Input
          placeholder="Email Address"
          value={user.email}
          editable={false}
          icon={<Feather name="mail" size={20} color="#666" />}
        />

        <Input
          placeholder="Phone Number"
          value={user.phonenumber}
          onChangeText={(text) => setUser({ ...user, phonenumber: text })}
          keyboardType="phone-pad"
          icon={<Feather name="phone" size={20} color="#666" />}
        />

        <Input
          placeholder="Your Address"
          value={user.address}
          onChangeText={(text) => setUser({ ...user, address: text })}
          icon={<Feather name="map-pin" size={20} color="#666" />}
        />

        <Input
          placeholder="Tell us about yourself..."
          value={user.bio}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          onChangeText={(text) => setUser({ ...user, bio: text })}
          icon={<Feather name="edit-3" size={20} color="#666" />}
        />

        <View className="mt-6 mb-10">
          <Button
            onPress={saveUpdates}
            title={loading ? "Saving..." : "Save Changes"}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfile;
