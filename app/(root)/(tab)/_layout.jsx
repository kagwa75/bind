import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

const TabIcon = ({ iconName, color, name, focused }) => {
  return (
    <View className="flex items-center justify-center gap-2 mt-3">
      <Feather name={iconName} size={24} color={color} />
      <Text
        className={`${
          focused ? "text-primary-300 font-rubik-medium" : "text-black"
        } text-xs w-full flex mt-1 text-center`}
        style={{ color: color }}
      >
        {name}
      </Text>
    </View>
  );
};

const TabLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#FFA001",
          tabBarInactiveTintColor: "#CDCDE0",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "white",
            borderTopWidth: 1,
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
                iconName="plus-square"
                color={color}
                name="Create"
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
