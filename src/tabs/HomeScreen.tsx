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
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProductCard from '../component/ProductCard';
import ProductCardSkeleton from '../component/ProductCardSkeleton';
import { CategoryCard } from '../component/CategoryCard';
import MainHeader from '../component/MainHeader';
import { scale, verticalScale, RESPONSIVE_PADDING, HORIZONTAL_PADDING } from '../utils/responsive';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const HOME_BANNERS = [
  { id: 1, image: 'https://loremflickr.com/400/300/fashion?lock=20', tag: 'NEW SEASON', title: 'Fashion that\nspeaks for you' },
  { id: 2, image: 'https://loremflickr.com/400/300/fashion?lock=21', tag: 'SUMMER SALE', title: 'Up to 50%\noff selected items' },
  { id: 3, image: 'https://loremflickr.com/400/300/fashion?lock=22', tag: 'EXCLUSIVE', title: 'Premium\nCollection' },
];

const categories = [
  { id: 1, name: 'Women', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&auto=format&fit=crop' },
  { id: 2, name: 'Men', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop' },
  { id: 3, name: 'Accessories', image: 'https://loremflickr.com/260/320/fashion?lock=7' },
];

const popularProducts = [
  {
    id: 1,
    name: "Women's Dress",
    price: '₹1,499',
    oldPrice: '₹1,899',
    discount: '20% OFF',
    image: 'https://loremflickr.com/250/350/fashion?lock=1',
    rating: 4.5,
    reviews: 128,
    inStock: true,
  },
  {
    id: 2,
    name: "Men's Shirt",
    price: '₹999',
    image: 'https://loremflickr.com/250/350/fashion?lock=2',
    rating: 4,
    reviews: 85,
    inStock: true,
  },
  {
    id: 3,
    name: "Women's Saree",
    price: '₹2,499',
    image: 'https://loremflickr.com/250/350/fashion?lock=3',
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
    image: 'https://loremflickr.com/250/350/fashion?lock=4',
    rating: 4.5,
    reviews: 92,
    inStock: true,
  },
];


const HomeScreen = () => {
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const handleBannerScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
    if (slide !== activeBannerIndex) {
      setActiveBannerIndex(slide);
    }
  };

  React.useEffect(() => {
    // Simulate real-time fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);


  return (
    <View style={styles.container}>

      <MainHeader onSearchPress={() => setSearchModalVisible(true)} />

      {/* Scrollable Content */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>

        {/* Swipable Banner */}
        <View style={styles.bannerWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleBannerScroll}
            scrollEventThrottle={16}
            style={{ width }}
          >
            {HOME_BANNERS.map((banner) => (
              <View key={banner.id} style={{ width }}>
                <ImageBackground
                  source={{ uri: banner.image }}
                  style={styles.banner}
                  imageStyle={styles.bannerImage}
                >
                  <View style={styles.bannerOverlay}>
                    <Text style={styles.bannerTag}>{banner.tag}</Text>
                    <Text style={styles.bannerTitle}>{banner.title}</Text>
                    <TouchableOpacity style={styles.shopButton}>
                      <Text style={styles.shopButtonText}>Shop now</Text>
                      <Ionicons name="arrow-forward" size={14} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
              </View>
            ))}
          </ScrollView>

          <View style={styles.bannerDots}>
            {HOME_BANNERS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeBannerIndex === index && styles.activeDot
                ]}
              />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by category</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: HORIZONTAL_PADDING,
            paddingRight: HORIZONTAL_PADDING,
          }}
        >
          {categories.map(cat => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onPress={() =>
                navigation.navigate('ProductsTab', {
                  categoryId: cat.id,
                })
              }
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
          data={isLoading ? [1, 2, 3, 4] as any[] : popularProducts}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => (isLoading ? item.toString() : item.id.toString())}
          contentContainerStyle={{ paddingLeft: HORIZONTAL_PADDING, paddingRight: HORIZONTAL_PADDING }}
          renderItem={({ item }) => (
            isLoading ? <ProductCardSkeleton /> : <ProductCard item={item as any} onPress={() => console.log(item.name)} />
          )}
          scrollEventThrottle={16}
          decelerationRate="fast"
        />
      </ScrollView>


      <Modal
        visible={searchModalVisible}
        animationType="slide"
        transparent={false}
        statusBarTranslucent={true}
      >
        <View style={[styles.searchModalContainer, { paddingTop: Math.max(insets.top, verticalScale(12)) }]}>
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
    paddingBottom: verticalScale(16),
    borderBottomLeftRadius: scale(24),
    borderBottomRightRadius: scale(24),

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
  },

  headerLeft: {
    flex: 1,
  },

  greeting: {
    fontSize: scale(12),
    color: '#888',
    marginBottom: 2,
  },

  brandName: {
    fontSize: scale(28),
    fontWeight: '800',
    color: '#111',
    letterSpacing: 2,
  },

  subTitle: {
    fontSize: scale(12),
    color: '#777',
    marginTop: 2,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIcon: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(21),
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(10),
  },

  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },

  profileContainer: {
    marginLeft: scale(12),
  },

  profileImage: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(21),
    borderWidth: 2,
    borderColor: '#111',
  },

  searchBar: {
    marginTop: verticalScale(18),
    marginHorizontal: HORIZONTAL_PADDING,
    backgroundColor: '#F6F6F6',
    height: scale(52),
    borderRadius: scale(16),

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: scale(16),

    borderWidth: 1,
    borderColor: '#ECECEC',
  },

  searchPlaceholder: {
    marginLeft: scale(12),
    color: '#999',
    fontSize: scale(14),
  },
  scrollContent: {
    flex: 1,
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

  
  searchModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: verticalScale(12)
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

  bannerWrapper: {
    position: 'relative',
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
  bannerDots: {
    position: 'absolute',
    bottom: verticalScale(10),
    flexDirection: 'row',
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  dot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginHorizontal: scale(4),
  },
  activeDot: {
    backgroundColor: '#0A0A0A',
    width: scale(16),
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
