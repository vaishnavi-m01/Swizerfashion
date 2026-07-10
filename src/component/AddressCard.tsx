import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import { colors } from '../theme/Colors';

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

interface Props {
  item: Address;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const AddressCard: React.FC<Props> = ({
  item,
  selected,
  onSelect,
  onEdit,
  onDelete,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onSelect}
      style={[styles.card, selected && styles.selectedCard]}
    >
      <View style={styles.row}>
        <View style={styles.radioContainer}>
          <View
            style={[
              styles.radioOuter,
              selected && styles.radioOuterSelected,
            ]}
          >
            {selected && <View style={styles.radioInner} />}
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>

                {item.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
              </View>

              <Text style={styles.phone}>{item.phone}</Text>
            </View>

            <View style={styles.iconRow}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onEdit}
                activeOpacity={0.7}
              >
                <Icon
                  name="pencil-outline"
                  size={20}
                  color="#444"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={onDelete}
                activeOpacity={0.7}
              >
                <Icon
                  name="delete-outline"
                  size={20}
                  color={colors.accent || '#E53935'}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.address}>
            {item.address}
            {'\n'}
            {item.city}, {item.state} - {item.pincode}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(15),
    borderWidth: 1,
    borderColor: '#ECECEC',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    marginRight: scale(12),
  },
  radioOuter: {
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
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
    height: scale(11),
    borderRadius: scale(5.5),
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
    flexWrap: 'wrap',
  },
  name: {
    fontSize: moderateScale(16),
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
    marginTop: verticalScale(4),
    fontSize: moderateScale(14),
    color: '#666',
  },
  address: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(14),
    color: '#555',
    lineHeight: moderateScale(20),
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(8),
  },
});

export default AddressCard;