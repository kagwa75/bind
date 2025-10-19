import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import Button from "../../components/Button";
import ScreenWrapper from "../../components/ScreenWrapper";
import TextInput from "../../components/TextInput";
import { supabase } from "../../lib/supabase";
const signUp = () => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [userName, setuserName] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [loading, setLoading] = useState();
  const router = useRouter();

  const handleRegister = async () => {
    try {
      if (confirmPassword !== password) {
        Alert.alert("Error", "Passwords don't match");
        return;
      }
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log("signup response:", data);

      if (error) {
        console.error("supabase error", JSON.stringify(error, null, 2));
        Alert.alert("Error", error.message);
        return;
      }

      if (data.session) {
        Alert.alert("Success", "You are signed up and logged in!");
        router.replace("/(tab)/home");
      } else {
        Alert.alert(
          "Success",
          "Please check your inbox for email verification!",
        );
      }
    } catch (error) {
      Alert.alert("Registration Error", error.message);
      console.log("Registration Error:", JSON.stringify(error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Handle Google login logic
    console.log("Google login attempted");
  };

  return (
    <ScreenWrapper>
      <View className={`flex-1 bg-white p-6 justify-center`}>
        {/* Header */}
        <Text className={`text-3xl font-bold text-gray-800 mb-2`}>
          Let's Get Started
        </Text>
        <Text className={`text-gray-500 mb-8`}>
          Please Register to continue
        </Text>

        {/* Email/Username Field */}
        <TextInput
          className={`border border-gray-200 rounded-lg p-4 mb-4`}
          placeholder="Username"
          placeholderTextColor="#9CA3AF"
          value={userName}
          onChangeText={setuserName}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          className={`border border-gray-200 rounded-lg p-4 mb-4`}
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* Password Field */}
        <TextInput
          className={`border border-gray-200 rounded-lg p-4 mb-6`}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          className={`border border-gray-200 rounded-lg p-4 mb-6`}
          placeholder="Confirm Password"
          placeholderTextColor="#9CA3AF"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {/* Login Button */}

        <Button
          title={"Register"}
          onPress={handleRegister}
          textStyle={"text-white text-center font-semibold"}
          buttonStyle={"bg-orange-400"}
        />

        {/* Divider */}
        <View className={`flex-row items-center mb-6`}>
          <View className={`flex-1 h-px bg-gray-200`} />
          <Text className={`px-4 text-gray-500`}>OR</Text>
          <View className={`flex-1 h-px bg-gray-200`} />
        </View>

        {/* Google Login Button */}
        <TouchableOpacity
          className={`flex-row items-center justify-center border border-gray-200 py-3 rounded-lg`}
          onPress={handleGoogleLogin}
        >
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
            }}
            className={`w-6 h-6 mr-2`}
          />
          <Text className={`text-gray-700 font-medium`}>
            Continue with Google
          </Text>
        </TouchableOpacity>

        {/* Forgot Password Link */}
        <TouchableOpacity className={`mt-6`}>
          <Text className={`text-center text-orange-400`}>
            Forgot password?
          </Text>
        </TouchableOpacity>

        <View className="flex flex-row items-center justify-center mt-5 gap-2">
          <Text>Already have an account ?</Text>
          <Link href={"/login"} className="text-orange-400">
            Login
          </Link>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default signUp;
