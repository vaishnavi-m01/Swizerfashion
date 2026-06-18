import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

import HomeScreen from "../screen/HomeScreen";
import MenuScreen from "../screen/MenuScreen";


import { colors } from "../theme/Colors";
import CartScreen from "../screen/CartScreen";
import OrderScreen from "../screen/OrderScreen";
import ProfileScreen from "../screen/ProfileScreen";

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

        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#999",

        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#EEEEEE",
          height: 65 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 4,
        },

        tabBarIcon: ({ color, focused, size }) => {
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
              size={24}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
        }}
      />

      <Tab.Screen
        name="ProductsTab"
        component={MenuScreen}
        options={{
          tabBarLabel: "Products",
        }}
      />

      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarLabel: "Cart",
        }}
      />

      <Tab.Screen
        name="OrdersTab"
        component={OrderScreen}
        options={{
          tabBarLabel: "Orders",
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}