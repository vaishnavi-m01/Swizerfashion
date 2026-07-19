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
    Share,
    RefreshControl
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from "../utils/responsive"
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../config/apiConfig';
import { IMAGE_BASE_URL } from "../api/apiBaseUrl";
import RNFS from 'react-native-fs';
import RNShare from 'react-native-share';
import { generatePDF } from 'react-native-html-to-pdf';


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
    const navigation = useNavigation<any>();
    const { orderId } = route.params || {}; // pass this as navigation.navigate("OrderDetails", { orderId: 58 })
    const insets = useSafeAreaInsets();

    // Modal / form state
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [returnModalVisible, setReturnModalVisible] = useState(false);
    const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

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
            setRefreshing(false);
        }
    }, [orderId]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchOrderDetails();
    }, [fetchOrderDetails]);

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
            setIsSubmitting(true);
            const endpoint = requestType === "Cancel" ? `/orders/${orderId}/cancel` : `/orders/${orderId}/return`;
            const payload = { reason: returnReason };

            console.log("[OrderDetails] Submitting request to:", endpoint, "Payload:", payload);
            const response = await api.post(endpoint, payload);

            if (response.data?.status) {
                ToastAndroid.show(`Your request for order ${requestType.toLowerCase()} has been successfully registered.`, ToastAndroid.LONG);
                setReturnModalVisible(false);
                setReturnReason("");
                // Go back to trigger refresh in OrderScreen, or refresh here
                navigation.goBack();
            } else {
                Alert.alert("Error", response.data?.message || "Failed to submit request.");
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert("Error", error.response?.data?.message || "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openInvoiceModal = () => {
        setInvoiceModalVisible(true);
    };

    const buildInvoiceHTML = () => {
        const o = order;
        const addr = o.address || {};
        const displayItems = (o.items || []).map((item: any) => ({
            name: item.product_name,
            qty: Number(item.quantity),
            price: Number(item.price),
            color: item.product_varient?.color?.name || '-',
            size: item.product_varient?.size?.name || '-',
        }));
        const subtotal = displayItems.reduce((s: number, i: any) => s + i.price * i.qty, 0);
        const shippingCost = Number(o.shipping_cost || 0);
        const taxAmt = Number(o.tax || 0);
        const totalAmt = Number(o.total || 0);
        const orderDate = new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
        const fullAddress = [addr.address, addr.city, addr.state, addr.country].filter(Boolean).join(', ') + (addr.postcode ? ` - ${addr.postcode}` : '');
        const customerName = `${addr.first_name || ''} ${addr.last_name || ''}`.trim();

        const itemRows = displayItems.map((item: any) => `
            <tr>
                <td style="padding:10px 8px;border-bottom:1px solid #F3F4F6;font-size:13px;color:#374151;">${item.name}</td>
                <td style="padding:10px 8px;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280;text-align:center;">${item.color} / ${item.size}</td>
                <td style="padding:10px 8px;border-bottom:1px solid #F3F4F6;font-size:13px;color:#374151;text-align:center;">${item.qty}</td>
                <td style="padding:10px 8px;border-bottom:1px solid #F3F4F6;font-size:13px;color:#374151;text-align:right;">&#8377;${item.price.toFixed(2)}</td>
                <td style="padding:10px 8px;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:700;color:#111827;text-align:right;">&#8377;${(item.price * item.qty).toFixed(2)}</td>
            </tr>
        `).join('');

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Invoice - ${o.order_number}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #F9FAFB; color: #1E3A8A; }
                .page { max-width: 700px; margin: 0 auto; background: #fff; }
                /* Header */
                .header { background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%); padding: 40px 48px; color: #fff; }
                .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
                .brand { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
                .brand span { color: #A5B4FC; }
                .invoice-label { text-align: right; }
                .invoice-label .inv-text { font-size: 13px; opacity: 0.7; text-transform: uppercase; letter-spacing: 1.5px; }
                .invoice-label .inv-number { font-size: 20px; font-weight: 700; margin-top: 4px; }
                .header-divider { height: 1px; background: rgba(255,255,255,0.15); margin: 24px 0; }
                .header-meta { display: flex; gap: 40px; }
                .meta-item .label { font-size: 11px; opacity: 0.6; text-transform: uppercase; letter-spacing: 1px; }
                .meta-item .value { font-size: 14px; font-weight: 600; margin-top: 2px; }
                /* Status pill */
                .status-pill { display: inline-block; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); border-radius: 50px; padding: 4px 14px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
                /* Body */
                .body { padding: 40px 48px; }
                .section-title { font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
                .address-card { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px 20px; margin-bottom: 32px; }
                .address-name { font-size: 15px; font-weight: 700; color: #1E3A8A; margin-bottom: 4px; }
                .address-line { font-size: 13px; color: #6B7280; line-height: 1.6; }
                /* Items table */
                .items-section { margin-bottom: 32px; }
                table { width: 100%; border-collapse: collapse; }
                thead tr { background: #F3F4F6; }
                thead th { padding: 10px 8px; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.8px; text-align: left; }
                thead th:last-child, thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
                thead th:nth-child(2) { text-align: center; }
                thead th:nth-child(3) { text-align: center; }
                /* Totals */
                .totals { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; padding-top: 16px; border-top: 2px solid #F3F4F6; }
                .total-row { display: flex; gap: 24px; font-size: 13px; }
                .total-row .t-label { color: #6B7280; min-width: 140px; text-align: right; }
                .total-row .t-value { color: #1E3A8A; font-weight: 500; min-width: 80px; text-align: right; }
                .grand-total { background: #EEF2FF; border-radius: 10px; padding: 14px 20px; display: flex; justify-content: flex-end; gap: 24px; margin-top: 8px; width: 100%; }
                .grand-total .t-label { color: #4338CA; font-weight: 700; font-size: 15px; }
                .grand-total .t-value { color: #312E81; font-weight: 800; font-size: 17px; }
                /* Payment */
                .payment-section { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 16px 20px; margin-top: 24px; display: flex; justify-content: space-between; align-items: center; }
                .payment-left .p-label { font-size: 11px; font-weight: 700; color: #15803D; text-transform: uppercase; letter-spacing: 1px; }
                .payment-left .p-value { font-size: 14px; font-weight: 600; color: #166534; margin-top: 4px; }
                .payment-badge { background: #22C55E; color: #fff; font-size: 12px; font-weight: 700; border-radius: 50px; padding: 5px 14px; text-transform: uppercase; }
                /* Footer */
                .footer { background: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 24px 48px; text-align: center; }
                .footer-text { font-size: 12px; color: #9CA3AF; line-height: 1.8; }
                .footer-brand { font-size: 14px; font-weight: 700; color: #4338CA; margin-bottom: 6px; }
            </style>
        </head>
        <body>
            <div class="page">
                <!-- Header -->
                <div class="header">
                    <div class="header-top">
                        <div>
                            <div class="brand">Swizer<span>Fashion</span></div>
                            <div style="font-size:12px;opacity:0.6;margin-top:4px;">Your Style, Delivered</div>
                        </div>
                        <div class="invoice-label">
                            <div class="inv-text">Tax Invoice</div>
                            <div class="inv-number">${o.order_number}</div>
                            <div style="margin-top:8px;"><span class="status-pill">${(o.order_status || '').toUpperCase()}</span></div>
                        </div>
                    </div>
                    <div class="header-divider"></div>
                    <div class="header-meta">
                        <div class="meta-item">
                            <div class="label">Order Date</div>
                            <div class="value">${orderDate}</div>
                        </div>
                        <div class="meta-item">
                            <div class="label">Payment Method</div>
                            <div class="value">${(o.payment_method || 'N/A').toUpperCase()}</div>
                        </div>
                        <div class="meta-item">
                            <div class="label">Payment Status</div>
                            <div class="value">${capitalize(o.payment_status || 'N/A')}</div>
                        </div>
                    </div>
                </div>

                <!-- Body -->
                <div class="body">
                    <!-- Delivery Address -->
                    <div class="section-title">Delivery Address</div>
                    <div class="address-card">
                        <div class="address-name">${customerName}</div>
                        <div class="address-line">${fullAddress}</div>
                        ${addr.phone ? `<div class="address-line" style="margin-top:6px;">&#128222; ${addr.phone}</div>` : ''}
                    </div>

                    <!-- Items -->
                    <div class="items-section">
                        <div class="section-title">Order Items</div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="border-radius:8px 0 0 8px;">Product</th>
                                    <th>Variant</th>
                                    <th>Qty</th>
                                    <th>Unit Price</th>
                                    <th style="text-align:right;border-radius:0 8px 8px 0;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemRows}
                            </tbody>
                        </table>
                    </div>

                    <!-- Totals -->
                    <div class="totals">
                        <div class="total-row">
                            <span class="t-label">Items Subtotal</span>
                            <span class="t-value">&#8377;${subtotal.toFixed(2)}</span>
                        </div>
                        <div class="total-row">
                            <span class="t-label">Shipping Fee</span>
                            <span class="t-value">${shippingCost === 0 ? 'FREE' : `&#8377;${shippingCost.toFixed(2)}`}</span>
                        </div>
                        <div class="total-row">
                            <span class="t-label">Tax</span>
                            <span class="t-value">&#8377;${taxAmt.toFixed(2)}</span>
                        </div>
                        <div class="grand-total">
                            <span class="t-label">Grand Total</span>
                            <span class="t-value">&#8377;${totalAmt.toFixed(2)}</span>
                        </div>
                    </div>

                    <!-- Payment Status -->
                    <div class="payment-section">
                        <div class="payment-left">
                            <div class="p-label">Payment Confirmation</div>
                            <div class="p-value">${(o.payment_method || '').toUpperCase()} &bull; ${capitalize(o.payment_status || '')}</div>
                        </div>
                        <span class="payment-badge">${(o.payment_status || '').toUpperCase() === 'PAID' || (o.payment_status || '').toLowerCase() === 'success' ? '&#10003; Paid' : capitalize(o.payment_status || 'Pending')}</span>
                    </div>
                </div>

                <!-- Footer -->
                <div class="footer">
                    <div class="footer-brand">SwizerFashion</div>
                    <div class="footer-text">
                        Thank you for shopping with us!<br/>
                        For any queries, contact us at support@swizerfashion.com<br/>
                        www.swizerfashion.com
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;
    };

    const generateAndDownloadPDF = async () => {
        try {
            setIsGeneratingPDF(true);
            const htmlContent = buildInvoiceHTML();
            const options = {
                html: htmlContent,
                fileName: `Invoice_${order?.order_number}`,
                directory: 'Documents',
                base64: true,
            };
            if (typeof generatePDF !== 'function') {
                Alert.alert('Error', 'PDF library not available. Please restart the app.');
                return;
            }
            const file = await generatePDF(options);
            if (file.base64) {
                setInvoiceModalVisible(false);
                
                try {
                    const downloadPath = `${RNFS.DownloadDirectoryPath}/Invoice_${order?.order_number}.pdf`;
                    await RNFS.writeFile(downloadPath, file.base64, 'base64');
                    
                    if (Platform.OS === 'android') {
                        try {
                            await RNFS.scanFile(downloadPath);
                        } catch (scanErr) {
                            console.log('scanFile error:', scanErr);
                        }
                        ToastAndroid.show(`Invoice downloaded to Downloads folder`, ToastAndroid.LONG);
                    } else {
                        Alert.alert('Success', `Invoice downloaded to Downloads folder`);
                    }

                    // Open share sheet so user can share via WhatsApp, etc.
                    await RNShare.open({
                        url: `file://${downloadPath}`,
                        type: 'application/pdf',
                        title: `Invoice_${order?.order_number}`,
                        message: `Invoice for order ${order?.order_number}`,
                    });
                } catch (error: any) {
                    if (error?.message !== 'User did not share' && !error?.message?.toLowerCase().includes('cancel') && !error?.message?.toLowerCase().includes('dismiss')) {
                        console.error('File save/share error:', error);
                        Alert.alert('Error', 'Failed to save or share the invoice PDF.');
                    }
                }
            } else {
                Alert.alert('Error', 'Could not generate PDF. Please try again.');
            }
        } catch (err: any) {
            console.error('PDF generation error:', err);
            Alert.alert('Error', 'Failed to generate invoice PDF.');
        } finally {
            setIsGeneratingPDF(false);
        }
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

     console.log("OrderDetails",items)
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
        console.log("OrderDetailsItem",item)
        setReviewItem(item);
        setReviewModalVisible(true);
        setIsReviewLoading(true);
        // Reset to blank first, in case fetch fails or no review exists
        setReviewId(null);
        setRating(0);
        setReviewTitle("");
        setReviewText("");

        try {
            const response = await api.get(`/reviews?order_item_id=${item.id}`);
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
            <ScrollView 
                style={styles.container} 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{ paddingBottom: verticalScale(16) }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4F46E5"]} />
                }
            >

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
                            <TouchableOpacity
                                style={styles.productSection}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('ProductDetails' as never, {
                                    id: item.variant_id,
                                    // productId: item.product_id,
                                } as never)}
                            >
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
                            </TouchableOpacity>

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
                {/* Order Cancelled card — shows cancel reason as comment */}
                {isCancelled && (
                    <View style={styles.cancelledCard}>
                        <View style={styles.cancelledCardHeader}>
                            <Ionicons name="close-circle" size={scale(18)} color="#DC2626" />
                            <Text style={styles.cancelledCardTitle}>Order Cancelled</Text>
                        </View>
                        <View style={styles.divider} />
                        {order.cancelled_at && (
                            <Text style={styles.cancelledDate}>
                                Cancelled on {formatDate(order.cancelled_at)}
                            </Text>
                        )}
                        {order.cancel_reason ? (
                            <View style={styles.cancelledReasonBox}>
                                <Text style={styles.cancelledReasonLabel}>Reason / Comment</Text>
                                <Text style={styles.cancelledReasonText}>{order.cancel_reason}</Text>
                            </View>
                        ) : null}
                    </View>
                )}

                {/* Return Requested card — shows return reason */}
                {!!order.return_reason && (
                    <View style={[styles.cancelledCard, { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }]}>
                        <View style={styles.cancelledCardHeader}>
                            <Ionicons name="refresh-circle" size={scale(18)} color="#D97706" />
                            <Text style={[styles.cancelledCardTitle, { color: "#92400E" }]}>Return Requested</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={[styles.cancelledReasonBox, { backgroundColor: "#FEF3C7", borderLeftColor: "#D97706" }]}>
                            <Text style={[styles.cancelledReasonLabel, { color: "#D97706" }]}>Reason / Comment</Text>
                            <Text style={[styles.cancelledReasonText, { color: "#92400E" }]}>{order.return_reason}</Text>
                        </View>
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

                {/* Cancel Order button — only show if not cancelled and no cancel_reason */}
                {!isCancelled && !order?.cancel_reason && displayStatus !== "Returned" && displayStatus !== "Delivered" && (
                    <View style={{ marginHorizontal: moderateScale(16), marginTop: verticalScale(8), marginBottom: verticalScale(4) }}>
                        <TouchableOpacity
                            style={styles.cancelReturnContainer}
                            onPress={() => {
                                setRequestType("Cancel");
                                setReturnReason("");
                                setReturnModalVisible(true);
                            }}
                        >
                            <Text style={styles.cancelReturnText}>Cancel Order</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Return button — only when order is Delivered and no return_reason */}
                {displayStatus === "Delivered" && !order?.return_reason && (
                    <View style={{ marginHorizontal: moderateScale(16), marginTop: verticalScale(4), marginBottom: verticalScale(20) }}>
                        <TouchableOpacity
                            style={styles.cancelReturnContainer}
                            onPress={() => {
                                setRequestType("Return");
                                setReturnReason("");
                                setReturnModalVisible(true);
                            }}
                        >
                            <Text style={styles.cancelReturnText}>Return or Replace Items?</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>

            {/* Sticky Bottom Footer — Invoice */}
            <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
                <View style={styles.footerBar}>
                    <View style={styles.footerAmountBlock}>
                        <Text style={styles.footerAmountLabel}>Total Paid</Text>
                        <Text style={styles.footerAmountValue}>₹{total.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity style={styles.invoiceButton} onPress={openInvoiceModal} activeOpacity={0.85}>
                        <Ionicons name="document-text-outline" size={scale(17)} color="#FFF" />
                        <Text style={styles.invoiceButtonText}>Invoice</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Review Modal — keyboard-aware bottom sheet */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={reviewModalVisible}
                onRequestClose={() => setReviewModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <TouchableOpacity
                        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
                        activeOpacity={1}
                        onPress={() => setReviewModalVisible(false)}
                    />
                    <View style={[
                        styles.reviewSheet,
                        { paddingBottom: Math.max(insets.bottom, verticalScale(20)) }
                    ]}>
                        <View style={styles.pullBar} />
                        <Text style={styles.modalTitle}>Write a Review</Text>
                        <Text style={styles.modalSubtitle}>How would you rate the product quality?</Text>

                        <View style={styles.starRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                    <Text style={[styles.starText, { color: star <= rating ? '#FBBF24' : '#D1D5DB' }]}>★</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput
                            style={[styles.reviewInput, { minHeight: verticalScale(40), marginBottom: verticalScale(12) }]}
                            placeholder="Review Title (Optional)"
                            placeholderTextColor="#9CA3AF"
                            value={reviewTitle}
                            onChangeText={setReviewTitle}
                            returnKeyType="next"
                        />

                        <TextInput
                            style={styles.reviewInput}
                            placeholder="Share details of your experience with this item..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={4}
                            value={reviewText}
                            onChangeText={setReviewText}
                            textAlignVertical="top"
                        />

                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalCancelBtn]}
                                onPress={() => setReviewModalVisible(false)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.modalCancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalSubmitBtn]}
                                onPress={submitReview}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.modalSubmitBtnText}>Submit Review</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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

                                <TouchableOpacity 
                                    style={[styles.actionSubmitBlock, isSubmitting && { opacity: 0.7 }]} 
                                    onPress={submitReturnRequest}
                                    disabled={isSubmitting}
                                >
                                    <Text style={styles.actionSubmitBlockText}>
                                        {isSubmitting ? "Processing..." : "Submit Request"}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionCloseBlock} onPress={() => setReturnModalVisible(false)}>
                                    <Text style={styles.actionCloseBlockText}>Go Back</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Invoice Modal — Full Screen Paper Invoice */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={invoiceModalVisible}
                onRequestClose={() => setInvoiceModalVisible(false)}
                statusBarTranslucent
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: '#E8E8E8' }} edges={['top', 'bottom']}>

                    {/* Top Bar */}
                    <View style={styles.invTopBar}>
                        <TouchableOpacity onPress={() => setInvoiceModalVisible(false)} style={styles.invTopBackBtn} activeOpacity={0.7}>
                            <Ionicons name="arrow-back" size={scale(20)} color="#374151" />
                        </TouchableOpacity>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={styles.invTopTitle}>Invoice Preview</Text>
                            <Text style={styles.invTopSub}>{order?.order_number}</Text>
                        </View>
                        {/* spacer to centre title */}
                        <View style={{ width: scale(36) }} />
                    </View>

                    {/* Paper Invoice Scroll */}
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{ padding: moderateScale(12), paddingBottom: verticalScale(16) }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Paper Sheet */}
                        <View style={styles.invPaper}>

                            {/* === HEADER: Brand + Invoice Label === */}
                            <View style={styles.invHeader}>
                                <View>
                                    <Text style={styles.invBrandName}>
                                        Swizer<Text style={{ color: '#A5B4FC' }}>Fashion</Text>
                                    </Text>
                                    <Text style={styles.invBrandTagline}>Your Style, Delivered</Text>
                                    <Text style={styles.invBrandContact}>support@swizerfashion.com</Text>
                                </View>
                                <View style={styles.invLabelBlock}>
                                    <Text style={styles.invLabelText}>TAX INVOICE</Text>
                                    <Text style={styles.invOrderNum}>{order?.order_number}</Text>
                                    <View style={[
                                        styles.invStatusPill,
                                        { backgroundColor: (STATUS_BADGE_COLORS[displayStatus] || { bg: '#E5E7EB' }).bg }
                                    ]}>
                                        <Text style={[styles.invStatusPillText, { color: (STATUS_BADGE_COLORS[displayStatus] || { color: '#374151' }).color }]}>
                                            {displayStatus.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* === META ROW === */}
                            <View style={styles.invMetaStrip}>
                                <View style={styles.invMetaCell}>
                                    <Text style={styles.invMetaKey}>DATE</Text>
                                    <Text style={styles.invMetaVal}>{order?.created_at ? formatDate(order.created_at) : '-'}</Text>
                                </View>
                                <View style={styles.invMetaSep} />
                                <View style={styles.invMetaCell}>
                                    <Text style={styles.invMetaKey}>PAYMENT</Text>
                                    <Text style={styles.invMetaVal}>{(order?.payment_method || 'N/A').toUpperCase()}</Text>
                                </View>
                                <View style={styles.invMetaSep} />
                                <View style={styles.invMetaCell}>
                                    <Text style={styles.invMetaKey}>PAY STATUS</Text>
                                    <Text style={[styles.invMetaVal, { color: '#16A34A' }]}>{capitalize(order?.payment_status || 'N/A')}</Text>
                                </View>
                            </View>

                            {/* === PERFORATED DIVIDER === */}
                            <View style={styles.invPerforated} />

                            {/* === BILL TO === */}
                            <View style={styles.invSection}>
                                <Text style={styles.invSectionLabel}>BILL TO</Text>
                                <Text style={styles.invAddrName}>{shippingAddress.name}</Text>
                                <Text style={styles.invAddrText}>{shippingAddress.address}</Text>
                                {shippingAddress.phone ? (
                                    <Text style={styles.invAddrPhone}>📞 {shippingAddress.phone}</Text>
                                ) : null}
                            </View>

                            {/* === ITEMS TABLE === */}
                            <View style={styles.invSection}>
                                <Text style={styles.invSectionLabel}>ORDER ITEMS</Text>

                                {/* Table header */}
                                <View style={styles.invTableHead}>
                                    <Text style={[styles.invThText, { flex: 1 }]}>ITEM</Text>
                                    <Text style={[styles.invThText, { width: scale(32), textAlign: 'center' }]}>QTY</Text>
                                    <Text style={[styles.invThText, { width: scale(68), textAlign: 'right' }]}>AMOUNT</Text>
                                </View>

                                {/* Table rows */}
                                {items.map((item: any, index: number) => (
                                    <View key={item.id} style={[styles.invTableRow, index % 2 === 1 && styles.invTableRowAlt]}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.invTdName} numberOfLines={2}>{item.name}</Text>
                                            <View style={{ flexDirection: 'row', gap: scale(4), marginTop: verticalScale(1) }}>
                                                {item.color ? <Text style={styles.invTdVariant}>{item.color}</Text> : null}
                                                {item.size ? <Text style={styles.invTdVariant}>Size {item.size}</Text> : null}
                                            </View>
                                            <Text style={styles.invTdUnitPrice}>Unit: ₹{Number(item.price).toFixed(2)}</Text>
                                        </View>
                                        <Text style={[styles.invTdNum, { width: scale(32), textAlign: 'center' }]}>{item.qty}</Text>
                                        <Text style={[styles.invTdTotal, { width: scale(68), textAlign: 'right' }]}>₹{(item.price * item.qty).toFixed(2)}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* === PERFORATED DIVIDER === */}
                            <View style={styles.invPerforated} />

                            {/* === TOTALS BLOCK === */}
                            <View style={styles.invTotalsBlock}>
                                <View style={styles.invTotalRow}>
                                    <Text style={styles.invTotalLabel}>Subtotal</Text>
                                    <Text style={styles.invTotalVal}>₹{itemsSubtotal.toFixed(2)}</Text>
                                </View>
                                <View style={styles.invTotalRow}>
                                    <Text style={styles.invTotalLabel}>Shipping</Text>
                                    <Text style={[styles.invTotalVal, { color: shipping === 0 ? '#16A34A' : '#111827' }]}>
                                        {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                                    </Text>
                                </View>
                                <View style={styles.invTotalRow}>
                                    <Text style={styles.invTotalLabel}>Tax</Text>
                                    <Text style={styles.invTotalVal}>₹{tax.toFixed(2)}</Text>
                                </View>
                                <View style={styles.invGrandRow}>
                                    <Text style={styles.invGrandLabel}>GRAND TOTAL</Text>
                                    <Text style={styles.invGrandVal}>₹{total.toFixed(2)}</Text>
                                </View>
                            </View>

                            {/* === PERFORATED DIVIDER === */}
                            <View style={styles.invPerforated} />

                            {/* === PAID STAMP === */}
                            <View style={styles.invStampRow}>
                                {(order?.payment_status || '').toLowerCase() === 'paid' || (order?.payment_status || '').toLowerCase() === 'success' ? (
                                    <View style={styles.invPaidStamp}>
                                        <Ionicons name="checkmark-circle" size={scale(14)} color="#16A34A" />
                                        <Text style={styles.invPaidStampText}>PAID</Text>
                                    </View>
                                ) : (
                                    <View style={[styles.invPaidStamp, { borderColor: '#DC2626' }]}>
                                        <Text style={[styles.invPaidStampText, { color: '#DC2626' }]}>{(order?.payment_status || 'PENDING').toUpperCase()}</Text>
                                    </View>
                                )}
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.invThankYou}>Thank you for your order!</Text>
                                    <Text style={styles.invWebsite}>www.swizerfashion.com</Text>
                                </View>
                            </View>

                        </View>
                        {/* end paper */}
                    </ScrollView>

                    {/* === BOTTOM ACTION BAR — SafeAreaView already wraps === */}
                    <View style={styles.invActionBar}>
                        <TouchableOpacity
                            style={styles.invCancelBtn}
                            onPress={() => setInvoiceModalVisible(false)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="close-outline" size={scale(18)} color="#4F46E5" />
                            <Text style={styles.invCancelBtnText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.invDownloadBtn, isGeneratingPDF && { opacity: 0.65 }]}
                            onPress={generateAndDownloadPDF}
                            disabled={isGeneratingPDF}
                            activeOpacity={0.85}
                        >
                            {isGeneratingPDF ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Ionicons name="download-outline" size={scale(18)} color="#FFF" />
                            )}
                            <Text style={styles.invDownloadBtnText}>
                                {isGeneratingPDF ? 'Generating...' : 'Download Invoice'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                </SafeAreaView>
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
    reasonBelowBtn: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: scale(5),
        marginTop: verticalScale(8),
        paddingHorizontal: moderateScale(4),
    },
    reasonBelowBtnText: {
        flex: 1,
        fontSize: scale(12),
        color: "#DC2626",
        lineHeight: scale(17),
        fontStyle: "italic",
    },

    /* Cancelled Order Card */
    cancelledCard: {
        backgroundColor: "#FFF1F2",
        borderRadius: moderateScale(14),
        padding: moderateScale(16),
        borderWidth: 1,
        borderColor: "#FECDD3",
        marginBottom: verticalScale(14),
        marginHorizontal: moderateScale(16),
    },
    cancelledCardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: scale(8),
        marginBottom: verticalScale(8),
    },
    cancelledCardTitle: {
        fontSize: scale(15),
        fontWeight: "700",
        color: "#991B1B",
    },
    cancelledDate: {
        fontSize: scale(12),
        color: "#6B7280",
        marginBottom: verticalScale(10),
    },
    cancelledReasonBox: {
        backgroundColor: "#FEE2E2",
        borderRadius: moderateScale(10),
        padding: moderateScale(12),
        borderLeftWidth: 3,
        borderLeftColor: "#DC2626",
        marginTop: verticalScale(4),
    },
    cancelledReasonLabel: {
        fontSize: scale(10),
        fontWeight: "700",
        color: "#DC2626",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: verticalScale(4),
    },
    cancelledReasonText: {
        fontSize: scale(13),
        color: "#7F1D1D",
        lineHeight: scale(18),
    },

    /* Refund Card */
    refundCard: {
        backgroundColor: "#F0FDF4",
        borderRadius: moderateScale(16),
        padding: moderateScale(16),
        borderWidth: 1,
        borderColor: "#BBF7D0",
        marginBottom: verticalScale(14),
        marginHorizontal: moderateScale(16),
    },
    refundCardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: scale(12),
        marginBottom: verticalScale(4),
    },
    refundIconCircle: {
        width: scale(38),
        height: scale(38),
        borderRadius: scale(19),
        backgroundColor: "#DCFCE7",
        justifyContent: "center",
        alignItems: "center",
    },
    refundCardTitle: {
        fontSize: scale(14),
        fontWeight: "700",
        color: "#14532D",
    },
    refundCardSub: {
        fontSize: scale(11),
        color: "#16A34A",
        marginTop: verticalScale(2),
    },
    refundRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: verticalScale(8),
    },
    refundLabel: {
        fontSize: scale(13),
        color: "#374151",
    },
    refundAmount: {
        fontSize: scale(15),
        fontWeight: "800",
        color: "#15803D",
    },
    refundMethod: {
        fontSize: scale(12),
        fontWeight: "600",
        color: "#374151",
        backgroundColor: "#E5E7EB",
        paddingHorizontal: moderateScale(8),
        paddingVertical: verticalScale(3),
        borderRadius: moderateScale(6),
    },
    refundStatusPill: {
        backgroundColor: "#FEF3C7",
        paddingHorizontal: moderateScale(10),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(50),
    },
    refundStatusText: {
        fontSize: scale(11),
        fontWeight: "700",
        color: "#D97706",
    },
    refundInfoBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: scale(6),
        backgroundColor: "#EFF6FF",
        borderRadius: moderateScale(8),
        padding: moderateScale(10),
        marginTop: verticalScale(8),
    },
    refundInfoText: {
        flex: 1,
        fontSize: scale(11),
        color: "#1D4ED8",
        lineHeight: scale(16),
    },



    /* Existing reason info card in cancel/return modal */
    existingReasonCard: {
        backgroundColor: "#FFF7ED",
        borderRadius: moderateScale(10),
        padding: moderateScale(12),
        borderWidth: 1,
        borderColor: "#FED7AA",
        marginBottom: verticalScale(12),
        marginTop: verticalScale(10),
    },
    existingReasonHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: scale(6),
        marginBottom: verticalScale(6),
    },
    existingReasonLabel: {
        fontSize: scale(11),
        fontWeight: "700",
        color: "#C2410C",
    },
    existingReasonText: {
        fontSize: scale(12),
        color: "#431407",
        lineHeight: scale(17),
    },

    /* Review Bottom Sheet */
    reviewSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: moderateScale(20),
        borderTopRightRadius: moderateScale(20),
        paddingHorizontal: moderateScale(20),
        paddingTop: verticalScale(10),
        paddingBottom: 0, // overridden dynamically in JSX using insets.bottom
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 16,
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

    /* ===== Invoice Full-Screen Paper Styles ===== */
    invTopBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: moderateScale(12),
        paddingVertical: verticalScale(10),
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    invTopBackBtn: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    invTopTitle: {
        fontSize: scale(15),
        fontWeight: '700',
        color: '#1E3A8A',
    },
    invTopSub: {
        fontSize: scale(11),
        color: '#9CA3AF',
        marginTop: verticalScale(1),
    },
    invPaper: {
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(4),
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 8,
    },
    invHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        backgroundColor: '#1E1B4B',
        paddingHorizontal: moderateScale(18),
        paddingTop: verticalScale(20),
        paddingBottom: verticalScale(18),
    },
    invBrandName: {
        fontSize: scale(22),
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    invBrandTagline: {
        fontSize: scale(10),
        color: 'rgba(255,255,255,0.55)',
        marginTop: verticalScale(2),
    },
    invBrandContact: {
        fontSize: scale(9),
        color: 'rgba(255,255,255,0.4)',
        marginTop: verticalScale(4),
    },
    invLabelBlock: {
        alignItems: 'flex-end',
    },
    invLabelText: {
        fontSize: scale(10),
        fontWeight: '700',
        color: 'rgba(255,255,255,0.55)',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    invOrderNum: {
        fontSize: scale(15),
        fontWeight: '800',
        color: '#FFFFFF',
        marginTop: verticalScale(4),
    },
    invStatusPill: {
        marginTop: verticalScale(8),
        paddingHorizontal: moderateScale(10),
        paddingVertical: verticalScale(3),
        borderRadius: moderateScale(50),
    },
    invStatusPillText: {
        fontSize: scale(10),
        fontWeight: '700',
        letterSpacing: 0.8,
    },
    invMetaStrip: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FB',
        borderBottomWidth: 1,
        borderBottomColor: '#E9EAEC',
        paddingVertical: verticalScale(12),
    },
    invMetaCell: {
        flex: 1,
        alignItems: 'center',
    },
    invMetaKey: {
        fontSize: scale(9),
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: 1.2,
        marginBottom: verticalScale(2),
    },
    invMetaVal: {
        fontSize: scale(11),
        fontWeight: '700',
        color: '#1E3A8A',
    },
    invMetaSep: {
        width: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: verticalScale(4),
    },
    invPerforated: {
        height: 1,
        marginHorizontal: moderateScale(18),
        marginVertical: verticalScale(0),
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    invSection: {
        paddingHorizontal: moderateScale(18),
        paddingTop: verticalScale(14),
        paddingBottom: verticalScale(10),
    },
    invSectionLabel: {
        fontSize: scale(9),
        fontWeight: '700',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: verticalScale(8),
    },
    invAddrName: {
        fontSize: scale(13),
        fontWeight: '700',
        color: '#1E3A8A',
        marginBottom: verticalScale(3),
    },
    invAddrText: {
        fontSize: scale(12),
        color: '#4B5563',
        lineHeight: scale(17),
    },
    invAddrPhone: {
        fontSize: scale(12),
        color: '#6B7280',
        marginTop: verticalScale(4),
    },
    invTableHead: {
        flexDirection: 'row',
        backgroundColor: '#4F46E5',
        paddingHorizontal: moderateScale(10),
        paddingVertical: verticalScale(7),
        borderRadius: moderateScale(4),
        marginBottom: verticalScale(4),
    },
    invThText: {
        fontSize: scale(9),
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    invTableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: moderateScale(10),
        paddingVertical: verticalScale(9),
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    invTableRowAlt: {
        backgroundColor: '#FAFAFA',
    },
    invTdName: {
        fontSize: scale(12),
        fontWeight: '600',
        color: '#1E3A8A',
        lineHeight: scale(16),
    },
    invTdVariant: {
        fontSize: scale(10),
        color: '#6B7280',
        backgroundColor: '#F0F0F0',
        paddingHorizontal: scale(5),
        paddingVertical: verticalScale(1),
        borderRadius: moderateScale(3),
    },
    invTdUnitPrice: {
        fontSize: scale(10),
        color: '#9CA3AF',
        marginTop: verticalScale(2),
    },
    invTdNum: {
        fontSize: scale(12),
        fontWeight: '600',
        color: '#374151',
    },
    invTdTotal: {
        fontSize: scale(12),
        fontWeight: '700',
        color: '#1E3A8A',
    },
    invTotalsBlock: {
        paddingHorizontal: moderateScale(18),
        paddingVertical: verticalScale(14),
        alignItems: 'flex-end',
    },
    invTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%',
        marginBottom: verticalScale(6),
    },
    invTotalLabel: {
        fontSize: scale(12),
        color: '#6B7280',
    },
    invTotalVal: {
        fontSize: scale(12),
        fontWeight: '600',
        color: '#1E3A8A',
    },
    invGrandRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%',
        backgroundColor: '#4F46E5',
        borderRadius: moderateScale(6),
        paddingHorizontal: moderateScale(12),
        paddingVertical: verticalScale(9),
        marginTop: verticalScale(4),
    },
    invGrandLabel: {
        fontSize: scale(11),
        fontWeight: '700',
        color: '#E0E7FF',
        letterSpacing: 0.5,
    },
    invGrandVal: {
        fontSize: scale(14),
        fontWeight: '800',
        color: '#FFFFFF',
    },
    invStampRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
        paddingHorizontal: moderateScale(18),
        paddingVertical: verticalScale(14),
        backgroundColor: '#FAFAFA',
    },
    invPaidStamp: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
        borderWidth: 2,
        borderColor: '#16A34A',
        borderRadius: moderateScale(4),
        paddingHorizontal: moderateScale(10),
        paddingVertical: verticalScale(5),
    },
    invPaidStampText: {
        fontSize: scale(13),
        fontWeight: '800',
        color: '#16A34A',
        letterSpacing: 1.5,
    },
    invThankYou: {
        fontSize: scale(11),
        fontWeight: '600',
        color: '#374151',
    },
    invWebsite: {
        fontSize: scale(10),
        color: '#9CA3AF',
        marginTop: verticalScale(2),
    },
    invActionBar: {
        flexDirection: 'row',
        gap: scale(10),
        paddingHorizontal: moderateScale(14),
        paddingVertical: verticalScale(12),
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    invCancelBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(6),
        borderWidth: 2,
        borderColor: '#4F46E5',
        borderRadius: moderateScale(12),
        paddingVertical: verticalScale(13),
    },
    invCancelBtnText: {
        fontSize: scale(14),
        fontWeight: '700',
        color: '#4F46E5',
    },
    invDownloadBtn: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(8),
        backgroundColor: '#4F46E5',
        borderRadius: moderateScale(12),
        paddingVertical: verticalScale(13),
    },
    invDownloadBtnText: {
        fontSize: scale(14),
        fontWeight: '700',
        color: '#fff',
    },
    /* keep old names so nothing else breaks */
    invoiceOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
    invoiceSheetContainer: { backgroundColor: '#fff', borderTopLeftRadius: moderateScale(24), borderTopRightRadius: moderateScale(24), maxHeight: '92%', flex: 0, flexShrink: 1 },
    invoiceModalHeader: { paddingHorizontal: moderateScale(20), paddingTop: verticalScale(10), paddingBottom: verticalScale(12), borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    invoicePullBar: { width: scale(40), height: verticalScale(4), backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginBottom: verticalScale(12) },
    invoiceHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    invoiceModalTitle: { fontSize: scale(17), fontWeight: '800', color: '#111827' },
    invoiceModalSubtitle: { fontSize: scale(12), color: '#6B7280', marginTop: verticalScale(2) },
    invoiceCloseBtn: { width: scale(34), height: scale(34), borderRadius: scale(17), backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
    invoiceBrandBanner: { backgroundColor: '#312E81', paddingHorizontal: moderateScale(20), paddingVertical: verticalScale(18), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    invoiceBrandName: { fontSize: scale(20), fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
    invoiceBrandTagline: { fontSize: scale(11), color: 'rgba(255,255,255,0.6)', marginTop: verticalScale(2) },
    invoiceMetaRow: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingVertical: verticalScale(14), paddingHorizontal: moderateScale(20) },
    invoiceMetaItem: { flex: 1, alignItems: 'center' },
    invoiceMetaLabel: { fontSize: scale(10), fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: verticalScale(3) },
    invoiceMetaValue: { fontSize: scale(12), fontWeight: '700', color: '#111827' },
    invoiceMetaDivider: { width: 1, backgroundColor: '#E5E7EB', marginVertical: verticalScale(2) },
    invoiceSection: { paddingHorizontal: moderateScale(16), paddingTop: verticalScale(16) },
    invoiceSectionLabel: { fontSize: scale(10), fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: verticalScale(10) },
    invoiceAddressCard: { flexDirection: 'row', backgroundColor: '#EEF2FF', borderRadius: moderateScale(12), padding: moderateScale(14), borderWidth: 1, borderColor: '#C7D2FE' },
    invoiceAddressName: { fontSize: scale(13), fontWeight: '700', color: '#111827', marginBottom: verticalScale(3) },
    invoiceAddressText: { fontSize: scale(12), color: '#4B5563', lineHeight: scale(17) },
    invoiceAddressPhone: { fontSize: scale(12), color: '#6B7280', marginTop: verticalScale(4) },
    invoiceItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(10) },
    invoiceItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    invoiceItemImage: { width: scale(48), height: scale(48), borderRadius: moderateScale(8), backgroundColor: '#F3F4F6' },
    invoiceItemName: { fontSize: scale(12), fontWeight: '600', color: '#374151', lineHeight: scale(16) },
    invoiceItemVariant: { fontSize: scale(11), color: '#6B7280', backgroundColor: '#F3F4F6', paddingHorizontal: scale(6), paddingVertical: verticalScale(2), borderRadius: moderateScale(4) },
    invoiceItemQty: { fontSize: scale(11), color: '#9CA3AF', marginTop: verticalScale(3) },
    invoiceItemPrice: { fontSize: scale(13), fontWeight: '700', color: '#111827', marginLeft: scale(8) },
    invoiceBillCard: { backgroundColor: '#F9FAFB', borderRadius: moderateScale(12), padding: moderateScale(14), borderWidth: 1, borderColor: '#E5E7EB' },
    invoiceBillRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(8) },
    invoiceBillLabel: { fontSize: scale(13), color: '#6B7280' },
    invoiceBillValue: { fontSize: scale(13), fontWeight: '500', color: '#111827' },
    invoiceBillDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: verticalScale(8) },
    invoiceGrandRow: { marginBottom: 0 },
    invoiceGrandLabel: { fontSize: scale(14), fontWeight: '700', color: '#312E81' },
    invoiceGrandValue: { fontSize: scale(16), fontWeight: '800', color: '#4338CA' },
    invoicePaymentBadge: { flexDirection: 'row', alignItems: 'center', gap: scale(8), backgroundColor: '#F0FDF4', borderRadius: moderateScale(10), padding: moderateScale(12), borderWidth: 1, borderColor: '#BBF7D0' },
    invoicePaymentText: { fontSize: scale(13), fontWeight: '600', color: '#166534' },
    invoiceFooter: { padding: moderateScale(16), borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#fff' },
    invoiceDownloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: scale(8), backgroundColor: '#312E81', paddingVertical: verticalScale(14), borderRadius: moderateScale(14) },
    invoiceDownloadBtnText: { color: '#fff', fontWeight: '700', fontSize: scale(15) },

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
        gap: moderateScale(10),
        marginTop: verticalScale(4),
        width: "100%"
    },
    modalBtn: {
        flex: 1,
        paddingVertical: verticalScale(13),
        borderRadius: moderateScale(12),
        alignItems: "center",
        justifyContent: "center",
    },
    modalCancelBtn: {
        backgroundColor: "#EEF2FF",
        borderWidth: 1.5,
        borderColor: "#4F46E5",
    },
    modalCancelBtnText: {
        color: "#4F46E5",
        fontWeight: "700",
        fontSize: scale(14)
    },
    modalSubmitBtn: {
        backgroundColor: "#4F46E5",
    },
    modalSubmitBtnText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: scale(14)
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