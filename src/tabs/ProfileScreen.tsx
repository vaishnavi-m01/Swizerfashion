import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Animated,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { moderateScale, scale, verticalScale } from '../utils/responsive';
import { colors } from '../theme/Colors';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { clearAuthState } from '../utils/storage';
import api from '../config/apiConfig';

const LOGO = require('../asset/images/logo.png');

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
    { icon: 'call-outline', label: 'Contact Us', action: 'contact' },
    { icon: 'refresh-outline', label: 'Return & Exchange Policy', action: 'returnPolicy' },
    { icon: 'shield-checkmark-outline', label: 'Privacy Policy', action: 'privacyPolicy' },
    { icon: 'document-text-outline', label: 'Terms & Conditions', action: 'terms' },
    { icon: 'lock-open-outline', label: 'Forgot Password', action: 'ForgotPassword' },
];

const COMPANY_INFO = [
    { icon: 'mail-outline', label: 'info@webbitech.com' },
    { icon: 'call-outline', label: '97892329293' },
    {
        icon: 'location-outline',
        label: '13/1b, Brooke Bond Layout, Krishnasamy Mudaliar Road, Coimbatore, Tamil Nadu, India - 625518641002',
    },
];

const ProfileScreen = () => {
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState(false);
    const [ordersCount, setOrdersCount] = useState<number>(0);
    const [pickerVisible, setPickerVisible] = useState(false);

    const slideAnim = useRef(new Animated.Value(200)).current;

    const navigation = useNavigation<any>();
    const dispatch = useAppDispatch();
    const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn);
    const cartItems = useAppSelector(state => state.cart.cartCount);
    const loyaltyPoints = 0;

    const fetchProfile = async () => {
        if (!isLoggedIn) return;
        try {
            setIsLoading(true);
            const response = await api.get('/profile');
            if (response.data && response.data.status) {
                setUserData(response.data.data);
                if (response.data.data.avatar) {
                    setProfileImage(response.data.data.avatar);
                }
            }
            const now = new Date();
            const end_date = now.toISOString().split('T')[0];
            const past = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            const start_date = past.toISOString().split('T')[0];
            const ordersResponse = await api.get(`/myorders?start_date=${start_date}&end_date=${end_date}`);
            if (ordersResponse.data && ordersResponse.data.status) {
                setOrdersCount(ordersResponse.data.data?.length || 0);
            }
        } catch (error) {
            console.error('Error fetching profile or orders:', error);
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

    const getNameInitials = (name: string) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const handleMenuPress = (action: string) => {
        if (action === 'DeliveryAddress') navigation.navigate('DeliveryAddress');
        else if (action === 'ForgotPassword') navigation.navigate('ForgotPassword');
        else if (action === 'notifications') navigation.navigate('NotificationPreferencesScreen');
        else if (action === 'payments') navigation.navigate('PaymentMethodsScreen');
        else if (action === 'contact') navigation.navigate('ContactUsScreen');
        else if (action === 'returnPolicy') navigation.navigate('ReturnPolicyScreen');
        else if (action === 'privacyPolicy') navigation.navigate('PrivacyPolicyScreen');
        else if (action === 'terms') navigation.navigate('TermsConditionsScreen');
        else Alert.alert('Coming Soon');
    };

    const openPicker = () => {
        setPickerVisible(true);
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 280,
            useNativeDriver: true,
        }).start();
    };

    const closePicker = (cb?: () => void) => {
        Animated.timing(slideAnim, {
            toValue: 300,
            duration: 220,
            useNativeDriver: true,
        }).start(() => {
            setPickerVisible(false);
            cb && cb();
        });
    };

    const openCamera = () => {
        closePicker(() => {
            launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: true }, response => {
                if (response.didCancel) return;
                if (response.assets?.length) {
                    setProfileImage(response.assets[0].uri || null);
                }
            });
        });
    };

    const openGallery = () => {
        closePicker(() => {
            launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, response => {
                if (response.didCancel) return;
                if (response.assets?.length) {
                    setProfileImage(response.assets[0].uri || null);
                }
            });
        });
    };

    const handleLogout = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
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
        ]);
    };

    if (!isLoggedIn) {
        return (
            <SafeAreaView style={[styles.container, styles.center]} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>
                <View style={styles.guestContainer}>
                    <View style={styles.guestIconWrap}>
                        <Ionicons name="person-circle-outline" size={scale(72)} color="#0A0A0A" />
                    </View>
                    <Text style={styles.guestTitle}>Welcome to SwizerFashion</Text>
                    <Text style={styles.guestSubtitle}>
                        Login to manage your profile, track orders, manage addresses and much more.
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

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={'#0A0A0A'} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity
                    style={styles.editIconBtn}
                    onPress={() => navigation.navigate('EditProfileScreen', { userData })}
                >
                    <MaterialIcons name="edit" color="#0A0A0A" size={moderateScale(20)} />
                </TouchableOpacity>
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
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <TouchableOpacity activeOpacity={0.85} onPress={openPicker} style={styles.avatarContainer}>
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
                            </View>
                        )}
                        <View style={styles.cameraOverlay}>
                            <Ionicons name="camera" size={moderateScale(13)} color="#fff" />
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.userName}>Webbitech</Text>
                    <Text style={styles.userEmail}>info@webbitech.com</Text>
                    <Text style={styles.userEmail}>97892329293</Text>
                    <Text style={[styles.userEmail, { textAlign: 'center', marginTop: 4, paddingHorizontal: 20 }]}>
                        13/1b, Brooke Bond Layout, Krishnasamy Mudaliar Road, Coimbatore, Tamil Nadu, India - 625518641002
                    </Text>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>{ordersCount}</Text>
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

                {/* Webbitech Company Info Card */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Webbitech</Text>
                    {COMPANY_INFO.map((info, idx) => (
                        <View key={idx} style={[styles.infoRow, idx < COMPANY_INFO.length - 1 && styles.infoRowBorder]}>
                            <View style={styles.infoIconWrap}>
                                <Ionicons name={info.icon as any} size={moderateScale(16)} color="#4A154B" />
                            </View>
                            <Text style={styles.infoText}>{info.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Menu Options */}
                <View style={styles.menuContainer}>
                    {menuOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.menuItem, index === menuOptions.length - 1 && styles.menuItemLast]}
                            onPress={() => handleMenuPress(option.action)}
                        >
                            <View style={styles.menuLeft}>
                                <View style={styles.iconWrapper}>
                                    <Ionicons name={option.icon as any} size={moderateScale(18)} color="#4A154B" />
                                </View>
                                <Text style={styles.menuLabel}>{option.label}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={moderateScale(16)} color="#C0C0C0" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Sign Out */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={moderateScale(18)} color="#EF4444" style={{ marginRight: scale(8) }} />
                    <Text style={styles.logoutBtnText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Image Picker Bottom Sheet */}
            <Modal transparent visible={pickerVisible} animationType="none" onRequestClose={() => closePicker()}>
                <Pressable style={styles.pickerBackdrop} onPress={() => closePicker()} />
                <Animated.View style={[styles.pickerSheet, { transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.pickerHandle} />
                    <Text style={styles.pickerTitle}>Choose Photo</Text>

                    <TouchableOpacity style={styles.pickerOption} onPress={openCamera} activeOpacity={0.7}>
                        <View style={styles.pickerIconWrap}>
                            <Ionicons name="camera-outline" size={moderateScale(22)} color="#4A154B" />
                        </View>
                        <Text style={styles.pickerOptionText}>Take Photo</Text>
                        <Ionicons name="chevron-forward" size={moderateScale(16)} color="#C0C0C0" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.pickerOption} onPress={openGallery} activeOpacity={0.7}>
                        <View style={styles.pickerIconWrap}>
                            <Ionicons name="image-outline" size={moderateScale(22)} color="#4A154B" />
                        </View>
                        <Text style={styles.pickerOptionText}>Choose from Gallery</Text>
                        <Ionicons name="chevron-forward" size={moderateScale(16)} color="#C0C0C0" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.pickerCancelBtn} onPress={() => closePicker()}>
                        <Text style={styles.pickerCancelText}>Cancel</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Modal>
        </SafeAreaView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8FA' },
    center: { justifyContent: 'center', alignItems: 'center' },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(14),
        backgroundColor: '#FFFFFF',
    },
    headerTitle: { fontSize: moderateScale(18), fontWeight: '900', color: '#0A0A0A' },
    editIconBtn: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(18),
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },

    scrollContent: { paddingBottom: verticalScale(40) },

    // Profile Card
    profileCard: {
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        paddingTop: verticalScale(28),
        paddingBottom: verticalScale(20),
        marginBottom: verticalScale(12),
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: verticalScale(12),
    },
    avatarPlaceholder: {
        width: moderateScale(90),
        height: moderateScale(90),
        borderRadius: moderateScale(45),
        backgroundColor: '#F3EEF8',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E8DFF5',
    },
    logoImage: {
        width: moderateScale(60),
        height: moderateScale(60),
    },
    avatarImage: {
        width: moderateScale(90),
        height: moderateScale(90),
        borderRadius: moderateScale(45),
        borderWidth: 2,
        borderColor: '#E8DFF5',
    },
    cameraOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#4A154B',
        width: moderateScale(26),
        height: moderateScale(26),
        borderRadius: moderateScale(13),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    userName: {
        fontSize: moderateScale(18),
        fontWeight: '800',
        color: '#0A0A0A',
    },
    userEmail: {
        fontSize: moderateScale(13),
        color: '#6B7280',
        marginTop: verticalScale(2),
        fontWeight: '500',
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        marginHorizontal: scale(16),
        marginBottom: verticalScale(12),
        borderRadius: moderateScale(12),
        paddingVertical: verticalScale(16),
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statBox: { alignItems: 'center', flex: 1 },
    statVal: { fontSize: moderateScale(18), fontWeight: '900', color: '#0A0A0A' },
    statLabel: { fontSize: moderateScale(11), color: '#6B7280', fontWeight: '600', marginTop: verticalScale(4) },
    statDivider: { width: 1, height: verticalScale(30), backgroundColor: '#F0F0F0' },

    // Company Info Card
    sectionCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: scale(16),
        marginBottom: verticalScale(12),
        borderRadius: moderateScale(12),
        paddingHorizontal: scale(16),
        paddingTop: verticalScale(14),
        paddingBottom: verticalScale(6),
    },
    sectionTitle: {
        fontSize: moderateScale(13),
        fontWeight: '800',
        color: '#4A154B',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: verticalScale(10),
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: verticalScale(10),
    },
    infoRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    infoIconWrap: {
        width: moderateScale(30),
        height: moderateScale(30),
        borderRadius: moderateScale(8),
        backgroundColor: '#F3EEF8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
        marginTop: verticalScale(1),
    },
    infoText: {
        flex: 1,
        fontSize: moderateScale(13),
        color: '#374151',
        fontWeight: '500',
        lineHeight: moderateScale(20),
    },

    // Menu
    menuContainer: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: scale(16),
        marginBottom: verticalScale(12),
        borderRadius: moderateScale(12),
        paddingHorizontal: scale(16),
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(13),
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    menuItemLast: { borderBottomWidth: 0 },
    menuLeft: { flexDirection: 'row', alignItems: 'center' },
    iconWrapper: {
        width: moderateScale(32),
        height: moderateScale(32),
        borderRadius: moderateScale(8),
        backgroundColor: '#F3EEF8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    menuLabel: { fontSize: moderateScale(13.5), fontWeight: '600', color: '#0A0A0A' },

    // Logout
    logoutBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: scale(16),
        height: verticalScale(48),
        borderRadius: moderateScale(12),
        borderWidth: 1.5,
        borderColor: '#EF4444',
    },
    logoutBtnText: { color: '#EF4444', fontSize: moderateScale(14.5), fontWeight: '800' },

    // Guest Screen
    guestContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scale(28),
        paddingBottom: verticalScale(60),
    },
    guestIconWrap: {
        width: scale(120),
        height: scale(120),
        borderRadius: scale(60),
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(24),
    },
    guestTitle: {
        fontSize: moderateScale(22),
        fontWeight: '900',
        color: '#0A0A0A',
        textAlign: 'center',
        marginBottom: verticalScale(10),
    },
    guestSubtitle: {
        fontSize: moderateScale(14),
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: moderateScale(22),
        marginBottom: verticalScale(32),
    },
    loginBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0A0A0A',
        borderRadius: moderateScale(14),
        paddingHorizontal: scale(32),
        paddingVertical: verticalScale(14),
    },
    loginBtnText: { color: '#FFF', fontWeight: '800', fontSize: moderateScale(15) },

    // Image Picker Bottom Sheet
    pickerBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    pickerSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: moderateScale(20),
        borderTopRightRadius: moderateScale(20),
        paddingHorizontal: scale(16),
        paddingBottom: verticalScale(30),
        paddingTop: verticalScale(12),
    },
    pickerHandle: {
        width: scale(40),
        height: verticalScale(4),
        borderRadius: moderateScale(2),
        backgroundColor: '#E0E0E0',
        alignSelf: 'center',
        marginBottom: verticalScale(16),
    },
    pickerTitle: {
        fontSize: moderateScale(15),
        fontWeight: '800',
        color: '#0A0A0A',
        marginBottom: verticalScale(12),
        textAlign: 'center',
    },
    pickerOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(14),
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    pickerIconWrap: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(10),
        backgroundColor: '#F3EEF8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(14),
    },
    pickerOptionText: {
        flex: 1,
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#0A0A0A',
    },
    pickerCancelBtn: {
        marginTop: verticalScale(14),
        paddingVertical: verticalScale(14),
        borderRadius: moderateScale(12),
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
    },
    pickerCancelText: {
        fontSize: moderateScale(14),
        fontWeight: '700',
        color: '#6B7280',
    },
});
