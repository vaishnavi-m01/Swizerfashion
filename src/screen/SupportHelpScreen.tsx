import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

interface FAQItem {
    question: string;
    answer: string;
}

const FAQS: FAQItem[] = [
    { question: 'How do I track my order?', answer: 'Go to My Orders, tap on your order and you\'ll see a live tracking status with shipping details.' },
    { question: 'How do I return or replace an item?', answer: 'Open the Order Details page for the delivered item and tap "Return or Replace Items" to raise a request.' },
    { question: 'When will I receive my refund?', answer: 'Refunds are processed within 5–7 business days after we receive the returned item.' },
    { question: 'How can I change my delivery address?', answer: 'Go to Profile → Manage Shipping Address to add, edit or set a default address before placing an order.' },
    { question: 'Can I cancel an order?', answer: 'Orders can be cancelled before they are shipped. Contact support if you need urgent assistance.' },
];

const SupportHelpScreen = () => {
    const [expanded, setExpanded] = useState<number | null>(null);

    const toggle = (i: number) => setExpanded(prev => (prev === i ? null : i));

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Contact Options */}
                <Text style={styles.sectionLabel}>CONTACT US</Text>
                <View style={styles.contactRow}>
                    <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('mailto:support@swizerfashion.com')}>
                        <Ionicons name="mail-outline" size={scale(24)} color="#111827" />
                        <Text style={styles.contactTitle}>Email</Text>
                        <Text style={styles.contactSub}>support@swizerfashion.com</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('tel:+919999999999')}>
                        <Ionicons name="call-outline" size={scale(24)} color="#111827" />
                        <Text style={styles.contactTitle}>Phone</Text>
                        <Text style={styles.contactSub}>+91 99999 99999</Text>
                    </TouchableOpacity>
                </View>

                {/* FAQ */}
                <Text style={[styles.sectionLabel, { marginTop: verticalScale(24) }]}>FREQUENTLY ASKED</Text>
                {FAQS.map((faq, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.faqCard, expanded === i && styles.faqCardActive]}
                        onPress={() => toggle(i)}
                        activeOpacity={0.85}
                    >
                        <View style={styles.faqHeader}>
                            <Text style={styles.faqQuestion}>{faq.question}</Text>
                            <Ionicons
                                name={expanded === i ? 'chevron-up' : 'chevron-down'}
                                size={scale(16)}
                                color="#9CA3AF"
                            />
                        </View>
                        {expanded === i && (
                            <Text style={styles.faqAnswer}>{faq.answer}</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

export default SupportHelpScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { padding: scale(16), paddingBottom: verticalScale(40) },
    sectionLabel: {
        fontSize: scale(11),
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: 0.8,
        marginBottom: verticalScale(10),
        marginTop: verticalScale(4),
    },
    contactRow: { flexDirection: 'row', gap: scale(12) },
    contactCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(14),
        padding: moderateScale(16),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        gap: verticalScale(6),
    },
    contactTitle: { fontSize: scale(13), fontWeight: '700', color: '#111827', marginTop: verticalScale(4) },
    contactSub: { fontSize: scale(11), color: '#6B7280', textAlign: 'center' },
    faqCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(12),
        padding: moderateScale(14),
        marginBottom: verticalScale(8),
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    faqCardActive: { borderColor: '#111827' },
    faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: scale(8) },
    faqQuestion: { flex: 1, fontSize: scale(13), fontWeight: '600', color: '#111827', lineHeight: scale(19) },
    faqAnswer: { fontSize: scale(13), color: '#6B7280', marginTop: verticalScale(10), lineHeight: scale(20) },
});
