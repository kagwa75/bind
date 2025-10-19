import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import NotificationCard from "../../components/NotificationCard";
import { useGlobalContext } from "../../lib/GlobalProvider";
import { fetchNotifications } from "../../lib/supabase";

const notifications = () => {
  const [notificationList, setNotificationList] = useState([]);
  const { user } = useGlobalContext();
  const router = useRouter();

  useEffect(() => {
    const getNofications = async () => {
      const res = await fetchNotifications(user?.id);
      if (res.success) {
        console.log("notifications", res.data);
        // Add data validation/transformation
        const validatedNotifications = res.data.map((notification) => ({
          ...notification,
          title: String(notification?.title ?? "No title"),
          users: {
            ...notification.users,
            name: String(notification?.users?.name ?? "Unknown User"),
          },
          data:
            typeof notification.data === "object"
              ? notification.data
              : (() => {
                  try {
                    return JSON.parse(notification.data);
                  } catch {
                    return {};
                  }
                })(),
        }));

        setNotificationList(validatedNotifications);
      } else {
        Alert.alert("Error", res.error);
      }
    };
    getNofications();
  }, [user]);

  return (
    <View className="flex-1">
      {notificationList.length == 0 ? (
        <View className="flex-1 justify-center items-center py-8 bg-white">
          <Feather name="alert-circle" size={48} color="#ef4444" />
          <Text className="text-gray-500 mt-2 text-lg">
            You Have No Notifications Currently
          </Text>
          <TouchableOpacity
            className="mt-4 bg-blue-500 px-6 py-2 rounded-full"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {notificationList.map((item) => {
            return (
              <NotificationCard item={item} router={router} key={item?.id} />
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default notifications;
