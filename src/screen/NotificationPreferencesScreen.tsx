import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

interface SettingItem {
    id: string;
    icon: string;
    title: string;
    subtitle: string;
}

const NOTIF_SETTINGS: SettingItem[] = [
    { id: 'orders', icon: '📦', title: 'Order Updates', subtitle: 'Shipping, delivery and tracking' },
    { id: 'offers', icon: '🎁', title: 'Offers & Promotions', subtitle: 'Deals, coupons and flash sales' },
    { id: 'wishlist', icon: '❤️', title: 'Wishlist Alerts', subtitle: 'Price drops on saved items' },
    { id: 'account', icon: '🔐', title: 'Account Activity', subtitle: 'Login, password & profile changes' },
    { id: 'newsletter', icon: '📰', title: 'Newsletter', subtitle: 'Weekly fashion updates' },
];

const NotificationPreferencesScreen = () => {
    const [enabled, setEnabled] = useState<Record<string, boolean>>({
        orders: true,
        offers: true,
        wishlist: false,
        account: true,
        newsletter: false,
    });

    const toggle = (id: string) => setEnabled(prev => ({ ...prev, [id]: !prev[id] }));

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionLabel}>PUSH NOTIFICATIONS</Text>

                {NOTIF_SETTINGS.map((item, index) => (
                    <View
                        key={item.id}
                        style={[
                            styles.row,
                            index === 0 && styles.rowFirst,
                            index === NOTIF_SETTINGS.length - 1 && styles.rowLast,
                        ]}
                    >
                        <Text style={styles.rowIcon}>{item.icon}</Text>
                        <View style={styles.rowInfo}>
                            <Text style={styles.rowTitle}>{item.title}</Text>
                            <Text style={styles.rowSub}>{item.subtitle}</Text>
                        </View>
                        <Switch
                            value={enabled[item.id]}
                            onValueChange={() => toggle(item.id)}
                            trackColor={{ false: '#E5E7EB', true: '#A5B4FC' }}
                            thumbColor={enabled[item.id] ? '#4F46E5' : '#9CA3AF'}
                        />
                    </View>
                ))}

                <Text style={styles.hint}>
                    You can also manage notification permissions in your phone's Settings app.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

export default NotificationPreferencesScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { padding: scale(16), paddingBottom: verticalScale(40) },
    sectionLabel: {
        fontSize: scale(11),
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: 0.8,
        marginBottom: verticalScale(8),
        marginTop: verticalScale(4),
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: moderateScale(14),
        paddingVertical: verticalScale(14),
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    rowFirst: { borderTopLeftRadius: moderateScale(14), borderTopRightRadius: moderateScale(14) },
    rowLast: { borderBottomLeftRadius: moderateScale(14), borderBottomRightRadius: moderateScale(14), borderBottomWidth: 0 },
    rowIcon: { fontSize: scale(22), marginRight: moderateScale(12) },
    rowInfo: { flex: 1 },
    rowTitle: { fontSize: scale(14), fontWeight: '600', color: '#111827' },
    rowSub: { fontSize: scale(12), color: '#6B7280', marginTop: verticalScale(2) },
    hint: {
        fontSize: scale(12),
        color: '#9CA3AF',
        marginTop: verticalScale(16),
        lineHeight: scale(18),
        textAlign: 'center',
    },
});
