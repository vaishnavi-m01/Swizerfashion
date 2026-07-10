// // import React, { useEffect, useState, useRef, useCallback } from "react";
// // import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image, Dimensions, Modal, ActivityIndicator, Alert, Animated } from "react-native";
// // import { moderateScale, scale, verticalScale } from "../utils/responsive";
// // import Ionicons from 'react-native-vector-icons/Ionicons';
// // import { useNavigation, useFocusEffect } from '@react-navigation/native';
// // import api from '../config/apiConfig';
// // import { IMAGE_BASE_URL } from '../api/apiBaseUrl';
// // import { useSelector } from 'react-redux';
// // import RazorpayCheckout from 'react-native-razorpay'; 

// // const { height: SCREEN_HEIGHT, width } = Dimensions.get('window');

// // interface CheckoutItem {
// //     id: string;
// //     title: string;
// //     variant: string;
// //     price: number;
// //     quantity: number;
// //     image: string;
// // }

// // interface AddressItem {
// //     id: string;
// //     name: string;
// //     phone: string;
// //     address: string;
// //     city: string;
// //     state: string;
// //     pincode: string;
// //     isDefault?: boolean;
// // }

// // const CheckOutScreen = () => {
// //     const navigation = useNavigation<any>();
// //     const userId = useSelector((state: any) => state.auth.userId);

// //     const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
// //     const [isCheckoutModalVisible, setCheckoutModalVisible] = useState(false);
// //     const [loading, setLoading] = useState(false);
// //     const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
// //     const [addresses, setAddresses] = useState<AddressItem[]>([]);
// //     const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
// //     const [summary, setSummary] = useState<any>(null);

// //     const buildImageUrl = (value?: string) => {
// //         if (!value) return 'https://via.placeholder.com/100';
// //         if (value.startsWith('http')) return value;
// //         return `${IMAGE_BASE_URL}${value.startsWith('/') ? value.slice(1) : value}`;
// //     };

// //     useFocusEffect(
// //         useCallback(() => {
// //             fetchCartAndAddress();
// //         }, [userId])
// //     );

// //     const fetchCartAndAddress = async () => {
// //         if (!userId) return;
// //         try {
// //             setLoading(true);
// //             const [cartResponse, addressResponse] = await Promise.all([
// //                 api.get('/cart'),
// //                 api.get(`/address?user_id=${userId}`),
// //             ]);

// //             if (cartResponse.data?.status) {
// //                 const items = cartResponse.data?.data?.cart_items ?? [];
// //                 const mappedItems = items.map((item: any) => ({
// //                     id: String(item.id),
// //                     title: item.product?.name || item.product_name || 'Product',
// //                     variant: item.product_varient?.name || item.variant_name || 'Standard',
// //                     price: Number(item.product_varient?.discount_price || item.product_varient?.price || item.product?.discount_price || item.product?.price || item.price || 0),
// //                     quantity: item.quantity || 1,
// //                     image: buildImageUrl(item.product_varient?.thumbnail || item.product?.thumbnail),
// //                 }));
// //                 setCheckoutItems(mappedItems);
// //                 setSummary(cartResponse.data?.data?.summary ?? null);
// //             }

// //             const serverAddresses = addressResponse.data?.data?.addresses ?? [];
// //             const mappedAddresses = serverAddresses.map((item: any) => ({
// //                 id: String(item.id),
// //                 name: `${item.first_name} ${item.last_name}`.trim(),
// //                 phone: item.phone,
// //                 address: item.address,
// //                 city: item.city,
// //                 state: item.state ?? '',
// //                 pincode: item.postcode ?? item.pincode ?? '',
// //                 isDefault: item.is_primary === 1,
// //             }));
// //             setAddresses(mappedAddresses);
// //             if (mappedAddresses.length > 0) {
// //                 setSelectedAddressId(mappedAddresses.find((a: AddressItem) => a.isDefault)?.id || mappedAddresses[0].id);
// //             }
// //         } catch (error: any) {
// //             console.log('[Checkout] fetch error:', error?.response?.data ?? error.message);
// //             Alert.alert('Error', 'Unable to load checkout details');
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     const updateQuantity = (id: string, type: 'increase' | 'decrease') => {
// //         setCheckoutItems(prevItems =>
// //             prevItems.map(item => {
// //                 if (item.id === id) {
// //                     const newQty = type === 'increase' ? item.quantity + 1 : item.quantity - 1;
// //                     return { ...item, quantity: Math.max(1, newQty) };
// //                 }
// //                 return item;
// //             })
// //         );
// //     };

// //     const subtotal = summary?.subtotal ?? checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
// //     const shipping = summary?.shipping ?? 0;
// //     const shippingLabel = summary?.shipping_label ?? (shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`);
// //     const gst = summary?.gst ?? 0;
// //     const total = summary?.total ?? (subtotal + shipping + gst);
// //     const selectedAddress = addresses.find(address => address.id === selectedAddressId);
// //     const isFreeDelivery = shipping === 0;

// //     // Free delivery banner animations
// //     const truckAnim = useRef(new Animated.Value(-100)).current;
// //     const pulseAnim = useRef(new Animated.Value(1)).current;
// //     useEffect(() => {
// //         if (isFreeDelivery) {
// //             Animated.sequence([
// //                 Animated.timing(truckAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
// //                 Animated.loop(
// //                     Animated.sequence([
// //                         Animated.timing(pulseAnim, { toValue: 1.04, duration: 700, useNativeDriver: true }),
// //                         Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
// //                     ])
// //                 ),
// //             ]).start();
// //         }
// //     }, [isFreeDelivery]);

// //     // MAIN RAZORPAY PAYMENT LOGIC USING THE RESPONSE PARAMS
// //     const handleConfirmOrder = async () => {
// //         if (!selectedAddressId) {
// //             Alert.alert("Error", "Please select a delivery address.");
// //             return;
// //         }

// //         try {
// //             setCheckoutModalVisible(false);
// //             setLoading(true);

// //             // 1. Post request to backend to create order database object and get razorpay data
// //             const response = await api.post('place-order', {
// //                 address_id: selectedAddressId,
// //                 payment_method: "razorpay"
// //             });

// //             if (response.data?.status) {
// //                 // Parsing exact data fields matching your API schema response
// //                 const orderData = response.data.data; 

// //                 const options = {
// //                     description: `Order Payment - ${orderData.order_number}`,
// //                     // image: 'https://swizerfashion.com/public/frontend/assets/images/logo/logoblack.png', // Place your enterprise icon URL here
// //                     currency: orderData.currency,              // Parsed as "INR"
// //                     key: 'rzp_live_SnyMtzXPhiXLfo',             // Replace with actual public Razorpay API Key (test or live version)
// //                     amount: orderData.amount,                  
// //                     name: 'Swizer',
// //                     order_id: orderData.razorpay_order_id,     
                    
// //                     prefill: {
// //                         email: orderData.prefill?.email,       
// //                         contact: orderData.prefill?.contact,   
// //                         name: orderData.prefill?.name         
// //                     },
// //                     theme: { color: '#0A0A0A' }                
// //                 };

// //                 // 3. Spawns Razorpay External Checkout Payment window overlay layer
// //                 RazorpayCheckout.open(options)
// //                     .then(async (successResponse: any) => {
// //                         console.log('Payment Processing Success Payload:', successResponse);
                        
// //                         //  Add backend verification route validation call if required:
// //                         // await api.post('api/verify-payment', successResponse);

// //                         setSuccessModalVisible(true);
// //                         setTimeout(() => {
// //                             setSuccessModalVisible(false);
// //                             navigation.navigate("MainTabs", { screen: "HomeTab" });
// //                         }, 3000);
// //                     })
// //                     .catch((errorResponse: any) => {
// //                         console.log('Payment Gate Processing Exception:', errorResponse);
// //                         Alert.alert('Payment Failure Alert', errorResponse.description || 'Payment transaction aborted or failed.');
// //                     });

// //             } else {
// //                 Alert.alert("Order Execution Failure", response.data?.message || "Unable to initiate structural intent order parameters.");
// //             }
// //         } catch (error: any) {
// //             console.log('[Checkout Interface Exception Block]:', error?.response?.data ?? error.message);
// //             Alert.alert('Execution Error', 'An issue arose processing your command transaction request.');
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     return (
// //         <View style={styles.container}>
// //             {loading && (
// //                 <View style={styles.loaderOverlay}>
// //                     <ActivityIndicator size="large" color="#000" />
// //                 </View>
// //             )}

// //             <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
// //                 {/* Free Delivery Banner Component */}
// //                 {isFreeDelivery && (
// //                     <Animated.View style={[styles.freeDeliveryBanner, { transform: [{ translateX: truckAnim }, { scale: pulseAnim }] }]}>
// //                         <Text style={styles.freeDeliveryTruck}>🚚</Text>
// //                         <View style={styles.freeDeliveryTextContainer}>
// //                             <Text style={styles.freeDeliveryTitle}>You've unlocked FREE Delivery!</Text>
// //                             <Text style={styles.freeDeliverySubtitle}>Your order qualifies for free shipping.</Text>
// //                         </View>
// //                         <Text style={styles.freeDeliveryBadge}>FREE</Text>
// //                     </Animated.View>
// //                 )}

// //                 {/* Delivery Address Target Card */}
// //                 <Text style={styles.sectionTitle}>Delivery Address</Text>
// //                 {selectedAddress ? (
// //                     <View style={styles.addressCard}>
// //                         <View style={styles.topRow}>
// //                             <View style={styles.leftRow}>
// //                                 <Ionicons name="radio-button-on" size={22} color="#000" />
// //                                 <Text style={styles.addressType}>{selectedAddress.name}</Text>
// //                             </View>
// //                         </View>
// //                         <View style={styles.addressBody}>
// //                             <Text style={styles.addressText}>{selectedAddress.address}</Text>
// //                             <Text style={styles.addressText}>{selectedAddress.city}, {selectedAddress.state}</Text>
// //                             <Text style={styles.addressText}>{selectedAddress.pincode}</Text>
// //                             <Text style={styles.addressText}>{selectedAddress.phone}</Text>
// //                         </View>
// //                         <View style={styles.actionRow}>
// //                             <TouchableOpacity style={styles.changeBtn} onPress={() => navigation.navigate("DeliveryAddress")}>
// //                                 <Text style={styles.changeText}>Change Address</Text>
// //                             </TouchableOpacity>
// //                             <TouchableOpacity style={styles.addAddressBtn} onPress={() => navigation.navigate("AddAddress")}>
// //                                 <Ionicons name="add-circle-outline" size={18} color="#2563EB" />
// //                                 <Text style={styles.addAddressText}>Add Address</Text>
// //                             </TouchableOpacity>
// //                         </View>
// //                     </View>
// //                 ) : (
// //                     <View style={styles.addressCard}>
// //                         <Text style={styles.addressText}>No saved address found.</Text>
// //                         <TouchableOpacity style={styles.addAddressBtn} onPress={() => navigation.navigate("AddAddress")}>
// //                             <Ionicons name="add-circle-outline" size={18} color="#2563EB" />
// //                             <Text style={styles.addAddressText}>Add Address</Text>
// //                         </TouchableOpacity>
// //                     </View>
// //                 )}

// //                 {/* Listing Mapped Product Lineup Items */}
// //                 <Text style={[styles.sectionTitle, { marginTop: scale(24) }]}>Product Details</Text>
// //                 <View style={styles.productsContainer}>
// //                     {checkoutItems.length === 0 ? (
// //                         <View style={styles.emptyState}>
// //                             <Text style={styles.emptyText}>No items in cart.</Text>
// //                         </View>
// //                     ) : checkoutItems.map((item, index) => (
// //                         <View key={item.id}>
// //                             <View style={styles.productCard}>
// //                                 <Image source={{ uri: item.image }} style={styles.productImage} />
// //                                 <View style={styles.productDetails}>
// //                                     <Text style={styles.productName} numberOfLines={1}>{item.title}</Text>
// //                                     <Text style={styles.productVariant}>{item.variant}</Text>
// //                                     <View style={styles.priceQtyRow}>
// //                                         <Text style={styles.productPrice}>₹{item.price.toLocaleString('en-IN')}</Text>
// //                                         <View style={styles.quantityContainer}>
// //                                             <TouchableOpacity
// //                                                 style={styles.qtyBtn}
// //                                                 onPress={() => updateQuantity(item.id, 'decrease')}
// //                                                 disabled={item.quantity <= 1}
// //                                             >
// //                                                 <Ionicons name="remove" size={16} color={item.quantity <= 1 ? "#D1D5DB" : "#000"} />
// //                                             </TouchableOpacity>
// //                                             <Text style={styles.qtyText}>{item.quantity}</Text>
// //                                             <TouchableOpacity
// //                                                 style={styles.qtyBtn}
// //                                                 onPress={() => updateQuantity(item.id, 'increase')}
// //                                             >
// //                                                 <Ionicons name="add" size={16} color="#000" />
// //                                             </TouchableOpacity>
// //                                         </View>
// //                                     </View>
// //                                 </View>
// //                             </View>
// //                             {index < checkoutItems.length - 1 && <View style={styles.itemDivider} />}
// //                         </View>
// //                     ))}
// //                 </View>

// //                 {/* Computations Cost Breakdown View */}
// //                 <Text style={[styles.sectionTitle, { marginTop: scale(24) }]}>Order Summary</Text>
// //                 <View style={styles.summaryCard}>
// //                     <View style={styles.summaryRow}>
// //                         <Text style={styles.summaryLabel}>Subtotal</Text>
// //                         <Text style={styles.summaryValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
// //                     </View>
// //                     <View style={styles.summaryRow}>
// //                         <Text style={styles.summaryLabel}>Delivery Charges</Text>
// //                         <Text style={[styles.summaryValue, shipping === 0 && { color: '#16A34A' }]}>{shippingLabel}</Text>
// //                     </View>
// //                     <View style={styles.summaryRow}>
// //                         <Text style={styles.summaryLabel}>Estimated GST</Text>
// //                         <Text style={styles.summaryValue}>₹{Math.round(gst).toLocaleString('en-IN')}</Text>
// //                     </View>
// //                     <View style={styles.summaryDivider} />
// //                     <View style={styles.summaryRow}>
// //                         <Text style={styles.totalLabel}>Total Payable</Text>
// //                         <Text style={styles.totalValue}>₹{Math.round(total).toLocaleString('en-IN')}</Text>
// //                     </View>
// //                 </View>
// //             </ScrollView>

// //             {/* Bottom Footer Fixed Panel Action Launcher */}
// //             <View style={styles.bottomFixedContainer}>
// //                 <TouchableOpacity style={styles.confirmButton} activeOpacity={0.8} onPress={() => setCheckoutModalVisible(true)}>
// //                     <Text style={styles.confirmButtonText}>Confirm Order • ₹{Math.round(total).toLocaleString('en-IN')}</Text>
// //                 </TouchableOpacity>
// //             </View>

// //             {/* Selection Payment Options Sheet Modal */}
// //             <Modal visible={isCheckoutModalVisible} animationType="slide" transparent={true} onRequestClose={() => setCheckoutModalVisible(false)}>
// //                 <View style={styles.modalOverlay}>
// //                     <View style={styles.checkoutModalContent}>
// //                         <View style={styles.modalHeader}>
// //                             <Text style={styles.modalTitle}>Payment method</Text>
// //                             <TouchableOpacity onPress={() => setCheckoutModalVisible(false)}>
// //                                 <Ionicons name="close" size={24} color="#0A0A0A" />
// //                             </TouchableOpacity>
// //                         </View>
// //                         <View style={styles.inputGroup}>
// //                             <Text style={styles.inputLabel}>Payment Method</Text>
// //                             <View style={styles.paymentSelector}>
// //                                 <TouchableOpacity style={[styles.paymentOption, styles.activePaymentOption]}>
// //                                     <Ionicons name="card" size={18} color="#0A0A0A" />
// //                                     <Text style={[styles.paymentText, styles.activePaymentText]}>Online Payment</Text>
// //                                 </TouchableOpacity>
// //                             </View>
// //                         </View>
// //                         <View style={styles.orderSummarySummary}>
// //                             <Text style={styles.inputLabel}>Total Amount to Pay</Text>
// //                             <Text style={styles.summaryPriceBold}>₹{Math.round(total).toLocaleString('en-IN')}</Text>
// //                         </View>
// //                         <TouchableOpacity style={styles.placeOrderBtn} onPress={handleConfirmOrder}>
// //                             <Text style={styles.placeOrderBtnText}>Pay Now via Razorpay</Text>
// //                         </TouchableOpacity>
// //                     </View>
// //                 </View>
// //             </Modal>

// //             {/* Transaction Confirmed Screen Popup Alert */}
// //             <Modal visible={isSuccessModalVisible} animationType="fade" transparent={true}>
// //                 <View style={[styles.modalOverlay, { justifyContent: 'center' }]}>
// //                     <View style={styles.successModalContent}>
// //                         <View style={styles.successBadge}>
// //                             <Ionicons name="checkmark-sharp" size={40} color="#fff" />
// //                         </View>
// //                         <Text style={styles.successTitle}>Order Placed!</Text>
// //                         <Text style={styles.successSubtitle}>Your order has been placed successfully and will be delivered soon.</Text>
// //                     </View>
// //                 </View>
// //             </Modal>
// //         </View>
// //     );
// // };

// // export default CheckOutScreen;

// // const styles = StyleSheet.create({
// //     container: { flex: 1, backgroundColor: '#ffffff' },
// //     loaderOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
// //     scrollContent: { paddingHorizontal: scale(16), paddingTop: scale(16), paddingBottom: scale(120) },
// //     sectionTitle: { fontSize: scale(16), fontWeight: '700', color: '#1F2937' },
// //     freeDeliveryBanner: { marginBottom: scale(12), backgroundColor: '#F0FFF4', borderRadius: scale(12), borderWidth: 1.5, borderColor: '#6EE7B7', flexDirection: 'row', alignItems: 'center', paddingHorizontal: scale(14), paddingVertical: verticalScale(12) },
// //     freeDeliveryTruck: { fontSize: scale(26), marginRight: scale(12) },
// //     freeDeliveryTextContainer: { flex: 1 },
// //     freeDeliveryTitle: { fontSize: scale(13), fontWeight: '800', color: '#064E3B' },
// //     freeDeliverySubtitle: { fontSize: scale(11), color: '#065F46', marginTop: verticalScale(2) },
// //     freeDeliveryBadge: { fontSize: scale(12), fontWeight: '900', color: '#FFFFFF', backgroundColor: '#10B981', borderRadius: scale(6), paddingHorizontal: scale(8), paddingVertical: verticalScale(4), overflow: 'hidden' },
// //     addressCard: { marginTop: scale(12), backgroundColor: '#FFF', borderRadius: scale(12), borderWidth: 1, borderColor: '#E5E7EB', padding: scale(16) },
// //     topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
// //     leftRow: { flexDirection: 'row', alignItems: 'center' },
// //     addressType: { marginLeft: scale(8), fontSize: scale(16), fontWeight: '700', color: '#1F2937' },
// //     addressBody: { marginTop: scale(10) },
// //     addressText: { fontSize: scale(14), color: '#4B5563', lineHeight: scale(20) },
// //     changeBtn: { alignSelf: 'flex-end', marginTop: scale(8) },
// //     changeText: { fontSize: scale(14), fontWeight: '600', color: '#2563EB' },
// //     actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: scale(10) },
// //     addAddressBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
// //     addAddressText: { fontSize: scale(14), fontWeight: '600', color: '#2563EB', marginLeft: scale(4) },
// //     productsContainer: { marginTop: scale(12), backgroundColor: '#FFF', borderRadius: scale(12), borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: scale(4) },
// //     productCard: { flexDirection: 'row', padding: scale(14), alignItems: 'center' },
// //     productImage: { width: scale(64), height: scale(64), borderRadius: scale(8), backgroundColor: '#F3F4F6' },
// //     productDetails: { flex: 1, marginLeft: scale(12) },
// //     productName: { fontSize: scale(14), fontWeight: '600', color: '#1F2937' },
// //     productVariant: { fontSize: scale(12), color: '#9CA3AF', marginTop: scale(2) },
// //     priceQtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: scale(8) },
// //     productPrice: { fontSize: scale(15), fontWeight: '700', color: '#1F2937' },
// //     quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: scale(8), borderWidth: 1, borderColor: '#E5E7EB', padding: scale(2) },
// //     qtyBtn: { width: scale(28), height: scale(28), justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderRadius: scale(6) },
// //     qtyText: { fontSize: scale(14), fontWeight: '600', color: '#1F2937', paddingHorizontal: scale(12), textAlign: 'center' },
// //     itemDivider: { height: 1, backgroundColor: '#E5E7EB', marginHorizontal: scale(14) },
// //     emptyState: { padding: scale(16), alignItems: 'center' },
// //     emptyText: { fontSize: scale(14), color: '#6B7280' },
// //     summaryCard: { marginTop: scale(12), backgroundColor: '#FFF', borderRadius: scale(12), borderWidth: 1, borderColor: '#E5E7EB', padding: scale(16) },
// //     summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: scale(4) },
// //     summaryLabel: { fontSize: scale(14), color: '#4B5563' },
// //     summaryValue: { fontSize: scale(14), fontWeight: '500', color: '#1F2937' },
// //     summaryDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: scale(10) },
// //     totalLabel: { fontSize: scale(16), fontWeight: '700', color: '#1F2937' },
// //     totalValue: { fontSize: scale(18), fontWeight: '800', color: '#10B981' },
// //     bottomFixedContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', paddingHorizontal: scale(16), paddingTop: scale(12), paddingBottom: SCREEN_HEIGHT < 700 ? scale(16) : scale(60), borderTopWidth: 1, borderTopColor: '#E5E7EB', elevation: 10 },
// //     confirmButton: { backgroundColor: '#000', borderRadius: scale(12), height: scale(48), justifyContent: 'center', alignItems: 'center' },
// //     confirmButtonText: { color: '#FFF', fontSize: scale(16), fontWeight: '700' },
// //     modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
// //     checkoutModalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: moderateScale(20), maxHeight: '80%' },
// //     modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: verticalScale(16), borderBottomWidth: 1, borderBottomColor: '#EFEFEF', marginBottom: verticalScale(16) },
// //     modalTitle: { fontSize: moderateScale(16), fontWeight: '800', color: '#0A0A0A' },
// //     inputGroup: { marginBottom: verticalScale(14) },
// //     inputLabel: { fontSize: moderateScale(12), fontWeight: '700', color: '#666', marginBottom: verticalScale(6) },
// //     paymentSelector: { flexDirection: 'row', justifyContent: 'space-between', marginTop: verticalScale(4) },
// //     paymentOption: { flex: 1, flexDirection: 'row', height: verticalScale(44), borderWidth: 1.5, borderColor: '#EFEFEF', borderRadius: moderateScale(8), justifyContent: 'center', alignItems: 'center', marginHorizontal: scale(4) },
// //     activePaymentOption: { borderColor: '#0A0A0A', backgroundColor: 'rgba(10, 10, 10, 0.05)' },
// //     paymentText: { fontSize: moderateScale(12.5), fontWeight: '600', color: '#666', marginLeft: scale(6) },
// //     activePaymentText: { color: '#0A0A0A', fontWeight: '700' },
// //     orderSummarySummary: { backgroundColor: '#F9F9F9', borderRadius: moderateScale(8), padding: moderateScale(12), marginTop: verticalScale(8), marginBottom: verticalScale(16), alignItems: 'center' },
// //     summaryPriceBold: { fontSize: moderateScale(15), fontWeight: '900', color: '#0A0A0A' },
// //     placeOrderBtn: { backgroundColor: '#0A0A0A', height: verticalScale(48), borderRadius: moderateScale(10), justifyContent: 'center', alignItems: 'center', marginTop: verticalScale(10), marginBottom: verticalScale(30) },
// //     placeOrderBtnText: { color: '#ffffff', fontSize: moderateScale(15), fontWeight: '800' },
// //     successModalContent: { backgroundColor: '#ffffff', borderRadius: moderateScale(16), padding: moderateScale(24), marginHorizontal: scale(24), alignItems: 'center', alignSelf: 'center', width: width - 48, elevation: 5 },
// //     successBadge: { width: scale(70), height: verticalScale(70), borderRadius: moderateScale(35), backgroundColor: '#28A745', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(16) },
// //     successTitle: { fontSize: moderateScale(18), fontWeight: '900', color: '#0A0A0A', textAlign: 'center' },
// //     successSubtitle: { fontSize: moderateScale(13), color: '#666', textAlign: 'center', marginTop: verticalScale(8), lineHeight: moderateScale(18) }
// // });



// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image, Dimensions, Modal, ActivityIndicator, Alert, Animated } from "react-native";
// import { moderateScale, scale, verticalScale } from "../utils/responsive";
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import api from '../config/apiConfig';
// import { IMAGE_BASE_URL } from '../api/apiBaseUrl';
// import { useSelector } from 'react-redux';
// import RazorpayCheckout from 'react-native-razorpay'; 

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// interface CheckoutItem {
//     id: string;
//     title: string;
//     variant: string;
//     price: number;
//     quantity: number;
//     image: string;
// }

// interface AddressItem {
//     id: string;
//     name: string;
//     phone: string;
//     address: string;
//     city: string;
//     state: string;
//     pincode: string;
//     isDefault?: boolean;
// }

// const CheckOutScreen = () => {
//     const navigation = useNavigation<any>();
//     const userId = useSelector((state: any) => state.auth.userId);

//     const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
//     const [addresses, setAddresses] = useState<AddressItem[]>([]);
//     const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
//     const [summary, setSummary] = useState<any>(null);

//     const buildImageUrl = (value?: string) => {
//         if (!value) return 'https://via.placeholder.com/100';
//         if (value.startsWith('http')) return value;
//         return `${IMAGE_BASE_URL}${value.startsWith('/') ? value.slice(1) : value}`;
//     };

//     useFocusEffect(
//         useCallback(() => {
//             fetchCartAndAddress();
//         }, [userId])
//     );

//     const fetchCartAndAddress = async () => {
//         if (!userId) return;
//         try {
//             setLoading(true);
//             const [cartResponse, addressResponse] = await Promise.all([
//                 api.get('/cart'),
//                 api.get(`/address?user_id=${userId}`),
//             ]);

//             if (cartResponse.data?.status) {
//                 const items = cartResponse.data?.data?.cart_items ?? [];
//                 const mappedItems = items.map((item: any) => ({
//                     id: String(item.id),
//                     title: item.product?.name || item.product_name || 'Product',
//                     variant: item.product_varient?.name || item.variant_name || 'Standard',
//                     price: Number(item.product_varient?.discount_price || item.product_varient?.price || item.product?.discount_price || item.product?.price || item.price || 0),
//                     quantity: item.quantity || 1,
//                     image: buildImageUrl(item.product_varient?.thumbnail || item.product?.thumbnail),
//                 }));
//                 setCheckoutItems(mappedItems);
//                 setSummary(cartResponse.data?.data?.summary ?? null);
//             }

//             const serverAddresses = addressResponse.data?.data?.addresses ?? [];
//             const mappedAddresses = serverAddresses.map((item: any) => ({
//                 id: String(item.id),
//                 name: `${item.first_name} ${item.last_name}`.trim(),
//                 phone: item.phone,
//                 address: item.address,
//                 city: item.city,
//                 state: item.state ?? '',
//                 pincode: item.postcode ?? item.pincode ?? '',
//                 isDefault: item.is_primary === 1,
//             }));
//             setAddresses(mappedAddresses);
//             if (mappedAddresses.length > 0) {
//                 setSelectedAddressId(mappedAddresses.find((a: AddressItem) => a.isDefault)?.id || mappedAddresses[0].id);
//             }
//         } catch (error: any) {
//             console.log('[Checkout] Fetch error architecture stack:', error?.response?.data ?? error.message);
//             Alert.alert('Error', 'Unable to load checkout details');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const updateQuantity = (id: string, type: 'increase' | 'decrease') => {
//         setCheckoutItems(prevItems =>
//             prevItems.map(item => {
//                 if (item.id === id) {
//                     const newQty = type === 'increase' ? item.quantity + 1 : item.quantity - 1;
//                     return { ...item, quantity: Math.max(1, newQty) };
//                 }
//                 return item;
//             })
//         );
//     };

//     const subtotal = summary?.subtotal ?? checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//     const shipping = summary?.shipping ?? 0;
//     const shippingLabel = summary?.shipping_label ?? (shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`);
//     const gst = summary?.gst ?? 0;
//     const total = summary?.total ?? (subtotal + shipping + gst);
//     const selectedAddress = addresses.find(address => address.id === selectedAddressId);
//     const isFreeDelivery = shipping === 0;

//     const truckAnim = useRef(new Animated.Value(-100)).current;
//     const pulseAnim = useRef(new Animated.Value(1)).current;
//     useEffect(() => {
//         if (isFreeDelivery) {
//             Animated.sequence([
//                 Animated.timing(truckAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
//                 Animated.loop(
//                     Animated.sequence([
//                         Animated.timing(pulseAnim, { toValue: 1.04, duration: 700, useNativeDriver: true }),
//                         Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
//                     ])
//                 ),
//             ]).start();
//         }
//     }, [isFreeDelivery]);

//   const handleConfirmOrder = async () => {
//     if (!selectedAddressId) {
//         Alert.alert("Address Missing", "Please select a delivery address before initiating payment.");
//         return;
//     }

//     try {
//         setLoading(true);
        
//         // 1. Create Order on your backend first
//         const response = await api.post('place-order', {
//             address_id: selectedAddressId,
//             payment_method: "razorpay"
//         });

//         if (response.data?.status) {
//             const orderData = response.data.data; 

//             const options = {
//                 description: `Order Payment - ${orderData.order_number}`,
//                 image: 'https://swizerfashion.com/public/frontend/assets/images/logo/logoblack.png', 
//                 currency: orderData.currency || 'INR',              
//                 key: 'rzp_live_SnyMtzXPhiXLfo',        
//                 amount: orderData.amount,                  
//                 name: 'Swizer Fashion',
//                 order_id: orderData.razorpay_order_id,     
//                 prefill: {
//                     email: orderData.prefill?.email || '',       
//                     contact: orderData.prefill?.contact || '',   
//                     name: orderData.prefill?.name || ''         
//                 },
//                 theme: { color: '#000000' }                
//             };

//             setLoading(false);

//             // 2. Open Razorpay Checkout Sheet
//             RazorpayCheckout.open(options)
//                 .then(async (successResponse: any) => {
//                     console.log('Razorpay Success Payload:', successResponse);
                    
//                     // Show loading indicator again while verifying backend status
//                     setLoading(true);

//                     try {
//                         // 3. INTEGRATED: Send verification tokens to backend API
//                         const verifyResponse = await api.post('verify-payment', {
//                             razorpay_order_id: successResponse.razorpay_order_id,
//                             razorpay_payment_id: successResponse.razorpay_payment_id,
//                             razorpay_signature: successResponse.razorpay_signature,
//                             order_id: orderData.id // your internal database order row identification
//                         });

//                         setLoading(false);

//                         if (verifyResponse.data?.status) {
//                             // Payment successfully validated on server side
//                             setSuccessModalVisible(true);
//                             setTimeout(() => { 
//                                 setSuccessModalVisible(false);
//                                 navigation.navigate("MainTabs", { screen: "HomeTab" });
//                             }, 3000);
//                         } else {
//                             Alert.alert('Verification Failed', verifyResponse.data?.message || 'Payment authentication failed.');
//                         }

//                     } catch (verifyError: any) {
//                         setLoading(false);
//                         console.log('[Verification Connection Error]', verifyError);
//                         Alert.alert('Verification Error', 'Failed to confirm transaction status with server.');
//                     }
//                 })
//                 .catch((errorResponse: any) => {
//                     setLoading(false);
//                     console.log('[Razorpay Error Container Output]', errorResponse);
//                     Alert.alert('Payment Cancelled', errorResponse.description || 'Payment workflow closed or failed.');
//                 });

//         } else {
//             setLoading(false);
//             Alert.alert("Order Execution Failure", response.data?.message || "Unable to initiate order parameters.");
//         }
//     } catch (error: any) {
//         setLoading(false);
//         console.log('[Checkout Catch Error]', error?.response?.data ?? error.message);
//         Alert.alert('Server Error', 'Failed to reach backend communication terminals.');
//     }
// };

//     return (
//         <View style={styles.container}>
            
//             {/* ⬇️ EXACT CENTRED REAL TIME EXPERIENCED LOADER OVERLAY */}
//             <Modal transparent visible={loading} animationType="fade">
//                 <View style={styles.loaderModalContainer}>
//                     <View style={styles.loaderBoxContent}>
//                         <ActivityIndicator size="large" color="#000000" />
//                         <Text style={styles.loaderStatusMessageText}>Securing Payment Gateway...</Text>
//                     </View>
//                 </View>
//             </Modal>

//             <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
//                 {isFreeDelivery && (
//                     <Animated.View style={[styles.freeDeliveryBanner, { transform: [{ translateX: truckAnim }, { scale: pulseAnim }] }]}>
//                         <Text style={styles.freeDeliveryTruck}>🚚</Text>
//                         <View style={styles.freeDeliveryTextContainer}>
//                             <Text style={styles.freeDeliveryTitle}>You've unlocked FREE Delivery!</Text>
//                             <Text style={styles.freeDeliverySubtitle}>Your order qualifies for free shipping.</Text>
//                         </View>
//                         <Text style={styles.freeDeliveryBadge}>FREE</Text>
//                     </Animated.View>
//                 )}

//                 <Text style={styles.sectionTitle}>Delivery Address</Text>
//                 {selectedAddress ? (
//                     <View style={styles.addressCard}>
//                         <View style={styles.topRow}>
//                             <View style={styles.leftRow}>
//                                 <Ionicons name="radio-button-on" size={22} color="#000" />
//                                 <Text style={styles.addressType}>{selectedAddress.name}</Text>
//                             </View>
//                         </View>
//                         <View style={styles.addressBody}>
//                             <Text style={styles.addressText}>{selectedAddress.address}</Text>
//                             <Text style={styles.addressText}>{selectedAddress.city}, {selectedAddress.state}</Text>
//                             <Text style={styles.addressText}>{selectedAddress.pincode}</Text>
//                             <Text style={styles.addressText}>{selectedAddress.phone}</Text>
//                         </View>
//                         <View style={styles.actionRow}>
//                             <TouchableOpacity style={styles.changeBtn} onPress={() => navigation.navigate("DeliveryAddress")}>
//                                 <Text style={styles.changeText}>Change Address</Text>
//                             </TouchableOpacity>
//                             <TouchableOpacity style={styles.addAddressBtn} onPress={() => navigation.navigate("AddAddress")}>
//                                 <Ionicons name="add-circle-outline" size={18} color="#2563EB" />
//                                 <Text style={styles.addAddressText}>Add Address</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 ) : (
//                     <View style={styles.addressCard}>
//                         <Text style={styles.addressText}>No saved address found.</Text>
//                         <TouchableOpacity style={styles.addAddressBtn} onPress={() => navigation.navigate("AddAddress")}>
//                             <Ionicons name="add-circle-outline" size={18} color="#2563EB" />
//                             <Text style={styles.addAddressText}>Add Address</Text>
//                         </TouchableOpacity>
//                     </View>
//                 )}

//                 <Text style={[styles.sectionTitle, { marginTop: scale(24) }]}>Product Details</Text>
//                 <View style={styles.productsContainer}>
//                     {checkoutItems.length === 0 ? (
//                         <View style={styles.emptyState}>
//                             <Text style={styles.emptyText}>No items in cart.</Text>
//                         </View>
//                     ) : checkoutItems.map((item, index) => (
//                         <View key={item.id}>
//                             <View style={styles.productCard}>
//                                 <Image source={{ uri: item.image }} style={styles.productImage} />
//                                 <View style={styles.productDetails}>
//                                     <Text style={styles.productName} numberOfLines={1}>{item.title}</Text>
//                                     <Text style={styles.productVariant}>{item.variant}</Text>
//                                     <View style={styles.priceQtyRow}>
//                                         <Text style={styles.productPrice}>₹{item.price.toLocaleString('en-IN')}</Text>
//                                         <View style={styles.quantityContainer}>
//                                             <TouchableOpacity
//                                                 style={styles.qtyBtn}
//                                                 onPress={() => updateQuantity(item.id, 'decrease')}
//                                                 disabled={item.quantity <= 1}
//                                             >
//                                                 <Ionicons name="remove" size={16} color={item.quantity <= 1 ? "#D1D5DB" : "#000"} />
//                                             </TouchableOpacity>
//                                             <Text style={styles.qtyText}>{item.quantity}</Text>
//                                             <TouchableOpacity
//                                                 style={styles.qtyBtn}
//                                                 onPress={() => updateQuantity(item.id, 'increase')}
//                                             >
//                                                 <Ionicons name="add" size={16} color="#000" />
//                                             </TouchableOpacity>
//                                         </View>
//                                     </View>
//                                 </View>
//                             </View>
//                             {index < checkoutItems.length - 1 && <View style={styles.itemDivider} />}
//                         </View>
//                     ))}
//                 </View>

//                 <Text style={[styles.sectionTitle, { marginTop: scale(24) }]}>Order Summary</Text>
//                 <View style={styles.summaryCard}>
//                     <View style={styles.summaryRow}>
//                         <Text style={styles.summaryLabel}>Subtotal</Text>
//                         <Text style={styles.summaryValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
//                     </View>
//                     <View style={styles.summaryRow}>
//                         <Text style={styles.summaryLabel}>Delivery Charges</Text>
//                         <Text style={[styles.summaryValue, shipping === 0 && { color: '#16A34A' }]}>{shippingLabel}</Text>
//                     </View>
//                     <View style={styles.summaryRow}>
//                         <Text style={styles.summaryLabel}>Estimated GST</Text>
//                         <Text style={styles.summaryValue}>₹{Math.round(gst).toLocaleString('en-IN')}</Text>
//                     </View>
//                     <View style={styles.summaryDivider} />
//                     <View style={styles.summaryRow}>
//                         <Text style={styles.totalLabel}>Total Payable</Text>
//                         <Text style={styles.totalValue}>₹{Math.round(total).toLocaleString('en-IN')}</Text>
//                     </View>
//                 </View>
//             </ScrollView>

//             <View style={styles.bottomFixedContainer}>
//                 <View style={styles.bottomPriceContainer}>
//                     <Text style={styles.bottomPriceLabel}>Total Payable</Text>
//                     <Text style={styles.bottomPriceValue}>₹{Math.round(total).toLocaleString('en-IN')}</Text>
//                 </View>
//                 <TouchableOpacity style={styles.payNowButton} activeOpacity={0.8} onPress={handleConfirmOrder}>
//                     <Text style={styles.payNowButtonText}>Pay Now via Razorpay</Text>
//                     <Ionicons name="arrow-forward" size={18} color="#FFF" style={styles.arrowIcon} />
//                 </TouchableOpacity>
//             </View>

//             <Modal visible={isSuccessModalVisible} animationType="fade" transparent={true}>
//                 <View style={[styles.modalOverlay, { justifyContent: 'center' }]}>
//                     <View style={styles.successModalContent}>
//                         <View style={styles.successBadge}>
//                             <Ionicons name="checkmark-sharp" size={40} color="#fff" />
//                         </View>
//                         <Text style={styles.successTitle}>Order Placed!</Text>
//                         <Text style={styles.successSubtitle}>Your order has been placed successfully.</Text>
//                     </View>
//                 </View>
//             </Modal>
//         </View>
//     );
// };

// export default CheckOutScreen;

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#ffffff' },
    
//     // ⬇️ PERFECT CENTRED TRANSLUCENT OVERLAY STYLE SHEETS
//     loaderModalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
//     loaderBoxContent: { backgroundColor: '#FFFFFF', paddingHorizontal: scale(28), paddingVertical: scale(22), borderRadius: scale(16), alignItems: 'center', justifyContent: 'center', elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, minWidth: scale(220) },
//     loaderStatusMessageText: { marginTop: scale(14), fontSize: scale(13), color: '#4B5563', fontWeight: '600', letterSpacing: 0.2, textAlign: 'center' },

//     scrollContent: { paddingHorizontal: scale(16), paddingTop: scale(16), paddingBottom: scale(140) },
//     sectionTitle: { fontSize: scale(16), fontWeight: '700', color: '#1F2937' },
//     freeDeliveryBanner: { marginBottom: scale(12), backgroundColor: '#F0FFF4', borderRadius: scale(12), borderWidth: 1.5, borderColor: '#6EE7B7', flexDirection: 'row', alignItems: 'center', paddingHorizontal: scale(14), paddingVertical: verticalScale(12) },
//     freeDeliveryTruck: { fontSize: scale(26), marginRight: scale(12) },
//     freeDeliveryTextContainer: { flex: 1 },
//     freeDeliveryTitle: { fontSize: scale(13), fontWeight: '800', color: '#064E3B' },
//     freeDeliverySubtitle: { fontSize: scale(11), color: '#065F46', marginTop: verticalScale(2) },
//     freeDeliveryBadge: { fontSize: scale(12), fontWeight: '900', color: '#FFFFFF', backgroundColor: '#10B981', borderRadius: scale(6), paddingHorizontal: scale(8), paddingVertical: verticalScale(4), overflow: 'hidden' },
//     addressCard: { marginTop: scale(12), backgroundColor: '#FFF', borderRadius: scale(12), borderWidth: 1, borderColor: '#E5E7EB', padding: scale(16) },
//     topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//     leftRow: { flexDirection: 'row', alignItems: 'center' },
//     addressType: { marginLeft: scale(8), fontSize: scale(16), fontWeight: '700', color: '#1F2937' },
//     addressBody: { marginTop: scale(10) },
//     addressText: { fontSize: scale(14), color: '#4B5563', lineHeight: scale(20) },
//     changeBtn: { alignSelf: 'flex-end', marginTop: scale(8) },
//     changeText: { fontSize: scale(14), fontWeight: '600', color: '#2563EB' },
//     actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: scale(10) },
//     addAddressBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
//     addAddressText: { fontSize: scale(14), fontWeight: '600', color: '#2563EB', marginLeft: scale(4) },
//     productsContainer: { marginTop: scale(12), backgroundColor: '#FFF', borderRadius: scale(12), borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: scale(4) },
//     productCard: { flexDirection: 'row', padding: scale(14), alignItems: 'center' },
//     productImage: { width: scale(64), height: scale(64), borderRadius: scale(8), backgroundColor: '#F3F4F6' },
//     productDetails: { flex: 1, marginLeft: scale(12) },
//     productName: { fontSize: scale(14), fontWeight: '600', color: '#1F2937' },
//     productVariant: { fontSize: scale(12), color: '#9CA3AF', marginTop: scale(2) },
//     priceQtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: scale(8) },
//     productPrice: { fontSize: scale(15), fontWeight: '700', color: '#1F2937' },
//     quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: scale(8), borderWidth: 1, borderColor: '#E5E7EB', padding: scale(2) },
//     qtyBtn: { width: scale(28), height: scale(28), justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderRadius: scale(6) },
//     qtyText: { fontSize: scale(14), fontWeight: '600', color: '#1F2937', paddingHorizontal: scale(12), textAlign: 'center' },
//     itemDivider: { height: 1, backgroundColor: '#E5E7EB', marginHorizontal: scale(14) },
//     emptyState: { padding: scale(16), alignItems: 'center' },
//     emptyText: { fontSize: scale(14), color: '#6B7280' },
//     summaryCard: { marginTop: scale(12), backgroundColor: '#FFF', borderRadius: scale(12), borderWidth: 1, borderColor: '#E5E7EB', padding: scale(16) },
//     summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: scale(4) },
//     summaryLabel: { fontSize: scale(14), color: '#4B5563' },
//     summaryValue: { fontSize: scale(14), fontWeight: '500', color: '#1F2937' },
//     summaryDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: scale(10) },
//     totalLabel: { fontSize: scale(16), fontWeight: '700', color: '#1F2937' },
//     totalValue: { fontSize: scale(18), fontWeight: '800', color: '#10B981' },
    
//     bottomFixedContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: scale(20), paddingTop: scale(16), paddingBottom: SCREEN_HEIGHT < 700 ? scale(20) : scale(44), borderTopWidth: 1, borderTopColor: '#EEEEEE', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 10 },
//     bottomPriceContainer: { flexDirection: 'column' },
//     bottomPriceLabel: { fontSize: scale(11), color: '#777777', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
//     bottomPriceValue: { fontSize: scale(20), fontWeight: '800', color: '#000000', marginTop: scale(2) },
//     payNowButton: { flex: 1, backgroundColor: '#000000', marginLeft: scale(24), borderRadius: scale(12), height: scale(50), flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: scale(16), elevation: 2 },
//     payNowButtonText: { color: '#FFFFFF', fontSize: scale(15), fontWeight: '700', letterSpacing: 0.2 },
//     arrowIcon: { marginLeft: scale(6) },
    
//     modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center' },
//     successModalContent: { backgroundColor: '#ffffff', borderRadius: moderateScale(16), padding: moderateScale(24), marginHorizontal: scale(24), alignItems: 'center', alignSelf: 'center', width: SCREEN_WIDTH - 48, elevation: 5 },
//     successBadge: { width: scale(70), height: verticalScale(70), borderRadius: moderateScale(35), backgroundColor: '#28A745', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(16) },
//     successTitle: { fontSize: moderateScale(18), fontWeight: '900', color: '#0A0A0A', textAlign: 'center' },
//     successSubtitle: { fontSize: moderateScale(13), color: '#666', textAlign: 'center', marginTop: verticalScale(8), lineHeight: moderateScale(18) }
// });


import React, { useEffect, useState, useRef, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image, Dimensions, Modal, ActivityIndicator, Alert, Animated } from "react-native";
import { moderateScale, scale, verticalScale } from "../utils/responsive";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import api from '../config/apiConfig';
import { IMAGE_BASE_URL } from '../api/apiBaseUrl';
import { useSelector } from 'react-redux';
import RazorpayCheckout from 'react-native-razorpay';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const FREE_SHIPPING_THRESHOLD = 999; 
const DEFAULT_GST_PERCENT = 5;

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
    quantity: item.quantity || 1,
    image: buildImageUrl(item.product_varient?.thumbnail || item.product?.thumbnail),
    productId: item.product_id,
    variantId: item.variant_id,
});

const CheckOutScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const userId = useSelector((state: any) => state.auth.userId);

    // Params from either entry point 
    const {
        buyNow,
        product_id,
        variant_id,
        quantity: buyNowQuantity,
        price: buyNowPrice,
        productName,
        productImage,
        gstPercent,
        selectedItems, // from CartScreen's "Checkout" button
    } = route.params || {};

    const isBuyNow = !!buyNow;
    const isFromCartSelection = !isBuyNow && Array.isArray(selectedItems) && selectedItems.length > 0;

    const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
    const [addresses, setAddresses] = useState<AddressItem[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [summary, setSummary] = useState<any>(null);

    useFocusEffect(
        useCallback(() => {
            initCheckout();
        }, [userId])
    );

    const initCheckout = async () => {
        if (!userId) return;
        try {
            setLoading(true);

            // Address is always needed regardless of entry point
            const addressResponse = await api.get(`/address?user_id=${userId}`);
            const serverAddresses = addressResponse.data?.data?.addresses ?? [];
            const mappedAddresses = serverAddresses.map((item: any) => ({
                id: String(item.id),
                name: `${item.first_name} ${item.last_name}`.trim(),
                phone: item.phone,
                address: item.address,
                city: item.city,
                state: item.state ?? '',
                pincode: item.postcode ?? item.pincode ?? '',
                isDefault: item.is_primary === 1,
            }));
            setAddresses(mappedAddresses);
            if (mappedAddresses.length > 0) {
                setSelectedAddressId(mappedAddresses.find((a: AddressItem) => a.isDefault)?.id || mappedAddresses[0].id);
            }

            if (isBuyNow) {
                // ---------- BUY NOW: single item, no /cart call at all ----------
                const qty = buyNowQuantity || 1;
                const price = Number(buyNowPrice) || 0;
                const singleItem: CheckoutItem = {
                    id: `buynow-${product_id}-${variant_id}`,
                    title: productName || 'Product',
                    variant: 'Selected variant',
                    price,
                    quantity: qty,
                    image: buildImageUrl(productImage),
                    productId: product_id,
                    variantId: variant_id,
                };
                setCheckoutItems([singleItem]);

                // Local summary calc (matches ~5% gst seen in real orders, free shipping)
                const subtotal = price * qty;
                const gstPct = gstPercent ?? DEFAULT_GST_PERCENT;
                const gst = +(subtotal * (gstPct / 100)).toFixed(2);
                const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 0; // shop appears to always ship free
                const total = +(subtotal + gst + shipping).toFixed(2);

                setSummary({
                    subtotal,
                    gst,
                    shipping,
                    shipping_label: shipping === 0 ? 'Free' : `₹${shipping}`,
                    total,
                });

            } else if (isFromCartSelection) {
                // ---------- CART CHECKOUT: use the items passed from CartScreen ----------
                const mappedItems = selectedItems.map(mapCartItemToCheckoutItem);
                setCheckoutItems(mappedItems);

                // Get the authoritative summary for exactly these selected cart ids
                // const cartIds = selectedItems.map((item: any) => item.id);
                // const summaryResponse = await api.post('/cart/summary', { cart_ids: cartIds, user_id: userId });
                // if (summaryResponse.data?.status) {
                //     setSummary(summaryResponse.data.data.summary);
                // }

            } else {
                // ---------- FALLBACK: no params, load entire cart (safety net) ----------
                const cartResponse = await api.get('/cart');
                if (cartResponse.data?.status) {
                    const items = cartResponse.data?.data?.cart_items ?? [];
                    setCheckoutItems(items.map(mapCartItemToCheckoutItem));
                    setSummary(cartResponse.data?.data?.summary ?? null);
                }
            }
        } catch (error: any) {
            console.log('[Checkout] init error:', error?.response?.data ?? error.message);
            Alert.alert('Error', 'Unable to load checkout details');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = (id: string, type: 'increase' | 'decrease') => {
        // Note: for Buy Now / cart-selection flows this only updates the local UI number.
        // If you want quantity changes to affect price live, recompute summary here too.
        setCheckoutItems(prevItems =>
            prevItems.map(item => {
                if (item.id === id) {
                    const newQty = type === 'increase' ? item.quantity + 1 : item.quantity - 1;
                    return { ...item, quantity: Math.max(1, newQty) };
                }
                return item;
            })
        );
    };

    const subtotal = summary?.subtotal ?? checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = summary?.shipping ?? 0;
    const shippingLabel = summary?.shipping_label ?? (shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`);
    const gst = summary?.gst ?? 0;
    const total = summary?.total ?? (subtotal + shipping + gst);
    const selectedAddress = addresses.find(address => address.id === selectedAddressId);
    const isFreeDelivery = shipping === 0;

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
            Alert.alert("Address Missing", "Please select a delivery address before initiating payment.");
            return;
        }

        try {
            setLoading(true);

            // Build the place-order payload depending on entry point
            const placeOrderPayload: any = {
                address_id: selectedAddressId,
                payment_method: "razorpay",
            };

            if (isBuyNow) {
                placeOrderPayload.buy_now = true;
                placeOrderPayload.product_id = product_id;
                placeOrderPayload.variant_id = variant_id;
                placeOrderPayload.quantity = buyNowQuantity || 1;
            } else if (isFromCartSelection) {
                placeOrderPayload.cart_ids = selectedItems.map((item: any) => item.id);
            }
            // else: fallback lets backend use the full cart as before

            const response = await api.post('place-order', placeOrderPayload);

            if (response.data?.status) {
                const orderData = response.data.data;

                setLoading(false);
                
                // Navigate to the separate RazorpayPaymentScreen
                navigation.navigate("Payment Screen", { 
                    orderData: orderData, 
                    preferredMethod: "card" 
                });

            } else {
                setLoading(false);
                Alert.alert("Order Execution Failure", response.data?.message || "Unable to initiate order parameters.");
            }
        } catch (error: any) {
            setLoading(false);
            console.log('[Checkout Catch Error]', error?.response?.data ?? error.message);
            Alert.alert('Server Error', 'Failed to reach backend communication terminals.');
        }
    };

    return (
        <View style={styles.container}>
            <Modal transparent visible={loading} animationType="fade">
                <View style={styles.loaderModalContainer}>
                    <View style={styles.loaderBoxContent}>
                        <ActivityIndicator size="large" color="#000000" />
                        <Text style={styles.loaderStatusMessageText}>Securing Payment Gateway...</Text>
                    </View>
                </View>
            </Modal>

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
                        </View>
                        <View style={styles.addressBody}>
                            <Text style={styles.addressText}>{selectedAddress.address}</Text>
                            <Text style={styles.addressText}>{selectedAddress.city}, {selectedAddress.state}</Text>
                            <Text style={styles.addressText}>{selectedAddress.pincode}</Text>
                            <Text style={styles.addressText}>{selectedAddress.phone}</Text>
                        </View>
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.changeBtn} onPress={() => navigation.navigate("DeliveryAddress")}>
                                <Text style={styles.changeText}>Change Address</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.addAddressBtn} onPress={() => navigation.navigate("AddAddress")}>
                                <Ionicons name="add-circle-outline" size={18} color="#2563EB" />
                                <Text style={styles.addAddressText}>Add Address</Text>
                            </TouchableOpacity>
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

                <Text style={[styles.sectionTitle, { marginTop: scale(24) }]}>
                    {isBuyNow ? "Product" : "Product Details"}
                </Text>
                <View style={styles.productsContainer}>
                    {checkoutItems.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No items to checkout.</Text>
                        </View>
                    ) : checkoutItems.map((item, index) => (
                        <View key={item.id}>
                            <View style={styles.productCard}>
                                <Image source={{ uri: item.image }} style={styles.productImage} />
                                <View style={styles.productDetails}>
                                    <Text style={styles.productName} numberOfLines={1}>{item.title}</Text>
                                    <Text style={styles.productVariant}>{item.variant}</Text>
                                    <View style={styles.priceQtyRow}>
                                        {/* <Text style={styles.productPrice}>₹{item.price.toLocaleString('en-IN')}</Text> */}
                                       <Text style={styles.productPrice}>₹{Math.round(item.price).toLocaleString('en-IN')}</Text>
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

                <Text style={[styles.sectionTitle, { marginTop: scale(24) }]}>Order Summary</Text>
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Delivery Charges</Text>
                        <Text style={[styles.summaryValue, shipping === 0 && { color: '#16A34A' }]}>{shippingLabel}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Estimated GST</Text>
                        <Text style={styles.summaryValue}>₹{Math.round(gst).toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total Payable</Text>
                        <Text style={styles.totalValue}>₹{Math.round(total).toLocaleString('en-IN')}</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.bottomFixedContainer}>
                <View style={styles.bottomPriceContainer}>
                    <Text style={styles.bottomPriceLabel}>Total Payable</Text>
                    <Text style={styles.bottomPriceValue}>₹{Math.round(total).toLocaleString('en-IN')}</Text>
                </View>
                <TouchableOpacity style={styles.payNowButton} activeOpacity={0.8} onPress={handleConfirmOrder}>
                    <Text style={styles.payNowButtonText}>Pay Now via Razorpay</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFF" style={styles.arrowIcon} />
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

export default CheckOutScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    loaderModalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
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
    changeBtn: { alignSelf: 'flex-end', marginTop: scale(8) },
    changeText: { fontSize: scale(14), fontWeight: '600', color: '#2563EB' },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: scale(10) },
    addAddressBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    addAddressText: { fontSize: scale(14), fontWeight: '600', color: '#2563EB', marginLeft: scale(4) },
    productsContainer: { marginTop: scale(12), backgroundColor: '#FFF', borderRadius: scale(12), borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: scale(4) },
    productCard: { flexDirection: 'row', padding: scale(14), alignItems: 'center' },
    productImage: { width: scale(64), height: scale(64), borderRadius: scale(8), backgroundColor: '#F3F4F6' },
    productDetails: { flex: 1, marginLeft: scale(12) },
    productName: { fontSize: scale(14), fontWeight: '600', color: '#1F2937' },
    productVariant: { fontSize: scale(12), color: '#9CA3AF', marginTop: scale(2) },
    priceQtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: scale(8) },
    productPrice: { fontSize: scale(15), fontWeight: '700', color: '#1F2937' },
    quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: scale(8), borderWidth: 1, borderColor: '#E5E7EB', padding: scale(2) },
    qtyBtn: { width: scale(28), height: scale(28), justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderRadius: scale(6) },
    qtyText: { fontSize: scale(14), fontWeight: '600', color: '#1F2937', paddingHorizontal: scale(12), textAlign: 'center' },
    itemDivider: { height: 1, backgroundColor: '#E5E7EB', marginHorizontal: scale(14) },
    emptyState: { padding: scale(16), alignItems: 'center' },
    emptyText: { fontSize: scale(14), color: '#6B7280' },
    summaryCard: { marginTop: scale(12), backgroundColor: '#FFF', borderRadius: scale(12), borderWidth: 1, borderColor: '#E5E7EB', padding: scale(16) },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: scale(4) },
    summaryLabel: { fontSize: scale(14), color: '#4B5563' },
    summaryValue: { fontSize: scale(14), fontWeight: '500', color: '#1F2937' },
    summaryDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: scale(10) },
    totalLabel: { fontSize: scale(16), fontWeight: '700', color: '#1F2937' },
    totalValue: { fontSize: scale(18), fontWeight: '800', color: '#10B981' },
    bottomFixedContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: scale(20), paddingTop: scale(16), paddingBottom: SCREEN_HEIGHT < 700 ? scale(20) : scale(44), borderTopWidth: 1, borderTopColor: '#EEEEEE', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 10 },
    bottomPriceContainer: { flexDirection: 'column' },
    bottomPriceLabel: { fontSize: scale(11), color: '#777777', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
    bottomPriceValue: { fontSize: scale(20), fontWeight: '800', color: '#000000', marginTop: scale(2) },
    payNowButton: { flex: 1, backgroundColor: '#000000', marginLeft: scale(24), borderRadius: scale(12), height: scale(50), flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: scale(16), elevation: 2 },
    payNowButtonText: { color: '#FFFFFF', fontSize: scale(15), fontWeight: '700', letterSpacing: 0.2 },
    arrowIcon: { marginLeft: scale(6) },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center' },
    successModalContent: { backgroundColor: '#ffffff', borderRadius: moderateScale(16), padding: moderateScale(24), marginHorizontal: scale(24), alignItems: 'center', alignSelf: 'center', width: SCREEN_WIDTH - 48, elevation: 5 },
    successBadge: { width: scale(70), height: verticalScale(70), borderRadius: moderateScale(35), backgroundColor: '#28A745', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(16) },
    successTitle: { fontSize: moderateScale(18), fontWeight: '900', color: '#0A0A0A', textAlign: 'center' },
    successSubtitle: { fontSize: moderateScale(13), color: '#666', textAlign: 'center', marginTop: verticalScale(8), lineHeight: moderateScale(18) }
});
