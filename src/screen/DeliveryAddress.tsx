import React, { useState, useCallback } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import api from '../config/apiConfig';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import { colors } from '../theme/Colors';
import AddressCard, { Address } from '../component/AddressCard';

const DeliveryAddress = () => {
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const navigation = useNavigation<any>();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(false);
    const userId = useSelector((state: any) => state.auth.userId);

    const fetchAddresses = async () => {
        if (!userId) return;

        setLoading(true);
        try {
            console.log('[Address] GET /address?user_id=', userId);
            const response = await api.get(`/address?user_id=${userId}`);
            console.log('[Address] response', response.data);
            const serverAddresses = response.data?.data?.addresses ?? [];

            const mapped = serverAddresses.map((item: any) => ({
                id: String(item.id),
                name: `${item.first_name} ${item.last_name}`.trim(),
                phone: item.phone,
                address: item.address,
                city: item.city,
                state: item.state ?? '',
                pincode: item.postcode ?? item.pincode ?? '',
                isDefault: item.is_primary === 1,
            }));

            setAddresses(mapped);
            if (mapped.length > 0 && !selectedAddress) {
                setSelectedAddress(mapped[0].id);
            }
        } catch (error: any) {
            console.log('[Address] GET error', error?.response?.data ?? error.message);
            Alert.alert('Error', error?.response?.data?.message || 'Unable to load addresses');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAddresses();
        }, [userId])
    );

    const handleDeleteAddress = (id: string) => {
        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            console.log(`[Address] DELETE /address/${id}`);

                            // Executing direct DELETE call against endpoint sequence
                            const response = await api.delete(`/address/${id}`);
                            console.log('[Address] DELETE response', response.data);

                            Alert.alert('Success', 'Address deleted successfully.');

                            // Local structural update to sync the view layout instantly
                            setAddresses(prev => prev.filter(item => item.id !== id));
                            if (selectedAddress === id) {
                                setSelectedAddress(null);
                            }
                        } catch (error: any) {
                            console.log('[Address] DELETE error', error?.response?.data ?? error.message);
                            Alert.alert('Error', error?.response?.data?.message || 'Failed to delete the address. Please try again.');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ],
        );
    };

    const renderItem = ({ item }: { item: Address }) => (
        <AddressCard
            item={item}
            selected={selectedAddress === item.id}
            onSelect={() => setSelectedAddress(item.id)}
            onEdit={() => navigation.navigate('AddAddress', { addressId: item.id })} // Forwards tracking state parameters dynamically
            onDelete={() => handleDeleteAddress(item.id)}
        />
    );

    return (
        <View style={styles.container}>
            {loading && addresses.length === 0 ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : (
                <FlatList
                    data={addresses}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No saved addresses yet.</Text>
                        </View>
                    )}
                />
            )}

            <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('AddAddress')}
            >
                <Icon name="plus" size={22} color="#fff" />
                <Text style={styles.addButtonText}>Add New Address</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    listContent: {
        padding: moderateScale(16),
        paddingBottom: verticalScale(110),
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: verticalScale(60),
    },
    emptyText: {
        fontSize: moderateScale(16),
        color: '#666',
    },
    addButton: {
        position: 'absolute',
        left: scale(16),
        right: scale(16),
        bottom: verticalScale(24),
        height: verticalScale(54),
        borderRadius: moderateScale(14),
        backgroundColor: colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    addButtonText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: '700',
        marginLeft: scale(8),
    },
});

export default DeliveryAddress;