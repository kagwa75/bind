import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

const TabIcon = ({ iconName, color, size, name, focused }) => {
  return (
    <View className="flex items-center justify-center gap-2 mt-3">
      <Feather name={iconName} size={size} color={color} />
    </View>
  );
};

const TabLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#ea580c",
          tabBarInactiveTintColor: "black",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "white",
            borderTopWidth: 0,
            borderBottomWidth: 1,
            borderTopColor: "#0061FF1A",
            minHeight: 42,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                size={20}
                iconName="home"
                color={color}
                name="Home"
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="CreatePost"
          options={{
            title: "Create",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                size={25}
                iconName="plus-square"
                color={color}
                name="Create"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Conversations"
          options={{
            title: "Convos",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                size={20}
                iconName="send"
                color={color}
                name="Chats"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="BookMarks"
          options={{
            title: "BookMark",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                size={20}
                iconName="bookmark"
                color={color}
                name="BookMark"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>

      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default TabLayout;
