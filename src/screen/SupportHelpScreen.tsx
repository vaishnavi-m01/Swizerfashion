import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

const SUPPORT_MODULES = [
    {
        id: '1',
        title: 'Contact Us',
        content: 'Email: swizerfashion@gmail.com\nPhone: +91 89258 97502\nSupport Hours: Monday to Saturday, 10 AM to 7 PM IST'
    },
    {
        id: '2',
        title: 'Return & Exchange Policy',
        content: 'Return Window: You have 7 days from the date of delivery to initiate a return request.\n\nMandatory Conditions: The product must have its original tags attached. Returns without tags will be strictly rejected. Only the exact product delivered to you is eligible for return.\n\nDispatch: Orders are typically dispatched within 48 hours of being placed.'
    },
    {
        id: '3',
        title: 'Privacy Policy',
        content: 'Data Collection: Swizer collects personal information (name, email, shipping address, phone, payment details) and non-personal information (browser type, device info, site behavior) to process orders and improve user experience.\n\nData Usage: Information is used to fulfill orders, provide customer support, send personalized offers (with consent), and perform site analytics.\n\nSharing: Data is only shared with necessary logistics and payment partners, or to comply with legal requirements.'
    },
    {
        id: '4',
        title: 'Terms and Conditions',
        content: 'Agreement: By using the website, you agree to their terms.\n\nIntellectual Property: All content (text, graphics, logos, images) is the property of the brand and protected by copyright.\n\nGoverning Law: The terms are governed by the laws of India, and disputes are subject to the exclusive jurisdiction of the courts in that location.'
    }
];

const SupportHelpScreen = () => {
    const [activeSection, setActiveSection] = useState<string | null>(null);

    const toggleSection = (id: string) => {
        setActiveSection(prev => (prev === id ? null : id));
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.headerTitle}>Support & Help Center</Text>
                <Text style={styles.headerSubtitle}>How can we help you today?</Text>

                <View style={styles.accordionContainer}>
                    {SUPPORT_MODULES.map((module) => {
                        const isActive = activeSection === module.id;
                        return (
                            <View key={module.id} style={styles.moduleCard}>
                                <TouchableOpacity 
                                    style={styles.moduleHeader} 
                                    onPress={() => toggleSection(module.id)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.moduleTitle, isActive && styles.activeTitle]}>
                                        {module.title}
                                    </Text>
                                    <Ionicons 
                                        name={isActive ? 'chevron-up' : 'chevron-down'} 
                                        size={moderateScale(20)} 
                                        color={isActive ? '#0A0A0A' : '#6B7280'} 
                                    />
                                </TouchableOpacity>
                                
                                {isActive && (
                                    <View style={styles.moduleContent}>
                                        <Text style={styles.bodyText}>{module.content}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SupportHelpScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    content: { padding: scale(16), paddingBottom: verticalScale(40) },
    headerTitle: { fontSize: moderateScale(24), fontWeight: '900', color: '#0A0A0A', marginBottom: verticalScale(8) },
    headerSubtitle: { fontSize: moderateScale(14), color: '#6B7280', marginBottom: verticalScale(24) },
    accordionContainer: { gap: verticalScale(12) },
    moduleCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    moduleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: scale(16),
        backgroundColor: '#FFFFFF',
    },
    moduleTitle: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: '#374151',
    },
    activeTitle: {
        color: '#0A0A0A',
    },
    moduleContent: {
        paddingHorizontal: scale(16),
        paddingBottom: scale(16),
        backgroundColor: '#FFFFFF',
    },
    bodyText: { 
        fontSize: moderateScale(14), 
        color: '#4B5563', 
        lineHeight: moderateScale(22) 
    },
});
