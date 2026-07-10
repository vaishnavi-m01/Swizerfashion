import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { moderateScale, scale, verticalScale } from '../utils/responsive';
import { colors } from '../theme/Colors';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { clearAuthState } from '../utils/storage';
import api from '../config/apiConfig';

interface UserProfile {
    id: number;
    name: string;
    username: string | null;
    role: string;
    is_active: boolean;
    email: string;
    avatar: string | null;
    phone: string;
}

const menuOptions = [
    { icon: 'location-outline', label: 'Manage Shipping Address', action: 'DeliveryAddress' },
    { icon: 'card-outline', label: 'Payment Methods', action: 'payments' },
    { icon: 'notifications-outline', label: 'Notification Preferences', action: 'notifications' },
    { icon: 'help-circle-outline', label: 'Support & Help Center', action: 'help' },
    { icon: 'shield-checkmark-outline', label: 'Privacy & Security', action: 'privacy' },
    { icon: 'lock-open-outline', label: 'Forgot Password', action: 'ForgotPassword' } // Fixed entry syntax
];

const ProfileScreen = () => {
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState(false);

    const navigation = useNavigation<any>();
    const dispatch = useAppDispatch();

    const membershipLevel = 'Platinum Member';
    const orders = ['order1', 'order2', 'order3'];
    const cartItems = useAppSelector(state => state.cart.cartCount);
    const loyaltyPoints = 350;

    // Fetch dynamic profile data from your API
    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/profile');
            if (response.data && response.data.status) {
                setUserData(response.data.data);
                if (response.data.data.avatar) {
                    setProfileImage(response.data.data.avatar);
                }
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            Alert.alert("Error", "Failed to load profile details.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProfile().finally(() => setRefreshing(false));
    }, []);

    // Get fallback letters from dynamic name (e.g., "Vaishu" -> "V")
    const getNameInitials = (name: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const handleMenuPress = (action: string) => {
        if (action === 'DeliveryAddress') {
            navigation.navigate('DeliveryAddress');
        } else if (action === 'ForgotPassword') {
            navigation.navigate('ForgotPassword');     
        } 
        else if (action === 'notifications') {
            navigation.navigate('NotificationPreferencesScreen');            
        }
        else if (action === "payments") {
            navigation.navigate("PaymentMethodsScreen")
        }
        else if (action === "help") {
            navigation.navigate("SupportHelpScreen")
        }
        else if (action === "privacy") {
            navigation.navigate("PrivacySecurityScreen")
        }
        else {
            Alert.alert('Coming Soon');
        }
    };

    const openCamera = () => {
        launchCamera(
            { mediaType: 'photo', quality: 0.8, saveToPhotos: true },
            response => {
                if (response.didCancel) return;
                if (response.assets?.length) {
                    setProfileImage(response.assets[0].uri || null);
                }
            }
        );
    };

    const openGallery = () => {
        launchImageLibrary(
            { mediaType: 'photo', quality: 0.8 },
            response => {
                if (response.didCancel) return;
                if (response.assets?.length) {
                    setProfileImage(response.assets[0].uri || null);
                }
            }
        );
    };

    const showImagePicker = () => {
        Alert.alert(
            'Select Image',
            'Choose an option',
            [
                { text: 'Camera', onPress: openCamera },
                { text: 'Gallery', onPress: openGallery },
                { text: 'Cancel', style: 'cancel' },
            ],
        );
    };

    const handleLogout = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        dispatch(logout());
                        await clearAuthState();
                        navigation.navigate('Login');
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={colors.accentDark || '#4A154B'} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header Container */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="notifications-outline" size={scale(22)} color="#0A0A0A" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="settings-outline" size={scale(22)} color="#0A0A0A" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#0A0A0A']}
                        tintColor="#0A0A0A"
                    />
                }
            >
                {/* Dynamic User Profile Summary Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarLetters}>
                                    {userData ? getNameInitials(userData.name) : 'MS'}
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity style={styles.editBadge} onPress={showImagePicker}>
                            <Ionicons name="camera" size={moderateScale(12)} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    
                    {/* DYNAMIC API TEXT NODES */}
                    <Text style={styles.userName}>{userData?.name || 'Guest User'}</Text>
                    <Text style={styles.userEmail}>{userData?.email || 'N/A'}</Text>

                    {/* Dynamic Membership Badge Row */}
                    <View style={[
                        styles.membershipBadge,
                        membershipLevel === 'Platinum Member' ? styles.platinumBadge : styles.goldBadge
                    ]}>
                        <Ionicons
                            name="sparkles"
                            size={moderateScale(12)}
                            color={membershipLevel === 'Platinum Member' ? colors.text : colors.accentDark}
                            style={{ marginRight: scale(4) }}
                        />
                        <Text style={[
                            styles.membershipText,
                            membershipLevel === 'Platinum Member' ? styles.platinumText : styles.goldText
                        ]}>
                            {membershipLevel}
                        </Text>
                    </View>
                </View>

                {/* Statistics Container Segment */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>{orders.length}</Text>
                        <Text style={styles.statLabel}>Orders</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>{cartItems || 0}</Text>
                        <Text style={styles.statLabel}>In Cart</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>{loyaltyPoints}</Text>
                        <Text style={styles.statLabel}>Points</Text>
                    </View>
                </View>

                {/* Menu Options Group List */}
                <View style={styles.menuContainer}>
                    {menuOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            onPress={() => handleMenuPress(option.action)}
                        >
                            <View style={styles.menuLeft}>
                                <View style={styles.iconWrapper}>
                                    <Ionicons name={option.icon} size={moderateScale(20)} color={colors.accentDark || '#4A154B'} />
                                </View>
                                <Text style={styles.menuLabel}>{option.label}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={moderateScale(16)} color={colors.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Sign Out Control Trigger */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={moderateScale(20)} color={colors.badge} style={{ marginRight: scale(8) }} />
                    <Text style={styles.logoutBtnText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: scale(24),
        fontWeight: '800',
        color: '#0A0A0A',
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
    },
    iconButton: {
        padding: scale(4),
    },
    scrollContent: {
        paddingBottom: verticalScale(32),
    },
    profileCard: {
        backgroundColor: '#ffffff',
        alignItems: 'center',
        paddingVertical: verticalScale(24),
        borderBottomWidth: 1,
        borderBottomColor: colors.border || '#F0F0F0',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: verticalScale(12),
    },
    avatarPlaceholder: {
        width: moderateScale(80),
        height: moderateScale(80),
        borderRadius: moderateScale(40),
        backgroundColor: '#eedcfc',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#ffffff',
    },
    avatarLetters: {
        fontSize: moderateScale(28),
        fontWeight: '900',
        color: '#4A154B'
    },
    avatarImage: {
        width: moderateScale(80),
        height: moderateScale(80),
        borderRadius: moderateScale(40),
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.accentDark || '#4A154B',
        width: moderateScale(24),
        height: moderateScale(24),
        borderRadius: moderateScale(12),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#ffffff',
    },
    userName: {
        fontSize: moderateScale(18),
        fontWeight: '800',
        color: colors.text || '#000',
    },
    userEmail: {
        fontSize: moderateScale(13),
        color: colors.textSecondary || '#666',
        marginTop: verticalScale(2),
        fontWeight: '500',
    },
    membershipBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(5),
        borderRadius: moderateScale(12),
        marginTop: verticalScale(12),
    },
    goldBadge: {
        backgroundColor: 'rgba(255, 213, 79, 0.15)',
    },
    platinumBadge: {
        backgroundColor: '#f1f3f5',
        borderWidth: 1,
        borderColor: colors.border || '#F0F0F0',
    },
    membershipText: {
        fontSize: moderateScale(11),
        fontWeight: '700',
    },
    goldText: {
        color: colors.accentDark || '#4A154B',
    },
    platinumText: {
        color: colors.text || '#000',
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        marginVertical: verticalScale(14),
        paddingVertical: verticalScale(16),
        borderWidth: 1,
        borderColor: colors.border || '#F0F0F0',
        borderRadius: moderateScale(12),
        marginHorizontal: scale(16),
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statVal: {
        fontSize: moderateScale(18),
        fontWeight: '900',
        color: colors.text || '#000',
    },
    statLabel: {
        fontSize: moderateScale(11),
        color: colors.textSecondary || '#666',
        fontWeight: '600',
        marginTop: verticalScale(4),
    },
    statDivider: {
        width: 1,
        height: verticalScale(30),
        backgroundColor: colors.border || '#F0F0F0',
    },
    menuContainer: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border || '#F0F0F0',
        paddingHorizontal: scale(16),
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(14),
        borderBottomWidth: 1,
        borderBottomColor: colors.border || '#F0F0F0',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        width: moderateScale(32),
        height: moderateScale(32),
        borderRadius: moderateScale(8),
        backgroundColor: '#fff3e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    menuLabel: {
        fontSize: moderateScale(13.5),
        fontWeight: '600',
        color: colors.text || '#000',
    },
    logoutBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        marginTop: verticalScale(20),
        marginHorizontal: scale(16),
        height: verticalScale(48),
        borderRadius: moderateScale(12),
        borderWidth: 1.5,
        borderColor: colors.badge || '#ef4444',
    },
    logoutBtnText: {
        color: colors.badge || '#ef4444',
        fontSize: moderateScale(14.5),
        fontWeight: '800',
    },
});