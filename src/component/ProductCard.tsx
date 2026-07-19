import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ToastAndroid,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { scale, verticalScale, fontScale } from "../utils/responsive";
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCartCount } from '../store/slices/cartSlice';
import { addToWishlistAsync, removeFromWishlistAsync } from '../store/slices/wishlistSlice';
import api from '../config/apiConfig';

type Product = {
  id: number | string;
  product_id?: number;
  variant_id?: number;
  product?: any;
  name: string;
  image: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  is_wishlisted?: boolean
};

type Props = {
  item: Product;
  onPress?: () => void;
  isGrid?: boolean;
};

const ProductCard: React.FC<Props> = ({ item, onPress, isGrid = false }) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector(state => state.wishlist.items);
  const userId = useAppSelector(state => state.auth.userId);

  const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn);

  const isWishlistLoaded = useAppSelector(state => state.wishlist.isLoaded);
  const addedVariantIds = useAppSelector(state => state.wishlist.addedVariantIds);
  const removedVariantIds = useAppSelector(state => state.wishlist.removedVariantIds);

  const currentVariantId = (item as any).variant_id ?? item.id;
  
  const apiWishlisted = item.is_wishlisted === "1" || item.is_wishlisted === 1 || item.is_wishlisted === true;

  const isFavorite = addedVariantIds.includes(currentVariantId)
    ? true
    : removedVariantIds.includes(currentVariantId)
      ? false
      : (isWishlistLoaded 
          ? wishlistItems.some(
              w => 
                String(w.variant_id) === String(currentVariantId) ||
                String(w.product_id) === String((item as any).product_id ?? item.id) ||
                String(w.id) === String(item.id)
            ) || apiWishlisted
          : apiWishlisted);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  //handleToggle
  const handleToggleFavorite = () => {
    if (!isLoggedIn) {
      navigation.navigate("Register");
      return;
    }

    const targetId = (item as any).product_id ?? (item.id as number);
    const variantId = (item as any).variant_id ?? undefined;

    if (isFavorite) {
      // 1. Find the current item saved inside the global Redux state list to get its metadata
      const existingWishlistItem = wishlistItems.find(
        (wishlistItem) => wishlistItem.product_id === item.id || wishlistItem.id === item.id
      );

      const removePayload = {
        productId: targetId,
        wishlistItemId: existingWishlistItem?.id,
        variantId: variantId,
      };

      dispatch(removeFromWishlistAsync(removePayload) as any).then(() => {
        ToastAndroid.show("Removed from wishlist", ToastAndroid.SHORT);
      });
    } else {
      const addPayload = {
        product_id: targetId,
        variant_id: variantId,
        product: item,
      };

      dispatch(addToWishlistAsync(addPayload) as any).then(() => {
        ToastAndroid.show("Added to wishlist", ToastAndroid.SHORT);
      });
    }
  };

  const calculateDiscount = () => {
    if (item.price && item.oldPrice) {
      const price = parseFloat(item.price.replace(/[^0-9]/g, ""));
      const oldPrice = parseFloat(item.oldPrice.replace(/[^0-9]/g, ""));
      if (oldPrice > price) {
        return Math.round(((oldPrice - price) / oldPrice) * 100);
      }
    }
    return null;
  };

  const discountPercent = calculateDiscount();

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        isGrid && styles.cardWrapperGrid,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.productCard, isGrid && styles.productCardGrid]}
        // onPress={onPress}
        onPress={() => navigation.push("ProductDetails", { product: item })}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {/* Image Container */}
        <View style={styles.productImageWrap}>
          <Image source={{ uri: item.image }} style={styles.productImage} />

          {/* Image Overlay Gradient Effect */}
          <View style={styles.imageOverlay} />

          {/* Discount Badge */}
          {(item.discount || discountPercent) && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {item.discount || ""}
              </Text>
            </View>
          )}

          {/* Stock Status removed from card, shown only in details and cart */}

          {/* Favorite Button */}
          <TouchableOpacity
            style={[
              styles.favorite,
              isFavorite && styles.favoriteActive,
            ]}
            onPress={handleToggleFavorite}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={scale(16)}
              color={isFavorite ? "#E84C3D" : "#0A0A0A"}
            />
          </TouchableOpacity>
        </View>

        {/* Content Container */}
        <View style={styles.productContent}>
          {/* Product Name */}
          <Text numberOfLines={2} style={styles.productName}>
            {item.name}
          </Text>

          {/* Rating Section */}
          {item.rating !== undefined && (
            <View style={styles.ratingContainer}>
              <View style={styles.starsRow}>
                {[...Array(5)].map((_, i) => (
                  <MaterialIcons
                    key={i}
                    name="star"
                    size={scale(12)}
                    color={i < Math.floor(item.rating || 0) ? "#FFC107" : "#E0E0E0"}
                  />
                ))}
              </View>
              {item.reviews && (
                <Text style={styles.reviewsText}>({item.reviews})</Text>
              )}
            </View>
          )}

          {/* Price Row */}
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>{item.price}</Text>

            {item.oldPrice && (
              <Text style={styles.oldPrice}>{item.oldPrice}</Text>
            )}
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            style={styles.addButton}
            // onPress={onPress}
            onPress={async () => {
              if (!isLoggedIn) {
                navigation.navigate('Register');
                return;
              }

              try {
                const payload = {
                  user_id: userId ?? 0,
                  product_id: (item as any).product_id ?? null,
                  variant_id: (item as any).id ?? (item as any).id ?? null,
                  quantity: 1,
                  size_id: (item as any).size_id ?? (item as any).size?.id ?? null,
                  color_id: (item as any).color_id ?? (item as any).color?.id ?? null,
                };

                console.log('[Cart] POST /cart/add REQUEST:', JSON.stringify(payload, null, 2));
                const response = await api.post('/cart/add', payload);
                console.log('[Cart] POST /cart/add RESPONSE:', JSON.stringify(response.data, null, 2));

                if (response.data.data?.cart_count !== undefined) {
                    dispatch(setCartCount(response.data.data.cart_count));
                }
                ToastAndroid.show("Added to cart", ToastAndroid.SHORT);

                navigation.navigate('MainTabs', {
                  screen: 'CartTab',
                });
              } catch (error: any) {
                console.log('[Cart] POST /cart/add ERROR:');
                console.log('  Status :', error?.response?.status);
                console.log('  Message:', error?.response?.data?.message);
                console.log('  Errors :', JSON.stringify(error?.response?.data?.errors, null, 2));
              }
            }}
          >
            <Ionicons
              name="bag-add-outline"
              size={scale(16)}
              color="#FFF"
            />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  cardWrapper: {
    marginRight: scale(10),
    marginBottom: verticalScale(8),
  },

  cardWrapperGrid: {
    width: '48%',
    marginBottom: verticalScale(16),
  },

  productCard: {
    width: scale(165),
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EBEBEB",
  },

  productCardGrid: {
    width: "100%",
  },

  productImageWrap: {
    position: "relative",
    backgroundColor: "#F5F5F5",
    overflow: "hidden",
  },

  productImage: {
    width: "100%",
    height: verticalScale(160),
    resizeMode: "cover",
  },

  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },

  discountBadge: {
    position: "absolute",
    left: scale(8),
    top: scale(8),
    backgroundColor: "#E84C3D",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(4),
  },

  discountText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: fontScale(10),
    letterSpacing: 0.3,
  },

  outOfStockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  outOfStockText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: fontScale(12),
  },

  favorite: {
    position: "absolute",
    right: scale(8),
    top: scale(8),
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EBEBEB",
  },

  favoriteActive: {
    backgroundColor: "#FFE8E4",
  },

  productContent: {
    padding: scale(10),
    flex: 1,
    justifyContent: "space-between",
  },

  productName: {
    fontSize: fontScale(13),
    fontWeight: "600",
    color: "#0A0A0A",
    lineHeight: scale(16),
    marginBottom: verticalScale(4),
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(6),
  },

  starsRow: {
    flexDirection: "row",
    gap: scale(2),
    marginRight: scale(6),
  },

  reviewsText: {
    fontSize: fontScale(11),
    color: "#888",
    fontWeight: "500",
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    marginBottom: verticalScale(8),
  },

  productPrice: {
    fontSize: fontScale(14),
    fontWeight: "700",
    color: "#0A0A0A",
  },

  oldPrice: {
    fontSize: fontScale(12),
    color: "#AAA",
    textDecorationLine: "line-through",
    fontWeight: "500",
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(6),
    backgroundColor: "#0A0A0A",
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
    marginTop: verticalScale(6),
  },

  addButtonDisabled: {
    backgroundColor: "#CCC",
    opacity: 0.6,
  },

  addButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: fontScale(12),
  },
});