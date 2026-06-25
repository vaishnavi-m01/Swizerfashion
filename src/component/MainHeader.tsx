import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, HORIZONTAL_PADDING } from '../utils/responsive';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';

const logo = require('../asset/images/logo.png');

interface Props {
  title?: string; 
  onSearchPress?: () => void;
}

const MainHeader: React.FC<Props> = ({ onSearchPress }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const cartItems = useAppSelector(state => state.cart.items);
  const cartCount = cartItems.length;

  return (
    <View
      style={[
        styles.headerWrapper,
        { 
          paddingTop: insets.top > 0 ? insets.top : verticalScale(12),
        }
      ]}
    >
      <View style={styles.headerContainer}>
        {/* Left Section: Logo */}
        <View style={styles.headerLeft}>
          <Image source={logo} style={styles.logoImage} resizeMode="contain" />
        </View>

        {/* Right Section: Action Buttons */}
        <View style={styles.headerRight}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.headerIcon} 
            onPress={onSearchPress}
          >
            <Ionicons name="search-outline" size={scale(20)} color="#1A1A1A" />
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.headerIcon} 
            onPress={() => navigation.navigate("Wishlist")}
          >
            <Ionicons name="heart-outline" size={scale(20)} color="#1A1A1A" />
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.headerIcon} 
            onPress={() => navigation.navigate("CartTab")}
          >
            {/* <Ionicons name="bag-handle-outline" size={scale(20)} color="#1A1A1A" /> */}
            <Ionicons name="cart-outline" color="#1A1A1A" size={24} />
            {cartCount > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default MainHeader;

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#FFFFFF',
    // Ultra-subtle, premium bottom border instead of harsh rounded corners
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7', 
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerContainer: {
    height: verticalScale(56), // Fixed content height for UI consistency
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  headerLeft: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  logoImage: {
    width: scale(105),
    height: verticalScale(32),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: '#F8F9FA', // Cleaner, brighter gray
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(12),
    // Subtle border for the button to make it pop over backgrounds
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  notificationDot: {
    position: 'absolute',
    top: scale(11),
    right: scale(11),
    width: scale(7),
    height: scale(7),
    borderRadius: scale(3.5),
    backgroundColor: '#FF3B30', // Apple System Red
    borderWidth: 1.5,
    borderColor: '#FFFFFF', // Creates a sharp cutout mask look
  },
});