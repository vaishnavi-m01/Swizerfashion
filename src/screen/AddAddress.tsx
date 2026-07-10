import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import api from '../config/apiConfig';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import { colors } from '../theme/Colors';

const AddAddress = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  
  // Extract addressId if passed from delivery list screen edit click trigger
  const addressId = route.params?.addressId;
  const isEditMode = !!addressId;

  const [form, setForm] = useState({
    fullName: '',
    lastName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isPrimary: false,
  });

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const authUser = useSelector((state: any) => state.auth.user);

  // Keyboard Event Listeners
  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  // Fetch individual address details if in Edit Mode
  useEffect(() => {
    if (isEditMode) {
      fetchAddressDetails();
    }
  }, [addressId]);

  const fetchAddressDetails = async () => {
    setIsLoadingData(true);
    try {
      console.log(`[Address] Fetching all addresses to find: ${addressId}`);
      const response = await api.get(`/address?user_id=${authUser?.id}`);
      console.log('[Address] GET all response for edit', response.data);
      
      const allAddresses = response.data?.data?.addresses || [];
      const addressData = allAddresses.find((addr: any) => String(addr.id) === String(addressId));
      
      if (addressData) {
        setForm({
          fullName: addressData.first_name || '',
          lastName: addressData.last_name || '',
          phone: addressData.phone || '',
          street: addressData.address || '',
          city: addressData.city || '',
          state: addressData.state || '',
          zipCode: addressData.postcode || addressData.pincode || '',
          isPrimary: addressData.is_primary === 1,
        });
      }
    } catch (err: any) {
      console.log('[Address] GET fetch error', err?.response?.data ?? err.message);
      Alert.alert('Error', 'Failed to pull address specifications details.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSave = () => {
    if (!form.fullName || !form.lastName || !form.phone || !form.street || !form.city || !form.state || !form.zipCode) {
      Alert.alert('Validation Error', 'Please fill all the mandatory asterisk (*) fields.');
      return;
    }

    const payload = {
      user_id: authUser?.id,
      first_name: form.fullName.trim(),
      last_name: form.lastName.trim(),
      email: authUser?.email ?? '',
      phone: form.phone,
      address: form.street,
      city: form.city,
      state: form.state.trim(),
      postcode: form.zipCode,
      is_primary: form.isPrimary ? 1 : 0,
    };

    setIsSubmitting(true);

    // Dynamic endpoint allocation rule based on view access criteria parameters
    const apiCall = isEditMode 
      ? api.put(`/address/${addressId}`, payload)
      : api.post('/address', payload);

    apiCall
      .then((res) => {
        console.log('Address submission action response', res.data);
        Alert.alert('Success', `Address ${isEditMode ? 'updated' : 'saved'} successfully!`, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      })
      .catch((err) => {
        console.log('Address save action runtime error', err?.response?.data ?? err.message);
        let backendError = 'Failed to execute address profile storage submission';
        if (err?.response?.data) {
          backendError = err.response.data.message || err.response.data.error || JSON.stringify(err.response.data);
        }
        Alert.alert('Submission Error', backendError);
      })
      .finally(() => setIsSubmitting(false));
  };

  if (isLoadingData) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.accentDark || '#4F46E5'} />
        <Text style={styles.loaderText}>Loading Address Data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.scrollContainer}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: isKeyboardVisible ? verticalScale(140) : verticalScale(100) }
          ]}
        >
          <Text style={styles.title}>{isEditMode ? 'Edit Address' : 'Add New Address'}</Text>
          <Text style={styles.subtitle}>
            {isEditMode ? 'Modify your selected shipping metrics below.' : 'Please enter your shipping details.'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name <Text style={styles.star}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Maya"
              placeholderTextColor={colors.textMuted || '#9CA3AF'}
              value={form.fullName}
              maxLength={60}
              onChangeText={(text) => handleChange('fullName', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name <Text style={styles.star}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Sharma"
              placeholderTextColor={colors.textMuted || '#9CA3AF'}
              value={form.lastName}
              maxLength={60}
              onChangeText={(text) => handleChange('lastName', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number <Text style={styles.star}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="+91 98765 43210"
              placeholderTextColor={colors.textMuted || '#9CA3AF'}
              keyboardType="phone-pad"
              value={form.phone}
              maxLength={12}
              onChangeText={(text) => handleChange('phone', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Street Address <Text style={styles.star}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="123 Main Street, Apt 4B"
              placeholderTextColor={colors.textMuted || '#9CA3AF'}
              multiline
              numberOfLines={3}
              value={form.street}
              maxLength={120}
              onChangeText={(text) => handleChange('street', text)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>City <Text style={styles.star}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Mumbai"
                placeholderTextColor={colors.textMuted || '#9CA3AF'}
                value={form.city}
                maxLength={60}
                onChangeText={(text) => handleChange('city', text)}
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>State<Text style={styles.star}> *</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Maharashtra"
                placeholderTextColor={colors.textMuted || '#9CA3AF'}
                value={form.state}
                maxLength={60}
                onChangeText={(text) => handleChange('state', text)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Zip Code <Text style={styles.star}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="400001"
              placeholderTextColor={colors.textMuted || '#9CA3AF'}
              keyboardType="numeric"
              value={form.zipCode}
              onChangeText={(text) => handleChange('zipCode', text)}
            />
          </View>

          <TouchableOpacity
            style={styles.primaryToggle}
            onPress={() => setForm({ ...form, isPrimary: !form.isPrimary })}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, form.isPrimary && styles.checkboxActive]}>
              {form.isPrimary ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
            <Text style={styles.primaryText}>Set as primary address</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {!isKeyboardVisible && (
        <View style={styles.buttonFooter}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Text style={styles.saveBtnText}>
              {isSubmitting ? 'Loading...' : isEditMode ? 'Update Address' : 'Save Address'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loaderText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(15),
    color: '#6B7280',
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: moderateScale(20),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: verticalScale(6),
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    marginBottom: verticalScale(24),
  },
  inputGroup: {
    marginBottom: verticalScale(18),
  },
  label: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: verticalScale(8),
  },
  star: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    fontSize: moderateScale(15),
    color: '#1F2937',
    // Shadows completely removed for flat look
  },
  textArea: {
    height: verticalScale(90),
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  primaryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  checkbox: {
    width: scale(22),
    height: scale(22),
    borderRadius: scale(6),
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
    backgroundColor: '#fff',
  },
  checkboxActive: {
    backgroundColor: colors.accentDark || '#4F46E5',
    borderColor: colors.accentDark || '#4F46E5',
  },
  checkmark: {
    color: '#fff',
    fontSize: moderateScale(13),
    fontWeight: '900',
  },
  primaryText: {
    fontSize: moderateScale(14),
    color: '#374151',
    fontWeight: '600',
  },
  buttonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    paddingTop: verticalScale(16),
    paddingBottom: Platform.OS === 'ios' ? verticalScale(34) : verticalScale(24),
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  cancelBtn: {
    width: '45%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  cancelBtnText: {
    color: '#4B5563',
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  saveBtn: {
    width: '50%',
    backgroundColor: colors.accentDark || '#4F46E5',
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    // Shadows completely removed for flat look
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: moderateScale(16),
    fontWeight: '800',
  },
});

export default AddAddress;