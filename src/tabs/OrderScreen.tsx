// // import React, { useState, useMemo } from 'react';
// // import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView } from "react-native";
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import Ionicons from 'react-native-vector-icons/Ionicons';
// // import { scale, verticalScale, moderateScale } from '../utils/responsive';
// // import OrderCard from '../component/OrderCards';
// // import api from '../config/apiConfig';

// // const orders = [
// //     {
// //         orderId: "58731245",
// //         orderStatus: "Pending",
// //         products: [
// //             { id: "1", image: "https://loremflickr.com/200/200/fashion?lock=1", name: "Premium Wireless Headphones", qty: 1 },
// //             { id: "2", image: "https://loremflickr.com/200/200/fashion?lock=2", name: "Women's Silk Saree", qty: 2 },
// //             { id: "3", image: "https://loremflickr.com/200/200/fashion?lock=3", name: "Kurti", qty: 1 },
// //         ],
// //         price: 2627.5,
// //         date: "Today, 04:30 PM",
// //         dateType: "Today",
// //     },
// //     {
// //         orderId: "58731246",
// //         orderStatus: "Delivered",
// //         products: [
// //             { id: "4", image: "https://loremflickr.com/200/200/fashion?lock=4", name: "Cotton Saree", qty: 1 },
// //             { id: "5", image: "https://loremflickr.com/200/200/fashion?lock=5", name: "Handbag", qty: 1 },
// //         ],
// //         price: 1899,
// //         date: "20 Jun 2026",
// //         dateType: "Week",
// //     },
// //     {
// //         orderId: "58731247",
// //         orderStatus: "Cancelled",
// //         products: [
// //             { id: "6", image: "https://loremflickr.com/200/200/fashion?lock=6", name: "Men's Casual Shirt", qty: 2 },
// //             { id: "7", image: "https://loremflickr.com/200/200/fashion?lock=7", name: "Jeans", qty: 1 },
// //             { id: "8", image: "https://loremflickr.com/200/200/fashion?lock=8", name: "Sneakers", qty: 1 },
// //             { id: "9", image: "https://loremflickr.com/200/200/fashion?lock=9", name: "Wallet", qty: 1 },
// //         ],
// //         price: 4299,
// //         date: "18 Jun 2026",
// //         dateType: "Month",
// //     },
// //     {
// //         orderId: "58731248",
// //         orderStatus: "Delivered",
// //         products: [
// //             { id: "10", image: "https://loremflickr.com/200/200/fashion?lock=10", name: "Ethnic Kurta Set", qty: 1 },
// //         ],
// //         price: 1599,
// //         date: "Jan 12, 2026",
// //         dateType: "Year",
// //     },
// // ];

// // const TIME_FILTERS = ['Today', 'Week', 'Month', 'Year'];
// // const STATUS_FILTERS = ['All', 'Pending', 'Delivered', 'Cancelled'];

// // const STATUS_STYLE: Record<string, { bg: string; color: string; icon: string }> = {
// //     Pending:   { bg: '#FEF3C7', color: '#D97706', icon: 'time-outline' },
// //     Delivered: { bg: '#DCFCE7', color: '#16A34A', icon: 'checkmark-circle-outline' },
// //     Cancelled: { bg: '#FEE2E2', color: '#DC2626', icon: 'close-circle-outline' },
// //     All:       { bg: '#EEF2FF', color: '#4F46E5', icon: 'list-outline' },
// // };


// //   //fetchOrderScreen
// //   const fetchOrderScreen = async () =>{

// //     const response = await api.get("/myorders");
// //   }

// // const OrderScreen = () => {
// //     const [activeTime, setActiveTime] = useState('Today');
// //     const [activeStatus, setActiveStatus] = useState('All');

// //     const filteredOrders = useMemo(() => {
// //         return orders.filter(order => {
// //             const matchTime = order.dateType === activeTime;
// //             const matchStatus = activeStatus === 'All' || order.orderStatus === activeStatus;
// //             return matchTime && matchStatus;
// //         });
// //     }, [activeTime, activeStatus]);



// //     return (
// //         <SafeAreaView style={styles.container} edges={['top']}>
// //             {/* Header */}
// //             <View style={styles.header}>
// //                 <View>
// //                     <Text style={styles.headerTitle}>My Orders</Text>
// //                     <Text style={styles.headerSubtitle}>{orders.length} total orders</Text>
// //                 </View>
// //                 <TouchableOpacity style={styles.iconButton}>
// //                     <Ionicons name="search-outline" size={scale(22)} color="#0A0A0A" />
// //                 </TouchableOpacity>
// //             </View>

// //             {/* Filter Bar - Time + Status together */}
// //             <View style={styles.filterBar}>
// //                 {/* Time Filter Pills */}
// //                 <View style={styles.timePillRow}>
// //                     {TIME_FILTERS.map((filter) => (
// //                         <TouchableOpacity
// //                             key={filter}
// //                             style={[styles.timePill, activeTime === filter && styles.timePillActive]}
// //                             onPress={() => setActiveTime(filter)}
// //                             activeOpacity={0.75}
// //                         >
// //                             <Text style={[styles.timePillText, activeTime === filter && styles.timePillTextActive]}>
// //                                 {filter}
// //                             </Text>
// //                         </TouchableOpacity>
// //                     ))}
// //                 </View>

// //                 {/* Status Filter Chips */}
// //                 <ScrollView
// //                     horizontal
// //                     showsHorizontalScrollIndicator={false}
// //                     contentContainerStyle={styles.statusRow}
// //                 >
// //                     {STATUS_FILTERS.map((status) => {
// //                         const sty = STATUS_STYLE[status];
// //                         const isActive = activeStatus === status;
// //                         return (
// //                             <TouchableOpacity
// //                                 key={status}
// //                                 style={[
// //                                     styles.statusChip,
// //                                     {
// //                                         backgroundColor: isActive ? sty.bg : '#F9F9F9',
// //                                         borderColor: isActive ? sty.color : '#EFEFEF',
// //                                     }
// //                                 ]}
// //                                 onPress={() => setActiveStatus(status)}
// //                                 activeOpacity={0.75}
// //                             >
// //                                 <Ionicons
// //                                     name={sty.icon as any}
// //                                     size={scale(13)}
// //                                     color={isActive ? sty.color : '#B0B0B0'}
// //                                 />
// //                                 <Text style={[
// //                                     styles.statusChipText,
// //                                     { color: isActive ? sty.color : '#B0B0B0', fontWeight: (isActive ? '700' : '500') as '700' | '500' }
// //                                 ]}>
// //                                     {status}
// //                                 </Text>
// //                             </TouchableOpacity>
// //                         );
// //                     })}
// //                 </ScrollView>
// //             </View>
// //             <View style={styles.filterDivider} />

// //             {/* Orders List */}
// //             {filteredOrders.length === 0 ? (
// //                 <View style={styles.emptyState}>
// //                     <Ionicons name="receipt-outline" size={scale(60)} color="#D1D5DB" />
// //                     <Text style={styles.emptyTitle}>No orders found</Text>
// //                     <Text style={styles.emptySubtitle}>Try changing your filters</Text>
// //                 </View>
// //             ) : (
// //                 <FlatList
// //                     data={filteredOrders}
// //                     keyExtractor={(item) => item.orderId}
// //                     contentContainerStyle={{ padding: scale(16) }}
// //                     showsVerticalScrollIndicator={false}
// //                     renderItem={({ item }) => (
// //                         <OrderCard
// //                             orderId={item.orderId}
// //                             orderStatus={item.orderStatus}
// //                             products={item.products}
// //                             price={item.price}
// //                             date={item.date}
// //                         />
// //                     )}
// //                 />
// //             )}
// //         </SafeAreaView>
// //     );
// // };

// // export default OrderScreen;

// // const styles = StyleSheet.create({
// //     container: {
// //         flex: 1,
// //         backgroundColor: '#FFFFFF',
// //     },
// //     header: {
// //         flexDirection: 'row',
// //         justifyContent: 'space-between',
// //         alignItems: 'center',
// //         paddingHorizontal: scale(16),
// //         paddingTop: verticalScale(12),
// //         paddingBottom: verticalScale(14),
// //         borderBottomWidth: 1,
// //         borderBottomColor: '#F0F0F0',
// //     },
// //     headerTitle: {
// //         fontSize: scale(22),
// //         fontWeight: '800',
// //         color: '#0A0A0A',
// //     },
// //     headerSubtitle: {
// //         fontSize: scale(12),
// //         color: '#9CA3AF',
// //         fontWeight: '400',
// //         marginTop: verticalScale(2),
// //     },
// //     iconButton: {
// //         width: scale(40),
// //         height: scale(40),
// //         borderRadius: scale(20),
// //         backgroundColor: '#F5F5F5',
// //         justifyContent: 'center',
// //         alignItems: 'center',
// //     },

// //     // Filter Bar
// //     filterBar: {
// //         backgroundColor: '#FFFFFF',
// //         paddingTop: verticalScale(8),
// //         paddingBottom: verticalScale(4),
// //     },
// //     filterDivider: {
// //         height: 1,
// //         backgroundColor: '#F0F0F0',
// //         marginBottom: verticalScale(4),
// //     },


// //     timePillRow: {
// //         flexDirection: 'row',
// //         paddingHorizontal: scale(16),
// //         paddingBottom: verticalScale(6),
// //         gap: scale(8),
// //     },
// //     timePill: {
// //         flex: 1,
// //         paddingVertical: verticalScale(7),
// //         borderRadius: moderateScale(10),
// //         backgroundColor: '#F3F4F6',
// //         alignItems: 'center',
// //     },
// //     timePillActive: {
// //         backgroundColor: '#0A0A0A',
// //     },
// //     timePillText: {
// //         fontSize: scale(12),
// //         fontWeight: '600' as const,
// //         color: '#6B7280',
// //     },
// //     timePillTextActive: {
// //         color: '#FFFFFF',
// //     },

// //     // Status Filter Chips
// //     statusRow: {
// //         paddingHorizontal: scale(16),
// //         paddingBottom: verticalScale(4),
// //         gap: scale(6),
// //         alignItems: 'center',
// //     },
// //     statusChip: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         gap: scale(4),
// //         paddingHorizontal: scale(12),
// //         paddingVertical: verticalScale(6),
// //         borderRadius: moderateScale(20),
// //         borderWidth: 1,
// //         borderColor: 'transparent',
// //     },
// //     statusChipText: {
// //         fontSize: scale(12),
// //         fontWeight: '500' as const,
// //     },

// //     // Empty State
// //     emptyState: {
// //         flex: 1,
// //         justifyContent: 'center',
// //         alignItems: 'center',
// //         paddingBottom: verticalScale(60),
// //     },
// //     emptyTitle: {
// //         fontSize: scale(18),
// //         fontWeight: '700',
// //         color: '#374151',
// //         marginTop: verticalScale(16),
// //     },
// //     emptySubtitle: {
// //         fontSize: scale(13),
// //         color: '#9CA3AF',
// //         marginTop: verticalScale(6),
// //     },
// // });


// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
// import { SafeAreaView } from 'react-native-safe-area-context';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { useNavigation } from '@react-navigation/native';
// import { scale, verticalScale, moderateScale } from '../utils/responsive';
// import OrderCard from '../component/OrderCards';
// import api from '../config/apiConfig';
// import { colors } from '../theme/Colors';

// const IMAGE_BASE_URL = "https://webbitech.in/gama/swizer/"; 

// const TIME_FILTERS = ['Today', 'Week', 'Month', 'Year'];
// const STATUS_FILTERS = ['All', 'Delivered', 'Cancelled'];

// const STATUS_STYLE: Record<string, { bg: string; color: string; icon: string }> = {
//     Pending:   { bg: '#FEF3C7', color: '#D97706', icon: 'time-outline' },
//     Shipped:  { bg: '#FEF3C7', color: '#D97706', icon: 'time-outline' },
//     Delivered: { bg: '#DCFCE7', color: '#16A34A', icon: 'checkmark-circle-outline' },
//     Cancelled: { bg: '#FEE2E2', color: '#DC2626', icon: 'close-circle-outline' },
//     All:       { bg: '#EEF2FF', color: '#4F46E5', icon: 'list-outline' },
// };

// // Capitalize API's lowercase order_status ("pending" -> "Pending")
// const normalizeStatus = (status: string) => {
//     if (!status) return "Pending";
//     const s = status.toLowerCase();
//     if (s === "delivered") return "Delivered";
//     if (s === "cancelled" || s === "canceled") return "Cancelled";
//     return "Pending"; // pending, processing, confirmed, shipped -> bucket as Pending for now
// };

// // Bucket created_at into Today / Week / Month / Year for the pill filter
// const getDateType = (createdAt: string) => {
//     const created = new Date(createdAt);
//     const now = new Date();
//     const diffMs = now.getTime() - created.getTime();
//     const diffDays = diffMs / (1000 * 60 * 60 * 24);

//     const isSameDay = created.toDateString() === now.toDateString();
//     if (isSameDay) return "Today";
//     if (diffDays <= 7) return "Week";
//     if (diffDays <= 30) return "Month";
//     return "Year";
// };

// const formatDisplayDate = (createdAt: string) => {
//     const created = new Date(createdAt);
//     const now = new Date();
//     const isSameDay = created.toDateString() === now.toDateString();
//     if (isSameDay) {
//         return `Today, ${created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
//     }
//     return created.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
// };

// // Map one raw API order -> shape OrderCard/FlatList needs
// const mapOrder = (order: any) => {
//     const products = (order.items || []).map((item: any) => {
//         const thumb = item.product_varient?.thumbnail;
//         return {
//             id: String(item.id),
//             image: thumb ? `${IMAGE_BASE_URL}${thumb}` : "https://loremflickr.com/200/200/fashion",
//             name: item.product_name,
//             qty: Number(item.quantity),
//         };
//     });

//     return {
//         orderId: order.id,                 
//         orderNumber: order.order_number,   
//         orderStatus: normalizeStatus(order.order_status),
//         products,
//         price: Number(order.total),
//         date: formatDisplayDate(order.created_at),
//         dateType: getDateType(order.created_at),
//         raw: order, 
//     };
// };

// const OrderScreen = () => {
//     const navigation = useNavigation<any>();
//     const [activeTime, setActiveTime] = useState('Today');
//     const [activeStatus, setActiveStatus] = useState('All');

//     const [orders, setOrders] = useState<any[]>([]);
//     console.log("OrderScreen responseMyOrders",orders)
//     const [loading, setLoading] = useState(true);
//     const [refreshing, setRefreshing] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     const fetchOrders = useCallback(async () => {
//         try {
//             setError(null);
//             const response = await api.get("/myorders");
//             if (response.data?.status) {
//                 const mapped = (response.data.data || []).map(mapOrder);
//                 setOrders(mapped);
//             } else {
//                 setError(response.data?.message || "Failed to load orders");
//             }
//         } catch (err: any) {
//             setError(err?.message || "Something went wrong while fetching orders");
//         } finally {
//             setLoading(false);
//             setRefreshing(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchOrders();
//     }, [fetchOrders]);

//     const onRefresh = useCallback(() => {
//         setRefreshing(true);
//         fetchOrders();
//     }, [fetchOrders]);

//     const filteredOrders = useMemo(() => {
//         return orders.filter(order => {
//             const matchTime = order.dateType === activeTime;
//             const matchStatus = activeStatus === 'All' || order.orderStatus === activeStatus;
//             return matchTime && matchStatus;
//         });
//     }, [orders, activeTime, activeStatus]);


//     const goToOrderDetails = (order: any) => {
//         navigation.navigate("OrderDetails", {
//             orderId: order.orderId,
//             orderNumber: order.orderNumber,
//             order: order.raw,
//         });
//     };

//     return (
//         <SafeAreaView style={styles.container} edges={['top']}>
//             {/* Header */}
//             <View style={styles.header}>
//                 <View>
//                     <Text style={styles.headerTitle}>My Orders</Text>
//                     <Text style={styles.headerSubtitle}>{orders.length} total orders</Text>
//                 </View>
//                 <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('SearchScreen')}>
//                     <Ionicons name="search-outline" size={scale(22)} color="#0A0A0A" />
//                 </TouchableOpacity>
//             </View>

//             {/* Filter Bar */}
//             <View style={styles.filterBar}>
//                 <View style={styles.timePillRow}>
//                     {TIME_FILTERS.map((filter) => (
//                         <TouchableOpacity
//                             key={filter}
//                             style={[styles.timePill, activeTime === filter && styles.timePillActive]}
//                             onPress={() => setActiveTime(filter)}
//                             activeOpacity={0.75}
//                         >
//                             <Text style={[styles.timePillText, activeTime === filter && styles.timePillTextActive]}>
//                                 {filter}
//                             </Text>
//                         </TouchableOpacity>
//                     ))}
//                 </View>

//                 <ScrollView
//                     horizontal
//                     showsHorizontalScrollIndicator={false}
//                     contentContainerStyle={styles.statusRow}
//                 >
//                     {STATUS_FILTERS.map((status) => {
//                         const sty = STATUS_STYLE[status];
//                         const isActive = activeStatus === status;
//                         return (
//                             <TouchableOpacity
//                                 key={status}
//                                 style={[
//                                     styles.statusChip,
//                                     {
//                                         backgroundColor: isActive ? sty.bg : '#F9F9F9',
//                                         borderColor: isActive ? sty.color : '#EFEFEF',
//                                     }
//                                 ]}
//                                 onPress={() => setActiveStatus(status)}
//                                 activeOpacity={0.75}
//                             >
//                                 <Ionicons
//                                     name={sty.icon as any}
//                                     size={scale(13)}
//                                     color={isActive ? sty.color : '#B0B0B0'}
//                                 />
//                                 <Text style={[
//                                     styles.statusChipText,
//                                     { color: isActive ? sty.color : '#B0B0B0', fontWeight: (isActive ? '700' : '500') as '700' | '500' }
//                                 ]}>
//                                     {status}
//                                 </Text>
//                             </TouchableOpacity>
//                         );
//                     })}
//                 </ScrollView>
//             </View>
//             <View style={styles.filterDivider} />

//             {/* Body */}
//             {loading ? (
//                 <View style={styles.emptyState}>
//                     <ActivityIndicator size="large" color="#4F46E5" />
//                     <Text style={styles.emptySubtitle}>Loading your orders…</Text>
//                 </View>
//             ) : error ? (
//                 <View style={styles.emptyState}>
//                     <Ionicons name="alert-circle-outline" size={scale(60)} color="#EF4444" />
//                     <Text style={styles.emptyTitle}>Couldn't load orders</Text>
//                     <Text style={styles.emptySubtitle}>{error}</Text>
//                     <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
//                         <Text style={styles.retryButtonText}>Retry</Text>
//                     </TouchableOpacity>
//                 </View>
//             ) : filteredOrders.length === 0 ? (
//                 <View style={styles.emptyState}>
//                     <Ionicons name="receipt-outline" size={scale(60)} color="#D1D5DB" />
//                     <Text style={styles.emptyTitle}>No orders found</Text>
//                     <Text style={styles.emptySubtitle}>Try changing your filters</Text>
//                 </View>
//             ) : (
//                 <FlatList
//                     data={filteredOrders}
//                     keyExtractor={(item) => String(item.orderId)}
//                     contentContainerStyle={{ padding: scale(16) }}
//                     showsVerticalScrollIndicator={false}
//                     refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//                     renderItem={({ item }) => (
//                         <OrderCard
//                             orderId={item.orderNumber}
//                             orderStatus={item.orderStatus}
//                             paymentStatus={item.paymentStatus}
//                             products={item.products}
//                             price={item.price}
//                             // image={item.thumbnail}
//                             date={item.date}
//                             onPress={() => goToOrderDetails(item)}
//                         />
//                     )}
//                 />
//             )}
//         </SafeAreaView>
//     );
// };

// export default OrderScreen;

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#FFFFFF' },
//     header: {
//         flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
//         paddingHorizontal: scale(16), paddingTop: verticalScale(12), paddingBottom: verticalScale(14),
//         borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
//     },
//     headerTitle: { fontSize: moderateScale(18), fontWeight: '900', color: '#0A0A0A' },
//     headerSubtitle: { fontSize: scale(12), color: '#9CA3AF', fontWeight: '400', marginTop: verticalScale(2) },
//     iconButton: {
//         width: scale(40), height: scale(40), borderRadius: scale(20),
//         backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center',
//     },
//     filterBar: { backgroundColor: '#FFFFFF', paddingTop: verticalScale(8), paddingBottom: verticalScale(4) },
//     filterDivider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: verticalScale(4) },
//     timePillRow: { flexDirection: 'row', paddingHorizontal: scale(16), paddingBottom: verticalScale(6), gap: scale(8) },
//     timePill: { flex: 1, paddingVertical: verticalScale(7), borderRadius: moderateScale(10), backgroundColor: '#F3F4F6', alignItems: 'center' },
//     timePillActive: { backgroundColor: '#0A0A0A' },
//     timePillText: { fontSize: scale(12), fontWeight: '600' as const, color: '#6B7280' },
//     timePillTextActive: { color: '#FFFFFF' },
//     statusRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: scale(16), paddingBottom: verticalScale(8), gap: scale(8) },
//     statusChip: {
//         flex: 1,
//         flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: scale(4),
//         paddingVertical: verticalScale(8),
//         borderRadius: moderateScale(10), borderWidth: 1, borderColor: 'transparent',
//     },
//     statusChipText: { fontSize: scale(12), fontWeight: '500' as const },
//     emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: verticalScale(60), paddingHorizontal: scale(24) },
//     emptyTitle: { fontSize: scale(18), fontWeight: '700', color: '#374151', marginTop: verticalScale(16) },
//     emptySubtitle: { fontSize: scale(13), color: '#9CA3AF', marginTop: verticalScale(6), textAlign: 'center' },
//     retryButton: { marginTop: verticalScale(16), backgroundColor: colors.accent, paddingHorizontal: scale(20), paddingVertical: verticalScale(10), borderRadius: moderateScale(10) },
//     retryButtonText: { color: '#FFF', fontWeight: '700', fontSize: scale(13) },
// });

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, RefreshControl, Modal } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import OrderCard from '../component/OrderCards';
import api from '../config/apiConfig';
import { colors } from '../theme/Colors';
import { useAppSelector } from '../store/hooks';

const IMAGE_BASE_URL = "https://webbitech.in/gama/swizer/";

const TIME_FILTERS = ['Today', 'Week', 'Month', 'Year'];
const STATUS_FILTERS = ['All', 'Delivered', 'Cancelled'];

const STATUS_STYLE: Record<string, { bg: string; color: string; icon: string }> = {
    Pending: { bg: '#FEF3C7', color: '#D97706', icon: 'time-outline' },
    Confirmed: { bg: '#DBEAFE', color: '#2563EB', icon: 'checkmark-circle' },
    Processing: { bg: '#E0F2FE', color: '#0284C7', icon: 'sync-outline' },
    Shipped: { bg: '#EDE9FE', color: '#7C3AED', icon: 'cube-outline' },
    Delivered: { bg: '#DCFCE7', color: '#16A34A', icon: 'checkmark-circle-outline' },
    Cancelled: { bg: '#FEE2E2', color: '#DC2626', icon: 'close-circle-outline' },
    All: { bg: '#EEF2FF', color: '#4F46E5', icon: 'list-outline' },
};

// Capitalize / bucket the API's raw order_status ("pending" -> "Pending", "shipped" -> "Shipped", etc.)
// BUG FIX: previously every non-delivered/cancelled status (including "shipped", "processing",
// "confirmed") fell through to "Pending", which is why every order was showing as Pending.
const normalizeStatus = (status: string) => {
    if (!status) return "Pending";
    return status.charAt(0).toUpperCase() + status.slice(1);
};

// Bucket created_at into Today / Week / Month / Year for the pill filter
const getDateType = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    const isSameDay = created.toDateString() === now.toDateString();
    if (isSameDay) return "Today";
    if (diffDays <= 7) return "Week";
    if (diffDays <= 30) return "Month";
    return "Year";
};

const formatDisplayDate = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const isSameDay = created.toDateString() === now.toDateString();
    if (isSameDay) {
        return `Today, ${created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return created.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Map one raw API order -> shape OrderCard/FlatList needs
const mapOrder = (order: any) => {
    const products = (order.items || []).map((item: any) => {
        const thumb = item.product_varient?.thumbnail;
        return {
            id: String(item.id),
            image: thumb ? `${IMAGE_BASE_URL}${thumb}` : "https://loremflickr.com/200/200/fashion",
            name: item.product_name,
            qty: Number(item.quantity),
        };
    });

    const mappedStatus = normalizeStatus(order.order_status);

    // Debug log: compare what the API sent vs what we mapped it to.
    console.log(
        `[OrderScreen] order #${order.id} (${order.order_number}) -> raw order_status: "${order.order_status}", mapped: "${mappedStatus}"`
    );

    return {
        orderId: order.id,
        orderNumber: order.order_number,
        orderStatus: mappedStatus,
        paymentStatus: order.payment_status || 'Pending',
        products,
        price: Number(order.total),
        date: formatDisplayDate(order.created_at),
        dateType: getDateType(order.created_at),
        raw: order,
    };
};

const OrderScreen = () => {
    const navigation = useNavigation<any>();
    const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn);
    const wishlistItems = useAppSelector(state => state.wishlist.items);
    const [activeTime, setActiveTime] = useState('Today');
    const [activeStatus, setActiveStatus] = useState('All');
    const [staffModalVisible, setStaffModalVisible] = useState(false);

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        if (!isLoggedIn) return;
        try {
            setError(null);

            const now = new Date();
            const end_date = now.toISOString().split('T')[0];
            let start_date = end_date;

            if (activeTime === 'Week') {
                const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                start_date = past.toISOString().split('T')[0];
            } else if (activeTime === 'Month') {
                const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                start_date = past.toISOString().split('T')[0];
            } else if (activeTime === 'Year') {
                const past = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                start_date = past.toISOString().split('T')[0];
            }

            const endpointUrl = `/myorders?start_date=${start_date}&end_date=${end_date}`;
            console.log("[OrderScreen] Fetching from API:", endpointUrl);
            const response = await api.get(endpointUrl);
            console.log("[OrderScreen] /myorders raw response:", JSON.stringify(response.data));
            if (response.data?.status) {
                const mapped = (response.data.data || []).map(mapOrder);
                console.log("[OrderScreen] mapped orders:", mapped.map((o: any) => ({ id: o.orderId, status: o.orderStatus })));
                setOrders(mapped);
            } else {
                setError(response.data?.message || "Failed to load orders");
            }
        } catch (err: any) {
            setError(err?.message || "Something went wrong while fetching orders");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTime]);

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [fetchOrders])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchOrders();
    }, [fetchOrders]);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchStatus = activeStatus === 'All' || order.orderStatus === activeStatus;
            return matchStatus;
        });
    }, [orders, activeStatus]);

    const orderCounts = useMemo(() => {
        const counts: Record<string, number> = { All: orders.length, Delivered: 0, Cancelled: 0 };
        orders.forEach(order => {
            if (order.orderStatus === 'Delivered') counts.Delivered++;
            if (order.orderStatus === 'Cancelled') counts.Cancelled++;
        });
        return counts;
    }, [orders]);
























    const goToOrderDetails = (order: any) => {
        navigation.navigate("OrderDetails", {
            orderId: order.orderId,
            orderNumber: order.orderNumber,
            order: order.raw,
        });
    };

    // Not logged in state — show login prompt
    if (!isLoggedIn) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerTitle}>My Orders</Text>
                        <Text style={styles.headerSubtitle}>Track all your purchases</Text>
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.headerIcon}
                        onPress={() => navigation.navigate('Wishlist')}
                    >
                        <Ionicons name="heart-outline" size={scale(20)} color="#1A1A1A" />
                        {wishlistItems.length > 0 && <View style={styles.notificationDot} />}
                    </TouchableOpacity>
                </View>
                <View style={styles.emptyState}>
                    <View style={styles.guestIconWrap}>
                        <Ionicons name="bag-handle-outline" size={scale(52)} color="#0A0A0A" />
                    </View>
                    <Text style={styles.guestTitle}>Place your first order!</Text>
                    <Text style={styles.guestSubtitle}>
                        Login to view your order history, track deliveries, and more.
                    </Text>
                    <TouchableOpacity
                        style={styles.loginBtn}
                        onPress={() => navigation.navigate('Login')}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="log-in-outline" size={scale(18)} color="#FFF" style={{ marginRight: scale(8) }} />
                        <Text style={styles.loginBtnText}>Login / Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>My Orders</Text>
                    <Text style={styles.headerSubtitle}>{orders.length} total orders</Text>
                </View>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.headerIcon}
                    onPress={() => navigation.navigate('Wishlist')}
                >
                    <Ionicons name="heart-outline" size={scale(20)} color="#1A1A1A" />
                    {wishlistItems.length > 0 && <View style={styles.notificationDot} />}
                </TouchableOpacity>
            </View>

            {/* Filter Bar */}
            <View style={styles.filterBar}>
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

                <View style={styles.statusRow}>
                    {STATUS_FILTERS.map((status) => {
                        const sty = STATUS_STYLE[status] || STATUS_STYLE.All;
                        const isActive = activeStatus === status;
                        const count = orderCounts[status] || 0;
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
                                    {status} ({count})
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
            <View style={styles.filterDivider} />

            {/* Body */}
            {loading ? (
                <View style={styles.emptyState}>
                    <ActivityIndicator size="large" color="#0A0A0A" />
                    <Text style={styles.emptySubtitle}>Loading your orders…</Text>
                </View>
            ) : error ? (
                <View style={styles.emptyState}>
                    <Ionicons name="alert-circle-outline" size={scale(60)} color="#EF4444" />
                    <Text style={styles.emptyTitle}>Couldn't load orders</Text>
                    <Text style={styles.emptySubtitle}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : filteredOrders.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.guestIconWrap}>
                        <Ionicons name="receipt-outline" size={scale(52)} color="#0A0A0A" />
                    </View>
                    <Text style={styles.guestTitle}>No orders yet</Text>
                    <Text style={styles.guestSubtitle}>Shop from our collection and your orders will appear here.</Text>
                    <TouchableOpacity
                        style={styles.loginBtn}
                        onPress={() => navigation.navigate('HomeTab')}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="storefront-outline" size={scale(18)} color="#FFF" style={{ marginRight: scale(8) }} />
                        <Text style={styles.loginBtnText}>Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filteredOrders}
                    keyExtractor={(item) => String(item.orderId)}
                    contentContainerStyle={{ padding: scale(16) }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    renderItem={({ item }) => (
                        <OrderCard
                            orderId={item.orderNumber}
                            orderStatus={item.orderStatus}
                            products={item.products}
                            price={item.price}
                            date={item.date}
                            onPress={() => goToOrderDetails(item)}
                            onAssignStaff={() => setStaffModalVisible(true)}
                        />
                    )}
                />
            )}

            <Modal visible={staffModalVisible} transparent animationType="slide" onRequestClose={() => setStaffModalVisible(false)}>
                <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setStaffModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Select Staff</Text>
                        <ScrollView>
                            {['Ramesh', 'Suresh', 'Karthik', 'Vijay'].map((staff, idx) => (
                                <TouchableOpacity key={idx} style={styles.staffItem} onPress={() => setStaffModalVisible(false)}>
                                    <Ionicons name="person-circle-outline" size={scale(24)} color="#4B5563" />
                                    <Text style={styles.staffName}>{staff}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setStaffModalVisible(false)}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

export default OrderScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(14),
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
    },
    headerTitle: { fontSize: moderateScale(18), fontWeight: '900', color: '#0A0A0A' },
    headerSubtitle: { fontSize: moderateScale(13), fontWeight: '600', color: '#0A0A0A', marginTop: verticalScale(2) },
    headerIcon: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    notificationDot: {
        position: 'absolute',
        top: scale(11),
        right: scale(11),
        width: scale(7),
        height: scale(7),
        borderRadius: scale(3.5),
        backgroundColor: '#FF3B30',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    iconButton: {
        width: scale(40), height: scale(40), borderRadius: scale(20),
        backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center',
    },
    filterBar: { backgroundColor: '#FFFFFF', paddingTop: verticalScale(8), paddingBottom: verticalScale(4) },
    filterDivider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: verticalScale(4) },
    timePillRow: { flexDirection: 'row', paddingHorizontal: scale(16), paddingBottom: verticalScale(6), gap: scale(8) },
    timePill: { flex: 1, paddingVertical: verticalScale(7), borderRadius: moderateScale(10), backgroundColor: '#F3F4F6', alignItems: 'center' },
    timePillActive: { backgroundColor: '#0A0A0A' },
    timePillText: { fontSize: scale(12), fontWeight: '600' as const, color: '#6B7280' },
    timePillTextActive: { color: '#FFFFFF' },
    statusRow: { flexDirection: 'row', backgroundColor: '#F3F4F6', padding: scale(4), borderRadius: moderateScale(10), marginHorizontal: scale(16), marginBottom: verticalScale(12) },
    statusChip: {
        flex: 1,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: scale(4),
        paddingVertical: verticalScale(8),
        borderRadius: moderateScale(8), borderWidth: 0, borderColor: 'transparent',
    },
    statusChipText: { fontSize: scale(12), fontWeight: '500' as const },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: verticalScale(60), paddingHorizontal: scale(24) },
    emptyTitle: { fontSize: scale(18), fontWeight: '700', color: '#374151', marginTop: verticalScale(16) },
    emptySubtitle: { fontSize: scale(13), color: '#9CA3AF', marginTop: verticalScale(6), textAlign: 'center' },
    retryButton: { marginTop: verticalScale(16), backgroundColor: colors.accent, paddingHorizontal: scale(20), paddingVertical: verticalScale(10), borderRadius: moderateScale(10) },
    retryButtonText: { color: '#FFF', fontWeight: '700', fontSize: scale(13) },
    // Guest / login prompt styles
    guestIconWrap: { width: scale(100), height: scale(100), borderRadius: scale(50), backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(20) },
    guestTitle: { fontSize: moderateScale(22), fontWeight: '800', color: '#0A0A0A', textAlign: 'center', marginBottom: verticalScale(8) },
    guestSubtitle: { fontSize: moderateScale(14), color: '#6B7280', textAlign: 'center', lineHeight: moderateScale(22), marginBottom: verticalScale(28), paddingHorizontal: scale(8) },
    loginBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0A0A', borderRadius: moderateScale(12), paddingHorizontal: scale(28), paddingVertical: verticalScale(14) },
    loginBtnText: { color: '#FFF', fontWeight: '800', fontSize: moderateScale(15) },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: '#FFF', borderTopLeftRadius: moderateScale(16), borderTopRightRadius: moderateScale(16), padding: scale(16), maxHeight: verticalScale(350) },
    modalTitle: { fontSize: moderateScale(18), fontWeight: '800', color: '#000', marginBottom: verticalScale(12), textAlign: 'center' },
    staffItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(12), borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    staffName: { fontSize: moderateScale(16), color: '#374151', marginLeft: scale(12) },
    cancelBtn: { marginTop: verticalScale(16), backgroundColor: '#F3F4F6', paddingVertical: verticalScale(12), borderRadius: moderateScale(8), alignItems: 'center' },
    cancelBtnText: { color: '#000', fontWeight: '600', fontSize: moderateScale(14) },
});
