import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { router, Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import GlobalProvider, { useGlobalContext } from "../lib/GlobalProvider";

WebBrowser.maybeCompleteAuthSession();

const Layout = () => {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GlobalProvider>
          <RootLayout />
        </GlobalProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
};

const RootLayout = () => {
  const { user, isLoading, isLoggedIn, userProfile } = useGlobalContext();

  useEffect(() => {
    if (isLoading) return; // wait until auth state is resolved
    console.log("Auth user:", user);
    if (!user || !userProfile) {
      router.replace("/(auth)/Welcome");
    } else {
      console.log("Auth user:", user);
      router.replace("/(tab)/home");
    }
  }, [isLoading]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
};

export default Layout;
