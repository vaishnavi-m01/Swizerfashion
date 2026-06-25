import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
} from 'react-native';
import { scale, verticalScale, RESPONSIVE_PADDING } from '../utils/responsive';

interface Category {
  id: number;
  name: string;
  image: string;
}

interface CategoryCardProps {
  category: Category;
  onPress?: () => void;
  style?: ViewStyle;
  active?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  style,
  active = false,
}) => {
  const cardSize = scale(72);

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
    
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.categoryImageRing,
          { width: cardSize, height: cardSize, borderRadius: cardSize / 2 },
          active && styles.categoryImageRingActive,
        ]}
      >
        <Image source={{ uri: category.image }} style={styles.categoryImage} />
      </View>
      <Text style={[styles.categoryTitle, active && styles.categoryTitleActive]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};



const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: scale(18),
  },

  categoryImageRing: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  categoryImageRingActive: {
    borderColor: '#000000',
    borderWidth: 2.5,
  },

  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },

  categoryTitle: {
    color: '#555555',
    fontWeight: '500',
    fontSize: scale(11),
    textAlign: 'center',
    maxWidth: scale(70),
  },
  categoryTitleActive: {
    color: '#000000',
    fontWeight: '700',
  },

  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  listHorizontal: {
    paddingHorizontal: RESPONSIVE_PADDING.lg,
  },
});
