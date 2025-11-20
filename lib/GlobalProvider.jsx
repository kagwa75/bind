import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { supabase } from "./supabase";

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // Add userProfile state
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Storage adapter
  const storage = {
    getItem: async (key) =>
      Platform.OS === "web"
        ? localStorage.getItem(key)
        : await AsyncStorage.getItem(key),
    setItem: async (key, value) =>
      Platform.OS === "web"
        ? localStorage.setItem(key, value)
        : await AsyncStorage.setItem(key, value),
    removeItem: async (key) =>
      Platform.OS === "web"
        ? localStorage.removeItem(key)
        : await AsyncStorage.removeItem(key),
  };

  // Fetch user profile from database
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Failed to fetch user profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  // Initialize session and user profile
  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        console.log("session data:", session);
        if (error) {
          console.error("Session error:", error);
          throw error;
        }

        if (session?.user) {
          setUser(session.user);
          await storage.setItem("supabaseUser", JSON.stringify(session.user));

          // Fetch and set user profile data
          const profileData = await fetchUserProfile(session.user.id);
          if (profileData) {
            setUserProfile(profileData);
            console.log("profile data:", profileData);
            await storage.setItem("userProfile", JSON.stringify(profileData));
          }
        } else {
          console.log("No session found, redirecting to welcome");
          // Only redirect if we're sure there's no session
          router.replace("/(auth)/Welcome");
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        setAuthError("Failed to load user session");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Load persisted user profile on app start
    const loadPersistedProfile = async () => {
      try {
        const storedProfile = await storage.getItem("userProfile");
        if (storedProfile) {
          setUserProfile(JSON.parse(storedProfile));
        }
      } catch (error) {
        console.error("Failed to load persisted profile:", error);
      }
    };

    loadPersistedProfile();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await storage.setItem("supabaseUser", JSON.stringify(session.user));

        // Fetch and set user profile on auth change
        const profileData = await fetchUserProfile(session.user.id);
        if (profileData) {
          setUserProfile(profileData);
          await storage.setItem("userProfile", JSON.stringify(profileData));
        }
      } else {
        setUser(null);
        setUserProfile(null);
        await storage.removeItem("supabaseUser");
        await storage.removeItem("userProfile");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setUserData = async (userData) => {
    try {
      // Update both user auth data and profile data
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      setUserProfile(userData);

      // Store both in storage
      if (userData) {
        await storage.setItem("supabaseUser", JSON.stringify(updatedUser));
        await storage.setItem("userProfile", JSON.stringify(userData));
      }
      setAuthError(null);
    } catch (error) {
      console.error("Failed to set user data:", error);
      setAuthError("Failed to update user data");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    await storage.removeItem("supabaseUser");
    await storage.removeItem("userProfile");
  };

  const value = {
    user: { ...user, ...userProfile }, // Merge auth user and profile data
    userProfile, // Also provide profile separately if needed
    setUserData,
    logout,
    isLoading,
    error: authError,
    clearError: () => setAuthError(null),
    isLoggedIn: !!user,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};

export default GlobalProvider;
