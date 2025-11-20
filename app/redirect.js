import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { supabase } from "../lib/supabase";

export default function Redirect() {
  useEffect(() => {
    const handleDeepLink = async () => {
      try {
        // Get the redirect URL the app was opened with
        const url = await Linking.getInitialURL();
        if (!url) return;

        // Parse the URL to get query parameters
        const { queryParams } = Linking.parse(url);
        const code = queryParams["code"];

        if (code) {
          console.log("OAuth code received:", code);

          // Exchange code for Supabase session
          const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("Session exchange failed:", error);
            return;
          }

          console.log("Session successfully restored:", data.session);

          // Navigate user to home screen
          router.replace("/(tab)/home");
        } else {
          console.warn("No code found in redirect URL.");
          router.replace("/(auth)/Welcome");
        }
      } catch (err) {
        console.error("Error handling redirect:", err);
      }
    };

    handleDeepLink();
  }, []);

  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="orange" />
      <Text>Finishing sign-in...</Text>
    </View>
  );
}
