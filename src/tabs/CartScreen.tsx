import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Dimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import CartItem from '../component/CartItem';
import { useNavigation } from '@react-navigation/native';

import { useAppSelector, useAppDispatch } from '../store/hooks';
import { removeFromCart, updateQuantity } from '../store/slices/cartSlice';

const { width } = Dimensions.get('window');

const CartScreen = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const dispatch = useAppDispatch();

    const cartItems = useAppSelector(state => state.cart.items);
    const [isCheckoutModalVisible, setCheckoutModalVisible] = useState(false);
    const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);

    const handleRemove = (id: string) => {
        dispatch(removeFromCart(id));
    };

    const handleUpdateQuantity = (id: string, newQuantity: number) => {
        dispatch(updateQuantity({ id, quantity: newQuantity }));
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const deliveryFee = subtotal > 1499 ? 0 : 99;
    const grandTotal = subtotal + (cartItems.length > 0 ? deliveryFee : 0);

    const handleCheckout = () => {
        // setCheckoutModalVisible(true);
    };


    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Cart</Text>
                {cartItems.length > 0 && (
                    <Text style={styles.headerCount}>{cartItems.length} Items</Text>
                )}
            </View>

            {cartItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={scale(80)} color="#EFEFEF" />
                    <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
                    <Text style={styles.emptySubtitle}>Looks like you haven't added anything to your cart yet.</Text>
                    <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('HomeTab')}>
                        <Text style={styles.shopBtnText}>Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <ScrollView style={styles.mainWrapper} contentContainerStyle={styles.itemList} showsVerticalScrollIndicator={false}>
                        {cartItems.map((item) => (
                            <CartItem
                                key={item.id}
                                item={item}
                                onRemove={handleRemove}
                                onUpdateQuantity={handleUpdateQuantity}
                                onPress={() => navigation.navigate('ProductDetails', { product: item.product })}
                            />
                        ))}

                        {/* Promo Code */}
                        <View style={styles.promoCard}>
                            <Ionicons name="pricetag-outline" size={18} color="#0A0A0A" />
                            <TextInput
                                style={styles.promoInput}
                                placeholder="Enter Promo Code"
                                placeholderTextColor="#888"
                            />
                            <TouchableOpacity style={styles.promoBtn}>
                                <Text style={styles.promoBtnText}>Apply</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Order Summary */}
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Order Summary</Text>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal</Text>
                                <Text style={styles.summaryVal}>₹{subtotal}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                                <Text style={styles.summaryVal}>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</Text>
                            </View>
                            {deliveryFee > 0 && (
                                <Text style={styles.freeShippingTip}>Add ₹{1500 - subtotal} more for free shipping!</Text>
                            )}
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryRow}>
                                <Text style={styles.grandTotalLabel}>Total</Text>
                                <Text style={styles.grandTotalVal}>₹{grandTotal}</Text>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : verticalScale(16) }]}>
                        <View style={styles.footerPriceCol}>
                            <Text style={styles.footerPriceLabel}>Total Price</Text>
                            <Text style={styles.footerPriceVal}>₹{grandTotal}</Text>
                        </View>
                        <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate("CheckOutScreen")}>
                            <Text style={styles.checkoutBtnText}>Checkout</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}



        </SafeAreaView>
    );
};

export default CartScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(14),
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
    },
    headerTitle: {
        fontSize: moderateScale(18),
        fontWeight: '900',
        color: '#0A0A0A',
    },
    headerCount: {
        fontSize: moderateScale(13),
        fontWeight: '600',
        color: '#0A0A0A',
    },
    mainWrapper: {
        flex: 1,
    },
    itemList: {
        padding: moderateScale(16),
        paddingBottom: verticalScale(40),
    },
    promoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: '#EFEFEF',
        paddingHorizontal: scale(12),
        height: verticalScale(48),
        marginVertical: verticalScale(4),
    },
    promoInput: {
        flex: 1,
        fontSize: moderateScale(13),
        color: '#0A0A0A',
        marginLeft: scale(8),
        padding: moderateScale(0),
    },
    promoBtn: {
        backgroundColor: 'rgba(10, 10, 10, 0.05)',
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: moderateScale(6),
    },
    promoBtnText: {
        color: '#0A0A0A',
        fontSize: moderateScale(12),
        fontWeight: '700',
    },
    summaryCard: {
        backgroundColor: '#ffffff',
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: '#EFEFEF',
        padding: moderateScale(16),
        marginTop: verticalScale(16),
    },
    summaryTitle: {
        fontSize: moderateScale(14),
        fontWeight: '800',
        color: '#0A0A0A',
        marginBottom: verticalScale(12),
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: verticalScale(4),
    },
    summaryLabel: {
        fontSize: moderateScale(13),
        color: '#666',
        fontWeight: '500',
    },
    summaryVal: {
        fontSize: moderateScale(13),
        color: '#0A0A0A',
        fontWeight: '700',
    },
    freeShippingTip: {
        fontSize: moderateScale(10.5),
        color: '#0A0A0A',
        fontWeight: '600',
        marginTop: verticalScale(4),
    },
    summaryDivider: {
        height: verticalScale(1),
        backgroundColor: '#EFEFEF',
        marginVertical: verticalScale(10),
    },
    grandTotalLabel: {
        fontSize: moderateScale(15),
        fontWeight: '800',
        color: '#0A0A0A',
    },
    grandTotalVal: {
        fontSize: moderateScale(16),
        fontWeight: '900',
        color: '#0A0A0A',
    },
    footer: {
        flexDirection: 'row',
        padding: moderateScale(16),
        borderTopWidth: 1,
        borderTopColor: '#EFEFEF',
        backgroundColor: '#ffffff',
        alignItems: 'center',
    },
    footerPriceCol: {
        flex: 1,
    },
    footerPriceLabel: {
        fontSize: moderateScale(11),
        color: '#666',
        fontWeight: '500',
    },
    footerPriceVal: {
        fontSize: moderateScale(18),
        fontWeight: '900',
        color: '#0A0A0A',
    },
    checkoutBtn: {
        flex: 1.5,
        height: verticalScale(46),
        backgroundColor: '#0A0A0A',
        borderRadius: moderateScale(8),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkoutBtnText: {
        color: '#ffffff',
        fontSize: moderateScale(14.5),
        fontWeight: '800',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scale(32),
    },
    emptyTitle: {
        fontSize: moderateScale(18),
        fontWeight: '800',
        color: '#0A0A0A',
        marginTop: verticalScale(16),
    },
    emptySubtitle: {
        fontSize: moderateScale(13),
        color: '#666',
        textAlign: 'center',
        marginTop: verticalScale(6),
        lineHeight: moderateScale(18),
    },
    shopBtn: {
        backgroundColor: '#0A0A0A',
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(8),
        marginTop: verticalScale(20),
    },
    shopBtnText: {
        color: '#ffffff',
        fontSize: moderateScale(13.5),
        fontWeight: '700',
    },


});