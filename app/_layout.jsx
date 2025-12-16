if (typeof window === "undefined") {
  global.window = {};
  global.document = {};
}
import { router, Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler"; // 👈 import
import GlobalProvider, { useGlobalContext } from "../lib/GlobalProvider";

WebBrowser.maybeCompleteAuthSession();

const Layout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GlobalProvider>
        <RootLayout />
      </GlobalProvider>
    </GestureHandlerRootView>
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
  }, [user, isLoading]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
};

export default Layout;
