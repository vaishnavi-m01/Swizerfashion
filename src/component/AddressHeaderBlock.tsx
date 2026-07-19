import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';
import api from '../config/apiConfig';
import { scale } from '../utils/responsive';

const AddressHeaderBlock = () => {
    const navigation = useNavigation<any>();
    const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn);
    const user = useAppSelector(state => state.auth.user);
    const [defaultAddress, setDefaultAddress] = useState<any>(null);

    useFocusEffect(
        useCallback(() => {
            if (isLoggedIn && user?.id) {
                api.get(`/address?user_id=${user.id}`).then(res => {
                    if (res.data?.status && res.data?.data && res.data.data.length > 0) {
                        setDefaultAddress(res.data.data[0]);
                    } else {
                        setDefaultAddress(null);
                    }
                }).catch(err => console.log('Address fetch error:', err));
            } else {
                setDefaultAddress(null);
            }
        }, [isLoggedIn, user])
    );

    if (!isLoggedIn || !defaultAddress) return null;

    return (
        <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => navigation.navigate('DeliveryAddress')}
            style={styles.container}
        >
            <View style={styles.topRow}>
                <Text style={styles.typeText}>{defaultAddress.type || 'Other'}</Text>
                <Ionicons name="chevron-down" size={scale(16)} color="#0A0A0A" style={styles.icon} />
            </View>
            <Text style={styles.addressText} numberOfLines={1}>
                {defaultAddress.address}, {defaultAddress.city}, {defaultAddress.pincode}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeText: {
        fontSize: scale(16),
        fontWeight: '800',
        color: '#0A0A0A',
    },
    icon: {
        marginLeft: scale(4),
        marginTop: scale(2),
    },
    addressText: {
        fontSize: scale(12),
        color: '#555',
        marginTop: scale(2),
        maxWidth: scale(220),
    }
});

export default AddressHeaderBlock;
