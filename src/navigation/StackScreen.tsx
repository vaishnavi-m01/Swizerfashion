import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../type/type";
import { Header } from "../component/Header";
import SplashScreen from "../screen/SplashScreen";
import { Tabs } from "react-native-screens";
import MainTabNavigator from "./Tabs";



const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackScreen() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={({ route }) => ({
          header: (props) => {
            if (route.name === "Splash") return null;
            return <Header title={route.name} />;
          },
        })}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name = "MainTabs" component={MainTabNavigator} options={{headerShown:false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}