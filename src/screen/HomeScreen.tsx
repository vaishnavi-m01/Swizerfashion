import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  ImageBackground,
  FlatList,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProductCard from '../component/ProductCard';
import { CategoryCard, CategoriesList } from '../component/CategoryCard';
import { scale, verticalScale, RESPONSIVE_PADDING, HORIZONTAL_PADDING } from '../utils/responsive';

const categories = [
  { id: 1, name: 'Women', image: 'https://picsum.photos/260/320?5' },
  { id: 2, name: 'Men', image: 'https://picsum.photos/260/320?6' },
  { id: 3, name: 'Accessories', image: 'https://picsum.photos/260/320?7' },
];

const popularProducts = [
  {
    id: 1,
    name: "Women's Dress",
    price: '₹1,499',
    oldPrice: '₹1,899',
    discount: '20% OFF',
    image: 'https://picsum.photos/250/350?1',
    rating: 4.5,
    reviews: 128,
    inStock: true,
  },
  {
    id: 2,
    name: "Men's Shirt",
    price: '₹999',
    image: 'https://picsum.photos/250/350?2',
    rating: 4,
    reviews: 85,
    inStock: true,
  },
  {
    id: 3,
    name: "Women's Saree",
    price: '₹2,499',
    image: 'https://picsum.photos/250/350?3',
    rating: 5,
    reviews: 256,
    inStock: true,
  },
  {
    id: 4,
    name: "Men's T-Shirt",
    price: '₹799',
    oldPrice: '₹999',
    discount: '20% OFF',
    image: 'https://picsum.photos/250/350?4',
    rating: 4.5,
    reviews: 92,
    inStock: true,
  },
];

const HomeScreen = () => {
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent={true} />

      {/* Fixed Header */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Good evening</Text>
            <Text style={styles.logoText}>SWIZER</Text>
          </View>

          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Ionicons
                name="notifications-outline"
                size={scale(18)}
                color="#0A0A0A"
              />
              <View style={styles.badgeDot} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.avatarButton} activeOpacity={0.7}>
              <Image
                source={{ uri: 'https://picsum.photos/100/100?50' }}
                style={styles.avatarImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity 
          style={styles.searchBar}
          activeOpacity={0.7}
          onPress={() => setSearchModalVisible(true)}
        >
          <Ionicons
            name="search-outline"
            size={scale(16)}
            color="#999"
            style={{ marginRight: scale(10) }}
          />
          <Text style={styles.searchBarPlaceholder}>Search fashion...</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>

        {/* Banner */}
        <ImageBackground
          source={{ uri: 'https://picsum.photos/400/300?20' }}
          style={styles.banner}
          imageStyle={styles.bannerImage}
        >
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTag}>NEW SEASON</Text>
            <Text style={styles.bannerTitle}>
              Fashion that{'\n'}speaks for you
            </Text>
            <TouchableOpacity style={styles.shopButton}>
              <Text style={styles.shopButtonText}>Shop now</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by category</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: HORIZONTAL_PADDING, paddingRight: HORIZONTAL_PADDING }}
        >
          {categories.map(cat => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onPress={() => console.log(cat.name)}
            />
          ))}
        </ScrollView>

        {/* Trending */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending now</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={popularProducts}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingLeft: HORIZONTAL_PADDING, paddingRight: HORIZONTAL_PADDING }}
          renderItem={({ item }) => (
            <ProductCard item={item} onPress={() => console.log(item.name)} />
          )}
          scrollEventThrottle={16}
          decelerationRate="fast"
        />
      </ScrollView>

      {/* Search Modal */}
      <Modal
        visible={searchModalVisible}
        animationType="slide"
        transparent={false}
        statusBarTranslucent={true}
      >
        <View style={styles.searchModalContainer}>
          <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent={true} />
          
          {/* Search Modal Header */}
          <View style={styles.searchModalHeader}>
            <TouchableOpacity
              onPress={() => {
                setSearchModalVisible(false);
                setSearchQuery('');
              }}
              style={styles.searchBackButton}
            >
              <Ionicons name="arrow-back" size={scale(24)} color="#0A0A0A" />
            </TouchableOpacity>

            <View style={styles.searchModalInputContainer}>
              <Ionicons name="search-outline" size={scale(18)} color="#999" />
              <TextInput
                placeholder="Search fashion..."
                placeholderTextColor="#AAA"
                style={styles.searchModalInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={scale(18)} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Search Results */}
          <ScrollView style={styles.searchResultsContainer} showsVerticalScrollIndicator={false}>
            {searchQuery.length === 0 ? (
              <View style={styles.searchEmptyState}>
                <Ionicons name="search-outline" size={scale(60)} color="#DDD" />
                <Text style={styles.searchEmptyText}>Search for products</Text>
              </View>
            ) : (
              <View style={styles.searchResultsContent}>
                <Text style={styles.searchResultsTitle}>
                  Results for "{searchQuery}"
                </Text>
                {/* Add search results here */}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  headerWrapper: {
    backgroundColor: '#FFFFFF',
    paddingTop: verticalScale(10),
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 10,
  },

  scrollContent: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(12),
    backgroundColor: '#FFFFFF',
  },

  welcomeText: {
    fontSize: scale(10),
    color: '#999',
    letterSpacing: 0.4,
    fontWeight: '400',
    marginBottom: verticalScale(2),
  },

  logoText: {
    fontSize: scale(22),
    fontWeight: '800',
    color: '#0A0A0A',
    letterSpacing: 2.2,
  },

  headerIcons: {
    flexDirection: 'row',
  },

  iconButton: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(12),
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },

  badgeDot: {
    position: 'absolute',
    top: scale(6),
    right: scale(7),
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: '#E84C3D',
  },

  avatarButton: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    marginLeft: scale(12),
    borderWidth: 2,
    borderColor: '#0A0A0A',
    overflow: 'hidden',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  searchBar: {
    marginHorizontal: HORIZONTAL_PADDING,
    marginTop: verticalScale(12),
    marginBottom: verticalScale(12),
    backgroundColor: '#F5F5F5',
    borderRadius: scale(12),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(14),
    height: scale(42),
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },

  searchBarPlaceholder: {
    flex: 1,
    fontSize: scale(14),
    color: '#AAA',
    fontWeight: '400',
  },

  headerDivider: {
    height: 0,
    backgroundColor: 'transparent',
    marginHorizontal: 0,
    marginBottom: 0,
  },

  // Search Modal Styles
  searchModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(16),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  searchBackButton: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(21),
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchModalInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    backgroundColor: '#F5F5F5',
    borderRadius: scale(14),
    paddingHorizontal: scale(16),
    height: scale(50),
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },

  searchModalInput: {
    flex: 1,
    fontSize: scale(17),
    color: '#0A0A0A',
    fontWeight: '500',
  },

  searchResultsContainer: {
    flex: 1,
  },

  searchEmptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(60),
  },

  searchEmptyText: {
    fontSize: scale(16),
    color: '#AAA',
    fontWeight: '500',
    marginTop: verticalScale(16),
  },

  searchResultsContent: {
    padding: HORIZONTAL_PADDING,
  },

  searchResultsTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#0A0A0A',
    marginBottom: verticalScale(16),
  },

  banner: {
    marginHorizontal: HORIZONTAL_PADDING,
    height: scale(180),
    borderRadius: scale(14),
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: '#0A0A0A',
    marginBottom: verticalScale(24),
    marginTop: verticalScale(8),
  },

  bannerImage: {
    opacity: 0.5,
  },

  bannerOverlay: {
    padding: RESPONSIVE_PADDING.lg,
    paddingBottom: RESPONSIVE_PADDING.xl,
  },

  bannerTag: {
    color: '#E0E0E0',
    fontSize: scale(10),
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: verticalScale(6),
  },

  bannerTitle: {
    color: '#FFF',
    fontSize: scale(22),
    fontWeight: '700',
    lineHeight: scale(28),
    marginBottom: verticalScale(12),
  },

  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    backgroundColor: '#0A0A0A',
    paddingHorizontal: RESPONSIVE_PADDING.lg,
    paddingVertical: verticalScale(10),
    borderRadius: scale(22),
    alignSelf: 'flex-start',
  },

  shopButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: scale(13),
  },

  sectionHeader: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(14),
    marginHorizontal: HORIZONTAL_PADDING,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },

  sectionTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#0A0A0A',
  },

  seeAll: {
    color: '#777777',
    fontSize: scale(12),
    fontWeight: '500',
  },

  categoryCard: {
    width: scale(92),
    marginRight: RESPONSIVE_PADDING.lg,
    alignItems: 'center',
  },

  categoryImageRing: {
    width: scale(84),
    height: scale(84),
    borderRadius: scale(42),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: scale(42),
  },

  categoryTitle: {
    color: '#0A0A0A',
    fontWeight: '500',
    fontSize: scale(13),
    textAlign: 'center',
  },

  productCard: {
    width: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },

  productImageWrap: {
    position: 'relative',
    height: 190,
    backgroundColor: '#F0F0F0',
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#0A0A0A',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },

  favorite: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  productContent: {
    padding: 12,
  },

  productName: {
    fontSize: 13,
    fontWeight: '400',
    color: '#0A0A0A',
    marginBottom: 6,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },

  productPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A0A0A',
  },

  oldPrice: {
    fontSize: 12,
    color: '#AAAAAA',
    textDecorationLine: 'line-through',
  },
});
