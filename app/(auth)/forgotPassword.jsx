import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../lib/supabase";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      // Adjust this redirect URL to match your app scheme + path
      const redirectUrl = Linking.createURL("auth/resetPassword");

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      Alert.alert(
        "Password Reset Sent",
        "Check your email for a password reset link.",
      );
      router.back();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

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
        Reset your password
      </Text>
      <Text style={{ color: "#6b7280", marginBottom: 32 }}>
        Enter your email address and we'll send you a link to reset your
        password.
      </Text>

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
          placeholder="Enter your email"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={{ color: "#1f2937" }}
        />
      </View>

      <TouchableOpacity
        onPress={handleResetPassword}
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
          {loading ? "Sending..." : "Send Reset Link"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.back()}
        style={{ alignItems: "center", marginTop: 24 }}
      >
        <Text style={{ color: "#f97316" }}>Back to login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPassword;
