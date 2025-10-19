import { Feather } from "@expo/vector-icons";
import { View } from "react-native";
import backArrow from "../assets/icons/left-arrow.png";

const edit = () => {
  return (
    <View>
      <Feather name="edit-3" size={18} color="black" />;
    </View>
  );
};
const home = () => {
  return (
    <View>
      <Feather name="home" size={18} color="black" />;
    </View>
  );
};
const create = () => {
  return (
    <View>
      <Feather name="plus-square" size={18} color="black" />;
    </View>
  );
};
const search = () => {
  return (
    <View>
      <Feather name="search" size={18} color="black" />;
    </View>
  );
};
const Icons = {
  backArrow,
  edit,
  home,
  create,
  search,
};
export default Icons;
