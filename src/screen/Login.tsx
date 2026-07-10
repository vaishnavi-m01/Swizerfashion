import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    ToastAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import api, { setAuthToken } from '../config/apiConfig';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/slices/authSlice';
import { saveAuthState } from '../utils/storage';
import { Alert, ActivityIndicator } from 'react-native';

const logo = require('../asset/images/logo.png');

const Login = () => {
    const navigation = useNavigation<any>();
    const dispatch = useAppDispatch();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    const handleLogin = async () => {
        const newErrors: {[key: string]: string} = {};
        if (!phone) newErrors.phone = 'Phone number is required';
        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 4) newErrors.password = 'Password must be at least 4 characters';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        
        try {
            setIsLoading(true);
            const response = await api.post('/login', {
                mobile: phone,
                password,
            });
            // API response: { status, access_token, token_type, data: { id, name, email, mobile, role, is_verified } }
            if (response.data && response.data.access_token) {
                const token    = response.data.access_token;
                const tokenType = response.data.token_type ?? 'Bearer';
                const userData = response.data.data ?? null;
                const userId   = userData?.id ?? null;

                console.log('[Login] Storing session — userId:', userId, 'name:', userData?.name);

                // Attach token to all future API requests
                setAuthToken(token);

                const loginPayload = { token, tokenType, userId, user: userData };

                // Clear old session and store fresh login response
                dispatch(login(loginPayload));
                await saveAuthState(loginPayload);

                // Verify what's now stored in Redux
                const { store: reduxStore } = require('../store/store');
                const storedAuth = reduxStore.getState().auth;
                console.log('=== LOGIN \u2014 Redux Auth State After Dispatch ===');
                console.log('isLoggedIn:', storedAuth.isLoggedIn);
                console.log('userId    :', storedAuth.userId);
                console.log('token     :', storedAuth.token);
                console.log('user      :', JSON.stringify(storedAuth.user, null, 2));
                console.log('axios Auth:', require('../config/apiConfig').default.defaults.headers.common['Authorization'] ?? 'NOT SET \u274c');
                console.log('================================================');

                if (Platform.OS === 'android') {
                    ToastAndroid.show('Login successful! Welcome back 👋', ToastAndroid.SHORT);
                }
                navigation.navigate('MainTabs');
            } else {
                Alert.alert('Error', 'Invalid login response');
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image source={logo} style={styles.logo} resizeMode="contain" />
                    <Text style={styles.tagline}>Fashion that speaks for you</Text>
                </View>

                {/* Card */}
                <View style={styles.card}>
                    <Text style={styles.title}>Welcome back</Text>
                    <Text style={styles.subtitle}>Sign in to your account</Text>

                    {/* Phone */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number <Text style={styles.requiredStar}>*</Text></Text>
                        <View style={[styles.inputWrapper, errors.phone ? styles.inputError : null]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your phone number"
                                placeholderTextColor="#B0B0B0"
                                value={phone}
                                onChangeText={(text) => {
                                    setPhone(text);
                                    if (errors.phone) setErrors({...errors, phone: ''});
                                }}
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                        </View>
                        {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password <Text style={styles.requiredStar}>*</Text></Text>
                        <View style={[styles.inputWrapper, errors.password ? styles.inputError : null]}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Enter your password"
                                placeholderTextColor="#B0B0B0"
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    if (errors.password) setErrors({...errors, password: ''});
                                }}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Text style={styles.showHide}>{showPassword ? 'Hide' : 'Show'}</Text>
                            </TouchableOpacity>
                        </View>
                        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                    </View>

                    <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
                        <Text style={styles.forgotText}>Forgot password?</Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={styles.loginBtn}
                        activeOpacity={0.85}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginBtnText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Register Link */}
                    <View style={styles.registerRow}>
                        <Text style={styles.registerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: scale(20),
        paddingBottom: verticalScale(40),
    },
    logoContainer: {
        alignItems: 'center',
        paddingTop: verticalScale(60),
        paddingBottom: verticalScale(28),
    },
    logo: {
        width: scale(140),
        height: scale(70),
    },
    tagline: {
        fontSize: scale(13),
        color: '#9CA3AF',
        fontWeight: '400',
        marginTop: verticalScale(6),
        letterSpacing: 0.3,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(20),
        padding: moderateScale(24),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
    },
    title: {
        fontSize: scale(22),
        fontWeight: '800',
        color: '#0A0A0A',
        marginBottom: verticalScale(4),
    },
    subtitle: {
        fontSize: scale(13),
        color: '#9CA3AF',
        marginBottom: verticalScale(24),
    },
    inputGroup: {
        marginBottom: verticalScale(16),
    },
    label: {
        fontSize: scale(13),
        fontWeight: '600',
        color: '#374151',
        marginBottom: verticalScale(6),
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#EFEFEF',
        borderRadius: moderateScale(12),
        paddingHorizontal: scale(14),
        backgroundColor: '#FAFAFA',
        height: verticalScale(48),
    },
    input: {
        flex: 1,
        fontSize: scale(14),
        color: '#0A0A0A',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    errorText: {
        color: '#EF4444',
        fontSize: scale(11),
        marginTop: verticalScale(4),
        marginLeft: scale(4),
    },
    requiredStar: {
        color: '#EF4444',
    },
    showHide: {
        fontSize: scale(13),
        color: '#6B7280',
        fontWeight: '600',
        paddingLeft: scale(8),
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: verticalScale(20),
    },
    forgotText: {
        fontSize: scale(13),
        color: '#6B7280',
        fontWeight: '500',
    },
    loginBtn: {
        backgroundColor: '#0A0A0A',
        borderRadius: moderateScale(14),
        height: verticalScale(50),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    loginBtnText: {
        color: '#FFFFFF',
        fontSize: scale(15),
        fontWeight: '800',
        letterSpacing: 0.4,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#F0F0F0',
    },
    dividerText: {
        fontSize: scale(12),
        color: '#B0B0B0',
        marginHorizontal: scale(12),
    },
    registerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        fontSize: scale(13),
        color: '#9CA3AF',
    },
    registerLink: {
        fontSize: scale(13),
        fontWeight: '800',
        color: '#0A0A0A',
    },
});