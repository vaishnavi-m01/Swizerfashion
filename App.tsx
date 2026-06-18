import "react-native-reanimated";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import 'react-native-gesture-handler';
import StackScreen from "./src/navigation/StackScreen";

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
          <StatusBar
            translucent
            backgroundColor="transparent"
            barStyle="light-content"
          />
          <StackScreen />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;