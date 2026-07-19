import React from "react";
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, ToastAndroid } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { scale, verticalScale, fontScale } from "../utils/responsive";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCartCount } from '../store/slices/cartSlice';
import { addToWishlistAsync, removeFromWishlistAsync } from '../store/slices/wishlistSlice';
import api from "../config/apiConfig";

type Product = {
  id: number | string;
  name: string;
  image: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  inStock?: boolean;
};

type Props = {
  item: Product;
  index: number;
};

const BestSellingCard: React.FC<Props> = ({ item, index }) => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const userId = useAppSelector(state => state.auth.userId);
  const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn);
  const wishlistItems = useAppSelector(state => state.wishlist.items);

  const isWishlistLoaded = useAppSelector(state => state.wishlist.isLoaded);
  const addedVariantIds = useAppSelector(state => state.wishlist.addedVariantIds);
  const removedVariantIds = useAppSelector(state => state.wishlist.removedVariantIds);

  const currentVariantId = (item as any).variant_id ?? item.id;

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
            )
          : (item as any).is_wishlisted);

  const handleToggleFavorite = () => {
    if (!isLoggedIn) {
      navigation.navigate("Register");
      return;
    }

    const targetId = (item as any).product_id ?? (item.id as number);
    const variantId = (item as any).variant_id ?? undefined;

    if (isFavorite) {
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

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.95}
      onPress={() => navigation.push("ProductDetails", { product: item })}
    >
      <ImageBackground 
        source={{ uri: item.image }} 
        style={styles.imageBackground}
        imageStyle={{ borderRadius: scale(16) }}
      >
        
        {/* Top Badges */}
        <View style={styles.topRow}>
{/* 
          <LinearGradient 
            colors={['#E84C3D', '#C0392B']} 
            start={{x: 0, y: 0}} end={{x: 1, y: 1}}
            style={styles.rankBadge}
          >
            <Text style={styles.rankText}>#{index + 1} TOP</Text>
          </LinearGradient> */}

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity 
              style={[styles.favoriteIconWrap, { marginLeft: scale(6) }]} 
              onPress={handleToggleFavorite}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={scale(15)} 
                color={isFavorite ? "#E84C3D" : "#0A0A0A"} 
              />
            </TouchableOpacity> 
          </View>
        </View>

        {/* Bottom Info with Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
          style={styles.gradientOverlay}
        >
          <Text numberOfLines={2} style={styles.productName}>{item.name}</Text>
          
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.price}>{item.price}</Text>
              {item.oldPrice && <Text style={styles.oldPrice}>{item.oldPrice}</Text>}
            </View>

            <TouchableOpacity
              style={styles.addBtn}
              onPress={async () => {
                try {
                  const payload = {
                    user_id: userId ?? 0,
                    product_id: (item as any).product_id ?? null,
                    variant_id: (item as any).id ?? null,
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

                  navigation.navigate("MainTabs", {
                    screen: "CartTab",
                    params: { id: 1 },
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
                name={"bag-add"} 
                size={scale(18)} 
                color="#000" 
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default BestSellingCard;

const styles = StyleSheet.create({
  card: {
    width: scale(165),
    height: verticalScale(230),
    marginRight: scale(12),
    borderRadius: scale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
topRow: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: scale(10),
},
  rankBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(6),
    shadowColor: "#E84C3D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  rankText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: fontScale(10),
    letterSpacing: 0.5,
  },
  favoriteIconWrap: {
    backgroundColor: '#FFF',
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientOverlay: {
    padding: scale(12),
    borderBottomLeftRadius: scale(16),
    borderBottomRightRadius: scale(16),
    paddingTop: verticalScale(30),
  },
  productName: {
    color: "#FFF",
    fontSize: fontScale(12),
    fontWeight: "600",
    lineHeight: scale(16),
    marginBottom: verticalScale(8),
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    color: "#FFF",
    fontSize: fontScale(15),
    fontWeight: "800",
  },
  oldPrice: {
    color: "rgba(255,255,255,0.6)",
    fontSize: fontScale(11),
    textDecorationLine: "line-through",
    marginTop: 2,
  },
  addBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});