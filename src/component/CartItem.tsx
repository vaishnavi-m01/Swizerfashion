
import React, { useRef, useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { moderateScale, scale, verticalScale } from '../utils/responsive';
import { IMAGE_BASE_URL } from '../api/apiBaseUrl';
import { useNavigation } from '@react-navigation/native';

interface CartItemProps {
  item: {
    id: number;
    quantity: number | string;
    price: string;
    selected?: boolean; 
    variant_id?:number;

    product: {
      id: number;
      name: string;
    };

    size?: {
      id: number;
      name: string;
      value?: string;
    } | null;

    color?: {
      id: number;
      name: string;
      code?: string;
    } | null;

    product_varient: {
      id?: number;
      thumbnail: string;
      price?: string;
      discount_price?: string;
      stock?: number;
      in_stock?: boolean;
    };
    out_of_stock?: boolean;
    in_stock?: boolean;
    stock?: number;
  };

  onRemove?: (id: number) => void;
  onUpdateQuantity?: (id: number, quantity: number) => void;
  onToggleSelect?: (id: number) => void; // Added for checkbox toggle
  onPress?: () => void;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onRemove,
  onUpdateQuantity,
  onToggleSelect,
}) => {
  const price = parseFloat(item.price);
  const quantity = parseInt(String(item.quantity), 10);
  const originalPrice = item.product_varient?.price ? parseFloat(item.product_varient.price) : null;
  const hasDiscount = originalPrice && originalPrice > price;

  const isOutOfStock = 
    item.out_of_stock === true || 
    item.in_stock === false || 
    item.product_varient?.stock === 0 || 
    (item.product as any)?.stock === 0 || 
    item.stock === 0 || 
    item.product_varient?.in_stock === false || 
    (item.product as any)?.in_stock === false;

  const slideAnim = useRef(new Animated.Value(0)).current;
  const prevQty = useRef(quantity);

  useEffect(() => {
    if (quantity !== prevQty.current) {
      const isIncrease = quantity > prevQty.current;
      prevQty.current = quantity;
      slideAnim.setValue(isIncrease ? -20 : 20);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 28,
        bounciness: 6,
      }).start();
    }
  }, [quantity]);

  const navigation = useNavigation<any>();
  const rawThumbnail = item.product_varient?.thumbnail || (item.product as any)?.thumbnail || (item.product as any)?.image;
  const imageUri = rawThumbnail
    ? (rawThumbnail.startsWith('http')
      ? rawThumbnail
      : `${IMAGE_BASE_URL}${rawThumbnail}`)
    : undefined;

  // console.log("ProductVarientItem", item)
  // console.log("ProductCartVarientId",item.variant_id)
  return (
    <View style={styles.container}>
      {/* Top Left Checkbox Button */}
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => !isOutOfStock && item.variant_id !== undefined && onToggleSelect?.(item.variant_id)}
        disabled={isOutOfStock}
      >
        <Ionicons
          name={item.selected !== false && !isOutOfStock ? "checkbox" : "square-outline"}
          size={scale(20)}
          color={item.selected !== false && !isOutOfStock ? "#0A0A0A" : "#CCC"}
        />
      </TouchableOpacity>

      <Pressable
        style={styles.cartCard}
        onPress={() => navigation.navigate("ProductDetails", { 
          product: {
            ...item.product,
            id: item.variant_id || item.product_varient?.id
          },
          variant_id: item.variant_id || item.product_varient?.id
        })}
        android_ripple={{ color: '#F5F5F5' }}
      >
        {/* Product Image */}
        <View style={styles.imageWrapper}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImage, styles.imagePlaceholder]}>
              <Ionicons name="image-outline" size={28} color="#CCC" />
            </View>
          )}
        </View>

        {/* Card Info */}
        <View style={styles.cardInfo}>
          {/* Name + Delete */}
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardName} numberOfLines={2}>
              {item.product.name}
            </Text>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => onRemove?.(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={scale(16)} color="#E84C3D" />
            </TouchableOpacity>
          </View>

          {/* Size & Color Tags */}
          <View style={styles.tagsRow}>
            {item.size && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>Size: {item.size.name}</Text>
              </View>
            )}
            {item.color && (
              <View style={styles.tag}>
                {item.color.code && (
                  <View style={[styles.colorDot, { backgroundColor: item.color.code }]} />
                )}
                <Text style={styles.tagText}>{item.color.name}</Text>
              </View>
            )}
            {isOutOfStock && (
              <View style={[styles.tag, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.tagText, { color: '#DC2626', fontWeight: '700' }]}>Out of Stock</Text>
              </View>
            )}
          </View>

          {/* Price & Quantity Footer Row */}
          <View style={styles.cardFooterRow}>
            {/* Price Info (Left Side) */}
            <View style={styles.priceCol}>
              <Text style={styles.priceText}>₹{price.toFixed(0)}</Text>
              {hasDiscount && (
                <Text style={styles.oldPriceText}>₹{originalPrice!.toFixed(0)}</Text>
              )}
            </View>

            {/* Qty Controls (Right Side) */}
            <View style={styles.qtyControls}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => onUpdateQuantity?.(item.id, Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Ionicons name="remove" size={scale(14)} color={quantity <= 1 ? '#CCC' : '#000'} />
              </TouchableOpacity>

              <View style={styles.qtyNumWrapper}>
                <Animated.Text
                  style={[
                    styles.qtyVal,
                    { transform: [{ translateY: slideAnim }] },
                  ]}
                >
                  {quantity}
                </Animated.Text>
              </View>

              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => onUpdateQuantity?.(item.id, quantity + 1)}
                disabled={isOutOfStock}
              >
                <Ionicons name="add" size={scale(14)} color={isOutOfStock ? '#CCC' : '#000'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

export default CartItem;

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(12),
    position: 'relative',
  },
  checkboxContainer: {
    position: 'absolute',
    top: scale(-6),
    left: scale(-6),
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: scale(4),
    padding: scale(2),
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: moderateScale(12),
    paddingTop: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  imageWrapper: {
    marginRight: scale(12),
    justifyContent: 'center',
  },
  cardImage: {
    width: scale(86),
    height: verticalScale(100),
    borderRadius: moderateScale(10),
    resizeMode: 'cover',
    backgroundColor: '#F6F6F6',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardName: {
    flex: 1,
    fontSize: moderateScale(13.5),
    fontWeight: '700',
    color: '#0A0A0A',
    marginRight: scale(8),
    lineHeight: moderateScale(19),
  },
  deleteBtn: {
    padding: scale(2),
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(6),
    marginTop: verticalScale(4),
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(6),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    gap: scale(4),
  },
  tagText: {
    fontSize: moderateScale(11),
    color: '#555',
    fontWeight: '600',
  },
  colorDot: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    borderWidth: 0.5,
    borderColor: '#DDD',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  priceCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  priceText: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    color: '#0A0A0A',
  },
  oldPriceText: {
    fontSize: moderateScale(11.5),
    color: '#999',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: moderateScale(8),
    overflow: 'hidden',
    backgroundColor: '#F8F8F8',
  },
  qtyBtn: {
    width: scale(28),
    height: scale(28),
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyNumWrapper: {
    width: scale(28),
    height: scale(28),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyVal: {
    paddingHorizontal: scale(2),
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: '#0A0A0A',
    textAlign: 'center',
  },
});