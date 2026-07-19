import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    Animated,
    Easing
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import CartItem from '../component/CartItem';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCartCount } from '../store/slices/cartSlice';
import api from '../config/apiConfig';

const { width } = Dimensions.get('window');

const CartScreen = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const dispatch = useAppDispatch();
    const userId = useAppSelector(state => state.auth.userId);
    const wishlistItems = useAppSelector(state => state.wishlist.items);

    const [cartItems, setCartItems] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // Pull values safely from API response
    const subtotal = summary?.subtotal ?? 0;
    const gst = summary?.gst ?? 0;
    const deliveryFee = summary?.shipping ?? 0;
    const shippingLabel = summary?.shipping_label;
    const grandTotal = summary?.total ?? 0;
    const selectedItems = cartItems.filter(item => item.selected);
    console.log("selectedItemsCart", selectedItems);

    // Derived condition for free delivery animation
    const isFreeDelivery = deliveryFee === 0 && subtotal > 0;

    // ─── ANIMATION SETUP ───────────────────────────────────────────
    const shimmerAnim = useRef(new Animated.Value(-1)).current;
    const truckAnim = useRef(new Animated.Value(-100)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Shimmer Loop
    useEffect(() => {
        const shimmerLoop = Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 2,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        shimmerLoop.start();
        return () => shimmerLoop.stop();
    }, [shimmerAnim]);

    const shimmerTranslate = shimmerAnim.interpolate({
        inputRange: [-1, 2],
        outputRange: [-width * 0.6, width * 0.6],
    });

    // Free Delivery Banner Animations
    useEffect(() => {
        if (isFreeDelivery) {
            Animated.sequence([
                Animated.timing(truckAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(pulseAnim, { toValue: 1.04, duration: 700, useNativeDriver: true }),
                        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
                    ])
                ),
            ]).start();
        } else {
            truckAnim.setValue(-100);
            pulseAnim.setValue(1);
        }
    }, [isFreeDelivery, truckAnim, pulseAnim]);


    console.log("CartScreen Summary", summary);

   useFocusEffect(
    React.useCallback(() => {
        if (userId) {
            getCart();
        } else {
            setCartItems([]);
            setSummary(null);
            dispatch(setCartCount(0));
        }
    }, [userId])
);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getCart();
    }, []);

    const getCart = async () => {
        try {
            setLoading(true);
            const response = await api.get('/cart');
            if (response.data.status) {
                const items = response.data.data.cart_items ?? [];
                const count = response.data.data.cart_count ?? items.length;
                const itemsWithSelection = items.map((item: any) => ({
                    ...item,
                    selected: true
                }));
                setCartItems(itemsWithSelection);
                setSummary(response.data.data.summary);
                dispatch(setCartCount(count));
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const updateSummaryFromBackend = async (currentItems: any[]) => {
        try {
            setSummaryLoading(true);
            const selectedIds = currentItems
                .filter(item => item.selected)
                .map(item => item.id);

            if (selectedIds.length === 0) {
                setSummary({ subtotal: 0, gst: 0, shipping: 0, shipping_label: 'Free', total: 0 });
                return;
            }

            const response = await api.post('/cart/summary', { cart_ids: selectedIds, user_id: userId });
            if (response.data.status) {
                setSummary(response.data.data.summary);
            }
        } catch (error) {
            console.log("Error updating summary:", error);
        } finally {
            setSummaryLoading(false);
        }
    };

    const handleRemove = async (id: number) => {
        try {
            await api.delete('/cart/remove', {
                data: { cart_id: id }
            });
            getCart();
        } catch (error) {
            console.log(error);
        }
    };

    const handleUpdateQuantity = async (id: number, quantity: number) => {
        try {
            await api.put('/cart/update', {
                cart_id: id,
                quantity,
                user_id: userId,
            });
            setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
            getCart();
        } catch (error) {
            console.log(error);
        }
    };

    const handleToggleSelect = (id: number) => {
        const updatedItems = cartItems.map(item =>
            item.id === id ? { ...item, selected: !item.selected } : item
        );
        setCartItems(updatedItems);
        updateSummaryFromBackend(updatedItems);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Shopping Bag</Text>
                    <Text style={styles.headerCount}>{cartItems.length} Items</Text>
                </View>
                <TouchableOpacity 
                    activeOpacity={0.7} 
                    style={styles.headerIcon} 
                    onPress={() => navigation.navigate("Wishlist")}
                >
                    <Ionicons name="heart-outline" size={scale(20)} color="#1A1A1A" />
                    {wishlistItems.length > 0 && <View style={styles.notificationDot} />}
                </TouchableOpacity>
            </View>
            {loading && cartItems.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0A0A0A" />
                    <Text style={styles.loadingText}>Loading your cart...</Text>
                </View>
            ) : cartItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={scale(80)} color="#EFEFEF" />
                    <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
                    <Text style={styles.emptySubtitle}>Looks like you haven't added anything to your cart yet.</Text>
                    <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'ProductsTab' })}>
                        <Text style={styles.shopBtnText}>Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <ScrollView
                        style={styles.mainWrapper}
                        contentContainerStyle={styles.itemList}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#0A0A0A']}
                                tintColor="#0A0A0A"
                            />
                        }
                    >
                        {/* Free Delivery Animated Notice (Optional implementation using your truckAnim/pulseAnim variables) */}
                        {isFreeDelivery && (
                            <Animated.View style={[styles.freeDeliveryBanner, { transform: [{ scale: pulseAnim }] }]}>
                                <Animated.View style={{ transform: [{ translateX: truckAnim }] }}>
                                    <Ionicons name="bicycle-outline" size={20} color="#16A34A" />
                                </Animated.View>
                                <Text style={styles.freeDeliveryText}>Yay! You get Free Delivery on this order 🎉</Text>
                            </Animated.View>
                        )}

                        {cartItems.map((item: any) => (
                            <CartItem
                                key={item.id}
                                item={item}
                                onRemove={handleRemove}
                                onUpdateQuantity={handleUpdateQuantity}
                                onToggleSelect={handleToggleSelect}
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

                        {/* Order Summary Card */}
                        <View style={styles.summaryCard}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(12) }}>
                                <Text style={styles.summaryTitle}>Order Summary</Text>
                                {summaryLoading && <ActivityIndicator size="small" color="#0A0A0A" />}
                            </View>

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal</Text>
                                <Text style={styles.summaryVal}>₹{Number(subtotal).toFixed(2)}</Text>
                            </View>
                            {gst > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>GST</Text>
                                    <Text style={styles.summaryVal}>₹{Number(gst).toFixed(2)}</Text>
                                </View>
                            )}
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Delivery</Text>
                                <Text style={[styles.summaryVal, deliveryFee === 0 && styles.freeLabel]}>
                                    {shippingLabel}
                                </Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryRow}>
                                <Text style={styles.grandTotalLabel}>Total</Text>
                                <Text style={styles.grandTotalVal}>₹{Number(grandTotal).toFixed(0)}</Text>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer Row with Animated Checkout Shimmer */}
                    <View style={[styles.footer,]}>
                        <View style={styles.footerPriceCol}>
                            <Text style={styles.footerPriceLabel}>Total Price</Text>
                            <Text style={styles.footerPriceVal}>₹{Number(grandTotal).toFixed(0)}</Text>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.checkoutBtn,
                                (selectedItems.length === 0 || summaryLoading || isCheckingOut) && styles.disabledBtn
                            ]}
                            disabled={selectedItems.length === 0 || summaryLoading || isCheckingOut}
                            onPress={async () => {
                                setIsCheckingOut(true);
                                try {
                                    // navigation.navigate("CheckOutScreen", { selectedItems });
                                    navigation.navigate("CheckOutScreen", {
                                        selectedItems,
                                        summary,
                                    });
                                } finally {
                                    setIsCheckingOut(false);
                                }
                            }}
                        >
                            <Animated.View
                                style={[
                                    styles.payNowShimmer,
                                    { transform: [{ translateX: shimmerTranslate }, { skewX: '-20deg' }] },
                                ]}
                                pointerEvents="none"
                            />
                            {isCheckingOut && (
                                <ActivityIndicator size="small" color="#fff" />
                            )}
                            <Text style={[styles.checkoutBtnText, isCheckingOut && { marginLeft: 6 }]}>
                                {isCheckingOut ? 'Processing...' : 'Checkout'}
                            </Text>
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
    headerIcon: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: '#F8F9FA', 
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EFEFEF',
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
    mainWrapper: {
        flex: 1,
    },
    itemList: {
        padding: moderateScale(16),
        paddingBottom: verticalScale(40),
    },
    freeDeliveryBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
        padding: moderateScale(10),
        borderRadius: moderateScale(8),
        marginBottom: verticalScale(12),
        gap: scale(8)
    },
    freeDeliveryText: {
        color: '#16A34A',
        fontWeight: '600',
        fontSize: moderateScale(12.5)
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
        overflow: 'hidden'
    },
    disabledBtn: {
        backgroundColor: '#A3A3A3',
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: verticalScale(12),
    },
    loadingText: {
        fontSize: moderateScale(13),
        color: '#888',
        fontWeight: '500',
    },
    freeLabel: {
        color: '#16A34A',
        fontWeight: '700',
    },
    payNowShimmer: {
        position: 'absolute',
        width: '50%',
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.15)'
    },
});