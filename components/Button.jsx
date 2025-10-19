import { Text, TouchableOpacity } from "react-native";
const Button = ({
  buttonStyle,
  textStyle,
  title,
  onPress,
  hasShadow = true,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex ${hasShadow && "shadow-lg shadow-black/20"} bg-orange-700 items-center justify-center py-4 rounded-lg mb-6 ${buttonStyle}`}
    >
      <Text
        className={`text-center font-medium text-lg text-white ${textStyle}`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
