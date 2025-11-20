import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../lib/supabase";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      Alert.alert("Success", "Your password has been updated successfully");
      router.replace("/"); // Go back to login screen
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const subscription = Linking.addEventListener("url", (event) => {
      console.log("Received deep link:", event.url);
    });
    return () => subscription.remove();
  }, []);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: "#1f2937",
          marginBottom: 8,
        }}
      >
        Set a new password
      </Text>

      <Text style={{ color: "#6b7280", marginBottom: 32 }}>
        Enter your new password below.
      </Text>

      {/* New Password */}
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
          placeholder="New Password"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ color: "#1f2937" }}
        />
      </View>

      {/* Confirm Password */}
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
          placeholder="Confirm Password"
          placeholderTextColor="#9ca3af"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={{ color: "#1f2937" }}
        />
      </View>

      <TouchableOpacity
        onPress={handleUpdatePassword}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#fdba74" : "#f97316",
          padding: 16,
          borderRadius: 8,
          alignItems: "center",
          opacity: loading ? 0.7 : 1,
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>
          {loading ? "Updating..." : "Update Password"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResetPassword;
