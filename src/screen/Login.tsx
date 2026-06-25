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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

const logo = require('../asset/images/logo.png');

const Login = () => {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="#B0B0B0"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Enter your password"
                                placeholderTextColor="#B0B0B0"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Text style={styles.showHide}>{showPassword ? 'Hide' : 'Show'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.forgotBtn}>
                        <Text style={styles.forgotText}>Forgot password?</Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={styles.loginBtn}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('MainTabs')}
                    >
                        <Text style={styles.loginBtnText}>Sign In</Text>
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