import { Platform, StyleSheet, Text, View } from "react-native";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";



// Custom toolbar icons with better styling
const ToolbarIcon = ({ children, color = "#374151" }) => (
  <Text style={[styles.toolbarIcon, { color }]}>{children}</Text>
);

const TextEditor = ({ editorRef, onChange, placeholder = "What's on your mind?" }) => {
  const handleChange = (content) => {
    onChange(content);
  };

  // Platform check with better handling
  if (Platform.OS === "web" && typeof window === "undefined") {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>
          Text editor not available in this environment
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <View style={styles.toolbarContainer}>
        <RichToolbar
          editor={editorRef}
          actions={[
            actions.undo,
            actions.redo,
            actions.setBold,
            actions.setItalic,
            actions.setUnderline,
            actions.insertBulletsList,
            actions.insertOrderedList,
            actions.insertLink,
            actions.removeFormat,
            actions.keyboard,
          ]}
          iconMap={{
            [actions.undo]: () => <ToolbarIcon>↶</ToolbarIcon>,
            [actions.redo]: () => <ToolbarIcon>↷</ToolbarIcon>,
            [actions.setBold]: () => <ToolbarIcon>𝐁</ToolbarIcon>,
            [actions.setItalic]: () => <ToolbarIcon>𝐼</ToolbarIcon>,
            [actions.setUnderline]: () => <ToolbarIcon>U̲</ToolbarIcon>,
            [actions.insertBulletsList]: () => <ToolbarIcon>•</ToolbarIcon>,
            [actions.insertOrderedList]: () => <ToolbarIcon>1.</ToolbarIcon>,
            [actions.insertLink]: () => <ToolbarIcon>🔗</ToolbarIcon>,
            [actions.removeFormat]: () => <ToolbarIcon>␡</ToolbarIcon>,
            [actions.keyboard]: () => <ToolbarIcon>⌨</ToolbarIcon>,
          }}
          selectedIconTint="#3B82F6"
          disabledIconTint="#9CA3AF"
          iconSize={22}
          style={styles.toolbar}
        />
      </View>

      {/* Editor */}
      <View style={styles.editorContainer}>
        <RichEditor
          ref={editorRef}
          containerStyle={styles.editorWrapper}
          editorStyle={styles.editor}
          placeholder={placeholder}
          onChange={handleChange}
          initialHeight={180}
          autoCapitalize="sentences"
          autoCorrect={true}
          useContainer={true}
          enterKeyHint="default"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 200,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  toolbarContainer: {
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  toolbar: {
    backgroundColor: "transparent",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  toolbarIcon: {
    fontSize: 16,
    fontWeight: "600",
  },
  editorContainer: {
    flex: 1,
  },
  editorWrapper: {
    flex: 1,
    backgroundColor: "white",
  },
  editor: {
    backgroundColor: "white",
    color: "#111827",
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    caretColor: "#3B82F6",
  },
  fallbackContainer: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  fallbackText: {
    color: "#6B7280",
    fontSize: 14,
  },
});

export default TextEditor;