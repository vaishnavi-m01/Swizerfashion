import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import OrderCard from '../component/OrderCards';

const orders = [
    {
        orderId: "58731245",
        orderStatus: "Pending",
        products: [
            { id: "1", image: "https://loremflickr.com/200/200/fashion?lock=1", name: "Premium Wireless Headphones", qty: 1 },
            { id: "2", image: "https://loremflickr.com/200/200/fashion?lock=2", name: "Women's Silk Saree", qty: 2 },
            { id: "3", image: "https://loremflickr.com/200/200/fashion?lock=3", name: "Kurti", qty: 1 },
        ],
        price: 2627.5,
        date: "Today, 04:30 PM",
        dateType: "Today",
    },
    {
        orderId: "58731246",
        orderStatus: "Delivered",
        products: [
            { id: "4", image: "https://loremflickr.com/200/200/fashion?lock=4", name: "Cotton Saree", qty: 1 },
            { id: "5", image: "https://loremflickr.com/200/200/fashion?lock=5", name: "Handbag", qty: 1 },
        ],
        price: 1899,
        date: "20 Jun 2026",
        dateType: "Week",
    },
    {
        orderId: "58731247",
        orderStatus: "Cancelled",
        products: [
            { id: "6", image: "https://loremflickr.com/200/200/fashion?lock=6", name: "Men's Casual Shirt", qty: 2 },
            { id: "7", image: "https://loremflickr.com/200/200/fashion?lock=7", name: "Jeans", qty: 1 },
            { id: "8", image: "https://loremflickr.com/200/200/fashion?lock=8", name: "Sneakers", qty: 1 },
            { id: "9", image: "https://loremflickr.com/200/200/fashion?lock=9", name: "Wallet", qty: 1 },
        ],
        price: 4299,
        date: "18 Jun 2026",
        dateType: "Month",
    },
    {
        orderId: "58731248",
        orderStatus: "Delivered",
        products: [
            { id: "10", image: "https://loremflickr.com/200/200/fashion?lock=10", name: "Ethnic Kurta Set", qty: 1 },
        ],
        price: 1599,
        date: "Jan 12, 2026",
        dateType: "Year",
    },
];

const TIME_FILTERS = ['Today', 'Week', 'Month', 'Year'];
const STATUS_FILTERS = ['All', 'Pending', 'Delivered', 'Cancelled'];

const STATUS_STYLE: Record<string, { bg: string; color: string; icon: string }> = {
    Pending:   { bg: '#FEF3C7', color: '#D97706', icon: 'time-outline' },
    Delivered: { bg: '#DCFCE7', color: '#16A34A', icon: 'checkmark-circle-outline' },
    Cancelled: { bg: '#FEE2E2', color: '#DC2626', icon: 'close-circle-outline' },
    All:       { bg: '#EEF2FF', color: '#4F46E5', icon: 'list-outline' },
};

const OrderScreen = () => {
    const [activeTime, setActiveTime] = useState('Today');
    const [activeStatus, setActiveStatus] = useState('All');

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchTime = order.dateType === activeTime;
            const matchStatus = activeStatus === 'All' || order.orderStatus === activeStatus;
            return matchTime && matchStatus;
        });
    }, [activeTime, activeStatus]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>My Orders</Text>
                    <Text style={styles.headerSubtitle}>{orders.length} total orders</Text>
                </View>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="search-outline" size={scale(22)} color="#0A0A0A" />
                </TouchableOpacity>
            </View>

            {/* Filter Bar - Time + Status together */}
            <View style={styles.filterBar}>
                {/* Time Filter Pills */}
                <View style={styles.timePillRow}>
                    {TIME_FILTERS.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[styles.timePill, activeTime === filter && styles.timePillActive]}
                            onPress={() => setActiveTime(filter)}
                            activeOpacity={0.75}
                        >
                            <Text style={[styles.timePillText, activeTime === filter && styles.timePillTextActive]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Status Filter Chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.statusRow}
                >
                    {STATUS_FILTERS.map((status) => {
                        const sty = STATUS_STYLE[status];
                        const isActive = activeStatus === status;
                        return (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.statusChip,
                                    {
                                        backgroundColor: isActive ? sty.bg : '#F9F9F9',
                                        borderColor: isActive ? sty.color : '#EFEFEF',
                                    }
                                ]}
                                onPress={() => setActiveStatus(status)}
                                activeOpacity={0.75}
                            >
                                <Ionicons
                                    name={sty.icon as any}
                                    size={scale(13)}
                                    color={isActive ? sty.color : '#B0B0B0'}
                                />
                                <Text style={[
                                    styles.statusChipText,
                                    { color: isActive ? sty.color : '#B0B0B0', fontWeight: (isActive ? '700' : '500') as '700' | '500' }
                                ]}>
                                    {status}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
            <View style={styles.filterDivider} />

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="receipt-outline" size={scale(60)} color="#D1D5DB" />
                    <Text style={styles.emptyTitle}>No orders found</Text>
                    <Text style={styles.emptySubtitle}>Try changing your filters</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredOrders}
                    keyExtractor={(item) => item.orderId}
                    contentContainerStyle={{ padding: scale(16) }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <OrderCard
                            orderId={item.orderId}
                            orderStatus={item.orderStatus}
                            products={item.products}
                            price={item.price}
                            date={item.date}
                        />
                    )}
                />
            )}
        </SafeAreaView>
    );
};

export default OrderScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingTop: verticalScale(12),
        paddingBottom: verticalScale(14),
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: scale(22),
        fontWeight: '800',
        color: '#0A0A0A',
    },
    headerSubtitle: {
        fontSize: scale(12),
        color: '#9CA3AF',
        fontWeight: '400',
        marginTop: verticalScale(2),
    },
    iconButton: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Filter Bar
    filterBar: {
        backgroundColor: '#FFFFFF',
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(4),
    },
    filterDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: verticalScale(4),
    },

    
    timePillRow: {
        flexDirection: 'row',
        paddingHorizontal: scale(16),
        paddingBottom: verticalScale(6),
        gap: scale(8),
    },
    timePill: {
        flex: 1,
        paddingVertical: verticalScale(7),
        borderRadius: moderateScale(10),
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    timePillActive: {
        backgroundColor: '#0A0A0A',
    },
    timePillText: {
        fontSize: scale(12),
        fontWeight: '600' as const,
        color: '#6B7280',
    },
    timePillTextActive: {
        color: '#FFFFFF',
    },

    // Status Filter Chips
    statusRow: {
        paddingHorizontal: scale(16),
        paddingBottom: verticalScale(4),
        gap: scale(6),
        alignItems: 'center',
    },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: moderateScale(20),
        borderWidth: 1,
        borderColor: 'transparent',
    },
    statusChipText: {
        fontSize: scale(12),
        fontWeight: '500' as const,
    },

    // Empty State
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: verticalScale(60),
    },
    emptyTitle: {
        fontSize: scale(18),
        fontWeight: '700',
        color: '#374151',
        marginTop: verticalScale(16),
    },
    emptySubtitle: {
        fontSize: scale(13),
        color: '#9CA3AF',
        marginTop: verticalScale(6),
    },
});