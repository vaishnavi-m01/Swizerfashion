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

const Register = () => {
    const navigation = useNavigation<any>();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const[confirmPassword,setConfirmPassword] = useState('');
    const[showConfirmPassword,setShowConfirmPassword] = useState(false);
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
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join us and explore the latest fashion</Text>

                    {/* Full Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                placeholderTextColor="#B0B0B0"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>
                    </View>

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

                    {/* Phone */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your phone number"
                                placeholderTextColor="#B0B0B0"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Create a password"
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

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Create a password"
                                placeholderTextColor="#B0B0B0"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Text style={styles.showHide}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                        style={styles.registerBtn}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('MainTabs')}
                    >
                        <Text style={styles.registerBtnText}>Create Account</Text>
                    </TouchableOpacity>

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
});