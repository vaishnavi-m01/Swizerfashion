import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

const methods = [
    { id: '1', type: 'card', last4: '4242', brand: 'Visa', expiry: '12/26', isDefault: true },
    { id: '2', type: 'upi', upiId: 'user@upi', isDefault: false },
];

const PaymentMethodsScreen = () => {
    const navigation = useNavigation<any>();

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionLabel}>SAVED METHODS</Text>

                {methods.map((m) => (
                    <View key={m.id} style={styles.card}>
                        <View style={styles.cardIconWrap}>
                            <Ionicons
                                name={m.type === 'card' ? 'card-outline' : 'phone-portrait-outline'}
                                size={scale(22)}
                                color="#111827"
                            />
                        </View>
                        <View style={styles.cardInfo}>
                            {m.type === 'card' ? (
                                <>
                                    <Text style={styles.cardTitle}>{m.brand} •••• {m.last4}</Text>
                                    <Text style={styles.cardSub}>Expires {m.expiry}</Text>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.cardTitle}>UPI</Text>
                                    <Text style={styles.cardSub}>{m.upiId}</Text>
                                </>
                            )}
                        </View>
                        {m.isDefault && (
                            <View style={styles.defaultBadge}>
                                <Text style={styles.defaultBadgeText}>Default</Text>
                            </View>
                        )}
                    </View>
                ))}

                <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
                    <Ionicons name="add-circle-outline" size={scale(20)} color="#111827" />
                    <Text style={styles.addButtonText}>Add Payment Method</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PaymentMethodsScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { padding: scale(16), paddingBottom: verticalScale(40) },
    sectionLabel: {
        fontSize: scale(11),
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: 0.8,
        marginBottom: verticalScale(12),
        marginTop: verticalScale(4),
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(14),
        padding: moderateScale(14),
        marginBottom: verticalScale(10),
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardIconWrap: {
        width: scale(42),
        height: scale(42),
        borderRadius: scale(21),
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: moderateScale(12),
    },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: scale(14), fontWeight: '600', color: '#111827' },
    cardSub: { fontSize: scale(12), color: '#6B7280', marginTop: verticalScale(2) },
    defaultBadge: {
        backgroundColor: '#DCFCE7',
        borderRadius: moderateScale(8),
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(3),
    },
    defaultBadgeText: { fontSize: scale(11), fontWeight: '600', color: '#16A34A' },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(8),
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        borderStyle: 'dashed',
        borderRadius: moderateScale(14),
        padding: moderateScale(14),
        marginTop: verticalScale(6),
    },
    addButtonText: { fontSize: scale(14), fontWeight: '600', color: '#111827' },
});
