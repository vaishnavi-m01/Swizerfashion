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
import ForgotPassword from "../screen/ForgotPassword";
import RazorpayPaymentScreen from "../screen/RazorpayPaymentScreen";
import SearchScreen from "../screen/SearchScreen";
import SupportHelpScreen from "../screen/SupportHelpScreen";
import PaymentMethodsScreen from "../screen/PaymentMethodsScreen";
import NotificationPreferencesScreen from "../screen/NotificationPreferencesScreen";
import PrivacySecurityScreen from "../screen/PrivacySecurityScreen";

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['https://www.swizerfashion.com', 'http://www.swizerfashion.com', 'swizerfashion://'],
  config: {
    screens: {
      ProductDetails: 'products/detail/:id',
    },
  },
};

export default function StackScreen() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="Splash"
        // screenOptions={{headerShown: true}}
        screenOptions={({ route }) => ({
          header: () => {
            if (route.name === "Splash") return null;

            const titleMap: Record<string, string> = {
              MainTabs: "Home",
              ProductList: "Products",
              CheckOutScreen: "Checkout",
              AddAddress: "Add Address",
              DeliveryAddress: "Delivery Address",
              OrderDetails: "Order Details",
              ForgotPassword: "Forgot Password",
              SupportHelpScreen: "Support & Help",
              PaymentMethodsScreen: "Payment Methods",
              NotificationPreferencesScreen: "Notifications",
              PrivacySecurityScreen: "Privacy & Security",
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

        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPassword}
          options={{ headerShown: true }} />

        <Stack.Screen name="Payment Screen" component={RazorpayPaymentScreen}
        options={{headerShown: false}} />

        <Stack.Screen
          name="SearchScreen"
          component={SearchScreen}
          options={{ headerShown: false, animation: 'fade' }} />

          <Stack.Screen
          name="SupportHelpScreen"
          component={SupportHelpScreen}
          options={{ headerShown: true }}/>

          <Stack.Screen
          name="PaymentMethodsScreen"
          component={PaymentMethodsScreen}
          options={{ headerShown: true }}/>

                   <Stack.Screen
          name="NotificationPreferencesScreen"
          component={NotificationPreferencesScreen}
          options={{ headerShown: true }}/>

          <Stack.Screen
          name="PrivacySecurityScreen"
          component={PrivacySecurityScreen}
          options={{ headerShown: true }}/>

      </Stack.Navigator>
    </NavigationContainer>
  );
}