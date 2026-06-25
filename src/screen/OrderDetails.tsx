import React, { useState } from "react"
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
    Alert
} from "react-native"
import { moderateScale, scale, verticalScale } from "../utils/responsive"

const OrderDetailsScreen = () => {
    // App States for Modals and User Inputs
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [returnModalVisible, setReturnModalVisible] = useState(false);
    
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState("");
    const [returnReason, setReturnReason] = useState("");
    const [requestType, setRequestType] = useState<"Return" | "Replace">("Return");

    // Static Mock Dataset 
    const orderData = {
        id: "58731234",
        status: "Delivered", 
        date: "June 22, 2026",
        eta: "Delivered on June 23, 2026",
        paymentMethod: "UPI (Google Pay)",
        steps: [
            { title: "Ordered", date: "June 22", isCompleted: true },
            { title: "Shipped", date: "June 23", isCompleted: true },
            { title: "Delivered", date: "June 23", isCompleted: true },
        ],
        items: [
            {
                id: "p1",
                name: "Premium Cotton Saree - Elegant Pink",
                qty: 1,
                price: 453,
                image: require("../asset/images/sareeImg.jpg")
            },
            {
                id: "p2",
                name: "Designer Banarasi Silk Border Dupatta",
                qty: 1,
                price: 299,
                image: require("../asset/images/sareeImg.jpg") 
            }
        ],
        pricing: {
            subtotal: 752,
            shipping: 40,
            discount: 50,
            total: 742
        },
        shippingAddress: {
            name: "Ananya Sharma",
            phone: "+91 98765 43210",
            address: "Flat 405, 4th Floor, Skyline Towers, Tech Park Phase 2, Bangalore, Karnataka - 560001"
        }
    };

    const submitReview = () => {
        if(!reviewText.trim()) {
            Alert.alert("Error", "Please write a comment before submitting.");
            return;
        }
        Alert.alert("Thank You!", `Your ${rating}-star review has been saved.`);
        setReviewModalVisible(false);
        setReviewText("");
    };

    const submitReturnRequest = () => {
        if(!returnReason.trim()) {
            Alert.alert("Error", "Please provide a reason for return/replacement.");
            return;
        }
        Alert.alert("Request Submitted", `Your request for order ${requestType} has been successfully registered.`);
        setReturnModalVisible(false);
        setReturnReason("");
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                
                {/*  Main Order Card Header */}
                <View style={styles.card}>
                    <View style={styles.row}>
                        <View>
                            <Text style={styles.orderId}>ID: #{orderData.id}</Text>
                            <Text style={styles.subText}>Placed on {orderData.date}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: "#DEF7EC" }]}>
                            <Text style={[styles.statusText, { color: "#03543F" }]}>{orderData.status}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.divider} />

                    {orderData.items.map((item, index) => (
                        <View key={item.id}>
                            <View style={styles.productSection}>
                                <Image source={item.image} style={styles.productImage} />
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                                    <Text style={styles.qty}>Qty: {item.qty}</Text>
                                    <Text style={styles.price}>₹{item.price}</Text>
                                </View>
                            </View>
                            {index < orderData.items.length - 1 && <View style={styles.itemDivider} />}
                        </View>
                    ))}
                </View>

                {/* Real-Time Shipment Tracking Stepper Component */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Track Shipment</Text>
                    <Text style={styles.subText}>{orderData.eta}</Text>

                    <View style={styles.stepperContainer}>
                        {orderData.steps.map((step, index) => (
                            <View key={index} style={styles.stepWrapper}>
                                <View style={styles.stepRow}>
                                    <View style={[styles.stepCircle, step.isCompleted && styles.completedStepCircle]}>
                                        {step.isCompleted && <Text style={styles.checkmark}>✓</Text>}
                                    </View>
                                    {index < orderData.steps.length - 1 && (
                                        <View style={[styles.stepLine, step.isCompleted && styles.completedStepLine]} />
                                    )}
                                </View>
                                <Text style={styles.stepTitle}>{step.title}</Text>
                                <Text style={styles.stepDate}>{step.date}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Interactive Main Action Section */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={() => Alert.alert("Success", "Downloading Invoice...")}>
                        <Text style={styles.secondaryButtonText}>📄 Invoice</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={() => setReviewModalVisible(true)}>
                        <Text style={styles.primaryButtonText}>⭐️ Write a Review</Text>
                    </TouchableOpacity>
                </View>

                {/* Complete Bill Payment Breakdown */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Bill Details</Text>
                    <View style={styles.divider} />
                    
                    <View style={styles.pricingRow}>
                        <Text style={styles.pricingLabel}>Item Subtotal</Text>
                        <Text style={styles.pricingValue}>₹{orderData.pricing.subtotal}</Text>
                    </View>
                    <View style={styles.pricingRow}>
                        <Text style={styles.pricingLabel}>Shipping Fee</Text>
                        <Text style={[styles.pricingValue, { color: "#10B981" }]}>FREE</Text>
                    </View>
                    <View style={styles.pricingRow}>
                        <Text style={styles.pricingLabel}>Coupons/Discounts</Text>
                        <Text style={[styles.pricingValue, { color: "#EF4444" }]}>-₹{orderData.pricing.discount}</Text>
                    </View>
                    
                    <View style={styles.itemDivider} />
                    
                    <View style={[styles.pricingRow, { marginTop: verticalScale(4) }]}>
                        <Text style={styles.totalLabel}>Total Amount Paid</Text>
                        <Text style={styles.totalValue}>₹{orderData.pricing.total}</Text>
                    </View>
                </View>

                {/* Verified Shipping Address Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                    <View style={styles.divider} />
                    <Text style={styles.customerName}>{orderData.shippingAddress.name}</Text>
                    <Text style={styles.addressText}>{orderData.shippingAddress.address}</Text>
                    <Text style={styles.phoneText}>Phone: {orderData.shippingAddress.phone}</Text>
                </View>


                <TouchableOpacity style={styles.cancelReturnContainer} onPress={() => setReturnModalVisible(true)}>
                    <Text style={styles.cancelReturnText}>Return or Replace Items?</Text>
                </TouchableOpacity>

            </ScrollView>

            <Modal animationType="fade" transparent={true} visible={reviewModalVisible} onRequestClose={() => setReviewModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.reviewModalContainer}>
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
                    </KeyboardAvoidingView>
                </View>
            </Modal>


            <Modal animationType="slide" transparent={true} visible={returnModalVisible} onRequestClose={() => setReturnModalVisible(false)}>
                <View style={styles.bottomSheetOverlay}>
                    <View style={styles.bottomSheetContainer}>
                        <View style={styles.pullBar} />
                        <Text style={styles.modalTitle}>Return or Replace Items</Text>
                        <Text style={styles.modalSubtitle}>Select your preferred operation service style:</Text>

                        {/* Request Toggle Selectors */}
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

                        <Text style={styles.inputLabel}>Reason for dynamic action context:</Text>
                        <TextInput 
                            style={styles.reasonInput}
                            placeholder="Example: Wrong size delivered / Product damaged on arrival..."
                            placeholderTextColor="#9CA3AF"
                            value={returnReason}
                            onChangeText={setReturnReason}
                        />

                        <TouchableOpacity style={styles.actionSubmitBlock} onPress={submitReturnRequest}>
                            <Text style={styles.actionSubmitBlockText}>Submit Request</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionCloseBlock} onPress={() => setReturnModalVisible(false)}>
                            <Text style={styles.actionCloseBlockText}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    card: {
        backgroundColor: "#FFF",
        borderRadius: moderateScale(14),
        padding: moderateScale(16),
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: verticalScale(16),
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
        borderRadius: moderateScale(6),
    },
    statusText: {
        fontSize: scale(12),
        fontWeight: "600",
    },
    divider: {
        height: 1,
        backgroundColor: "#E5E7EB",
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
        alignItems: "center",
    },
    productImage: {
        width: scale(65),
        height: scale(65),
        borderRadius: moderateScale(8),
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
        marginBottom: verticalScale(2)
    },
    qty: {
        fontSize: scale(12),
        color: "#6B7280",
        marginBottom: verticalScale(2)
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
    stepDate: {
        fontSize: scale(10),
        color: "#9CA3AF",
        marginTop: verticalScale(2)
    },
    /* Main Actions Style */
    actionsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: moderateScale(16),
        marginBottom: verticalScale(16),
    },
    actionButton: {
        flex: 0.48,
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(10),
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    primaryButton: {
        backgroundColor: "#4F46E5",
        borderColor: "#4F46E5",
    },
    primaryButtonText: {
        color: "#FFF",
        fontSize: scale(13),
        fontWeight: "600",
    },
    secondaryButton: {
        backgroundColor: "#FFF",
        borderColor: "#D1D5DB",
    },
    secondaryButtonText: {
        color: "#374151",
        fontSize: scale(13),
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
    /* Address Info Card elements */
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
        marginBottom: verticalScale(62),
    },
    cancelReturnText: {
        fontSize: scale(13),
        fontWeight: "600",
        color: "#EF4444",
        textDecorationLine: "underline"
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
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
    }
})