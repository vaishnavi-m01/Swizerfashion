import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import api from '../config/apiConfig';

type RouteParams = {
    params: {
        userData?: {
            name: string;
            email: string;
            phone: string;
            username?: string;
        }
    }
};

const EditProfileScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RouteParams, 'params'>>();
    const initialData = route.params?.userData;

    const [name, setName] = useState(initialData?.name || '');
    const [email, setEmail] = useState(initialData?.email || '');
    const [phone, setPhone] = useState(initialData?.phone || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Validation Error", "Name is required.");
            return;
        }

        try {
            setIsLoading(true);
            const payload = {
                name,
                email,
                phone,
            };
            
            const response = await api.put('/profile/update', payload);

            if (response.data && response.data.status) {
                Alert.alert("Success", "Profile updated successfully!", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert("Error", response.data?.message || "Failed to update profile.");
            }
        } catch (error: any) {
            console.error("Profile update error:", error);
            Alert.alert("Error", error?.response?.data?.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Edit Profile</Text>
                    <Text style={styles.subtitle}>Update your personal information.</Text>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="call-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Enter your phone number"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.saveBtn, isLoading && styles.saveBtnDisabled]} 
                    onPress={handleSave}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <Text style={styles.saveBtnText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    content: { padding: scale(20), paddingBottom: verticalScale(40) },
    header: { marginBottom: verticalScale(30) },
    title: { fontSize: moderateScale(28), fontWeight: '900', color: '#0A0A0A', marginBottom: verticalScale(8) },
    subtitle: { fontSize: moderateScale(15), color: '#6B7280', lineHeight: moderateScale(22) },
    formGroup: { marginBottom: verticalScale(20) },
    label: { fontSize: moderateScale(14), fontWeight: '700', color: '#374151', marginBottom: verticalScale(8) },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: moderateScale(12),
        paddingHorizontal: scale(16),
        height: verticalScale(50),
    },
    inputIcon: { marginRight: scale(10) },
    input: { flex: 1, fontSize: moderateScale(15), color: '#0A0A0A' },
    saveBtn: {
        backgroundColor: '#0A0A0A',
        height: verticalScale(50),
        borderRadius: moderateScale(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    saveBtnDisabled: { opacity: 0.7 },
    saveBtnText: { color: '#FFFFFF', fontSize: moderateScale(16), fontWeight: '800' },
});
