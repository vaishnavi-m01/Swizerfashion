import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import HomeScreen from "../tabs/HomeScreen";
import MenuScreen from "../tabs/MenuScreen";
import CartScreen from "../tabs/CartScreen";
import OrderScreen from "../tabs/OrderScreen";
import ProfileScreen from "../tabs/ProfileScreen";
import { scale } from "../utils/responsive";
import { useAppSelector } from "../store/hooks";

export type MainTabParamList = {
  HomeTab: undefined;
  ProductsTab: undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const cartItemsCount = useAppSelector(state => state.cart.cartCount);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#0A0A0A",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6', 
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: -2 },
          height: Platform.OS === 'ios' ? scale(65) + Math.max(insets.bottom, scale(20)) : scale(75) + Math.max(insets.bottom, scale(15)),
          paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, scale(20)) : Math.max(insets.bottom, scale(15)),
          paddingTop: scale(10),
        },
        tabBarLabelStyle: {
          fontSize: scale(11),
          fontWeight: "600",
          marginTop: scale(4),
        },
        // Removing the default gray ripple effect
        tabBarButton: (props) => (
          <TouchableOpacity 
            {...(props as any)} 
            activeOpacity={0.7}
            style={props.style}
          />
        ),
        tabBarIcon: ({ color, focused }) => {
          let iconName = "";

          switch (route.name) {
            case "HomeTab":
              iconName = focused ? "home" : "home-outline";
              break;
            case "ProductsTab":
              iconName = focused ? "grid" : "grid-outline";
              break;
            case "CartTab":
              iconName = focused ? "cart" : "cart-outline";
              break;
            case "OrdersTab":
              iconName = focused ? "receipt" : "receipt-outline";
              break;
            case "ProfileTab":
              iconName = focused ? "person" : "person-outline";
              break;
          }

          return (
            <Ionicons
              name={iconName}
              size={scale(24)}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="ProductsTab"
        component={MenuScreen}
        options={{ tabBarLabel: "Shop" }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{ 
          tabBarLabel: "Cart",
          tabBarBadge: cartItemsCount > 0 ? cartItemsCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#E53E3E', color: 'white', fontSize: 10 }
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrderScreen}
        options={{ tabBarLabel: "Orders" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
}
