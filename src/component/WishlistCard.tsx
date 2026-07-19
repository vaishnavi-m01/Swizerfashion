import React from "react";
import { Image, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { moderateScale, scale, verticalScale } from "../utils/responsive";
import Ionicons from "react-native-vector-icons/Ionicons";
import { IMAGE_BASE_URL } from "../api/apiBaseUrl";
import { useNavigation } from '@react-navigation/native';

interface WishlistCardProps {
    item: {
        id: string | number;
        product_id?: number;
        variant_id?: number;
        product?: any;
        // flat shape fallbacks
        name?: string;
        image?: string;
        price?: string;
        oldPrice?: string;
        product_varient?: any;
    };
    onRemove?: (item: any) => void;
    onAddToCart?: (item: any) => void;
    onPress?: () => void;
    isAddingToCart?: boolean;
}




const WishlistCard: React.FC<WishlistCardProps> = ({ item, onRemove, onAddToCart, onPress, isAddingToCart }) => {
    const productData = item.product ?? item;
    console.log("WishlistCard ProductDetails", item)
    const name = productData.name ?? '';
    const resolveImage = (value?: string) => {
        if (!value) return '';
        if (value.startsWith('http')) return value;
        return `${IMAGE_BASE_URL}${value.startsWith('/') ? value.slice(1) : value}`;
    };
    const image = resolveImage(productData.image ?? productData.thumbnail ?? item.product_varient?.thumbnail ?? '');
    const priceValue = productData.discount_price ?? productData.price ?? item.product_varient?.discount_price ?? item.product_varient?.price ?? item.price ?? productData.base_price;
    const price = priceValue != null && priceValue !== '' ? `₹${priceValue}` : '';
    const oldPrice = productData.old_price != null ? `₹${productData.old_price}` : (item.oldPrice ?? undefined);
    const navigation = useNavigation<any>();


    const handlePress = () => {
        const variantId = item.product_varient?.id ?? item.variant_id;
        if (!variantId) return;
        navigation.push("ProductDetails", { id: variantId });
    };

    return (
        <TouchableOpacity style={styles.wishlistCard} activeOpacity={1} onPress={handlePress}>
            {/* Image Container */}
            <View style={styles.productImageWrap}>
                <Image source={{ uri: image || 'https://via.placeholder.com/300x400?text=No+Image' }} style={styles.productImage} />
                {onRemove && (
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={() => onRemove(item)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="heart" size={scale(15)} color="#FFFFFF" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Product Details */}
            <View style={styles.detailsWrap}>
                <Text style={styles.productName} numberOfLines={1}>{name}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.price}>{price}</Text>
                    {oldPrice && <Text style={styles.oldPrice}>{oldPrice}</Text>}
                </View>
            </View>

            {/* Action Button */}
            {onAddToCart && (
                <TouchableOpacity
                    style={[styles.addToCartBtn, isAddingToCart && styles.addToCartBtnDisabled]}
                    onPress={() => !isAddingToCart && onAddToCart(item)}
                    disabled={isAddingToCart}
                    activeOpacity={0.7}
                >
                    {isAddingToCart ? (
                        <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: scale(6) }} />
                    ) : (
                        <Ionicons name="bag-add-outline" size={scale(14)} color="#FFFFFF" style={styles.cartIcon} />
                    )}
                    <Text style={styles.addToCartText}>
                        {isAddingToCart ? 'PROCESSING...' : 'ADD TO CART'}
                    </Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

export default WishlistCard;

const styles = StyleSheet.create({
    wishlistCard: {
        width: scale(165),
        backgroundColor: "#FFFFFF",
        marginBottom: verticalScale(24),
        borderWidth: 1,
        borderColor: '#EFEFEF',
        borderRadius: moderateScale(8),
        overflow: 'hidden',
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    productImageWrap: {
        position: 'relative',
        backgroundColor: "#F4F4F4",
        width: "100%",
        height: verticalScale(160),
        overflow: "hidden",
    },
    productImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    favoriteButton: {
        position: "absolute",
        right: scale(8),
        top: scale(8),
        width: scale(28),
        height: scale(28),
        borderRadius: scale(14),
        backgroundColor: "#E84C3D",
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    detailsWrap: {
        padding: moderateScale(10),
    },
    productName: {
        fontSize: moderateScale(12.5),
        fontWeight: "500",
        color: "#555",
        marginBottom: verticalScale(4),
        letterSpacing: 0.3,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    price: {
        fontSize: moderateScale(13.5),
        fontWeight: "800",
        color: "#111",
    },
    oldPrice: {
        fontSize: moderateScale(11),
        fontWeight: "400",
        color: "#999",
        textDecorationLine: 'line-through',
        marginLeft: scale(6),
    },
    addToCartBtn: {
        flexDirection: 'row',
        paddingVertical: verticalScale(10),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0A0A0A',
    },
    addToCartBtnDisabled: {
        backgroundColor: '#555555',
    },
    cartIcon: {
        marginRight: scale(6),
    },
    addToCartText: {
        fontSize: moderateScale(10.5),
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: 0.5,
    }
});