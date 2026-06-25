import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Alert } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { moderateScale, scale, verticalScale } from '../utils/responsive';
import { colors } from '../theme/Colors';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';

const menuOptions = [
    { icon: 'location-outline', label: 'Manage Shipping Address', action: 'DeliveryAddress' },
    { icon: 'card-outline', label: 'Payment Methods', action: 'payments' },
    { icon: 'notifications-outline', label: 'Notification Preferences', action: 'notifications' },
    { icon: 'help-circle-outline', label: 'Support & Help Center', action: 'help' },
    { icon: 'shield-checkmark-outline', label: 'Privacy & Security', action: 'privacy' },
];

const ProfileScreen = () => {
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const navigation = useNavigation<any>();

    const membershipLevel = 'Platinum Member';
    const orders = ['order1', 'order2', 'order3'];
    const cartItems = useAppSelector(state => state.cart.items);
    const cartCount = cartItems.length;
    const loyaltyPoints = 350;



    const handleMenuPress = (action: string) => {
        if (action === 'DeliveryAddress') {
            navigation.navigate('DeliveryAddress');
        } else {
            Alert.alert('Coming Soon');
        }
    };


    const openCamera = () => {
        launchCamera(
            {
                mediaType: 'photo',
                quality: 0.8,
                saveToPhotos: true,
            },
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
            {
                mediaType: 'photo',
                quality: 0.8,
            },
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

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* User Profile Summary Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarLetters}>MS</Text>
                            </View>
                        )}

                        <TouchableOpacity style={styles.editBadge} onPress={showImagePicker}>
                            <Ionicons name="camera" size={moderateScale(12)} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>Maya Sharma</Text>
                    <Text style={styles.userEmail}>maya.sharma@example.com</Text>

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


                {/* Dynamic User Statistics Container Segment */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>{orders.length}</Text>
                        <Text style={styles.statLabel}>Orders</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>{cartCount}</Text>
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
                                    <Ionicons name={option.icon} size={moderateScale(20)} color={colors.accentDark} />
                                </View>
                                <Text style={styles.menuLabel}>{option.label}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={moderateScale(16)} color={colors.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Account Termination Sign Out Control Trigger */}
                <TouchableOpacity style={styles.logoutBtn} onPress={() => Alert.alert("Account", "Signing Out...")}>
                    <Ionicons name="log-out-outline" size={moderateScale(20)} color={colors.badge} style={{ marginRight: scale(8) }} />
                    <Text style={styles.logoutBtnText}>Sign Out</Text>
                </TouchableOpacity>

                {/* <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <Text>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                    <Text> Register</Text>
                </TouchableOpacity> */}
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
        borderBottomColor: colors.border,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(4),
        elevation: 3,
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
        backgroundColor: colors.accentDark,
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
        color: colors.text,
    },
    userEmail: {
        fontSize: moderateScale(13),
        color: colors.textSecondary,
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
        borderColor: colors.border,
    },
    membershipText: {
        fontSize: moderateScale(11),
        fontWeight: '700',
    },
    goldText: {
        color: colors.accentDark,
    },
    platinumText: {
        color: colors.text,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        marginVertical: verticalScale(14),
        paddingVertical: verticalScale(16),
        borderWidth: 1,
        borderColor: colors.border,
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
        color: colors.text,
    },
    statLabel: {
        fontSize: moderateScale(11),
        color: colors.textSecondary,
        fontWeight: '600',
        marginTop: verticalScale(4),
    },
    statDivider: {
        width: 1,
        height: verticalScale(30),
        backgroundColor: colors.border,
    },
    menuContainer: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: scale(16),
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(14),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
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
        color: colors.text,
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
        borderColor: colors.badge,
    },
    logoutBtnText: {
        color: colors.badge,
        fontSize: moderateScale(14.5),
        fontWeight: '800',
    },
});