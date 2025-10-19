import { Image, TextInput, View } from "react-native";

const Input = ({
  className,
  icon, // React element (e.g. <Feather />)
  iconSource, // For image icons
  placeholder,
  placeholderTextColor = "#999",
  value,
  onChangeText,
  secureTextEntry = false,
  ...props // capture all other TextInput props (editable, multiline, keyboardType, etc.)
}) => {
  return (
    <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-4">
      {icon && <View className="mr-2">{icon}</View>}
      {iconSource && (
        <Image
          resizeMode="contain"
          className="w-5 h-5 mr-2"
          source={iconSource}
        />
      )}
      <TextInput
        autoCapitalize="none"
        className={`flex-1 text-base text-gray-800 ${className || ""}`}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        {...props}
      />
    </View>
  );
};

export default Input;
