// import React from 'react';
// import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { moderateScale, scale, verticalScale } from '../utils/responsive';
// import { IMAGE_BASE_URL } from '../api/apiBaseUrl';
// import { useNavigation } from '@react-navigation/native';


// interface CartItemProps {
//   item: {
//     id: number;
//     quantity: number | string;
//     price: string;

//     product: {
//       id: number;
//       name: string;
//     };

//     size?: {
//       id: number;
//       name: string;
//       value?: string;
//     } | null;

//     color?: {
//       id: number;
//       name: string;
//       code?: string;
//     } | null;

//     product_varient: {
//       thumbnail: string;
//       price?: string;
//       discount_price?: string;
//     };
//   };

//   onRemove?: (id: number) => void;
//   onUpdateQuantity?: (id: number, quantity: number) => void;
//   onPress?: () => void;
// }

// const CartItem: React.FC<CartItemProps> = ({
//   item,
//   onRemove,
//   onUpdateQuantity,
//   onPress,
// }) => {
//   const price = parseFloat(item.price);
//   const quantity = parseInt(String(item.quantity), 10);
//   const originalPrice = item.product_varient?.price ? parseFloat(item.product_varient.price) : null;
//   const hasDiscount = originalPrice && originalPrice > price;

//   const navigation = useNavigation<any>();
//   const imageUri = item.product_varient?.thumbnail
//     ? (item.product_varient.thumbnail.startsWith('http')
//       ? item.product_varient.thumbnail
//       : `${IMAGE_BASE_URL}${item.product_varient.thumbnail}`)
//     : undefined;

//   return (
//     <View style={styles.container}>
//       <Pressable style={styles.cartCard} 
//       // onPress={onPress}
//             onPress={() => navigation.navigate("ProductDetails", { product: item })}
//     android_ripple={{ color: '#F5F5F5' }}>
//         {/* Product Image */}
//         <View style={styles.imageWrapper}>
//           {imageUri ? (
//             <Image
//               source={{ uri: imageUri }}
//               style={styles.cardImage}
//             />
//           ) : (
//             <View style={[styles.cardImage, styles.imagePlaceholder]}>
//               <Ionicons name="image-outline" size={28} color="#CCC" />
//             </View>
//           )}
//         </View>

//         {/* Card Info */}
//         <View style={styles.cardInfo}>
//           {/* Name + Delete */}
//           <View style={styles.cardHeaderRow}>
//             <Text style={styles.cardName} numberOfLines={2}>
//               {item.product.name}
//             </Text>
//             <TouchableOpacity
//               style={styles.deleteBtn}
//               onPress={() => onRemove?.(item.id)}
//               hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//             >
//               <Ionicons name="trash-outline" size={scale(16)} color="#E84C3D" />
//             </TouchableOpacity>
//           </View>

//           {/* Size & Color Tags */}
//           <View style={styles.tagsRow}>
//             {item.size && (
//               <View style={styles.tag}>
//                 <Text style={styles.tagText}>Size: {item.size.name}</Text>
//               </View>
//             )}
//             {item.color && (
//               <View style={styles.tag}>
//                 {item.color.code && (
//                   <View style={[styles.colorDot, { backgroundColor: item.color.code }]} />
//                 )}
//                 <Text style={styles.tagText}>{item.color.name}</Text>
//               </View>
//             )}
//           </View>

//           {/* Price Row */}
//           <View style={styles.priceRow}>
//             <Text style={styles.priceText}>₹{price.toFixed(0)}</Text>
//             {hasDiscount && (
//               <Text style={styles.oldPriceText}>₹{originalPrice!.toFixed(0)}</Text>
//             )}
//           </View>

//           {/* Subtotal + Qty Controls */}
//           <View style={styles.cardFooterRow}>
//             {/* <Text style={styles.cardSubtotal}>₹{(price * quantity).toFixed(0)}</Text> */}

//             <View style={styles.qtyControls}>
//               <TouchableOpacity
//                 style={styles.qtyBtn}
//                 onPress={() => onUpdateQuantity?.(item.id, Math.max(1, quantity - 1))}
//                 disabled={quantity <= 1}
//               >
//                 <Ionicons name="remove" size={scale(14)} color={quantity <= 1 ? '#CCC' : '#000'} />
//               </TouchableOpacity>

//               <Text style={styles.qtyVal}>{quantity}</Text>

//               <TouchableOpacity
//                 style={styles.qtyBtn}
//                 onPress={() => onUpdateQuantity?.(item.id, quantity + 1)}
//               >
//                 <Ionicons name="add" size={scale(14)} color="#000" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Pressable>
//     </View>
//   );
// };

// export default CartItem;

// const styles = StyleSheet.create({
//   container: {
//     marginBottom: verticalScale(12),
//   },
//   cartCard: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     borderRadius: moderateScale(14),
//     borderWidth: 1,
//     borderColor: '#F0F0F0',
//     padding: moderateScale(12),
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.04,
//     shadowRadius: 4,
//     elevation: 1,
//   },
//   imageWrapper: {
//     marginRight: scale(12),
//   },
//   cardImage: {
//     width: scale(86),
//     height: verticalScale(100),
//     borderRadius: moderateScale(10),
//     resizeMode: 'cover',
//     backgroundColor: '#F6F6F6',
//   },
//   imagePlaceholder: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   cardInfo: {
//     flex: 1,
//     justifyContent: 'space-between',
//   },
//   cardHeaderRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//   },
//   cardName: {
//     flex: 1,
//     fontSize: moderateScale(13.5),
//     fontWeight: '700',
//     color: '#0A0A0A',
//     marginRight: scale(8),
//     lineHeight: moderateScale(19),
//   },
//   deleteBtn: {
//     padding: scale(2),
//   },
//   tagsRow: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: scale(6),
//     marginTop: verticalScale(6),
//   },
//   tag: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F5F5F5',
//     borderRadius: moderateScale(6),
//     paddingHorizontal: scale(8),
//     paddingVertical: verticalScale(3),
//     gap: scale(4),
//   },
//   tagText: {
//     fontSize: moderateScale(11),
//     color: '#555',
//     fontWeight: '600',
//   },
//   colorDot: {
//     width: scale(10),
//     height: scale(10),
//     borderRadius: scale(5),
//     borderWidth: 0.5,
//     borderColor: '#DDD',
//   },
//   priceRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: scale(6),
//     marginTop: verticalScale(6),
//   },
//   priceText: {
//     fontSize: moderateScale(14),
//     fontWeight: '800',
//     color: '#0A0A0A',
//   },
//   oldPriceText: {
//     fontSize: moderateScale(11.5),
//     color: '#999',
//     textDecorationLine: 'line-through',
//     fontWeight: '500',
//   },
//   cardFooterRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: verticalScale(8),
//   },
//   cardSubtotal: {
//     fontSize: moderateScale(15),
//     fontWeight: '800',
//     color: '#0A0A0A',
//   },
//   qtyControls: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E8E8E8',
//     borderRadius: moderateScale(8),
//     overflow: 'hidden',
//   },
//   qtyBtn: {
//     width: scale(30),
//     height: scale(30),
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F8F8F8',
//   },
//   qtyVal: {
//     paddingHorizontal: scale(12),
//     fontSize: moderateScale(13),
//     fontWeight: '700',
//     color: '#0A0A0A',
//   },
// });


import React from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
      thumbnail: string;
      price?: string;
      discount_price?: string;
    };
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

  const navigation = useNavigation<any>();
  const imageUri = item.product_varient?.thumbnail
    ? (item.product_varient.thumbnail.startsWith('http')
      ? item.product_varient.thumbnail
      : `${IMAGE_BASE_URL}${item.product_varient.thumbnail}`)
    : undefined;

  // console.log("ProductVarientItem", item)
  // console.log("ProductCartVarientId",item.variant_id)
  return (
    <View style={styles.container}>
      {/* Top Left Checkbox Button */}
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => onToggleSelect?.(item.variant_id)}
      // onPress={() => navigation.navigate("ProductDetails", { product: item })}

      >
        <Ionicons
          name={item.selected !== false ? "checkbox" : "square-outline"}
          size={scale(20)}
          color={item.selected !== false ? "#0A0A0A" : "#CCC"}
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

              <Text style={styles.qtyVal}>{quantity}</Text>

              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => onUpdateQuantity?.(item.id, quantity + 1)}
              >
                <Ionicons name="add" size={scale(14)} color="#000" />
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
  qtyVal: {
    paddingHorizontal: scale(10),
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: '#0A0A0A',
  },
});