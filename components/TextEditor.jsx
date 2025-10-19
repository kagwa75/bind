import { Platform, Text, View } from "react-native";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";

const TextEditor = ({ editorRef, onChange, placeholder }) => {
  if (Platform.OS !== "web" && typeof window === "undefined") {
    return null;
  }
  return (
    <View className="min-h-20">
      <RichToolbar
        editor={editorRef}
        actions={[
          actions.undo,
          actions.redo,
          actions.insertVideo,
          actions.insertImage,
          actions.setStrikethrough,
          actions.insertOrderedList,
          actions.blockquote,
          actions.alignLeft,
          actions.alignCenter,
          actions.alignRight,
          actions.code,
          actions.line,
          actions.foreColor,
          actions.hiliteColor,
          actions.heading1,
          actions.heading4,
          "insertEmoji",
          "insertHTML",
          "fontSize",
        ]}
        iconMap={{
          [actions.foreColor]: () => <Text>FC</Text>,
          [actions.hiliteColor]: () => <Text>BC</Text>,
          [actions.heading1]: () => <Text>H1</Text>,
          [actions.heading4]: () => <Text>H4</Text>,
          insertEmoji: () => <Text>😊</Text>,
          insertHTML: () => <Text>HTML</Text>,
          fontSize: () => <Text>FS</Text>,
        }}
        selectedIconTint="#ef4444" // Use hex color instead of Tailwind class
        disabled={false}
      />
      <RichEditor
        ref={editorRef}
        containerStyle={{
          minHeight: 180,
          padding: 20,
          borderTopWidth: 0,
          flex: 1,
          elevation: 2,
          padding: 5,
          borderBottomLeftRadius: "0.75rem",
          borderBottomRightRadius: "0.75rem",
        }}
        editorStyle={{
          backgroundColor: "white",
          color: "black",
        }}
        placeholder={placeholder}
        onChange={onChange}
      />
    </View>
  );
};

export default TextEditor;
