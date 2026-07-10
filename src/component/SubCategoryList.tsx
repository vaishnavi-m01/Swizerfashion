import React from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  View,
} from 'react-native';
import { scale, verticalScale } from '../utils/responsive';
import { IMAGE_BASE_URL } from '../api/apiBaseUrl';

type Item = {
  id: number;
  name: string;
  image?: string;
  [key: string]: any;
};

type Props = {
  data: Item[];
  activeItemId?: number | null;
  onItemPress: (item: Item) => void;
};

const SubCategoryList: React.FC<Props> = ({
  data,
  activeItemId,
  onItemPress,
}) => {

  const renderItem = ({ item }: { item: Item }) => {
    const isActive = activeItemId === item.id;
    const imageUrl = item.image 
      ? (item.image.startsWith('http') ? item.image : `${IMAGE_BASE_URL}${item.image}`) 
      : `https://loremflickr.com/300/300/fashion?lock=${item.id}`;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.itemContainer, isActive && styles.activeContainer]}
        onPress={() => onItemPress(item)}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
        />
        
        <View style={styles.textOverlay}>
          <Text
            numberOfLines={2}
            style={[styles.title, isActive && styles.activeTitle]}
          >
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default SubCategoryList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  listContent: {
    paddingHorizontal: scale(10),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(25),
  },

  itemContainer: {
    width: '46%',
    marginHorizontal: '2%',
    marginBottom: verticalScale(16),
    height: scale(120),
    backgroundColor: '#F3F4F6',
    borderRadius: scale(12),
    overflow: 'hidden',
  },

  activeContainer: {
    borderWidth: 2,
    borderColor: '#0A0A0A',
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)', // Elegant neat dark strip at bottom
    paddingVertical: scale(8),
    paddingHorizontal: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: scale(12),
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  activeTitle: {
    fontWeight: '800',
  },
});