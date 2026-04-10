import { ScrollView, Text, View } from "react-native";
import TopHeader from "./TopHeader";
import Logo from "../common/Logo";
import Sidebar from "./Sidebar";
import SearchInput from "./SearchInput";

const Header = () => {
  return (
    <ScrollView stickyHeaderIndices={[0]} className="border-b top-0 z-50 bg-babyshopWhite">
      <TopHeader />
      <View className="flex-row items-center justify-between gap-5 p-2">
        <View className="flex-row  items-center  gap-2">
          <Sidebar />
          <Logo />
        </View>

        <View className="flex-row  items-center   gap-2">
          <Text>Order</Text>
          <Text>Wishlist</Text>
          <Text>Cart</Text>
        </View>
        <View className="mr-3">
          <SearchInput />
        </View>
      </View>
    </ScrollView>
  );
};

export default Header;
