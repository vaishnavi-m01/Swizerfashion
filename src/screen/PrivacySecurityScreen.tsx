import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

interface SecurityItem {
    id: string;
    icon: string;
    title: string;
    subtitle: string;
    type: 'switch' | 'link';
}

const SECURITY_SETTINGS: SecurityItem[] = [
    { id: 'faceId', icon: 'scan-outline', title: 'Face ID / Touch ID', subtitle: 'Enable biometric login', type: 'switch' },
    { id: 'twoFactor', icon: 'shield-checkmark-outline', title: 'Two-Factor Authentication', subtitle: 'Add an extra layer of security', type: 'switch' },
    { id: 'changePass', icon: 'key-outline', title: 'Change Password', subtitle: 'Update your account password', type: 'link' },
    { id: 'devices', icon: 'laptop-outline', title: 'Device Management', subtitle: 'Manage connected devices', type: 'link' },
];

const PrivacySecurityScreen = () => {
    const [enabled, setEnabled] = useState<Record<string, boolean>>({
        faceId: true,
        twoFactor: false,
    });

    const toggle = (id: string) => setEnabled(prev => ({ ...prev, [id]: !prev[id] }));

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                
                {/* Security Section */}
                <Text style={styles.sectionLabel}>ACCOUNT SECURITY</Text>
                
                <View style={styles.card}>
                    {SECURITY_SETTINGS.map((item, index) => (
                        <View key={item.id}>
                            <TouchableOpacity 
                                style={styles.row} 
                                activeOpacity={item.type === 'link' ? 0.7 : 1}
                            >
                                <View style={styles.iconWrap}>
                                    <Ionicons name={item.icon} size={scale(20)} color="#111827" />
                                </View>
                                <View style={styles.rowInfo}>
                                    <Text style={styles.rowTitle}>{item.title}</Text>
                                    <Text style={styles.rowSub}>{item.subtitle}</Text>
                                </View>

                                {item.type === 'switch' ? (
                                    <Switch
                                        value={enabled[item.id]}
                                        onValueChange={() => toggle(item.id)}
                                        trackColor={{ false: '#E5E7EB', true: '#A5B4FC' }}
                                        thumbColor={enabled[item.id] ? '#4F46E5' : '#9CA3AF'}
                                    />
                                ) : (
                                    <Ionicons name="chevron-forward" size={scale(20)} color="#9CA3AF" />
                                )}
                            </TouchableOpacity>

                            {index < SECURITY_SETTINGS.length - 1 && <View style={styles.divider} />}
                        </View>
                    ))}
                </View>

                {/* Privacy Section */}
                <Text style={[styles.sectionLabel, { marginTop: verticalScale(24) }]}>DATA & PRIVACY</Text>
                
                <View style={styles.card}>
                    <TouchableOpacity style={styles.row} activeOpacity={0.7}>
                        <View style={styles.iconWrap}>
                            <Ionicons name="document-text-outline" size={scale(20)} color="#111827" />
                        </View>
                        <View style={styles.rowInfo}>
                            <Text style={styles.rowTitle}>Privacy Policy</Text>
                            <Text style={styles.rowSub}>Read our data policy</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={scale(20)} color="#9CA3AF" />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.row} activeOpacity={0.7}>
                        <View style={styles.iconWrap}>
                            <Ionicons name="trash-outline" size={scale(20)} color="#EF4444" />
                        </View>
                        <View style={styles.rowInfo}>
                            <Text style={[styles.rowTitle, { color: '#EF4444' }]}>Delete Account</Text>
                            <Text style={styles.rowSub}>Permanently delete your data</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={scale(20)} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default PrivacySecurityScreen;

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
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(14),
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: moderateScale(14),
        paddingVertical: verticalScale(14),
    },
    iconWrap: {
        width: scale(38),
        height: scale(38),
        borderRadius: scale(19),
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: moderateScale(12),
    },
    rowInfo: { flex: 1 },
    rowTitle: { fontSize: scale(14), fontWeight: '600', color: '#111827' },
    rowSub: { fontSize: scale(12), color: '#6B7280', marginTop: verticalScale(2) },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginLeft: moderateScale(64), // Aligns with text start
    },
});
