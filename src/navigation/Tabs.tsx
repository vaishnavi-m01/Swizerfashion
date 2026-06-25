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
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? 85 + insets.bottom : 60 + (insets.bottom || 10),
          paddingBottom: insets.bottom || 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: scale(10.5),
          fontWeight: "600",
          marginTop: 4,
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
              size={scale(22)}
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
        options={{ tabBarLabel: "Cart" }}
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
