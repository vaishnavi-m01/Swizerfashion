import React, { useState, useEffect, useCallback } from "react"
import {
    Image,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ToastAndroid,
    ActivityIndicator,
    Share
} from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from "../utils/responsive"
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute } from '@react-navigation/native';
import api from '../config/apiConfig';
import { IMAGE_BASE_URL } from "../api/apiBaseUrl";
import RNFS from 'react-native-fs';
import RNShare from 'react-native-share';


const STATUS_BADGE_COLORS: Record<string, { bg: string; color: string }> = {
    Pending: { bg: "#FEF3C7", color: "#D97706" },
    Confirmed: { bg: "#DBEAFE", color: "#2563EB" },
    Processing: { bg: "#E0F2FE", color: "#0284C7" },
    Shipped: { bg: "#EDE9FE", color: "#7C3AED" },
    Delivered: { bg: "#DCFCE7", color: "#16A34A" },
    Cancelled: { bg: "#FEE2E2", color: "#DC2626" },
    Returned: { bg: "#FFEDD5", color: "#EA580C" },
    Return: { bg: "#FFEDD5", color: "#EA580C" },
};

const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

const buildSteps = (status: string) => {
    const s = status.toLowerCase();
    const cancelled = s === "cancelled" || s === "canceled";

    if (cancelled) {
        return [
            { title: "Ordered", isCompleted: true },
            { title: "Cancelled", isCompleted: true },
        ];
    }

    const order = ["pending", "confirmed", "shipped", "delivered"];
    const currentIndex = order.indexOf(s) === -1 ? 0 : order.indexOf(s);

    return [
        { title: "Ordered", isCompleted: currentIndex >= 0 },
        { title: "Confirmed", isCompleted: currentIndex >= 1 },
        { title: "Shipped", isCompleted: currentIndex >= 2 },
        { title: "Delivered", isCompleted: currentIndex >= 3 },
    ];
};

const OrderDetailsScreen = () => {
    const route = useRoute<any>();
    const { orderId } = route.params || {}; // pass this as navigation.navigate("OrderDetails", { orderId: 58 })

    // Modal / form state
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [returnModalVisible, setReturnModalVisible] = useState(false);
    const [rating, setRating] = useState(0);
    const [reviewTitle, setReviewTitle] = useState("");
    const [reviewText, setReviewText] = useState("");
    const [reviewItem, setReviewItem] = useState<any>(null);
    const [returnReason, setReturnReason] = useState("");
    const [requestType, setRequestType] = useState<"Return" | "Replace" | "Cancel">("Return");

    // API state
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [reviewId, setReviewId] = useState<string | number | null>(null);
    const [isReviewLoading, setIsReviewLoading] = useState(false);

    const fetchOrderDetails = useCallback(async () => {
        if (!orderId) {
            setError("No order id provided.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/orders/${orderId}`);
            if (response.data?.status) {
                setOrder(response.data.data);
            } else {
                setError(response.data?.message || "Failed to load order details.");
            }
        } catch (err: any) {
            setError(err?.message || "Something went wrong while fetching this order.");
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);


    const submitReview = async () => {
        if (rating === 0) {
            Alert.alert("Error", "Please select a rating.");
            return;
        }
        if (!reviewText.trim()) {
            Alert.alert("Error", "Please write a comment before submitting.");
            return;
        }
        if (!reviewItem) return;

        try {
            const payload = {
                order_item_id: reviewItem.id,
                product_id: reviewItem.product_id,
                variant_id: reviewItem.variant_id,
                rating: rating,
                title: reviewTitle,
                comment: reviewText,
            };

            // If reviewId exists, this is an edit → PUT. Otherwise it's new → POST.
            const response = reviewId
                ? await api.put(`/reviews/${reviewId}`, payload)
                : await api.post('/reviews', payload);

            if (response.data?.status) {
                ToastAndroid.show(
                    reviewId ? "Your review has been updated successfully." : "Your review has been submitted successfully.",
                    ToastAndroid.SHORT
                );
                setReviewModalVisible(false);
                setReviewText("");
                setReviewTitle("");
                setRating(0);
                setReviewItem(null);
                setReviewId(null);
            } else {
                Alert.alert("Error", response.data?.message || "Failed to submit review.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Something went wrong.");
        }
    };

    const submitReturnRequest = async () => {
        if (!returnReason.trim()) {
            Alert.alert("Error", `Please provide a reason for ${requestType.toLowerCase()}.`);
            return;
        }

        try {
            const endpoint = requestType === "Cancel" ? `/orders/${orderId}/cancel` : `/orders/${orderId}/return`;
            const payload = { reason: returnReason };

            console.log("[OrderDetails] Submitting request to:", endpoint, "Payload:", payload);
            const response = await api.post(endpoint, payload);

            if (response.data?.status) {
                ToastAndroid.show(`Your request for order ${requestType.toLowerCase()} has been successfully registered.`, ToastAndroid.LONG);
                setReturnModalVisible(false);
                setReturnReason("");
                fetchOrderDetails();
            } else {
                Alert.alert("Error", response.data?.message || "Failed to submit request.");
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert("Error", error.response?.data?.message || "Something went wrong.");
        }
    };

    const downloadInvoice = () => {
        ToastAndroid.show('Downloading Invoice...', ToastAndroid.SHORT);
        // TODO: hit your invoice endpoint here, e.g. api.get(`/orders/${orderId}/invoice`)
    };

    // ---------- Loading state ----------
    if (loading) {
        return (
            <View style={styles.centerState}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={styles.centerStateText}>Loading order details…</Text>
            </View>
        );
    }

    // ---------- Error / empty state ----------
    if (error || !order) {
        return (
            <View style={styles.centerState}>
                <Ionicons name="alert-circle-outline" size={scale(56)} color="#EF4444" />
                <Text style={styles.centerStateTitle}>Couldn't load order</Text>
                <Text style={styles.centerStateText}>{error || "Order not found."}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchOrderDetails}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ---------- Map API response -> view model ----------
    const displayStatus = capitalize(order.order_status);
    const badgeStyle = STATUS_BADGE_COLORS[displayStatus] || { bg: "#E5E7EB", color: "#374151" };

    const items = (order.items || []).map((item: any) => ({
        id: String(item.id),
        product_id: item.product_id,
        variant_id: item.product_varient?.id || item.variant_id,
        name: item.product_name,
        qty: Number(item.quantity),
        price: Number(item.price),
        color: item.product_varient?.color?.name,
        colorCode: item.product_varient?.color?.code,
        size: item.product_varient?.size?.name,
        image: item.product_varient?.thumbnail
            ? { uri: `${IMAGE_BASE_URL}${item.product_varient.thumbnail}` }
            : require("../asset/images/sareeImg.jpg"),
    }));

    const itemsSubtotal = items.reduce((sum: number, i: any) => sum + i.price * i.qty, 0);
    const shipping = Number(order.shipping_cost || 0);
    const tax = Number(order.tax || 0);
    const total = Number(order.total || 0);

    const addr = order.address || {};
    const shippingAddress = {
        name: `${addr.first_name || ""} ${addr.last_name || ""}`.trim(),
        phone: addr.phone,
        address: [addr.address, addr.city, addr.state, addr.country]
            .filter(Boolean)
            .join(", ") + (addr.postcode ? ` - ${addr.postcode}` : ""),
    };


    const openReviewModal = async (item: any) => {
        setReviewItem(item);
        setReviewModalVisible(true);
        setIsReviewLoading(true);
        // Reset to blank first, in case fetch fails or no review exists
        setReviewId(null);
        setRating(0);
        setReviewTitle("");
        setReviewText("");

        try {
            const response = await api.get(`/reviews?product_varient_id=${item.variant_id}`);
            if (response.data?.status && response.data?.data) {

                const existing = Array.isArray(response.data.data)
                    ? response.data.data[0]
                    : response.data.data;

                if (existing) {
                    setReviewId(existing.id);
                    setRating(existing.rating || 0);
                    setReviewTitle(existing.title || "");
                    setReviewText(existing.comment || "");
                }
            }
        } catch (error) {
            console.log("Error checking existing review:", error);

        } finally {
            setIsReviewLoading(false);
        }
    };

    const handleShareProduct = async (item: any) => {
        try {
            const variantId = item.variant_id || item.id;
            const shareUrl = `https://www.swizerfashion.com/products/detail/${variantId}`;
            const message = `Check out this amazing product on Swizer!\n\n*${item.name}*\nPrice: ₹${item.price}\n\nShop here: ${shareUrl}`;

            let base64Image = '';

            if (item.image && typeof item.image === 'object' && item.image.uri) {
                const imageUrl = item.image.uri;
                try {
                    const downloadDest = `${RNFS.CachesDirectoryPath}/temp_share_image.jpg`;
                    const result = await RNFS.downloadFile({
                        fromUrl: imageUrl,
                        toFile: downloadDest,
                    }).promise;

                    if (result.statusCode === 200) {
                        base64Image = await RNFS.readFile(downloadDest, 'base64');
                        base64Image = `data:image/jpeg;base64,${base64Image}`;
                    }
                } catch (e) {
                    console.log("Image download failed", e);
                }
            }

            const shareOptions: any = {
                message: message,
                title: item.name
            };

            if (base64Image) {
                shareOptions.url = base64Image;
            } else if (item.image && typeof item.image === 'object' && item.image.uri) {
                // Fallback to image url if download fails
                shareOptions.url = item.image.uri;
            }

            await RNShare.open(shareOptions);
        } catch (error) {
            console.log("Error sharing:", error);
        }
    };

    const steps = buildSteps(order.order_status);
    const isCancelled = order.order_status?.toLowerCase().includes("cancel");
    const eta = order.tracking_url
        ? "Track your shipment using the link below"
        : isCancelled
            ? (order.cancel_reason ? `Cancelled: ${order.cancel_reason}` : "This order was cancelled")
            : "We'll update tracking info once it ships";

    return (
        <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: verticalScale(16) }}>

                {/* Main Order Card Header */}
                <View style={styles.card}>
                    <View style={styles.row}>
                        <View>
                            <Text style={styles.orderId}>{order.order_number}</Text>
                            <Text style={styles.subText}>Placed on {formatDate(order.created_at)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(6) }}>
                            {order.payment_status && (() => {
                                const ps = order.payment_status.toLowerCase();
                                let bg = '#F3F4F6';
                                let col = '#4B5563';
                                if (ps === 'paid' || ps === 'success') { bg = '#DCFCE7'; col = '#16A34A'; }
                                else if (ps === 'failed' || ps === 'unpaid') { bg = '#FEE2E2'; col = '#DC2626'; }

                                return (
                                    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                                        <Text style={[styles.statusText, { color: col, textTransform: 'uppercase' }]}>
                                            {order.payment_status}
                                        </Text>
                                    </View>
                                )
                            })()}
                            <View style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}>
                                <Text style={[styles.statusText, { color: badgeStyle.color }]}>{displayStatus}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {items.map((item: any, index: number) => (
                        <View key={item.id}>
                            <View style={styles.productSection}>
                                <Image source={item.image} style={styles.productImage} />
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>

                                    <View style={styles.variantRow}>
                                        {item.colorCode && (
                                            <View style={[styles.colorDot, { backgroundColor: item.colorCode }]} />
                                        )}
                                        {!!item.color && (
                                            <Text style={styles.variantChipText}>{item.color}</Text>
                                        )}
                                        {!!item.color && !!item.size && (
                                            <View style={styles.variantDivider} />
                                        )}
                                        {!!item.size && (
                                            <Text style={styles.variantChipText}>Size {item.size}</Text>
                                        )}
                                    </View>

                                    <View style={styles.qtyPriceRow}>
                                        <Text style={styles.qty}>Qty: {item.qty}</Text>
                                        <Text style={styles.price}>₹{item.price}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={[styles.actionsContainer, { marginTop: verticalScale(8), flexDirection: 'row', gap: scale(10) }]}>
                                <TouchableOpacity
                                    style={styles.reviewButton}
                                    onPress={() => openReviewModal(item)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="star" size={scale(13)} color="#FBBF24" />
                                    <Text style={styles.reviewButtonText}>Write Review</Text>
                                </TouchableOpacity>
                            </View>

                            {index < items.length - 1 && <View style={styles.itemDivider} />}
                        </View>
                    ))}
                </View>

                {/* Shipment Tracking Stepper — hidden if cancelled */}
                {!isCancelled && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Track Shipment</Text>
                        <Text style={styles.subText}>{eta}</Text>

                        <View style={styles.stepperContainer}>
                            {steps.map((step, index) => (
                                <View key={index} style={styles.stepWrapper}>
                                    <View style={styles.stepRow}>
                                        <View style={[styles.stepCircle, step.isCompleted && styles.completedStepCircle]}>
                                            {step.isCompleted && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                        {index < steps.length - 1 && (
                                            <View style={[styles.stepLine, step.isCompleted && styles.completedStepLine]} />
                                        )}
                                    </View>
                                    <Text style={styles.stepTitle}>{step.title}</Text>
                                </View>
                            ))}
                        </View>

                        {order.awb_code && (
                            <View style={styles.awbBox}>
                                <Ionicons name="cube-outline" size={scale(16)} color="#4F46E5" />
                                <Text style={styles.awbText}>
                                    AWB: {order.awb_code} {order.courier_name ? `• ${order.courier_name}` : ""}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {isCancelled && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Order Cancelled</Text>
                        <View style={styles.divider} />
                        <Text style={styles.subText}>
                            {order.cancel_reason || "This order was cancelled."}
                        </Text>
                        {order.cancelled_at && (
                            <Text style={[styles.subText, { marginTop: verticalScale(6) }]}>
                                Cancelled on {formatDate(order.cancelled_at)}
                            </Text>
                        )}
                    </View>
                )}


                {/* Bill Details */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Bill Details</Text>
                    <View style={styles.divider} />

                    <View style={styles.pricingRow}>
                        <Text style={styles.pricingLabel}>Item Subtotal</Text>
                        <Text style={styles.pricingValue}>₹{itemsSubtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.pricingRow}>
                        <Text style={styles.pricingLabel}>Shipping Fee</Text>
                        <Text style={[styles.pricingValue, { color: shipping === 0 ? "#10B981" : "#111827" }]}>
                            {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                        </Text>
                    </View>
                    <View style={styles.pricingRow}>
                        <Text style={styles.pricingLabel}>Tax</Text>
                        <Text style={styles.pricingValue}>₹{tax.toFixed(2)}</Text>
                    </View>

                    <View style={styles.itemDivider} />

                    <View style={[styles.pricingRow, { marginTop: verticalScale(4) }]}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
                    </View>
                    <Text style={[styles.subText, { marginTop: verticalScale(6) }]}>
                        Payment via {order.payment_method?.toUpperCase()} • {capitalize(order.payment_status)}
                    </Text>
                </View>

                {/* Shipping Address */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                    <View style={styles.divider} />
                    <Text style={styles.customerName}>{shippingAddress.name}</Text>
                    <Text style={styles.addressText}>{shippingAddress.address}</Text>
                    <Text style={styles.phoneText}>Phone: {shippingAddress.phone}</Text>
                </View>

                {!isCancelled && displayStatus !== "Returned" && displayStatus !== "Delivered" && (
                    <TouchableOpacity style={styles.cancelReturnContainer} onPress={() => { setRequestType("Cancel"); setReturnModalVisible(true); }}>
                        <Text style={styles.cancelReturnText}>Cancel Order</Text>
                    </TouchableOpacity>
                )}

                {!isCancelled && displayStatus === "Delivered" && (
                    <TouchableOpacity style={styles.cancelReturnContainer} onPress={() => { setRequestType("Return"); setReturnModalVisible(true); }}>
                        <Text style={styles.cancelReturnText}>Return or Replace Items?</Text>
                    </TouchableOpacity>
                )}

            </ScrollView>

            {/* Sticky Bottom Footer — Invoice */}
            <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
                <View style={styles.footerBar}>
                    <View style={styles.footerAmountBlock}>
                        <Text style={styles.footerAmountLabel}>Total Paid</Text>
                        <Text style={styles.footerAmountValue}>₹{total.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity style={styles.invoiceButton} onPress={downloadInvoice} activeOpacity={0.85}>
                        <Ionicons name="download-outline" size={scale(17)} color="#FFF" />
                        <Text style={styles.invoiceButtonText}>Invoice</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Review Modal */}
            <Modal animationType="fade" transparent={true} visible={reviewModalVisible} onRequestClose={() => setReviewModalVisible(false)}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: verticalScale(60) }}
                        style={{ flex: 1, width: '100%' }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.reviewModalContainer}>
                            <Text style={styles.modalTitle}>Write a Review</Text>
                            <Text style={styles.modalSubtitle}>How would you rate the product quality?</Text>

                            <View style={styles.starRow}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                        <Text style={[styles.starText, { color: star <= rating ? "#FBBF24" : "#D1D5DB" }]}>★</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TextInput
                                style={[styles.reviewInput, { minHeight: verticalScale(40), marginBottom: verticalScale(12) }]}
                                placeholder="Review Title (Optional)"
                                placeholderTextColor="#9CA3AF"
                                value={reviewTitle}
                                onChangeText={setReviewTitle}
                            />

                            <TextInput
                                style={styles.reviewInput}
                                placeholder="Share details of your experience with this item..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={4}
                                value={reviewText}
                                onChangeText={setReviewText}
                            />

                            <View style={styles.modalButtonRow}>
                                <TouchableOpacity style={[styles.modalBtn, styles.modalCancelBtn]} onPress={() => setReviewModalVisible(false)}>
                                    <Text style={styles.modalCancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalBtn, styles.modalSubmitBtn]} onPress={submitReview}>
                                    <Text style={styles.modalSubmitBtnText}>Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>


            {/* Return/Replace Modal */}
            <Modal animationType="slide" transparent={true} visible={returnModalVisible} onRequestClose={() => setReturnModalVisible(false)}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <View style={styles.bottomSheetOverlay}>
                        <ScrollView
                            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.bottomSheetContainer}>
                                <View style={styles.pullBar} />
                                <Text style={styles.modalTitle}>
                                    {requestType === "Cancel" ? "Cancel Order" : "Return or Replace Items"}
                                </Text>
                                {/* <Text style={styles.modalSubtitle}>
                                    {requestType === "Cancel" ? "Please let us know why you are cancelling this order." : "Select your preferred operation service style:"}
                                </Text> */}

                                {/* {requestType !== "Cancel" && (
                                    <View style={styles.toggleRow}>
                                        <TouchableOpacity
                                            style={[styles.toggleOption, requestType === "Return" && styles.toggleActive]}
                                            onPress={() => setRequestType("Return")}
                                        >
                                            <Text style={[styles.toggleText, requestType === "Return" && styles.toggleActiveText]}>Request Return</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.toggleOption, requestType === "Replace" && styles.toggleActive]}
                                            onPress={() => setRequestType("Replace")}
                                        >
                                            <Text style={[styles.toggleText, requestType === "Replace" && styles.toggleActiveText]}>Request Replace</Text>
                                        </TouchableOpacity>
                                    </View>
                                )} */}

                                <Text style={styles.inputLabel}>Reason:</Text>
                                <TextInput
                                    style={styles.reasonInput}
                                    placeholder="Example: Wrong size delivered / Product damaged on arrival..."
                                    placeholderTextColor="#9CA3AF"
                                    value={returnReason}
                                    multiline
                                    numberOfLines={5}
                                    textAlignVertical="top"
                                    onChangeText={setReturnReason}
                                />

                                <TouchableOpacity style={styles.actionSubmitBlock} onPress={submitReturnRequest}>
                                    <Text style={styles.actionSubmitBlockText}>Submit Request</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionCloseBlock} onPress={() => setReturnModalVisible(false)}>
                                    <Text style={styles.actionCloseBlockText}>Go Back</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    )
}

export default OrderDetailsScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        paddingTop: verticalScale(12),
    },
    centerState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: scale(24),
        backgroundColor: "#F9FAFB",
    },
    centerStateTitle: {
        fontSize: scale(16),
        fontWeight: "700",
        color: "#374151",
        marginTop: verticalScale(12),
    },
    centerStateText: {
        fontSize: scale(13),
        color: "#9CA3AF",
        marginTop: verticalScale(8),
        textAlign: "center",
    },
    retryButton: {
        marginTop: verticalScale(16),
        backgroundColor: "#4F46E5",
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(10),
    },
    retryButtonText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: scale(13),
    },
    card: {
        backgroundColor: "#FFF",
        borderRadius: moderateScale(16),
        padding: moderateScale(16),
        borderWidth: 1,
        borderColor: "#EEF0F3",
        marginBottom: verticalScale(14),
        marginHorizontal: moderateScale(16),
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    orderId: {
        fontSize: scale(15),
        fontWeight: "700",
        color: "#111827"
    },
    sectionTitle: {
        fontSize: scale(15),
        fontWeight: "700",
        color: "#111827"
    },
    subText: {
        fontSize: scale(12),
        color: "#6B7280",
        marginTop: verticalScale(2)
    },
    statusBadge: {
        paddingHorizontal: moderateScale(10),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(20),
    },
    statusText: {
        fontSize: scale(12),
        fontWeight: "700",
    },
    divider: {
        height: 1,
        backgroundColor: "#EEF0F3",
        marginVertical: verticalScale(12),
    },
    itemDivider: {
        height: 1,
        backgroundColor: "#F3F4F6",
        marginVertical: verticalScale(12),
        borderStyle: "dashed"
    },
    productSection: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    productImage: {
        width: scale(65),
        height: scale(65),
        borderRadius: moderateScale(10),
        backgroundColor: "#F3F4F6"
    },
    productInfo: {
        flex: 1,
        marginLeft: moderateScale(12),
    },
    productName: {
        fontSize: scale(13),
        fontWeight: "600",
        color: "#374151",
        lineHeight: scale(18),
        marginBottom: verticalScale(6)
    },
    // Color + Size chip row
    variantRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        alignSelf: "flex-start",
        paddingHorizontal: moderateScale(8),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(8),
        marginBottom: verticalScale(6),
    },
    colorDot: {
        width: scale(10),
        height: scale(10),
        borderRadius: scale(5),
        marginRight: moderateScale(6),
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.08)",
    },
    variantChipText: {
        fontSize: scale(11.5),
        fontWeight: "600",
        color: "#4B5563",
    },
    variantDivider: {
        width: 1,
        height: scale(10),
        backgroundColor: "#D1D5DB",
        marginHorizontal: moderateScale(8),
    },
    qtyPriceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    qty: {
        fontSize: scale(12),
        color: "#6B7280",
    },
    price: {
        fontWeight: "700",
        fontSize: scale(14),
        color: "#111827",
    },
    /* Stepper Styling */
    stepperContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: verticalScale(20),
        paddingHorizontal: moderateScale(4)
    },
    stepWrapper: {
        alignItems: "center",
        flex: 1,
    },
    stepRow: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        justifyContent: "center"
    },
    stepCircle: {
        width: scale(22),
        height: scale(22),
        borderRadius: scale(11),
        borderWidth: 2,
        borderColor: "#D1D5DB",
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2
    },
    completedStepCircle: {
        backgroundColor: "#10B981",
        borderColor: "#10B981"
    },
    checkmark: {
        color: "#FFF",
        fontSize: scale(11),
        fontWeight: "700"
    },
    stepLine: {
        position: "absolute",
        left: "50%",
        right: "-50%",
        height: 2,
        backgroundColor: "#D1D5DB",
        zIndex: 1
    },
    completedStepLine: {
        backgroundColor: "#10B981"
    },
    stepTitle: {
        fontSize: scale(12),
        fontWeight: "600",
        color: "#374151",
        marginTop: verticalScale(6)
    },
    awbBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EEF2FF",
        borderRadius: moderateScale(10),
        paddingHorizontal: moderateScale(10),
        paddingVertical: verticalScale(8),
        marginTop: verticalScale(14),
        gap: scale(6),
    },
    awbText: {
        fontSize: scale(12),
        color: "#4338CA",
        fontWeight: "600",
    },
    /* Inline review action */
    actionsContainer: {
        marginHorizontal: moderateScale(16),
        marginBottom: verticalScale(14),
    },
    reviewButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: scale(6),
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(14),
        borderRadius: moderateScale(6),
        alignSelf: "flex-end",
    },
    reviewButtonText: {
        color: "#374151",
        fontSize: scale(12),
        fontWeight: "600",
    },
    pricingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: verticalScale(8)
    },
    pricingLabel: {
        fontSize: scale(13),
        color: "#4B5563"
    },
    pricingValue: {
        fontSize: scale(13),
        fontWeight: "500",
        color: "#111827"
    },
    totalLabel: {
        fontSize: scale(14),
        fontWeight: "700",
        color: "#111827"
    },
    totalValue: {
        fontSize: scale(16),
        fontWeight: "700",
        color: "#4F46E5"
    },
    customerName: {
        fontSize: scale(13),
        fontWeight: "600",
        color: "#111827",
        marginBottom: verticalScale(4)
    },
    addressText: {
        fontSize: scale(13),
        color: "#4B5563",
        lineHeight: scale(18)
    },
    phoneText: {
        fontSize: scale(12),
        color: "#6B7280",
        marginTop: verticalScale(4)
    },
    cancelReturnContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: verticalScale(8),
        marginBottom: verticalScale(20),
        marginHorizontal: moderateScale(16),
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(10),
        borderWidth: 1,
        borderColor: "#FCA5A5",
        backgroundColor: "#FEF2F2",
    },
    cancelReturnText: {
        fontSize: scale(14),
        fontWeight: "700",
        color: "#DC2626",
    },

    /* Sticky Footer */
    footerSafeArea: {
        backgroundColor: "#FFF",
    },
    footerBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFF",
        paddingHorizontal: moderateScale(16),
        paddingVertical: verticalScale(12),
        borderTopWidth: 1,
        borderTopColor: "#EEF0F3",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 8,
    },
    footerAmountBlock: {
        justifyContent: "center",
    },
    footerAmountLabel: {
        fontSize: scale(11),
        color: "#9CA3AF",
        fontWeight: "500",
    },
    footerAmountValue: {
        fontSize: scale(17),
        fontWeight: "800",
        color: "#111827",
        marginTop: verticalScale(1),
    },
    invoiceButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: scale(6),
        backgroundColor: "#111827",
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(12),
    },
    invoiceButtonText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: scale(14),
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center"
    },
    reviewModalContainer: {
        width: "85%",
        backgroundColor: "#FFF",
        borderRadius: moderateScale(16),
        padding: moderateScale(20),
        alignItems: "center",
    },
    modalTitle: {
        fontSize: scale(16),
        fontWeight: "700",
        color: "#111827",
        marginBottom: verticalScale(4)
    },
    modalSubtitle: {
        fontSize: scale(12),
        color: "#6B7280",
        textAlign: "center",
        marginBottom: verticalScale(12)
    },
    starRow: {
        flexDirection: "row",
        marginBottom: verticalScale(16)
    },
    starText: {
        fontSize: scale(32),
        marginHorizontal: moderateScale(4)
    },
    reviewInput: {
        width: "100%",
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: moderateScale(10),
        padding: moderateScale(12),
        fontSize: scale(13),
        color: "#111827",
        textAlignVertical: "top",
        height: verticalScale(90),
        marginBottom: verticalScale(16)
    },
    modalButtonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%"
    },
    modalBtn: {
        flex: 0.47,
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(8),
        alignItems: "center"
    },
    modalCancelBtn: {
        backgroundColor: "#F3F4F6",
    },
    modalCancelBtnText: {
        color: "#4B5563",
        fontWeight: "600",
        fontSize: scale(13)
    },
    modalSubmitBtn: {
        backgroundColor: "#4F46E5",
    },
    modalSubmitBtnText: {
        color: "#FFF",
        fontWeight: "600",
        fontSize: scale(13)
    },
    bottomSheetOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end"
    },
    bottomSheetContainer: {
        backgroundColor: "#FFF",
        borderTopLeftRadius: moderateScale(20),
        borderTopRightRadius: moderateScale(20),
        paddingHorizontal: moderateScale(20),
        paddingBottom: verticalScale(30),
        paddingTop: verticalScale(10)
    },
    pullBar: {
        width: scale(40),
        height: verticalScale(4),
        backgroundColor: "#E5E7EB",
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: verticalScale(14)
    },
    toggleRow: {
        flexDirection: "row",
        backgroundColor: "#F3F4F6",
        borderRadius: moderateScale(10),
        padding: moderateScale(4),
        marginVertical: verticalScale(16)
    },
    toggleOption: {
        flex: 1,
        paddingVertical: verticalScale(10),
        alignItems: "center",
        borderRadius: moderateScale(8)
    },
    toggleActive: {
        backgroundColor: "#FFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },
    toggleText: {
        fontSize: scale(13),
        fontWeight: "500",
        color: "#6B7280"
    },
    toggleActiveText: {
        color: "#4F46E5",
        fontWeight: "700"
    },
    inputLabel: {
        fontSize: scale(13),
        fontWeight: "600",
        color: "#374151",
        marginBottom: verticalScale(6)
    },
    reasonInput: {
        width: "100%",
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: moderateScale(10),
        padding: moderateScale(12),
        fontSize: scale(13),
        color: "#111827",
        minHeight: verticalScale(100),
        textAlignVertical: "top",
        marginBottom: verticalScale(20)
    },
    actionSubmitBlock: {
        backgroundColor: "#EF4444",
        width: "100%",
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(10),
        alignItems: "center",
        marginBottom: verticalScale(10)
    },
    actionSubmitBlockText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: scale(14)
    },
    actionCloseBlock: {
        width: "100%",
        paddingVertical: verticalScale(10),
        alignItems: "center",
        marginBottom: verticalScale(20)
    },
    actionCloseBlockText: {
        color: "#6B7280",
        fontWeight: "600",
        fontSize: scale(13)
    },
    // reviewButton: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     paddingVertical: verticalScale(5),
    //     paddingHorizontal: scale(10),
    //     borderRadius: moderateScale(6),
    //     borderWidth: 1,
    //     borderColor: '#E5E7EB',
    //     backgroundColor: 'transparent',
    // },
    // reviewButtonText: {
    //     color: '#374151',
    //     fontSize: scale(11.5),
    //     fontWeight: '600',
    //     marginLeft: scale(4),
    // },
})