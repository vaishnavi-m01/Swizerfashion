import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import api, { setAuthToken } from '../config/apiConfig';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/slices/authSlice';
import { saveAuthState } from '../utils/storage';
import { Alert, ActivityIndicator, ToastAndroid } from 'react-native';
import OtpVerify from 'react-native-otp-verify';

const logo = require('../asset/images/logo.png');

const Register = () => {
    const navigation = useNavigation<any>();
    const dispatch = useAppDispatch();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword,setConfirmPassword] = useState('');
    const [showConfirmPassword,setShowConfirmPassword] = useState(false);

    // OTP states
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const otpInputRef = useRef<TextInput>(null);
    const [isOtpFocused, setIsOtpFocused] = useState(false);
    const [timer, setTimer] = useState(0);

    // Timer countdown
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // SMS auto-read OTP
    useEffect(() => {
        if (isOtpSent) {
            OtpVerify.getOtp().then((p: any) => OtpVerify.addListener((message: string) => {
                // Extract OTP from message (6-digit number)
                const match = message && message.match(/(\d{4,6})/);
                if (match) {
                    setOtp(match[1]);
                }
            })).catch((err: any) => console.log('SMS OTP error:', err));

            return () => {
                OtpVerify.removeListener();
            };
        }
    }, [isOtpSent]);

    const handleRegister = async () => {
        const newErrors: {[key: string]: string} = {};
        if (!name) newErrors.name = 'Full Name is required';
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Please enter a valid email address';
        if (!phone) newErrors.phone = 'Phone Number is required';
        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 4) newErrors.password = 'Password must be at least 4 characters';
        if (!confirmPassword) newErrors.confirmPassword = 'Confirm Password is required';
        else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});

        try {
            setIsLoading(true);
            const response = await api.post('/send-register-otp', {
                name,
                mobile: phone,
                password,
                email: email,
                password_confirmation: confirmPassword
            });
            if (response.data) {
                setIsOtpSent(true);
                setTimer(30); // Start 30s timer
                if (response.data.otp) {
                    setOtp(response.data.otp.toString());
                } else if (response.data.data && response.data.data.otp) {
                    setOtp(response.data.data.otp.toString());
                }
                ToastAndroid.show('OTP sent successfully', ToastAndroid.SHORT);
            }
        } catch (error: any) {
          
            const validationErrors = error.response?.data?.errors;
            let errorMsg = error.response?.data?.message || 'Failed to send OTP';
            if (validationErrors) {
                const details = Object.entries(validationErrors)
                    .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                    .join('\n');
                errorMsg = `${errorMsg}\n\n${details}`;
            }
            Alert.alert('Validation Error', errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            setErrors({otp: 'OTP is required'});
            return;
        }
        setErrors({});
        
        try {
            setIsLoading(true);
            const response = await api.post('/verify-register-otp', {
                mobile: phone,
                otp,
            });
            console.log("Register Otp verification response:",response.data)
            if (response.data) {
                const loginResponse = await api.post('/login', {
                    mobile: phone,
                    password,
                });
                if (loginResponse.data && loginResponse.data.access_token) {
                    const token     = loginResponse.data.access_token;
                    const tokenType = loginResponse.data.token_type ?? 'Bearer';
                    const userData  = loginResponse.data.data ?? null;
                    const userId    = userData?.id ?? null;

                    console.log('[Register] Storing session — userId:', userId, 'name:', userData?.name);

                    // Attach token to all future API requests
                    setAuthToken(token);

                    const loginPayload = { token, tokenType, userId, user: userData };

                    // Clear old session and store fresh login response
                    dispatch(login(loginPayload));
                    await saveAuthState(loginPayload);
                
                    navigation.navigate('MainTabs');
                } else {
                    ToastAndroid.show('Registered successfully. Please login.', ToastAndroid.LONG);
                    navigation.navigate('Login');
                }
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to verify OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setOtp('');
        if (errors.otp) setErrors({...errors, otp: ''});
        
        try {
            setIsLoading(true);
            const response = await api.post('/resend-otp', {
                mobile: phone,
            });
            if (response.data) {
                setTimer(30); // Restart 30s timer on resend
                if (response.data.otp) {
                    setOtp(response.data.otp.toString());
                } else if (response.data.data && response.data.data.otp) {
                    setOtp(response.data.data.otp.toString());
                }
                ToastAndroid.show('OTP resent successfully', ToastAndroid.SHORT);
            }
        } catch (error: any) {
            
            Alert.alert('Error', error.response?.data?.message || 'Failed to resend OTP');
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
                    <Text style={styles.tagline}>Create your fashion account</Text>
                </View>

                {/* Card */}
                <View style={styles.card}>
                    <Text style={styles.title}>{isOtpSent ? 'Verify OTP' : 'Create Account'}</Text>
                    <Text style={styles.subtitle}>{isOtpSent ? `Enter the OTP sent to ${phone}` : 'Join us and explore the latest fashion'}</Text>

                    {!isOtpSent ? (
                        <>
                            {/* Full Name */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Full Name <Text style={styles.requiredStar}>*</Text></Text>
                                <View style={[styles.inputWrapper, errors.name ? styles.inputError : null]}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your full name"
                                        placeholderTextColor="#B0B0B0"
                                        value={name}
                                        onChangeText={(text) => {
                                            setName(text);
                                            if (errors.name) setErrors({...errors, name: ''});
                                        }}
                                        autoCapitalize="words"
                                    />
                                </View>
                                {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
                            </View>

                            {/* Email */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email</Text>
                                <View style={[styles.inputWrapper, errors.email ? styles.inputError : null]}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your email"
                                        placeholderTextColor="#B0B0B0"
                                        value={email}
                                        onChangeText={(text) => {
                                            setEmail(text);
                                            if (errors.email) setErrors({...errors, email: ''});
                                        }}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                            </View>

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

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Password <Text style={styles.requiredStar}>*</Text></Text>
                                <View style={[styles.inputWrapper, errors.password ? styles.inputError : null]}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder="Create a password"
                                        placeholderTextColor="#B0B0B0"
                                        value={password}
                                        onChangeText={(text) => {
                                            setPassword(text);
                                            if (errors.password) setErrors({...errors, password: ''});
                                        }}
                                        secureTextEntry={!showPassword}
                                        maxLength={32}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Text style={styles.showHide}>{showPassword ? 'Hide' : 'Show'}</Text>
                                    </TouchableOpacity>
                                </View>
                                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                            </View>

                            {/* Confirm Password */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Confirm Password <Text style={styles.requiredStar}>*</Text></Text>
                                <View style={[styles.inputWrapper, errors.confirmPassword ? styles.inputError : null]}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder="Create a password"
                                        placeholderTextColor="#B0B0B0"
                                        value={confirmPassword}
                                        onChangeText={(text) => {
                                            setConfirmPassword(text);
                                            if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
                                        }}
                                        secureTextEntry={!showConfirmPassword}
                                        maxLength={32}
                                    />
                                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        <Text style={styles.showHide}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
                                    </TouchableOpacity>
                                </View>
                                {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
                            </View>

                            {/* Register Button */}
                            <TouchableOpacity
                                style={styles.registerBtn}
                                activeOpacity={0.85}
                                onPress={handleRegister}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.registerBtnText}>Create Account</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            {/* OTP */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>OTP <Text style={styles.requiredStar}>*</Text></Text>
                                <View style={{ position: 'relative' }}>
                                    <View style={styles.otpContainer}>
                                        {Array(6).fill(0).map((_, i) => (
                                            <View key={i} style={[
                                                styles.otpBox, 
                                                isOtpFocused && otp.length === i ? styles.otpBoxActive : null,
                                                errors.otp ? styles.inputError : null
                                            ]}>
                                                <Text style={styles.otpText}>{otp[i] || ''}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    <TextInput
                                        ref={otpInputRef}
                                        value={otp}
                                        onChangeText={(text) => {
                                            const val = text.replace(/[^0-9]/g, '').slice(0, 6);
                                            setOtp(val);
                                            if (errors.otp) setErrors({...errors, otp: ''});
                                        }}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        style={styles.hiddenInput}
                                        onFocus={() => setIsOtpFocused(true)}
                                        onBlur={() => setIsOtpFocused(false)}
                                        textContentType="oneTimeCode"
                                        autoComplete="sms-otp"
                                        importantForAutofill="yes"
                                    />
                                </View>
                                {errors.otp ? <Text style={styles.errorText}>{errors.otp}</Text> : null}
                            </View>

                            <TouchableOpacity
                                style={styles.registerBtn}
                                activeOpacity={0.85}
                                onPress={handleVerifyOtp}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.registerBtnText}>Verify OTP</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity 
                                onPress={handleResendOtp} 
                                disabled={isLoading || timer > 0} 
                                style={{alignItems: 'center', marginBottom: verticalScale(20)}}
                            >
                                <Text style={[styles.loginLink, timer > 0 ? { color: '#9CA3AF' } : null]}>
                                    {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* Divider */}
                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Login Link */}
                    <View style={styles.loginRow}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Register;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: scale(20),
        paddingBottom: verticalScale(60),
    },
    logoContainer: {
        alignItems: 'center',
        paddingTop: verticalScale(48),
        paddingBottom: verticalScale(22),
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
        marginBottom: verticalScale(14),
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
    registerBtn: {
        backgroundColor: '#0A0A0A',
        borderRadius: moderateScale(14),
        height: verticalScale(50),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(8),
        marginBottom: verticalScale(20),
    },
    registerBtnText: {
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
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        fontSize: scale(13),
        color: '#9CA3AF',
    },
    loginLink: {
        fontSize: scale(13),
        fontWeight: '800',
        color: '#0A0A0A',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: verticalScale(8),
        gap: scale(8),
    },
    otpBox: {
        flex: 1,
        height: verticalScale(52),
        borderWidth: 1.5,
        borderColor: '#EFEFEF',
        borderRadius: moderateScale(10),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    otpBoxActive: {
        borderColor: '#0A0A0A',
        backgroundColor: '#FFFFFF',
    },
    otpText: {
        fontSize: scale(18),
        fontWeight: '700',
        color: '#0A0A0A',
    },
    hiddenInput: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0,
        zIndex: 1,
    },
});