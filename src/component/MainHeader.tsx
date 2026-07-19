import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, HORIZONTAL_PADDING } from '../utils/responsive';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';
import api from '../config/apiConfig';

const logo = require('../asset/images/logo.png');

interface Props {
  title?: string; 
  onSearchPress?: () => void;
  showAddress?: boolean;
  hideCartIcon?: boolean;
  hideWishlistIcon?: boolean;
}

const MainHeader: React.FC<Props> = ({ 
  onSearchPress, 
  showAddress = false, 
  hideCartIcon = false, 
  hideWishlistIcon = false 
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const cartCount = useAppSelector(state => state.cart.cartCount);
  const wishlistItems = useAppSelector(state => state.wishlist.items);
  
  const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn);
  const user = useAppSelector(state => state.auth.user);
  const [defaultAddress, setDefaultAddress] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      if (showAddress && isLoggedIn && user?.id) {
        api.get(`/address?user_id=${user.id}`).then(res => {
          if (res.data?.status && res.data?.data && res.data.data.length > 0) {
            setDefaultAddress(res.data.data[0]);
          } else {
            setDefaultAddress(null);
          }
        }).catch(err => {
          console.log('Error fetching address in MainHeader:', err);
        });
      } else {
        setDefaultAddress(null);
      }
    }, [isLoggedIn, user, showAddress])
  );

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
        {/* Left Section: Logo or Address */}
        <View style={styles.headerLeft}>
          {showAddress && defaultAddress ? (
            <TouchableOpacity 
                activeOpacity={0.8} 
                onPress={() => navigation.navigate('DeliveryAddress')}
                style={styles.addressContainer}
            >
                <View style={styles.addressTopRow}>
                    <Text style={styles.addressTypeText}>{defaultAddress.type || 'Other'}</Text>
                    <Ionicons name="chevron-down" size={scale(16)} color="#0A0A0A" style={styles.addressIcon} />
                </View>
                <Text style={styles.addressText} numberOfLines={1}>
                    {defaultAddress.address}, {defaultAddress.city}, {defaultAddress.pincode}
                </Text>
            </TouchableOpacity>
          ) : (
            <Image source={logo} style={styles.logoImage} resizeMode="contain" />
          )}
        </View>

        {/* Right Section: Action Buttons */}
        <View style={styles.headerRight}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.headerIcon} 
            onPress={onSearchPress || (() => navigation.navigate('SearchScreen'))}
          >
            <Ionicons name="search-outline" size={scale(20)} color="#1A1A1A" />
          </TouchableOpacity>

          {!hideWishlistIcon && (
            <TouchableOpacity 
              activeOpacity={0.7} 
              style={styles.headerIcon} 
              onPress={() => navigation.navigate("Wishlist")}
            >
              <Ionicons name="heart-outline" size={scale(20)} color="#1A1A1A" />
              {wishlistItems.length > 0 && <View style={styles.notificationDot} />}
            </TouchableOpacity>
          )}

          {!hideCartIcon && (
            <TouchableOpacity 
              activeOpacity={0.7} 
              style={styles.headerIcon} 
              onPress={() => navigation.navigate("CartTab")}
            >
              <Ionicons name="cart-outline" color="#1A1A1A" size={24} />
              {cartCount > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default MainHeader;

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#FFFFFF',
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
    height: verticalScale(56), 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  headerLeft: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1,
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
    backgroundColor: '#F8F9FA', 
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(12),
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#E84C3D',
    borderRadius: scale(10),
    minWidth: scale(16),
    height: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(4),
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: scale(9),
    fontWeight: 'bold',
  },
  notificationDot: {
    position: 'absolute',
    top: scale(11),
    right: scale(11),
    width: scale(7),
    height: scale(7),
    borderRadius: scale(3.5),
    backgroundColor: '#FF3B30', 
    borderWidth: 1.5,
    borderColor: '#FFFFFF', 
  },
  addressContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  addressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressTypeText: {
    fontSize: scale(16),
    fontWeight: '800',
    color: '#0A0A0A',
  },
  addressIcon: {
    marginLeft: scale(4),
    marginTop: scale(2),
  },
  addressText: {
    fontSize: scale(12),
    color: '#555',
    marginTop: scale(2),
    maxWidth: scale(180),
  },
});