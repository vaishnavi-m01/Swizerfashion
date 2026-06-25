import "react-native-reanimated";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import 'react-native-gesture-handler';
import StackScreen from "./src/navigation/StackScreen";
import { Provider } from "react-redux";
import { store } from "./src/store/store";

const App = () => {
  return (
    <Provider store={store}>
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
    </Provider>
  );
};

export default App;