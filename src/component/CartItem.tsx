import React from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from "../theme/Colors";
import { moderateScale, scale, verticalScale } from "../utils/responsive";

interface CartItemProps {
    item: {
        id: string;
        product: {
            id: string | number;
            image: string;
            name: string;
            price: number | string;
        };
        quantity: number;
        size: string;
    };
    onRemove?: (id: string) => void;
    onUpdateQuantity?: (id: string, newQuantity: number) => void;
    onPress?: () => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onRemove, onUpdateQuantity, onPress }) => {
    // Parse price to ensure it's a number
    const price = typeof item.product.price === 'string' 
        ? parseFloat(item.product.price.replace(/[^0-9.]/g, '')) 
        : item.product.price;
        
    return (
        <View style={styles.container}>
            <Pressable style={styles.cartCard} onPress={onPress}>
                <Image source={{ uri: item.product.image }} style={styles.cardImage} />
                <View style={styles.cardInfo}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardName} numberOfLines={1}>
                            {item.product.name}
                        </Text>
                        <TouchableOpacity
                            onPress={() => onRemove && onRemove(item.id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons name="trash-outline" size={18} color="#E84C3D" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.cardDetailText}>Size: <Text style={styles.boldText}>{item.size}</Text></Text>
                    <Text style={styles.cardDetailText}>Price: <Text style={styles.boldText}>₹{price}</Text></Text>

                    <View style={styles.cardFooterRow}>
                        <Text style={styles.cardSubtotal}>₹{price * item.quantity}</Text>

                        <View style={styles.qtyControls}>
                            <TouchableOpacity
                                style={styles.qtyBtn}
                                onPress={() => onUpdateQuantity && onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            >
                                <Ionicons name="remove" size={14} color="#0A0A0A" />
                            </TouchableOpacity>
                            <Text style={styles.qtyVal}>{item.quantity}</Text>
                            <TouchableOpacity
                                style={styles.qtyBtn}
                                onPress={() => onUpdateQuantity && onUpdateQuantity(item.id, item.quantity + 1)}
                            >
                                <Ionicons name="add" size={14} color="#0A0A0A" />
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
    },
    cartCard: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: '#EFEFEF',
        padding: moderateScale(12),
    },
    cardImage: {
        width: scale(80),
        height: verticalScale(90),
        borderRadius: moderateScale(8),
        resizeMode: 'cover',
        backgroundColor: '#f1f3f5',
    },
    cardInfo: {
        flex: 1,
        marginLeft: scale(12),
        justifyContent: 'space-between',
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardName: {
        fontSize: moderateScale(14),
        fontWeight: '800',
        color: '#0A0A0A',
        flex: 0.9,
    },
    cardDetailText: {
        fontSize: moderateScale(12),
        color: '#666',
        marginTop: verticalScale(2),
    },
    boldText: {
        fontWeight: '700',
        color: '#0A0A0A',
    },
    cardFooterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: verticalScale(6),
    },
    cardSubtotal: {
        fontSize: moderateScale(15),
        fontWeight: '900',
        color: '#0A0A0A',
    },
    qtyControls: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EFEFEF',
        borderRadius: moderateScale(6),
        height: verticalScale(28),
    },
    qtyBtn: {
        width: scale(28),
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyVal: {
        fontSize: moderateScale(12),
        fontWeight: '800',
        color: '#0A0A0A',
        paddingHorizontal: scale(8),
    },
});