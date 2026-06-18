import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const SplashScreen = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("MainTabs"); 
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#000"
        barStyle="light-content"
      />

      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>S</Text>
        </View>

        <Text style={styles.brandName}>SWIZER</Text>
        <Text style={styles.brandSubTitle}>FASHION</Text>

        <View style={styles.line} />

        <Text style={styles.tagline}>
          Style • Elegance • Fashion
        </Text>
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 80,
  },

  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },

  logoText: {
    fontSize: 55,
    color: "#D4AF37",
    fontWeight: "bold",
  },

  brandName: {
    fontSize: 34,
    color: "#FFFFFF",
    fontWeight: "bold",
    letterSpacing: 5,
  },

  brandSubTitle: {
    marginTop: 6,
    fontSize: 16,
    color: "#D4AF37",
    letterSpacing: 8,
  },

  line: {
    width: 130,
    height: 2,
    backgroundColor: "#D4AF37",
    marginVertical: 22,
  },

  tagline: {
    color: "#BDBDBD",
    fontSize: 14,
    letterSpacing: 2,
  },
});