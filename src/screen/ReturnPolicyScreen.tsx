x`import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

const ReturnPolicyScreen = () => {
    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Return & Exchange Policy</Text>
                    <Text style={styles.subtitle}>Everything you need to know about returns and exchanges.</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Ionicons name="calendar-outline" size={24} color="#0A0A0A" />
                        <Text style={styles.sectionTitle}>Return Window</Text>
                    </View>
                    <Text style={styles.sectionText}>You have 7 days from the date of delivery to initiate a return request.</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Ionicons name="pricetag-outline" size={24} color="#0A0A0A" />
                        <Text style={styles.sectionTitle}>Mandatory Conditions</Text>
                    </View>
                    <Text style={styles.sectionText}>The product must have its original tags attached. Returns without tags will be strictly rejected. Only the exact product delivered to you is eligible for return.</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Ionicons name="car-outline" size={24} color="#0A0A0A" />
                        <Text style={styles.sectionTitle}>Dispatch Timeline</Text>
                    </View>
                    <Text style={styles.sectionText}>Orders are typically dispatched within 48 hours of being placed.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ReturnPolicyScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    content: { padding: scale(20), paddingBottom: verticalScale(40) },
    header: { marginBottom: verticalScale(30) },
    title: { fontSize: moderateScale(28), fontWeight: '900', color: '#0A0A0A', marginBottom: verticalScale(8) },
    subtitle: { fontSize: moderateScale(15), color: '#6B7280', lineHeight: moderateScale(22) },
    section: {
        backgroundColor: '#FFFFFF',
        padding: scale(20),
        borderRadius: moderateScale(16),
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    sectionTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#0A0A0A',
        marginLeft: scale(12),
    },
    sectionText: {
        fontSize: moderateScale(14),
        color: '#4B5563',
        lineHeight: moderateScale(24),
    },
});
