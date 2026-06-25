import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import { colors } from '../theme/Colors';
import AddressCard from '../component/AddressCard';

interface Address {
    id: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
}

const DeliveryAddress = () => {
    const [selectedAddress, setSelectedAddress] = useState('1');
    const navigation = useNavigation<any>();
    const [addresses, setAddresses] = useState<Address[]>([
        {
            id: '1',
            name: 'Vaishnavi M',
            phone: '9876543210',
            address: '12, Anna Nagar',
            city: 'Coimbatore',
            state: 'Tamil Nadu',
            pincode: '641001',
            isDefault: true,
        },
        {
            id: '2',
            name: 'Vaishnavi M',
            phone: '9876543210',
            address: '45, Gandhi Street',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600001',
        },
        {
            id: '3',
            name: 'Vaishnavi M',
            phone: '9876543210',
            address: '100, Cross Road',
            city: 'Madurai',
            state: 'Tamil Nadu',
            pincode: '625001',
        },
    ]);

    const deleteAddress = (id: string) => {
        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this address?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setAddresses(prev =>
                            prev.filter(item => item.id !== id),
                        );
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
            onEdit={() => Alert.alert('Edit')}
            onDelete={() => deleteAddress(item.id)}
        />
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={addresses}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    padding: moderateScale(16),
                    paddingBottom: verticalScale(100),
                }}
            />

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate("AddAddress")}>
                <Icon
                    name="plus"
                    size={22}
                    color="#fff"
                />
                <Text style={styles.addButtonText}>
                    Add New Address
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default DeliveryAddress;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(16),
        padding: moderateScale(16),
        marginBottom: verticalScale(15),
        borderWidth: 1,
        borderColor: '#ECECEC',
        elevation: 1,
    },

    selectedCard: {
        borderColor: colors.accent,
        borderWidth: 2,
    },

    row: {
        flexDirection: 'row',
    },

    radioContainer: {
        justifyContent: 'center',
        marginRight: scale(15),
    },

    radioOuter: {
        width: scale(22),
        height: verticalScale(22),
        borderRadius: moderateScale(11),
        borderWidth: 2,
        borderColor: '#CFCFCF',
        justifyContent: 'center',
        alignItems: 'center',
    },

    radioOuterSelected: {
        borderColor: colors.accent,
    },

    radioInner: {
        width: scale(11),
        height: verticalScale(11),
        borderRadius: moderateScale(6),
        backgroundColor: colors.accent,
    },

    details: {
        flex: 1,
    },

    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },

    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    name: {
        fontSize: moderateScale(17),
        fontWeight: '700',
        color: '#222',
    },

    defaultBadge: {
        backgroundColor: '#4CAF50',
        borderRadius: moderateScale(20),
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(3),
        marginLeft: scale(8),
    },

    defaultText: {
        color: '#fff',
        fontSize: moderateScale(11),
        fontWeight: '600',
    },

    phone: {
        marginTop: verticalScale(5),
        fontSize: moderateScale(14),
        color: '#666',
    },

    address: {
        marginTop: verticalScale(8),
        fontSize: moderateScale(14),
        color: '#555',
        lineHeight: moderateScale(22),
    },

    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    iconButton: {
        width: scale(36),
        height: verticalScale(36),
        borderRadius: moderateScale(18),
        backgroundColor: '#F7F7F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: scale(8),
    },

    addButton: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 20,
        height: verticalScale(55),
        borderRadius: moderateScale(14),
        backgroundColor: colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        elevation: 5,
        marginBottom: verticalScale(38)
    },

    addButtonText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: '700',
        marginLeft: scale(8),
    },
});