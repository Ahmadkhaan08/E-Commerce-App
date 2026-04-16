import FloatingCart from "@/components/home-screen/FloatingCart";
import { useStore } from "@/store/useStore";
import { Feather } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const mainQueryClient = new QueryClient();

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  const cartCount = useStore((s) => s.cartCount);
  const wishlistCount = useStore((s) => s.wishlistCount);
  const refreshCounts = useStore((s) => s.refreshCounts);

  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  return (
    <QueryClientProvider client={mainQueryClient}>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: "#edf3ff" },
            tabBarActiveTintColor: "#4b63df",
            tabBarInactiveTintColor: "#7682a8",
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "700",
              marginBottom: Platform.OS === "ios" ? 0 : 2,
            },
            tabBarStyle: {
              height: 72 + Math.max(insets.bottom, 4),
              paddingTop: 8,
              paddingBottom: Math.max(insets.bottom, 8),
              borderTopColor: "#d7e2ff",
              backgroundColor: "#ffffff",
              shadowColor: "#9fb1e8",
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
              elevation: 10,
            },
            tabBarItemStyle: {
              paddingVertical: 4,
            },
            tabBarBadgeStyle: {
              backgroundColor: "#ff4d6d",
              color: "#ffffff",
              fontSize: 10,
              fontWeight: "700",
              minWidth: 18,
              height: 18,
              lineHeight: 16,
              borderRadius: 9,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, focused }) => (
                <Feather name="home" size={focused ? 26 : 23} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              title: "Search",
              tabBarIcon: ({ color, focused }) => (
                <Feather name="search" size={focused ? 26 : 23} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="cart"
            options={{
              title: "Cart",
              tabBarBadge: cartCount > 0 ? (cartCount > 99 ? "99+" : cartCount) : undefined,
              tabBarIcon: ({ color, focused }) => (
                <Feather
                  name="shopping-cart"
                  size={focused ? 26 : 23}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="wishlist"
            options={{
              title: "Wishlist",
              tabBarBadge:
                wishlistCount > 0
                  ? wishlistCount > 99
                    ? "99+"
                    : wishlistCount
                  : undefined,
              tabBarIcon: ({ color, focused }) => (
                <Feather name="heart" size={focused ? 26 : 23} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, focused }) => (
                <Feather name="user" size={focused ? 26 : 23} color={color} />
              ),
            }}
          />

          <Tabs.Screen name="categories" options={{ href: null }} />
          <Tabs.Screen name="products" options={{ href: null }} />
          <Tabs.Screen name="search-results" options={{ href: null }} />
          <Tabs.Screen name="checkout" options={{ href: null }} />
          <Tabs.Screen name="filters" options={{ href: null }} />
          <Tabs.Screen name="product/[id]" options={{ href: null }} />
          <Tabs.Screen name="order-tracking/[id]" options={{ href: null }} />
          <Tabs.Screen name="about" options={{ href: null }} />
          <Tabs.Screen name="help-support" options={{ href: null }} />
          <Tabs.Screen name="notifications" options={{ href: null }} />
          <Tabs.Screen name="payment-methods" options={{ href: null }} />
          <Tabs.Screen name="addresses" options={{ href: null }} />
          <Tabs.Screen name="my-orders" options={{ href: null }} />
          <Tabs.Screen name="edit-profile" options={{ href: null }} />
          <Tabs.Screen name="brands" options={{ href: null }} />
          <Tabs.Screen name="terms" options={{ href: null }} />
          <Tabs.Screen name="privacy" options={{ href: null }} />
          <Tabs.Screen name="payment-success" options={{ href: null }} />
        </Tabs>

        <FloatingCart />
      </View>
    </QueryClientProvider>
  );
}
