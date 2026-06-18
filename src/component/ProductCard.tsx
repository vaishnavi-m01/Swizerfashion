import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { scale, verticalScale, fontScale } from "../utils/responsive";

type Product = {
  id: number | string;
  name: string;
  image: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
};

type Props = {
  item: Product;
  onPress?: () => void;
};

const ProductCard: React.FC<Props> = ({ item, onPress }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

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

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
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
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.productCard}
        onPress={onPress}
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
                {item.discount || `${discountPercent}% OFF`}
              </Text>
            </View>
          )}

          {/* Stock Status */}
          {item.inStock === false && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}

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
            style={[
              styles.addButton,
              item.inStock === false && styles.addButtonDisabled,
            ]}
            onPress={onPress}
            disabled={item.inStock === false}
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
    marginRight: scale(12),
    marginBottom: verticalScale(8),
  },

  productCard: {
    width: scale(160),
    backgroundColor: "#FFFFFF",
    borderRadius: scale(14),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  productImageWrap: {
    position: "relative",
    backgroundColor: "#F5F5F5",
    overflow: "hidden",
  },

  productImage: {
    width: "100%",
    height: verticalScale(200),
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
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(6),
    shadowColor: "#E84C3D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
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
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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