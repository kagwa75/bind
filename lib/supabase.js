import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";
import "react-native-url-polyfill/auto";
import { supabaseKey, supabaseUrl } from "../constants/index";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: Platform.OS !== "web" ? AsyncStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

export const getUser = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("id", userId)
      .single();
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error(JSON.stringify(error));
  }
};
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error(JSON.stringify(error));
  }
};
export const updateUser = async (userId, userData) => {
  // Changed parameter name from 'data' to 'userData'
  try {
    const { name, email, phonenumber, image, bio, address } = userData; // Use userData instead of data
    const { data: updatedUser, error } = await supabase // Renamed destructured data to updatedUser
      .from("users")
      .update({
        name,
        email,
        phonenumber,
        image,
        bio,
        address,
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.log("upload Error", error);
      throw error;
    }

    return { data: updatedUser }; // Return consistent format
  } catch (error) {
    console.error(JSON.stringify(error));
    return { data: null, error }; // Return consistent format even on error
  }
};
export const NewPost = async (userData) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .insert([userData])
      .select();
    if (error) {
      throw error;
    }
    return { success: true, data: data };
  } catch (error) {
    console.error(JSON.stringify(error));
    return { data: null, error };
  }
};
export const fetchPosts = async (limit = 10, userId) => {
  // Input validation
  if (limit <= 0 || limit > 100) {
    return {
      success: false,
      data: null,
      error: new Error("Limit must be between 1 and 100"),
    };
  }

  try {
    let query = supabase
      .from("posts")
      .select(
        `*,postlikes(*),comments(*),bookmarks(*),users!posts_userid_fkey(*)`,
      )
      .order("createdat", { ascending: false })
      .limit(limit);

    if (userId) {
      // Convert to string if it's a number
      const userIdString =
        typeof userId === "number" ? userId.toString() : userId;
      query = query.eq("userid", userIdString);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return { success: true, data: data || [] }; // Ensure data is always an array
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    return { success: false, data: null, error };
  }
};
export const fetchSinglePost = async (PostId) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `*, postlikes(*), comments(*), bookmarks(*), users!posts_userid_fkey(*)`,
      )
      .eq("id", PostId)
      .order("createdat", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return { success: true, data: data?.[0] || null }; // return a single post
  } catch (error) {
    console.error("Error fetching post:", error.message);
    return { success: false, data: null, error };
  }
};

export const PostLikes = async (LikedData) => {
  try {
    const { data, error } = await supabase
      .from("postlikes")
      .insert([LikedData])
      .select()
      .single();
    if (error) {
      console.log("postin error:", error);
      throw error;
    }
    return { success: true, data: data };
  } catch (error) {
    console.error(JSON.stringify(error));
    return { data: null, error };
  }
};
export const removeLikes = async (userId, postId) => {
  try {
    const { error } = await supabase
      .from("postlikes")
      .delete()
      .eq("userid", userId)
      .eq("postid", postId);

    if (error) {
      console.log("deletin post error:", error);
      throw error;
    }
    return { success: true };
  } catch (error) {
    console.error(JSON.stringify(error));
    return { data: null, error };
  }
};
export const checkUserLike = async (userId, postId) => {
  try {
    const { data, error } = await supabase
      .from("postLikes")
      .select("id")
      .eq("userid", userId)
      .eq("postid", postId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      throw error;
    }
    return { success: true, isLiked: !!data };
  } catch (error) {
    console.error("checkUserLike error:", error);
    return { success: false, error };
  }
};
// Fetch comments for a post
export const getPostComments = async (postId) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select("*, users(id, name, image)")
      .eq("postid", postId);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("getPostComments error:", err.message);
    throw err;
  }
};

// Add a comment
export const addComment = async (CommentData) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert([CommentData])
      .select("id")
      .single();

    if (error) throw error;
    return { success: true, id: data.id };
  } catch (err) {
    console.error("addComment error:", err.message);
    return { success: false };
  }
};
//delete comment
export const deleteComment = async (commentId) => {
  try {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.log("deletin comment error:", error);
      throw error;
    }
    return { success: true };
  } catch (error) {
    console.error(JSON.stringify(error));
    return { data: null, error };
  }
};
export const deletePost = async (PostId) => {
  try {
    const { error } = await supabase.from("posts").delete().eq("id", PostId);

    if (error) {
      console.log("deletin post error:", error);
      throw error;
    }
    return { success: true };
  } catch (error) {
    console.error(JSON.stringify(error));
    return { data: null, error };
  }
};
export const fetchPostDetails = async (postId) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(`*,postlikes (*),comments (*),users!posts_userid_fkey (*)`)
      .eq("id", postId)
      .single();
    if (error) {
      throw error;
    }
    return { success: true, data: data };
  } catch (error) {
    console.error(JSON.stringify(error));
    return { data: null, error };
  }
};
export const PostNotifications = async (NotificationData) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert([NotificationData])
      .select()
      .single();
    if (error) {
      console.log("postin error:", error);
      throw error;
    }
    return { success: true, data: data };
  } catch (error) {
    console.error(JSON.stringify(error));
    return { data: null, error };
  }
};
export const fetchNotifications = async (receiverId) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select(`*,users!notifications_senderid_fkey (*)`)
      .eq("receiveid", receiverId);
    if (error) {
      console.log("notification error:", error);
      throw error;
    }
    return { success: true, data: data };
  } catch (error) {
    console.error("catched notification error:", JSON.stringify(error));
    return { data: null, error };
  }
};
export const CreateBookmark = async (Data) => {
  try {
    const { data, error } = await supabase
      .from("bookmarks")
      .insert([Data])
      .select();
    if (error) {
      console.log("postin error:", error);
      throw error;
    }
    return { success: true, data: data };
  } catch (error) {
    console.error(JSON.stringify(error));
    return { data: null, error };
  }
};
export const removeBookmark = async (userId, postId) => {
  try {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("userid", userId)
      .eq("postid", postId);

    if (error) {
      console.log("deletin bookmark error:", error);
      throw error;
    }
    return { success: true };
  } catch (error) {
    console.error(JSON.stringify(error));
    return { data: null, error };
  }
};
export const FetchBookMarks = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("bookmarks")
      .select(
        `
        id,
        created_at,
    posts:bookmarks_postid_fkey (*,
          users:posts_userid_fkey (*), 
          postlikes (*, users:userid (*)),
          bookmarks (*, users:userid (*)),
          comments (*, users:userid (*))),
    users:bookmarks_userid_fkey (*)
      `,
      )
      .eq("userid", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return { success: true, data };
  } catch (err) {
    console.error("Error fetching bookmarks:", err.message);
    return { success: false, error: err.message };
  }
};
//chats
export const PostChats = async (CommentData) => {
  try {
    const { data, error } = await supabase
      .from("chats")
      .insert([CommentData])
      .select("id")
      .single();

    if (error) throw error;
    return { success: true, id: data.id };
  } catch (err) {
    console.error("PostChats error:", err.message);
    return { success: false };
  }
};
export const getChats = async (senderId) => {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select("*, users!chats_senderid_fkey (*)")
      .eq("senderid", senderId);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("getChats error:", err.message);
    throw err;
  }
};
export const getChatsBetweenUsers = async (currentUserId, otherUserId) => {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select("*, users!chats_senderid_fkey (*)")
      .or(
        `and(senderid.eq.${currentUserId},receiverid.eq.${otherUserId}),and(senderid.eq.${otherUserId},receiverid.eq.${currentUserId})`,
      )
      .order("createdat", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("getChatsBetweenUsers error:", err.message);
    throw err;
  }
};
// Get all unique conversations for a user
export const getChatConversations = async (userId) => {
  try {
    // First, get all chats where user is either sender or receiver
    const { data: chats, error } = await supabase
      .from("chats")
      .select("*, users!chats_senderid_fkey (*)")
      .or(`senderid.eq.${userId},receiverid.eq.${userId}`)
      .order("createdat", { ascending: false });

    if (error) throw error;

    // Group by other user and get latest message
    const conversationsMap = new Map();

    chats.forEach((chat) => {
      const otherUserId =
        chat.senderid === userId ? chat.receiverid : chat.senderid;

      if (!conversationsMap.has(otherUserId)) {
        // In lib/supabase.js - Add this function
        conversationsMap.set(otherUserId, {
          other_user: chat.users,
          last_message: chat,
        });
      }
    });

    // Convert map to array and get user details for each conversation
    const conversations = Array.from(conversationsMap.values());

    // Fetch complete user details for each conversation
    const conversationsWithUsers = await Promise.all(
      conversations.map(async (conv) => {
        if (conv.other_user.id === userId) {
          // This shouldn't happen, but just in case
          return conv;
        }

        // Get the other user's details
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", conv.other_user.id)
          .single();

        return {
          ...conv,
          other_user: userData || conv.other_user,
        };
      }),
    );

    return conversationsWithUsers;
  } catch (err) {
    console.error("getChatConversations error:", err.message);
    throw err;
  }
};
