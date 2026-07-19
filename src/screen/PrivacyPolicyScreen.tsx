import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

const PrivacyPolicyScreen = () => {
    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Privacy Policy</Text>
                    <Text style={styles.subtitle}>How we handle and protect your personal information.</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Data Collection</Text>
                    <Text style={styles.cardText}>
                        Swizer collects personal information (name, email, shipping address, phone, payment details) and non-personal information (browser type, device info, site behavior) to process orders and improve user experience.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Data Usage</Text>
                    <Text style={styles.cardText}>
                        Information is used to fulfill orders, provide customer support, send personalized offers (with consent), and perform site analytics.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Sharing</Text>
                    <Text style={styles.cardText}>
                        Data is only shared with necessary logistics and payment partners, or to comply with legal requirements.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    content: { padding: scale(20), paddingBottom: verticalScale(40) },
    header: { marginBottom: verticalScale(30) },
    title: { fontSize: moderateScale(28), fontWeight: '900', color: '#0A0A0A', marginBottom: verticalScale(8) },
    subtitle: { fontSize: moderateScale(15), color: '#6B7280', lineHeight: moderateScale(22) },
    card: {
        backgroundColor: '#FFFFFF',
        padding: scale(20),
        borderRadius: moderateScale(12),
        marginBottom: verticalScale(16),
        borderLeftWidth: 4,
        borderLeftColor: '#0A0A0A',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTitle: {
        fontSize: moderateScale(16),
        fontWeight: '800',
        color: '#0A0A0A',
        marginBottom: verticalScale(8),
    },
    cardText: {
        fontSize: moderateScale(14),
        color: '#4B5563',
        lineHeight: moderateScale(24),
    },
});
