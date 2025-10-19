import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useGlobalContext } from "../lib/GlobalProvider";
import Avatar from "./avatar";

const ProfilePic = ({ style, onPress, onEdit, uri }) => {
  const { user } = useGlobalContext();
  const imageUri = uri || user?.image;
  const getInitials = (email) => {
    if (!email) return "U";
    const namePart = email.split("@")[0];
    return namePart
      .split(/[._]/) // split by . or _
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };
  return (
    <View>
      {/* Profile picture / initials */}
      <TouchableOpacity onPress={onPress} className="items-center ">
        {imageUri ? (
          <Avatar uri={imageUri} size={50} />
        ) : (
          <View
            className={`${style} w-24 h-24 rounded-full bg-gray-300 items-center justify-center`}
          >
            <Text className="text-3xl font-bold text-white">
              {getInitials(user?.email)}
            </Text>
          </View>
        )}
        {onEdit && (
          <TouchableOpacity
            onPress={onEdit}
            className="absolute bottom-0 right-[40%] bg-white p-2 rounded-full shadow"
          >
            <Feather name="edit-3" size={18} color="black" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ProfilePic;
