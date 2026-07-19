import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

const TermsConditionsScreen = () => {
    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Terms & Conditions</Text>
                    <Text style={styles.subtitle}>Please read these terms and conditions carefully.</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionNumber}>01</Text>
                    <View style={styles.sectionContent}>
                        <Text style={styles.sectionTitle}>Agreement</Text>
                        <Text style={styles.sectionText}>
                            By using this app, you agree to their terms and conditions. If you do not agree, you must not use our services.
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionNumber}>02</Text>
                    <View style={styles.sectionContent}>
                        <Text style={styles.sectionTitle}>Intellectual Property</Text>
                        <Text style={styles.sectionText}>
                            All content (text, graphics, logos, images) is the property of the brand and protected by copyright.
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionNumber}>03</Text>
                    <View style={styles.sectionContent}>
                        <Text style={styles.sectionTitle}>Governing Law</Text>
                        <Text style={styles.sectionText}>
                            The terms are governed by the laws of India, and disputes are subject to the exclusive jurisdiction of the courts in that location.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default TermsConditionsScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    content: { padding: scale(20), paddingBottom: verticalScale(40) },
    header: { marginBottom: verticalScale(30) },
    title: { fontSize: moderateScale(28), fontWeight: '900', color: '#0A0A0A', marginBottom: verticalScale(8) },
    subtitle: { fontSize: moderateScale(15), color: '#6B7280', lineHeight: moderateScale(22) },
    section: {
        flexDirection: 'row',
        marginBottom: verticalScale(24),
    },
    sectionNumber: {
        fontSize: moderateScale(32),
        fontWeight: '900',
        color: '#E5E7EB',
        marginRight: scale(16),
        marginTop: verticalScale(-4),
    },
    sectionContent: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#0A0A0A',
        marginBottom: verticalScale(6),
    },
    sectionText: {
        fontSize: moderateScale(14),
        color: '#4B5563',
        lineHeight: moderateScale(22),
    },
});
