import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { StyleSheet, View, Text, Pressable } from "react-native";
import Placeholder from "@tiptap/extension-placeholder";

const TextEditor = ({ onChange, placeholder = "What's on your mind?" }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor",
      },
    },
  });

  if (!editor) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>Loading editor…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <ToolbarButton
          label="B"
          onPress={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="I"
          onPress={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="U"
          onPress={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          label="•"
          onPress={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="1."
          onPress={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          label="🔗"
          onPress={() => {
            const url = prompt("Enter URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        />
      </View>

      {/* Editor */}
      <EditorContent editor={editor} />
    </View>
  );
};

const ToolbarButton = ({ label, onPress }) => (
  <Pressable onPress={onPress} style={styles.button}>
    <Text style={styles.buttonText}>{label}</Text>
  </Pressable>
);

export default TextEditor;
const styles = StyleSheet.create({
  container: {
    minHeight: 200,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  toolbar: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  button: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  fallbackContainer: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    color: "#6B7280",
  },
});
