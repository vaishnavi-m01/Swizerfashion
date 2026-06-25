import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image, Dimensions, Modal } from "react-native";
import { moderateScale, scale, verticalScale } from "../utils/responsive";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Screen, screensEnabled } from "react-native-screens";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CheckoutItem {
    id: string;
    title: string;
    variant: string;
    price: number;
    quantity: number;
    image: string;
}

const { width } = Dimensions.get('window');

const CheckOutScreen = () => {

    const navigation = useNavigation<any>();
    const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
    const [isCheckoutModalVisible, setCheckoutModalVisible] = useState(false);


    const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([
        {
            id: '1',
            title: 'Premium Wireless Headphones',
            variant: 'Black / ANC',
            price: 12499,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200&auto=format&fit=crop'
        },
        {
            id: '2',
            title: 'Ergonomic Wireless Mouse',
            variant: 'Space Gray',
            price: 3999,
            quantity: 2,
            image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=200&auto=format&fit=crop'
        },
        {
            id: '3',
            title: 'Mechanical Gaming Keyboard',
            variant: 'RGB / Blue Switches',
            price: 7499,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=200&auto=format&fit=crop'
        }
    ]);

    // 2. Quantity control handlers
    const updateQuantity = (id: string, type: 'increase' | 'decrease') => {
        setCheckoutItems(prevItems =>
            prevItems.map(item => {
                if (item.id === id) {
                    const newQty = type === 'increase' ? item.quantity + 1 : item.quantity - 1;
                    // Don't let quantity drop below 1
                    return { ...item, quantity: Math.max(1, newQty) };
                }
                return item;
            })
        );
    };

    // 3. Automated live computations base variables
    const subtotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 150 : 0; // Free delivery logic can go here
    const gst = subtotal * 0.18;
    const total = subtotal + shipping + gst;



    const handlePlaceOrder = () => {
        setCheckoutModalVisible(false);
        setSuccessModalVisible(true);
        setTimeout(() => {
            setSuccessModalVisible(false);
            // setCartItems([]);
            navigation.navigate("MainTabs",{Screen:"HomeTab"});
        }, 3000);
    };

    return (
        <View style={styles.container}>
            {/* Scrollable Area */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >

                {/* Address Section */}
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <View style={styles.addressCard}>
                    <View style={styles.topRow}>
                        <View style={styles.leftRow}>
                            <Ionicons name="radio-button-on" size={22} color="#000" />
                            <Text style={styles.addressType}>Home</Text>
                        </View>
                        <View style={styles.iconRow}>
                            <TouchableOpacity>
                               <MaterialIcons name="edit" color="#000" size={24} />
                            </TouchableOpacity>
                            <TouchableOpacity >
                                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.addressBody}>
                        <Text style={styles.addressText}>5-4-57(1), Kamaraj Nagar</Text>
                        <Text style={styles.addressText}>Keela Surandai</Text>
                        <Text style={styles.addressText}>Tenkasi - 627859</Text>
                    </View>
                    <TouchableOpacity style={styles.changeBtn} onPress={() => navigation.navigate("DeliveryAddress")}>
                        <Text style={styles.changeText}>Change Address</Text>
                    </TouchableOpacity>
                </View>

                {/* Product Details Section (With interactive quantity counter) */}
                <Text style={[styles.sectionTitle, { marginTop: scale(24) }]}>Product Details</Text>
                <View style={styles.productsContainer}>
                    {checkoutItems.map((item, index) => (
                        <View key={item.id}>
                            <View style={styles.productCard}>
                                <Image source={{ uri: item.image }} style={styles.productImage} />
                                <View style={styles.productDetails}>
                                    <Text style={styles.productName} numberOfLines={1}>{item.title}</Text>
                                    <Text style={styles.productVariant}>{item.variant}</Text>

                                    <View style={styles.priceQtyRow}>
                                        <Text style={styles.productPrice}>₹{item.price.toLocaleString('en-IN')}</Text>

                                        {/* Interlocking dynamic counter controllers */}
                                        <View style={styles.quantityContainer}>
                                            <TouchableOpacity
                                                style={styles.qtyBtn}
                                                onPress={() => updateQuantity(item.id, 'decrease')}
                                                disabled={item.quantity <= 1}
                                            >
                                                <Ionicons name="remove" size={16} color={item.quantity <= 1 ? "#D1D5DB" : "#000"} />
                                            </TouchableOpacity>

                                            <Text style={styles.qtyText}>{item.quantity}</Text>

                                            <TouchableOpacity
                                                style={styles.qtyBtn}
                                                onPress={() => updateQuantity(item.id, 'increase')}
                                            >
                                                <Ionicons name="add" size={16} color="#000" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            {index < checkoutItems.length - 1 && <View style={styles.itemDivider} />}
                        </View>
                    ))}
                </View>

                {/* Order Summary Section */}
                <Text style={[styles.sectionTitle, { marginTop: scale(24) }]}>Order Summary</Text>
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Delivery Charges</Text>
                        <Text style={styles.summaryValue}>₹{shipping.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Estimated GST (18%)</Text>
                        <Text style={styles.summaryValue}>₹{Math.round(gst).toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total Payable</Text>
                        <Text style={styles.totalValue}>₹{Math.round(total).toLocaleString('en-IN')}</Text>
                    </View>
                </View>
            </ScrollView>


            {/* Bottom Fixed Container containing screen-safe Confirmation parameters */}
            <View style={styles.bottomFixedContainer}>
                <TouchableOpacity style={styles.confirmButton} activeOpacity={0.8} onPress={() => setCheckoutModalVisible(true)}>
                    <Text style={styles.confirmButtonText}>Confirm Order • ₹{Math.round(total).toLocaleString('en-IN')}</Text>
                </TouchableOpacity>
            </View>

            {/* Checkout Modal */}
            <Modal
                visible={isCheckoutModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setCheckoutModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.checkoutModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Payment method</Text>
                            <TouchableOpacity onPress={() => setCheckoutModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#0A0A0A" />
                            </TouchableOpacity>
                        </View>



                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Payment Method</Text>
                            <View style={styles.paymentSelector}>
                                <TouchableOpacity style={[styles.paymentOption, styles.activePaymentOption]}>
                                    <Ionicons name="card" size={18} color="#0A0A0A" />
                                    <Text style={[styles.paymentText, styles.activePaymentText]}>Card</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.paymentOption}>
                                    <Ionicons name="cash-outline" size={18} color="#666" />
                                    <Text style={styles.paymentText}>Cash (COD)</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.orderSummarySummary}>
                            <Text style={styles.inputLabel}>Total Amount to Pay</Text>
                            <Text style={styles.summaryPriceBold}>₹{total}</Text>
                        </View>

                        <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder}>
                            <Text style={styles.placeOrderBtnText}>Confirm Order</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


            {/* Success Modal */}
            <Modal
                visible={isSuccessModalVisible}
                animationType="fade"
                transparent={true}
            >
                <View style={[styles.modalOverlay, { justifyContent: 'center' }]}>
                    <View style={styles.successModalContent}>
                        <View style={styles.successBadge}>
                            <Ionicons name="checkmark-sharp" size={40} color="#fff" />
                        </View>
                        <Text style={styles.successTitle}>Order Placed!</Text>
                        <Text style={styles.successSubtitle}>Your order has been placed successfully and will be delivered soon.</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default CheckOutScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        paddingHorizontal: scale(16),
        paddingTop: scale(16),
        paddingBottom: scale(120),
    },
    sectionTitle: {
        fontSize: scale(16),
        fontWeight: '700',
        color: '#1F2937',
    },

    // --- Address Card ---
    addressCard: {
        marginTop: scale(12),
        backgroundColor: '#FFF',
        borderRadius: scale(12),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: scale(16),
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addressType: {
        marginLeft: scale(8),
        fontSize: scale(16),
        fontWeight: '700',
        color: '#1F2937',
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap:6
    },
    addressBody: {
        marginTop: scale(10),
    },
    addressText: {
        fontSize: scale(14),
        color: '#4B5563',
        lineHeight: scale(20),
    },
    changeBtn: {
        alignSelf: 'flex-end',
        marginTop: scale(8),
    },
    changeText: {
        fontSize: scale(14),
        fontWeight: '600',
        color: '#2563EB',
    },

    // --- Product Card & Quantity Control Layouts ---
    productsContainer: {
        marginTop: scale(12),
        backgroundColor: '#FFF',
        borderRadius: scale(12),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingVertical: scale(4),
    },
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
        marginLeft: scale(12),
    },
    productName: {
        fontSize: scale(14),
        fontWeight: '600',
        color: '#1F2937',
    },
    productVariant: {
        fontSize: scale(12),
        color: '#9CA3AF',
        marginTop: scale(2),
    },
    priceQtyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: scale(8),
    },
    productPrice: {
        fontSize: scale(15),
        fontWeight: '700',
        color: '#1F2937',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: scale(8),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: scale(2),
    },
    qtyBtn: {
        width: scale(28),
        height: scale(28),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: scale(6),
    },
    qtyText: {
        fontSize: scale(14),
        fontWeight: '600',
        color: '#1F2937',
        paddingHorizontal: scale(12),
        textAlign: 'center',
    },
    itemDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: scale(14),
    },

    // --- Summary Layouts ---
    summaryCard: {
        marginTop: scale(12),
        backgroundColor: '#FFF',
        borderRadius: scale(12),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: scale(16),
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: scale(4),
    },
    summaryLabel: {
        fontSize: scale(14),
        color: '#4B5563',
    },
    summaryValue: {
        fontSize: scale(14),
        fontWeight: '500',
        color: '#1F2937',
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: scale(10),
    },
    totalLabel: {
        fontSize: scale(16),
        fontWeight: '700',
        color: '#1F2937',
    },
    totalValue: {
        fontSize: scale(18),
        fontWeight: '800',
        color: '#10B981',
    },

    // --- Fixed Bottom Confirm Action Layout ---
    bottomFixedContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        paddingHorizontal: scale(16),
        paddingTop: scale(12),
        paddingBottom: SCREEN_HEIGHT < 700 ? scale(16) : scale(60),
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 10,

    },
    confirmButton: {
        backgroundColor: '#000',
        borderRadius: scale(12),
        height: scale(48),
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#FFF',
        fontSize: scale(16),
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    checkoutModalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: moderateScale(20),
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
        marginBottom: verticalScale(16),
    },
    modalTitle: {
        fontSize: moderateScale(16),
        fontWeight: '800',
        color: '#0A0A0A',
    },
    inputGroup: {
        marginBottom: verticalScale(14),
    },
    inputLabel: {
        fontSize: moderateScale(12),
        fontWeight: '700',
        color: '#666',
        marginBottom: verticalScale(6),
    },
    textInput: {
        borderWidth: 1.5,
        borderColor: '#EFEFEF',
        borderRadius: moderateScale(8),
        paddingHorizontal: scale(12),
        height: verticalScale(44),
        fontSize: moderateScale(13.5),
        color: '#0A0A0A',
    },
    addressInput: {
        height: verticalScale(70),
        textAlignVertical: 'top',
        paddingVertical: verticalScale(8),
    },
    paymentSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: verticalScale(4),
    },
    paymentOption: {
        flex: 1,
        flexDirection: 'row',
        height: verticalScale(44),
        borderWidth: 1.5,
        borderColor: '#EFEFEF',
        borderRadius: moderateScale(8),
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: scale(4),
    },
    activePaymentOption: {
        borderColor: '#0A0A0A',
        backgroundColor: 'rgba(10, 10, 10, 0.05)',
    },
    paymentText: {
        fontSize: moderateScale(12.5),
        fontWeight: '600',
        color: '#666',
        marginLeft: scale(6),
    },
    activePaymentText: {
        color: '#0A0A0A',
        fontWeight: '700',
    },

    orderSummarySummary: {
        backgroundColor: '#F9F9F9',
        borderRadius: moderateScale(8),
        padding: moderateScale(12),
        marginTop: verticalScale(8),
        marginBottom: verticalScale(16),
        alignItems: 'center',
    },
    summaryPriceBold: {
        fontSize: moderateScale(15),
        fontWeight: '900',
        color: '#0A0A0A',
    },
    placeOrderBtn: {
        backgroundColor: '#0A0A0A',
        height: verticalScale(48),
        borderRadius: moderateScale(10),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(10),
        marginBottom: verticalScale(30),
    },
    placeOrderBtnText: {
        color: '#ffffff',
        fontSize: moderateScale(15),
        fontWeight: '800',
    },
    successModalContent: {
        backgroundColor: '#ffffff',
        borderRadius: moderateScale(16),
        padding: moderateScale(24),
        marginHorizontal: scale(24),
        alignItems: 'center',
        alignSelf: 'center',
        width: width - 48,
        shadowColor: '#000',
        shadowOffset: { width: scale(0), height: verticalScale(2) },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    successBadge: {
        width: scale(70),
        height: verticalScale(70),
        borderRadius: moderateScale(35),
        backgroundColor: '#28A745',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    successTitle: {
        fontSize: moderateScale(18),
        fontWeight: '900',
        color: '#0A0A0A',
        textAlign: 'center',
    },
    successSubtitle: {
        fontSize: moderateScale(13),
        color: '#666',
        textAlign: 'center',
        marginTop: verticalScale(8),
        lineHeight: moderateScale(18),
    },


});