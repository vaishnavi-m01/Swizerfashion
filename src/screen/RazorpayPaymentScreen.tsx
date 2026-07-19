import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity, Dimensions, Modal, Alert, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RazorpayCheckout from 'react-native-razorpay';
import { scale, moderateScale, verticalScale } from "../utils/responsive";
import api from '../config/apiConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RazorpayPaymentScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    // Destination properties unpack
    const { orderData, preferredMethod } = route.params;

    const [processing, setProcessing] = useState(true);
    const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);

    useEffect(() => {
        executeDirectMethodTransaction();
    }, []);

    const executeDirectMethodTransaction = () => {
        const options: any = {
            description: `Secure checkout verification - ${orderData.order_number}`,
            image: 'https://swizerfashion.com/public/frontend/assets/images/logo/logoblack.png',
            currency: orderData.currency || 'INR',
            key: 'rzp_test_TBOcoc1chS5hKn',
            amount: orderData.amount,
            name: 'Swizer Fashion',
            order_id: orderData.razorpay_order_id,
            prefill: {
                email: orderData.prefill?.email || '',
                contact: orderData.prefill?.contact || '',
                name: orderData.prefill?.name || ''
            },
            theme: {
                color: '#000000'
            },
            retry: {
                enabled: false 
            }
        };

        RazorpayCheckout.open(options)
            .then(async (successResponse: any) => {
                try {
                    // Import api at the top if needed, assuming it's available. Let's make sure.
                    const verifyResponse = await api.post('verify-payment', {
                        razorpay_order_id: successResponse.razorpay_order_id,
                        razorpay_payment_id: successResponse.razorpay_payment_id,
                        razorpay_signature: successResponse.razorpay_signature,
                        order_id: orderData.id
                    });

                    if (verifyResponse.data?.status) {
                        setProcessing(false);
                        setSuccessModalVisible(true);
                        setTimeout(() => {
                            setSuccessModalVisible(false);
                            // Clear intermediate execution records out of history track stack
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'MainTabs', params: { screen: 'HomeTab' } }],
                            });
                        }, 2500);
                    } else {
                        setProcessing(false);
                        Alert.alert('Verification Failed', verifyResponse.data?.message || 'Payment authentication failed.');
                    }
                } catch (verifyError: any) {
                    setProcessing(false);
                    Alert.alert('Verification Error', 'Failed to confirm transaction status with server.');
                }
            })
            .catch((errorResponse: any) => {
                setProcessing(false);
                navigation.goBack();
            });
    };

    return (
        <View style={styles.pageContainer}>
            <StatusBar backgroundColor="#000000" barStyle="light-content" />
            <View style={[styles.headerBar, { paddingTop: insets.top > 0 ? insets.top : verticalScale(16) }]}>
                <TouchableOpacity style={styles.backTouch} onPress={() => navigation.goBack()} disabled={processing}>
                    <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitleText}>Processing Payment</Text>
                <View style={{ width: 24 }} />
            </View>

            {processing && (
                <View style={styles.centerLoadingArea}>
                    <ActivityIndicator size="large" color="#0A0A0A" />
                    <Text style={styles.loadingMessage}>
                        Opening your {preferredMethod.toUpperCase()} pipeline...
                    </Text>
                    <Text style={styles.secureSubtext}>Authorizing digital security clearance. Please standby.</Text>
                </View>
            )}

            {/* REAL-TIME APP FEEDBACK DIALOG BOX */}
            <Modal visible={isSuccessModalVisible} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.successModalContent}>
                        <View style={styles.successBadge}>
                            <Ionicons name="checkmark-sharp" size={36} color="#fff" />
                        </View>
                        <Text style={styles.successTitle}>Payment Verified</Text>
                        <Text style={styles.successSubtitle}>Your order confirmation has processed into our logistics system.</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default RazorpayPaymentScreen;

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    headerBar: {
        backgroundColor: '#000000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(16),
        paddingBottom: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: '#000000'
    },
    backTouch: {
        padding: scale(4)
    },
    headerTitleText: {
        color: '#FFFFFF',
        fontSize: scale(16),
        fontWeight: '700',
        letterSpacing: 0.2
    },
    centerLoadingArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scale(32)
    },
    loadingMessage: {
        color: '#0A0A0A',
        fontSize: scale(15),
        fontWeight: '600',
        marginTop: scale(18)
    },
    secureSubtext: {
        color: '#666666',
        fontSize: scale(12),
        marginTop: scale(6),
        textAlign: 'center',
        lineHeight: scale(18)
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    successModalContent: {
        backgroundColor: '#ffffff',
        borderRadius: moderateScale(16),
        padding: moderateScale(24),
        alignItems: 'center',
        width: SCREEN_WIDTH - scale(48)
    },
    successBadge: {
        width: scale(64),
        height: scale(64),
        borderRadius: scale(32),
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(14)
    },
    successTitle: {
        fontSize: moderateScale(17),
        fontWeight: '800',
        color: '#111827',
        textAlign: 'center'
    },
    successSubtitle: {
        fontSize: moderateScale(12),
        color: '#4B5563',
        textAlign: 'center',
        marginTop: verticalScale(6),
        lineHeight: moderateScale(18)
    }
});