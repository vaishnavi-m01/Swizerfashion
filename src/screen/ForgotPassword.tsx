import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  ToastAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import OtpVerify from 'react-native-otp-verify';
import api from '../config/apiConfig';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import { colors } from '../theme/Colors';

type ForgotStep = 'mobile' | 'otp' | 'password';

const ForgotPassword = () => {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState<ForgotStep>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const otpInputRef = useRef<TextInput>(null);

  // SMS auto-read OTP
  useEffect(() => {
      if (step === 'otp') {
          OtpVerify.getOtp().then(() => OtpVerify.addListener((message: string) => {
              const match = message && message.match(/(\d{4,6})/);
              if (match) {
                  setOtp(match[1]);
              }
          })).catch((err: any) => console.log('SMS OTP error:', err));

          return () => {
              OtpVerify.removeListener();
          };
      }
  }, [step]);

  const handleSendOtp = async () => {
    const newErrors: {[key: string]: string} = {};
    if (!mobile) newErrors.mobile = 'Mobile Number is required';
    else if (mobile.length < 10) newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }
    setErrors({});
    
    setOtp('');

    try {
      setLoading(true);
      const response = await api.post('/forgot-password-otp', { mobile });
      ToastAndroid.show(response.data?.message || 'Please check your mobile for the OTP', ToastAndroid.LONG);
      setStep('otp');
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const newErrors: {[key: string]: string} = {};
    if (!otp) newErrors.otp = 'OTP is required';
    else if (otp.length < 6) newErrors.otp = 'Please enter a valid 6-digit OTP code';
    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }
    setErrors({});

    try {
      setLoading(true);
      const response = await api.post('/verify-forgot-otp', { mobile, otp });
      ToastAndroid.show(response.data?.message || 'OTP verified successfully', ToastAndroid.SHORT);
      setStep('password');
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const newErrors: {[key: string]: string} = {};
    if (!password) newErrors.password = 'New Password is required';
    else if (password.length < 4) newErrors.password = 'Password must be at least 4 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Confirm Password is required';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }
    setErrors({});

    try {
      setLoading(true);
      const response = await api.post('/reset-password', {
        mobile,
        password,
        password_confirmation: confirmPassword,
      });
      ToastAndroid.show(response.data?.message || 'Password updated successfully', ToastAndroid.LONG);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Section */}
        {/* <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={moderateScale(22)} color={colors.text || '#000'} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account Recovery</Text>
        </View> */}

        {/* Progress Tracker Card */}
        <View style={styles.progressContainer}>
          <View style={styles.progressItem}>
            <View style={[styles.stepCircle, styles.stepActive]}>
              <Text style={styles.stepTextActive}>1</Text>
            </View>
            <Text style={styles.progressLabel}>Mobile</Text>
          </View>
          <View style={[styles.progressLine, (step === 'otp' || step === 'password') && styles.progressLineActive]} />
          
          <View style={styles.progressItem}>
            <View style={[styles.stepCircle, (step === 'otp' || step === 'password') && styles.stepActive]}>
              <Text style={(step === 'otp' || step === 'password') ? styles.stepTextActive : styles.stepTextInactive}>2</Text>
            </View>
            <Text style={styles.progressLabel}>Verify</Text>
          </View>
          <View style={[styles.progressLine, step === 'password' && styles.progressLineActive]} />
          
          <View style={styles.progressItem}>
            <View style={[styles.stepCircle, step === 'password' && styles.stepActive]}>
              <Text style={step === 'password' ? styles.stepTextActive : styles.stepTextInactive}>3</Text>
            </View>
            <Text style={styles.progressLabel}>Reset</Text>
          </View>
        </View>

        {/* Main Content Form Wrapper */}
        <View style={styles.card}>
          {step === 'mobile' && (
            <View>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>Enter your phone number below. We will send an OTP verification pin to verify your profile.</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mobile Number <Text style={styles.requiredStar}>*</Text></Text>
                <View style={[styles.inputWrapper, isFocused === 'mobile' && styles.inputWrapperFocused, errors.mobile ? styles.inputError : null]}>
                  <Ionicons name="phone-portrait-outline" size={moderateScale(18)} color={colors.textSecondary || '#666'} style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="Enter 10-digit number"
                    placeholderTextColor={colors.textMuted || '#999'}
                    value={mobile}
                    onChangeText={(text) => {
                        setMobile(text);
                        if (errors.mobile) setErrors({...errors, mobile: ''});
                    }}
                    keyboardType="phone-pad"
                    maxLength={10}
                    onFocus={() => setIsFocused('mobile')}
                    onBlur={() => setIsFocused(null)}
                  />
                </View>
                {errors.mobile ? <Text style={styles.errorText}>{errors.mobile}</Text> : null}
              </View>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleSendOtp} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Send Verification Link</Text>}
              </TouchableOpacity>
            </View>
          )}

          {step === 'otp' && (
            <View>
              <Text style={styles.title}>Verification Code</Text>
              <Text style={styles.subtitle}>Please enter the 6-digit verification security key sent to <Text style={styles.boldText}>+91 {mobile}</Text></Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Enter Code <Text style={styles.requiredStar}>*</Text></Text>
                <View style={{ position: 'relative' }}>
                    <View style={styles.otpContainer}>
                        {Array(6).fill(0).map((_, i) => (
                            <View key={i} style={[
                                styles.otpBox, 
                                isFocused === 'otp' && otp.length === i ? styles.otpBoxActive : null,
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
                        onFocus={() => setIsFocused('otp')}
                        onBlur={() => setIsFocused(null)}
                        textContentType="oneTimeCode"
                        autoComplete="sms-otp"
                        importantForAutofill="yes"
                    />
                </View>
                {errors.otp ? <Text style={styles.errorText}>{errors.otp}</Text> : null}
              </View>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyOtp} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Verify OTP Code</Text>}
              </TouchableOpacity>
              
              <View style={styles.resendRow}>
                <Text style={styles.resendInfo}>Didn't receive code? </Text>
                <TouchableOpacity onPress={handleSendOtp} disabled={loading}>
                  <Text style={styles.resendText}>Resend Request</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 'password' && (
            <View>
              <Text style={styles.title}>New Password</Text>
              <Text style={styles.subtitle}>Set up a strong, secure password containing alphanumeric variations to secure your user profile.</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password <Text style={styles.requiredStar}>*</Text></Text>
                <View style={[styles.inputWrapper, isFocused === 'pass' && styles.inputWrapperFocused, errors.password ? styles.inputError : null]}>
                  <Ionicons name="lock-closed-outline" size={moderateScale(18)} color={colors.textSecondary || '#666'} style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted || '#999'}
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password) setErrors({...errors, password: ''});
                    }}
                    secureTextEntry={!showPassword}
                    maxLength={32}
                    onFocus={() => setIsFocused('pass')}
                    onBlur={() => setIsFocused(null)}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={moderateScale(18)} color={colors.textSecondary || '#666'} />
                  </TouchableOpacity>
                </View>
                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password <Text style={styles.requiredStar}>*</Text></Text>
                <View style={[styles.inputWrapper, isFocused === 'confirm' && styles.inputWrapperFocused, errors.confirmPassword ? styles.inputError : null]}>
                  <Ionicons name="lock-closed-outline" size={moderateScale(18)} color={colors.textSecondary || '#666'} style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted || '#999'}
                    value={confirmPassword}
                    onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
                    }}
                    secureTextEntry={!showConfirmPassword}
                    maxLength={32}
                    onFocus={() => setIsFocused('confirm')}
                    onBlur={() => setIsFocused(null)}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={moderateScale(18)} color={colors.textSecondary || '#666'} />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleResetPassword} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Update & Save Password</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    marginTop: Platform.OS === 'ios' ? verticalScale(10) : verticalScale(5),
  },
  backButton: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(10),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: colors.text || '#111',
    marginLeft: scale(14),
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: verticalScale(20),
    backgroundColor: '#FFFFFF',
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progressItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    backgroundColor: '#D1D5DB', // Darker gray for inactive step visibility
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    backgroundColor: colors.accentDark || '#4A154B',
  },
  stepTextActive: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  stepTextInactive: {
    color: '#4B5563',
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  progressLabel: {
    fontSize: moderateScale(10),
    color: '#4B5563',
    fontWeight: '600',
    marginTop: verticalScale(4),
  },
  progressLine: {
    width: scale(50),
    height: verticalScale(3),
    backgroundColor: '#D1D5DB',
    marginHorizontal: scale(8),
    marginTop: verticalScale(-14),
  },
  progressLineActive: {
    backgroundColor: colors.accentDark || '#4A154B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(24),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    color: colors.text || '#0A0A0A',
    marginBottom: verticalScale(6),
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
    color: colors.textSecondary || '#666',
    marginBottom: verticalScale(24),
  },
  boldText: {
    fontWeight: '700',
    color: colors.text || '#000',
  },
  inputGroup: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: colors.text || '#333',
    marginBottom: verticalScale(8),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(14),
  },
  inputWrapperFocused: {
    borderColor: colors.accentDark || '#4A154B',
    backgroundColor: '#FFFFFF',
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
  inputIcon: {
    marginRight: scale(10),
  },
  inputFlex: {
    flex: 1,
    fontSize: moderateScale(14.5),
    color: colors.text || '#000',
    paddingVertical: Platform.OS === 'ios' ? verticalScale(14) : verticalScale(10),
  },
  otpInputText: {
    letterSpacing: scale(4),
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  primaryBtn: {
    backgroundColor: colors.accentDark || '#4A154B',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: moderateScale(14.5),
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  resendInfo: {
    fontSize: moderateScale(13),
    color: colors.textSecondary || '#666',
  },
  resendText: {
    fontSize: moderateScale(13),
    color: colors.accentDark || '#4A154B',
    fontWeight: '700',
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
    borderColor: colors.accentDark || '#4A154B',
    backgroundColor: '#FFFFFF',
  },
  otpText: {
    fontSize: moderateScale(18),
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

export default ForgotPassword;