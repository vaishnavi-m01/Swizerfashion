import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

const ContactUsScreen = () => {
    const handleEmail = () => {
        Linking.openURL('mailto:swizerfashion@gmail.com');
    };

    const handlePhone = () => {
        Linking.openURL('tel:+918925897502');
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Get in Touch</Text>
                    <Text style={styles.subtitle}>We're here to help and answer any question you might have.</Text>
                </View>

                <TouchableOpacity style={styles.contactCard} onPress={handleEmail} activeOpacity={0.8}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="mail" size={24} color="#0A0A0A" />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>Email Support</Text>
                        <Text style={styles.cardValue}>swizerfashion@gmail.com</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.contactCard} onPress={handlePhone} activeOpacity={0.8}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="call" size={24} color="#0A0A0A" />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>Phone Support</Text>
                        <Text style={styles.cardValue}>+91 89258 97502</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.hoursContainer}>
                    <Ionicons name="time-outline" size={20} color="#6B7280" />
                    <Text style={styles.hoursText}>Support Hours: Monday to Saturday, 10 AM to 7 PM IST</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ContactUsScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    content: { padding: scale(20), paddingBottom: verticalScale(40) },
    header: { marginBottom: verticalScale(30) },
    title: { fontSize: moderateScale(28), fontWeight: '900', color: '#0A0A0A', marginBottom: verticalScale(8) },
    subtitle: { fontSize: moderateScale(15), color: '#6B7280', lineHeight: moderateScale(22) },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: scale(16),
        borderRadius: moderateScale(16),
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: scale(48),
        height: scale(48),
        borderRadius: moderateScale(24),
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(16),
    },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: moderateScale(14), color: '#6B7280', marginBottom: verticalScale(4) },
    cardValue: { fontSize: moderateScale(16), fontWeight: '700', color: '#0A0A0A' },
    hoursContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(20),
        padding: scale(16),
        backgroundColor: '#F3F4F6',
        borderRadius: moderateScale(12),
    },
    hoursText: { fontSize: moderateScale(13), color: '#4B5563', marginLeft: scale(8), fontWeight: '500' },
});
