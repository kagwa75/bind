import * as AuthSession from "expo-auth-session";
import * as Linking from "expo-linking";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

// Call this once in your app (preferably in App.js)
WebBrowser.maybeCompleteAuthSession();

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleUrl = async (event) => {
      const url = event.url;
      console.log("URL received:", url);

      if (url.includes("access_token") && url.includes("refresh_token")) {
        setAuthLoading(true);

        try {
          // Extract tokens from URL
          const params = new URLSearchParams(url.split("#")[1]);
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            // Set the session
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) throw error;

            console.log("Session set from deep link");
            // Wait for GlobalProvider to update
            setTimeout(() => {
              router.replace("/(tab)/home");
            }, 500);
          }
        } catch (error) {
          console.error("Error handling URL:", error);
          Alert.alert("Authentication Error", "Failed to complete login");
        } finally {
          setAuthLoading(false);
        }
      }
    };

    const subscription = Linking.addEventListener("url", handleUrl);

    // Check initial URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }

      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert("Login Error", error.message);
        console.error("Supabase error", JSON.stringify(error, null, 2));
        return;
      }
      console.log("login Data:", data);
      // Successfully logged in
      router.replace("/(tab)/home");
    } catch (error) {
      Alert.alert("Login Error", error.message);
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);

      // Generate redirect URI for Expo Go
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: "messager",
      });

      console.log("Redirect URL:", redirectUrl);

      // Get the OAuth URL from Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true, // 👈 prevents Supabase from calling location.assign()
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
      console.log("OAuth URL:", data?.url);

      // Manually open the auth session
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl,
      );

      console.log("Auth session result:", result);

      if (result.type === "success") {
        const { url } = result;
        // Extract parameters from URL
        const params = new URLSearchParams(url.split("#")[1]);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          // Set the session manually
          const { data: sessionData, error: sessionError } =
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          if (sessionError) throw sessionError;

          console.log("OAuth session set successfully");
          // Wait a moment for GlobalProvider to detect the session
          setTimeout(() => {
            router.replace("/(tab)/home");
          }, 500);
        }
      }
    } catch (error) {
      console.error("Google login error:", error);
      Alert.alert("Google Login Error", error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (authLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={{ marginTop: 16, color: "#4b5563" }}>
          Completing authentication...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        padding: 24,
        justifyContent: "center",
      }}
    >
      {/* Header */}
      <Text
        style={{
          fontSize: 32,
          fontWeight: "bold",
          color: "#1f2937",
          marginBottom: 8,
        }}
      >
        Welcome back
      </Text>
      <Text style={{ color: "#6b7280", marginBottom: 32 }}>
        Please sign in to continue
      </Text>

      {/* Email Field */}
      <View
        style={{
          borderWidth: 1,
          borderColor: "#e5e7eb",
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <TextInput
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={{ color: "#1f2937" }}
        />
      </View>

      {/* Password Field */}
      <View
        style={{
          borderWidth: 1,
          borderColor: "#e5e7eb",
          borderRadius: 8,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <TextInput
          placeholder="Password"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ color: "#1f2937" }}
        />
      </View>

      {/* Login Button */}
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#fdba74" : "#f97316",
          padding: 16,
          borderRadius: 8,
          alignItems: "center",
          marginBottom: 24,
          opacity: loading ? 0.7 : 1,
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>
          {loading ? "Signing in..." : "Login"}
        </Text>
      </TouchableOpacity>

      {/* Divider */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}
      >
        <View style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
        <Text style={{ paddingHorizontal: 16, color: "#6b7280" }}>OR</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
      </View>

      {/* Google Login Button */}
      <TouchableOpacity
        onPress={handleGoogleLogin}
        disabled={authLoading}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "#e5e7eb",
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
          opacity: authLoading ? 0.7 : 1,
        }}
      >
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
          }}
          style={{ width: 24, height: 24, marginRight: 8 }}
        />
        <Text style={{ color: "#374151", fontWeight: "500" }}>
          {authLoading ? "Signing in..." : "Continue with Google"}
        </Text>
      </TouchableOpacity>

      {/* Forgot Password Link */}
      <TouchableOpacity
        onPress={() => router.push("/forgotPassword")}
        style={{ alignItems: "center", marginTop: 24 }}
      >
        <Text style={{ color: "#f97316" }}>Forgot password?</Text>
      </TouchableOpacity>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 20,
          gap: 8,
        }}
      >
        <Text style={{ color: "#6b7280" }}>Don't have an account?</Text>
        <Link href={"/signUp"} style={{ color: "#f97316" }}>
          Register
        </Link>
      </View>
    </View>
  );
};

export default Login;
