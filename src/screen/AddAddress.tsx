import React, { useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import { colors } from '../theme/Colors';

const AddAddress = () => {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSave = () => {
    
    if (!form.fullName || !form.phone || !form.street || !form.city || !form.state) {
      Alert.alert('Validation Error', 'Please fill all the fields.');
      return;
    }

   
    Alert.alert('Success', 'Address saved successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    //   keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Add New Address</Text>
        <Text style={styles.subtitle}>Please enter your shipping details.</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name <Text style={styles.star}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Maya Sharma"
            placeholderTextColor={colors.textMuted}
            value={form.fullName}
            maxLength={60}
            onChangeText={(text) => handleChange('fullName', text)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number <Text style={styles.star}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="+91 98765 43210"
            placeholderTextColor={colors.textMuted}
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
            placeholderTextColor={colors.textMuted}
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
              placeholderTextColor={colors.textMuted}
              value={form.city}
              maxLength={60}
              onChangeText={(text) => handleChange('city', text)}
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>State <Text style={styles.star}></Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Maharashtra"
              placeholderTextColor={colors.textMuted}
              value={form.state}
              maxLength={60}
              onChangeText={(text) => handleChange('state', text)}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Zip Code</Text>
          <TextInput
            style={styles.input}
            placeholder="400001"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={form.zipCode}
            onChangeText={(text) => handleChange('zipCode', text)}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Address</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: moderateScale(20),
    paddingBottom: verticalScale(40),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: colors.text,
    marginBottom: verticalScale(6),
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: colors.textSecondary,
    marginBottom: verticalScale(24),
  },
  inputGroup: {
    marginBottom: verticalScale(16),
  },
  label: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: verticalScale(8),
  },
  star :{
    color:"red"
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(15),
    color: colors.text,
  },
  textArea: {
    height: verticalScale(80),
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  saveBtn: {
    backgroundColor: colors.accentDark,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: moderateScale(16),
    fontWeight: '800',
  },
});

export default AddAddress;