import React from "react";
import { Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { moderateScale, scale, verticalScale } from "../utils/responsive";
import Ionicons from "react-native-vector-icons/Ionicons";

interface WishlistCardProps {
    item: {
        id: string | number;
        name: string;
        image: string;
        price: string;
        oldPrice?: string;
    };
    onRemove?: (id: string | number) => void;
    onAddToCart?: (item: any) => void;
    onPress?: () => void;
}

const WishlistCard: React.FC<WishlistCardProps> = ({ item, onRemove, onAddToCart, onPress }) => {
    return (
        <TouchableOpacity style={styles.wishlistCard} activeOpacity={1} onPress={onPress}>
            {/* Image Container */}
            <View style={styles.productImageWrap}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                {onRemove && (
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={() => onRemove(item.id)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="heart" size={scale(15)} color="#FFFFFF" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Product Details */}
            <View style={styles.detailsWrap}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.price}>{item.price}</Text>
                    {item.oldPrice && <Text style={styles.oldPrice}>{item.oldPrice}</Text>}
                </View>
            </View>

            {/* Action Button */}
            {onAddToCart && (
                <TouchableOpacity
                    style={styles.addToCartBtn}
                    onPress={() => onAddToCart(item)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="bag-add-outline" size={scale(14)} color="#FFFFFF" style={styles.cartIcon} />
                    <Text style={styles.addToCartText}>ADD TO CART</Text>
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