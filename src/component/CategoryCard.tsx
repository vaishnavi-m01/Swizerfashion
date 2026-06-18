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
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  style,
}) => {
  const cardSize = scale(84);

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.categoryImageRing, { width: cardSize, height: cardSize, borderRadius: cardSize / 2 }]}>
        <Image
          source={{ uri: category.image }}
          style={styles.categoryImage}
        />
      </View>
      <Text style={styles.categoryTitle}>{category.name}</Text>
    </TouchableOpacity>
  );
};

interface CategoriesListProps {
  categories: Category[];
  onCategoryPress?: (category: Category) => void;
  horizontal?: boolean;
}

export const CategoriesList: React.FC<CategoriesListProps> = ({
  categories,
  onCategoryPress,
  horizontal = true,
}) => {
  return (
    <View
      style={[
        styles.listContainer,
        horizontal && styles.listHorizontal,
      ]}
    >
      {categories.map(cat => (
        <CategoryCard
          key={cat.id}
          category={cat}
          onPress={() => onCategoryPress?.(cat)}
        />
      ))}
    </View>
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
    marginBottom: verticalScale(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },

  categoryTitle: {
    color: '#0A0A0A',
    fontWeight: '500',
    fontSize: scale(13),
    textAlign: 'center',
    maxWidth: scale(92),
  },

  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  listHorizontal: {
    paddingHorizontal: RESPONSIVE_PADDING.lg,
  },
});
