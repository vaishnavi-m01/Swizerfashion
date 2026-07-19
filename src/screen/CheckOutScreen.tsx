import React, { useEffect, useState, useRef, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image, Dimensions, Modal, ActivityIndicator, Alert, Animated, Easing, Platform, UIManager } from "react-native";

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { moderateScale, scale, verticalScale } from "../utils/responsive";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import api from '../config/apiConfig';
import { IMAGE_BASE_URL } from '../api/apiBaseUrl';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface CheckoutItem {
    id: string;
    title: string;
    variant: string;
    price: number;
    quantity: number;
    image: string;
    productId?: string | number;
    variantId?: string | number;
}

interface AddressItem {
    id: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
}

const buildImageUrl = (value?: string) => {
    if (!value) return 'https://via.placeholder.com/100';
    if (value.startsWith('http')) return value;
    return `${IMAGE_BASE_URL}${value.startsWith('/') ? value.slice(1) : value}`;
};

const mapCartItemToCheckoutItem = (item: any): CheckoutItem => ({
    id: String(item.id),
    title: item.product?.name || item.product_name || 'Product',
    variant: [item.product_varient?.color?.name, item.product_varient?.size?.name].filter(Boolean).join(' • ') || item.variant_name || 'Standard',
    price: Number(item.product_varient?.discount_price || item.product_varient?.price || item.product?.discount_price || item.product?.price || item.price || 0),
    quantity: parseInt(String(item.quantity || 1), 10),
    image: buildImageUrl(item.product_varient?.thumbnail || item.product?.thumbnail),
    productId: item.product_id,
    variantId: item.variant_id,
});

const CheckOutScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const userId = useSelector((state: any) => state.auth.userId);

    const { selectedItems, summary: cartSummary } = route.params || {};
    const isFromCartSelection = Array.isArray(selectedItems) && selectedItems.length > 0;

    const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
    const [addresses, setAddresses] = useState<AddressItem[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    // summary is initialized from cartSummary (GET API response from CartScreen)
    const [summary, setSummary] = useState<any>(cartSummary ?? null);
    console.log("CheckoutScreen Summary", summary, "CartSummary", cartSummary);
    const insets = useSafeAreaInsets();

    useFocusEffect(
        useCallback(() => {
            initCheckout();
        }, [userId])
    );

    const initCheckout = async () => {
        if (!userId) return;

        try {
            setLoading(true);

            // Address API
            const addressResponse = await api.get(`/address?user_id=${userId}`);

            const serverAddresses =
                addressResponse.data?.data?.addresses ?? [];

            const mappedAddresses = serverAddresses.map((item: any) => ({
                id: String(item.id),
                name: `${item.first_name} ${item.last_name}`.trim(),
                phone: item.phone,
                address: item.address,
                city: item.city,
                state: item.state ?? "",
                pincode: item.postcode ?? item.pincode ?? "",
                isDefault: item.is_primary === 1,
            }));

            setAddresses(mappedAddresses);

            if (mappedAddresses.length > 0) {
                setSelectedAddressId(
                    mappedAddresses.find((a: AddressItem) => a.isDefault)?.id ??
                    mappedAddresses[0].id
                );
            }

            // Coming from Cart Screen — map items and use cartSummary directly from GET API
            if (isFromCartSelection) {
                const items = selectedItems.map(mapCartItemToCheckoutItem);
                setCheckoutItems(items);
                // Use the summary passed from CartScreen (from GET /cart response)
                if (cartSummary) {
                    setSummary(cartSummary);
                }
            } else {
                // Fetch Full Cart via GET API
                const cartResponse = await api.get("/cart");

                if (cartResponse.data?.status) {
                    const cartItems =
                        cartResponse.data?.data?.cart_items ?? [];
                    const items = cartItems.map(mapCartItemToCheckoutItem);
                    setCheckoutItems(items);
                    // Use summary directly from GET API response
                    const apiSummary = cartResponse.data?.data?.summary;
                    if (apiSummary) {
                        setSummary(apiSummary);
                    } else {
                        // fallback: calculate locally
                        const subtotal = items.reduce(
                            (sum: number, item: CheckoutItem) =>
                                sum + item.price * item.quantity,
                            0
                        );
                        const shipping = subtotal >= 1000 ? 0 : 50;
                        const gst = Number((subtotal * 0.18).toFixed(2));
                        setSummary({
                            subtotal,
                            shipping,
                            shipping_label: shipping === 0 ? "Free" : `₹${shipping}`,
                            gst,
                            total: subtotal + shipping + gst,
                        });
                    }
                }
            }
        } catch (error: any) {
            console.log(error?.response?.data || error.message);
            Alert.alert(
                "Error",
                "Unable to load checkout details."
            );
        } finally {
            setLoading(false);
        }
    };

    // Refresh cart summary from GET API after quantity update
    const refreshCartSummary = async (cartIds: number[]) => {
        try {
            const cartResponse = await api.get("/cart");
            if (cartResponse.data?.status) {
                const apiSummary = cartResponse.data?.data?.summary;
                if (apiSummary) {
                    setSummary(apiSummary);
                }
                // Also refresh item quantities from GET response
                const cartItems = cartResponse.data?.data?.cart_items ?? [];
                setCheckoutItems(prev =>
                    prev.map(prevItem => {
                        const found = cartItems.find((ci: any) => String(ci.id) === String(prevItem.id));
                        if (found) {
                            return { ...prevItem, quantity: parseInt(String(found.quantity || prevItem.quantity), 10) };
                        }
                        return prevItem;
                    })
                );
            }
        } catch (error) {
            console.log("Error refreshing cart summary:", error);
        }
    };

    const updateQuantity = async (
        id: string,
        type: "increase" | "decrease"
    ) => {
        // Optimistically update quantity in UI first
        let newQty = 1;
        setCheckoutItems(prev => {
            const updated = prev.map(item => {
                if (item.id === id) {
                    newQty = type === "increase"
                        ? item.quantity + 1
                        : Math.max(1, item.quantity - 1);
                    return { ...item, quantity: newQty };
                }
                return item;
            });
            return updated;
        });

        try {
            // PUT API call to update quantity in cart silently in background
            await api.put('/cart/update', {
                cart_id: parseInt(id, 10),
                quantity: newQty,
                user_id: userId,
            });
            // After PUT, refresh summary and items from GET API
            await refreshCartSummary(checkoutItems.map(i => parseInt(i.id, 10)));
        } catch (error) {
            console.log("Error updating quantity:", error);
        }
    };

    const subtotal = summary?.subtotal ?? checkoutItems.reduce((acc, item) => acc + (item.price * parseInt(String(item.quantity), 10)), 0);
    const shipping = summary?.shipping ?? 0;
    const shippingLabel = summary?.shipping_label ?? (shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`);
    const gst = summary?.gst ?? 0;
    const total = summary?.total ?? (subtotal + shipping + gst);
    const selectedAddress = addresses.find(address => address.id === selectedAddressId);
    const isFreeDelivery = shipping === 0;

    // Pay Now shimmer animation
    const shimmerAnim = useRef(new Animated.Value(-1)).current;
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
    }, []);

    const shimmerTranslate = shimmerAnim.interpolate({
        inputRange: [-1, 2],
        outputRange: [-SCREEN_WIDTH * 0.6, SCREEN_WIDTH * 0.6],
    });

    const truckAnim = useRef(new Animated.Value(-100)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

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
        }
    }, [isFreeDelivery]);

    const handleConfirmOrder = async () => {
        if (!selectedAddressId) {
            Alert.alert(
                "Address Missing",
                "Please select a delivery address before initiating payment."
            );
            return;
        }

        try {
            setPaymentLoading(true);

            const placeOrderPayload: any = {
                address_id: selectedAddressId,
                payment_method: "razorpay",
            };

            if (isFromCartSelection) {
                placeOrderPayload.cart_ids = selectedItems.map(
                    (item: any) => item.id
                );
            }

            const response = await api.post("place-order", placeOrderPayload);

            if (response.data?.status) {
                navigation.navigate("Payment Screen", {
                    orderData: response.data.data,
                    preferredMethod: "card",
                });
            } else {
                Alert.alert(
                    "Notice",
                    response.data?.message || "Unable to place order."
                );
            }
        } catch (error: any) {
            console.log(
                "[Checkout Catch Error]",
                error?.response?.data ?? error.message
            );

            Alert.alert(
                "Notice",
                error?.response?.data?.message ||
                "Failed to communicate with server."
            );
        } finally {
            setPaymentLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {loading && !paymentLoading ? (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }]}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            ) : null}

            {/* <Modal transparent visible={paymentLoading} animationType="fade">
                <View style={styles.loaderModalContainer}>
                    <View style={styles.loaderBoxContent}>
                        <ActivityIndicator size="large" color="#000000" />
                        <Text style={styles.loaderStatusMessageText}>Securing Payment Gateway...</Text>
                    </View>
                </View>
            </Modal> */}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {isFreeDelivery && (
                    <Animated.View style={[styles.freeDeliveryBanner, { transform: [{ translateX: truckAnim }, { scale: pulseAnim }] }]}>
                        <Text style={styles.freeDeliveryTruck}>🚚</Text>
                        <View style={styles.freeDeliveryTextContainer}>
                            <Text style={styles.freeDeliveryTitle}>You've unlocked FREE Delivery!</Text>
                            <Text style={styles.freeDeliverySubtitle}>Your order qualifies for free shipping.</Text>
                        </View>
                        <Text style={styles.freeDeliveryBadge}>FREE</Text>
                    </Animated.View>
                )}

                <Text style={styles.sectionTitle}>Delivery Address</Text>
                {selectedAddress ? (
                    <View style={styles.addressCard}>
                        <View style={styles.topRow}>
                            <View style={styles.leftRow}>
                                <Ionicons name="radio-button-on" size={22} color="#000" />
                                <Text style={styles.addressType}>{selectedAddress.name}</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate("DeliveryAddress")}>
                                <Text style={styles.changeText}>Change</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.addressBody}>
                            <Text style={styles.addressText}>{selectedAddress.address}</Text>
                            <Text style={styles.addressText}>{selectedAddress.city}, {selectedAddress.state}</Text>
                            <Text style={styles.addressText}>{selectedAddress.pincode}</Text>
                            <Text style={styles.addressText}>{selectedAddress.phone}</Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.addressCard}>
                        <Text style={styles.addressText}>No saved address found.</Text>
                        <TouchableOpacity style={styles.addAddressBtn} onPress={() => navigation.navigate("AddAddress")}>
                            <Ionicons name="add-circle-outline" size={18} color="#2563EB" />
                            <Text style={styles.addAddressText}>Add Address</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={[styles.sectionTitle, { marginTop: scale(24) }]}>Product Details</Text>
                <View style={styles.productsContainer}>
                    {checkoutItems.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No items to checkout.</Text>
                        </View>
                    ) : checkoutItems.map((item, index) => (
                        <CheckoutItemRow
                            key={item.id}
                            item={item}
                            onIncrease={() => updateQuantity(item.id, 'increase')}
                            onDecrease={() => updateQuantity(item.id, 'decrease')}
                            showDivider={index < checkoutItems.length - 1}
                        />
                    ))}
                </View>

                <Text style={[styles.sectionTitle, { marginTop: scale(24) }]}>Order Summary</Text>

                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>
                            ₹{Number(subtotal).toFixed(2)}
                        </Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Delivery Charges</Text>
                        <Text
                            style={[
                                styles.summaryValue,
                                shipping === 0 && { color: "#16A34A" },
                            ]}
                        >
                            {shippingLabel}
                        </Text>
                    </View>

                    {gst > 0 && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>GST</Text>
                            <Text style={styles.summaryValue}>
                                ₹{Number(gst).toFixed(2)}
                            </Text>
                        </View>
                    )}

                    <View style={styles.summaryDivider} />

                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total Payable</Text>
                        <Text style={styles.totalValue}>
                            ₹{Number(total).toFixed(2)}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.bottomFixedContainer}>
                <View style={styles.bottomPriceContainer}>
                    <Text style={styles.bottomPriceLabel}>Total Payable</Text>
                    <Text style={styles.bottomPriceValue}>₹{Math.round(total).toLocaleString('en-IN')}</Text>
                </View>
                <TouchableOpacity style={styles.payNowButton} activeOpacity={0.85} onPress={handleConfirmOrder}>
                    <Animated.View
                        style={[
                            styles.payNowShimmer,
                            { transform: [{ translateX: shimmerTranslate }] },
                        ]}
                        pointerEvents="none"
                    />
                    <Ionicons name="lock-closed-outline" size={15} color="rgba(255,255,255,0.85)" style={{ marginRight: scale(6) }} />
                    <Text style={styles.payNowButtonText}>Pay Now</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFF" style={styles.arrowIcon} />
                </TouchableOpacity>
            </View>

            <Modal visible={isSuccessModalVisible} animationType="fade" transparent={true}>
                <View style={[styles.modalOverlay, { justifyContent: 'center' }]}>
                    <View style={styles.successModalContent}>
                        <View style={styles.successBadge}>
                            <Ionicons name="checkmark-sharp" size={40} color="#fff" />
                        </View>
                        <Text style={styles.successTitle}>Order Placed!</Text>
                        <Text style={styles.successSubtitle}>Your order has been placed successfully.</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// Checkout Item Row Component
const CheckoutItemRow = ({
    item,
    onIncrease,
    onDecrease,
    showDivider,
}: {
    item: CheckoutItem;
    onIncrease: () => void;
    onDecrease: () => void;
    showDivider: boolean;
}) => {
    const slideAnim = useRef(new Animated.Value(0)).current;
    const prevQty = useRef(item.quantity);

    useEffect(() => {
        if (item.quantity !== prevQty.current) {
            const isIncrease = item.quantity > prevQty.current;
            prevQty.current = item.quantity;
            slideAnim.setValue(isIncrease ? -20 : 20);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                speed: 28,
                bounciness: 6,
            }).start();
        }
    }, [item.quantity]);

    const qty = parseInt(String(item.quantity), 10) || 1;

    return (
        <View>
            <View style={checkoutRowStyles.productCard}>
                <Image source={{ uri: item.image }} style={checkoutRowStyles.productImage} />
                <View style={checkoutRowStyles.productDetails}>
                    <Text style={checkoutRowStyles.productName} numberOfLines={1}>{item.title}</Text>
                    <Text style={checkoutRowStyles.productVariant}>{item.variant}</Text>
                    <View style={checkoutRowStyles.priceQtyRow}>
                        <Text style={checkoutRowStyles.productPrice}>
                            ₹{Math.round(item.price).toLocaleString('en-IN')}
                        </Text>
                        <View style={checkoutRowStyles.quantityContainer}>
                            <TouchableOpacity
                                style={checkoutRowStyles.qtyBtn}
                                onPress={onDecrease}
                                disabled={qty <= 1}
                            >
                                <Ionicons name="remove" size={16} color={qty <= 1 ? '#D1D5DB' : '#000'} />
                            </TouchableOpacity>
                            <View style={checkoutRowStyles.qtyNumWrapper}>
                                <Animated.Text
                                    style={[
                                        checkoutRowStyles.qtyText,
                                        { transform: [{ translateY: slideAnim }] },
                                    ]}
                                >
                                    {qty}
                                </Animated.Text>
                            </View>
                            <TouchableOpacity
                                style={checkoutRowStyles.qtyBtn}
                                onPress={onIncrease}
                            >
                                <Ionicons name="add" size={16} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
            {showDivider && <View style={checkoutRowStyles.itemDivider} />}
        </View>
    );
};

const checkoutRowStyles = StyleSheet.create({
    productCard: {
        flexDirection: 'row',
        padding: scale(14),
        alignItems: 'center'
    },
    productImage: {
        width: scale(64),
        height: scale(64),
        borderRadius: scale(8),
        backgroundColor: '#F3F4F6'
    },
    productDetails: {
        flex: 1,
        marginLeft: scale(12)
    },
    productName: {
        fontSize: scale(14),
        fontWeight: '600',
        color: '#1F2937'
    },
    productVariant: {
        fontSize: scale(12),
        color: '#9CA3AF',
        marginTop: scale(2)
    },
    priceQtyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: scale(8)
    },
    productPrice: {
        fontSize: scale(15),
        fontWeight: '700',
        color: '#1F2937'
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: scale(8),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: scale(2)
    },
    qtyBtn: {
        width: scale(28),
        height: scale(28),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: scale(6)
    },
    qtyNumWrapper: {
        width: scale(32),
        height: scale(28),
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center'
    },
    qtyText: {
        fontSize: scale(14),
        fontWeight: '700',
        color: '#1F2937',
        textAlign: 'center'
    },
    itemDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: scale(14)
    },
});

const styles = StyleSheet.create({
    container:
    {
        flex: 1,
        backgroundColor: '#ffffff'
    },

    loaderModalContainer: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    loaderBoxContent: { backgroundColor: '#FFFFFF', paddingHorizontal: scale(28), paddingVertical: scale(22), borderRadius: scale(16), alignItems: 'center', justifyContent: 'center', elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, minWidth: scale(220) },
    loaderStatusMessageText: { marginTop: scale(14), fontSize: scale(13), color: '#4B5563', fontWeight: '600', letterSpacing: 0.2, textAlign: 'center' },
    scrollContent: { paddingHorizontal: scale(16), paddingTop: scale(16), paddingBottom: scale(140) },
    sectionTitle: { fontSize: scale(16), fontWeight: '700', color: '#1F2937' },
    freeDeliveryBanner: { marginBottom: scale(12), backgroundColor: '#F0FFF4', borderRadius: scale(12), borderWidth: 1.5, borderColor: '#6EE7B7', flexDirection: 'row', alignItems: 'center', paddingHorizontal: scale(14), paddingVertical: verticalScale(12) },
    freeDeliveryTruck: { fontSize: scale(26), marginRight: scale(12) },
    freeDeliveryTextContainer: { flex: 1 },
    freeDeliveryTitle: { fontSize: scale(13), fontWeight: '800', color: '#064E3B' },
    freeDeliverySubtitle: { fontSize: scale(11), color: '#065F46', marginTop: verticalScale(2) },
    freeDeliveryBadge: { fontSize: scale(12), fontWeight: '900', color: '#FFFFFF', backgroundColor: '#10B981', borderRadius: scale(6), paddingHorizontal: scale(8), paddingVertical: verticalScale(4), overflow: 'hidden' },
    addressCard: { marginTop: scale(12), backgroundColor: '#FFF', borderRadius: scale(12), borderWidth: 1, borderColor: '#E5E7EB', padding: scale(16) },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    leftRow: { flexDirection: 'row', alignItems: 'center' },
    addressType: { marginLeft: scale(8), fontSize: scale(16), fontWeight: '700', color: '#1F2937' },
    addressBody: { marginTop: scale(10) },
    addressText: { fontSize: scale(14), color: '#4B5563', lineHeight: scale(20) },
    changeText: { fontSize: scale(14), fontWeight: '600', color: '#2563EB' },
    addAddressBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: scale(8) },
    addAddressText: { fontSize: scale(14), fontWeight: '600', color: '#2563EB', marginLeft: scale(4) },
    productsContainer: { marginTop: scale(12), backgroundColor: '#FFF', borderRadius: scale(12), borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: scale(4) },
    emptyState: { padding: scale(16), alignItems: 'center' },
    emptyText: { fontSize: scale(14), color: '#6B7280' },
    summaryCard: { marginTop: scale(12), backgroundColor: '#FFF', borderRadius: scale(12), borderWidth: 1, borderColor: '#E5E7EB', padding: scale(16) },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: scale(4) },
    summaryLabel: { fontSize: scale(14), color: '#4B5563' },
    summaryValue: { fontSize: scale(14), fontWeight: '500', color: '#1F2937' },
    summaryDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: scale(10) },
    totalLabel: { fontSize: scale(16), fontWeight: '700', color: '#1F2937' },
    totalValue: { fontSize: scale(18), fontWeight: '800', color: '#10B981' },
    bottomFixedContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: scale(20),
        paddingTop: scale(16),
        // paddingBottom: insets.bottom > 0 ? insets.bottom : verticalScale(12) ,
        paddingBottom: SCREEN_HEIGHT < 700 ? scale(20) : scale(50),
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    bottomPriceContainer: { flexDirection: 'column' },
    bottomPriceLabel: { fontSize: scale(11), color: '#777777', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
    bottomPriceValue: { fontSize: scale(20), fontWeight: '800', color: '#000000', marginTop: scale(2) },
    payNowButton: { flex: 1, backgroundColor: '#0A0A0A', marginLeft: scale(24), borderRadius: scale(14), height: scale(52), flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: scale(16), overflow: 'hidden' },
    payNowShimmer: { position: 'absolute', width: '50%', height: '100%', backgroundColor: 'rgba(255,255,255,0.12)', transform: [{ skewX: '-20deg' }] },
    payNowButtonText: { color: '#FFFFFF', fontSize: scale(15), fontWeight: '800', letterSpacing: 0.4 },
    arrowIcon: { marginLeft: scale(8) },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center' },
    successModalContent: { backgroundColor: '#ffffff', borderRadius: moderateScale(16), padding: moderateScale(24), marginHorizontal: scale(24), alignItems: 'center', alignSelf: 'center', width: SCREEN_WIDTH - 48, elevation: 5 },
    successBadge: { width: scale(70), height: verticalScale(70), borderRadius: moderateScale(35), backgroundColor: '#28A745', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(16) },
    successTitle: { fontSize: moderateScale(18), fontWeight: '900', color: '#0A0A0A', textAlign: 'center' },
    successSubtitle: { fontSize: moderateScale(13), color: '#666', textAlign: 'center', marginTop: verticalScale(8), lineHeight: moderateScale(18) }
});

export default CheckOutScreen;