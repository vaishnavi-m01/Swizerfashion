import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import 'react-native-gesture-handler';
import StackScreen from "./src/navigation/StackScreen";
import { Provider } from "react-redux";
import { store } from "./src/store/store";
import { setAuthToken } from "./src/config/apiConfig";
import { useAppDispatch } from "./src/store/hooks";
import { login } from "./src/store/slices/authSlice";
import { loadAuthState } from "./src/utils/storage";

const AppInner = () => {
  const dispatch = useAppDispatch();
  const [rehydrated, setRehydrated] = useState(false);

  useEffect(() => {
    const restoreAuth = async () => {
      const persistedAuth = await loadAuthState();
      console.log('=== APP START — Persisted Auth ===');
      console.log('persistedAuth:', JSON.stringify(persistedAuth, null, 2));

      if (persistedAuth?.token) {
        setAuthToken(persistedAuth.token);
        dispatch(login(persistedAuth));
        console.log('[App] Restored auth from AsyncStorage ✓');
      } else {
        console.log('[App] No persisted auth found');
      }
      setRehydrated(true);
    };

    restoreAuth();
  }, [dispatch]);

  if (!rehydrated) {
    return null;
  }

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

const App = () => {
  return (
    <Provider store={store}>
      <AppInner />
    </Provider>
  );
};

export default App;