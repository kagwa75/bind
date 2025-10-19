import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Avatar from "../../components/avatar";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useGlobalContext } from "../../lib/GlobalProvider";

const Profile = () => {
  const { user, logout } = useGlobalContext();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => logout(), style: "destructive" },
    ]);
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} className="bg-gray-50">
        <ModernProfileHeader
          user={user}
          router={router}
          handleLogout={handleLogout}
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

const ModernProfileHeader = ({ user, router, handleLogout }) => {
  const getInitials = (email) => {
    const EX = "U";
    if (!email) return EX;
    const namePart = email.split("@")[0];
    return namePart
      .split(/[._]/)
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const formatName = (email) => {
    if (!email) return "User";
    const namePart = email.split("@")[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  const menuItems = [
    {
      icon: "edit",
      label: "Edit Profile",
      onPress: () => router.push("/editProfile"),
      color: "#3B82F6",
    },
    {
      icon: "settings",
      label: "Settings",
      onPress: () => router.push("/settings"),
      color: "#6B7280",
    },
    {
      icon: "help-circle",
      label: "Help & Support",
      onPress: () => router.push("/support"),
      color: "#8B5CF6",
    },
    {
      icon: "log-out",
      label: "Logout",
      onPress: handleLogout,
      color: "#EF4444",
    },
  ];

  return (
    <View className="flex-1">
      {/* Header with gradient */}
      <View className="bg-gradient-to-b from-blue-600 to-blue-500 pb-8 pt-2 px-6 rounded-b-3xl">
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity
            onPress={router.back}
            className="bg-white/20 p-3 rounded-full"
          >
            <Feather name="arrow-left" size={22} color="gray" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Profile</Text>
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            className="bg-white/20 p-3 rounded-full"
          >
            <Feather name="settings" size={22} color="gray" />
          </TouchableOpacity>
        </View>

        {/* Profile section */}
        <View className="items-center">
          <View className="relative mb-4">
            {user?.image ? (
              <Avatar
                uri={user.image}
                size={100}
                style={{ borderWidth: 4, borderColor: "white" }}
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center border-4 border-white">
                <Text className="text-3xl font-bold text-white">
                  {getInitials(user?.email)}
                </Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => router.push("/editProfile")}
              className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full border-2 border-white"
            >
              <Feather name="edit-3" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <Text className="text-gray-500 text-2xl font-bold mb-1">
            {user?.name || formatName(user?.email)}
          </Text>
          <Text className="text-blue-400 text-md font-bold">
            {user?.address || "Add your address"}
          </Text>
        </View>
      </View>
      {/* Stats cards */}
      <View className="flex-row justify-between px-6 -mt-6 mb-6">
        <StatCard icon="star" value="48k" label="followers" />
        <StatCard icon="check-circle" value="1" label="following" />
        <StatCard icon="clock" value="2" label="Pending" />
      </View>
      {/* user post info 
      <View className="p-4 flex">
        <Posts />
      </View>*/}

      {/* Info cards */}
      <View className="px-6 mb-6">
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Contact Info
          </Text>

          <InfoRow
            icon="mail"
            text={user?.email || "No email provided"}
            type="email"
          />
          <InfoRow
            icon="phone"
            text={user?.phonenumber || "No phone number"}
            type="phone"
          />
          <InfoRow
            icon="map-pin"
            text={user?.address || "No address provided"}
            type="address"
          />
        </View>
      </View>
      {/* Bio section */}
      {user?.bio && (
        <View className="px-6 mb-6">
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              About Me
            </Text>
            <Text className="text-gray-600 leading-6">{user.bio}</Text>
          </View>
        </View>
      )}
      {/* Menu items */}
      <View className="px-6 mb-8">
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              className={`flex-row items-center px-6 py-4 ${
                index !== menuItems.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: item.color + "20" }}
              >
                <Feather name={item.icon} size={20} color={item.color} />
              </View>
              <Text className="text-gray-800 ml-4 flex-1">{item.label}</Text>
              <Feather name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const StatCard = ({ icon, value, label }) => (
  <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 items-center flex-1 mx-2">
    <View className="bg-blue-50 p-3 rounded-full mb-2">
      <Feather name={icon} size={20} color="#3B82F6" />
    </View>
    <Text className="text-2xl font-bold text-gray-900">{value}</Text>
    <Text className="text-gray-500 text-xs">{label}</Text>
  </View>
);

const InfoRow = ({ icon, text, type }) => {
  const getActionIcon = () => {
    switch (type) {
      case "email":
        return "mail";
      case "phone":
        return "phone";
      case "address":
        return "map-pin";
      default:
        return "external-link";
    }
  };

  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-row items-center flex-1">
        <View className="bg-gray-100 p-2 rounded-lg mr-3">
          <Feather name={icon} size={18} color="#6B7280" />
        </View>
        <Text className="text-gray-700 flex-1" numberOfLines={1}>
          {text}
        </Text>
      </View>
      {text !== "No email provided" &&
        text !== "No phone number" &&
        text !== "No address provided" && (
          <TouchableOpacity className="p-2">
            <Feather name={getActionIcon()} size={18} color="#3B82F6" />
          </TouchableOpacity>
        )}
    </View>
  );
};

export default Profile;
