import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screen/SplashScreen";
import MainTabNavigator from "./Tabs";
import ProductList from "../screen/ProductList";
import ProductDetails from "../screen/ProductDetails";
import Wishlist from "../screen/Wishlist";
import Header from "../component/Header";
import CheckOutScreen from "../screen/CheckOutScreen";
import AddAddress from "../screen/AddAddress";
import DeliveryAddress from "../screen/DeliveryAddress";
import OrderDetails from "../screen/OrderDetails";
import Login from "../screen/Login";
import Register from "../screen/Register";

const Stack = createNativeStackNavigator();

export default function StackScreen() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        // screenOptions={{headerShown: true}}
        screenOptions={({ route }) => ({
          header: () => {
            if (route.name === "Splash") return null;

            const titleMap: Record<string, string> = {
              MainTabs: "Home",
              ProductList: "Products",
            };

            return (
              <Header
                title={titleMap[route.name] || route.name}
              />
            );
          },
        })}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
        />

        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ProductList"
          component={ProductList}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ProductDetails"
          component={ProductDetails}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Wishlist"
          component={Wishlist}
          options={{ headerShown: true }} />

        <Stack.Screen
          name="CheckOutScreen"
          component={CheckOutScreen}
          options={{ headerShown: true }} />

        <Stack.Screen
          name="AddAddress"
          component={AddAddress}
          options={{ headerShown: true }} />

        <Stack.Screen
          name="DeliveryAddress"
          component={DeliveryAddress}
          options={{ headerShown: true }} />

        <Stack.Screen
          name="OrderDetails"
          component={OrderDetails}
          options={{ headerShown: true }} />

        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: true }} />

        <Stack.Screen
          name="Register"
          component={Register}
          options={{ headerShown: true }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}