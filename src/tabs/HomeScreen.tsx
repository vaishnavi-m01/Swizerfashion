import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ImageBackground,
  Modal,
  Dimensions,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProductCard from '../component/ProductCard';
import ProductCardSkeleton from '../component/ProductCardSkeleton';
import { CategoryCard } from '../component/CategoryCard';
import BestSellingCard from '../component/BestSellingCard';
import MainHeader from '../component/MainHeader';
import { scale, verticalScale, RESPONSIVE_PADDING, HORIZONTAL_PADDING } from '../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppSelector } from '../store/hooks';
import api from '../config/apiConfig';
import { IMAGE_BASE_URL } from '../api/apiBaseUrl';

const { width } = Dimensions.get('window');







const HomeScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiCategories, setApiCategories] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [bestSelling, setBestSelling] = useState<any[]>([]);
  const [sliders, setSliders] = useState<any[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<any>(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn);
  const user = useAppSelector(state => state.auth.user);
  const wishlistUpdateTrigger = useAppSelector(state => state.wishlist.wishlistUpdateTrigger);

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const bannerIndexRef = useRef(0);

  const handleBannerScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
    if (slide !== activeBannerIndex) {
      setActiveBannerIndex(slide);
      bannerIndexRef.current = slide;
    }
  };

  // Auto-scroll banner every 3 seconds
  useEffect(() => {
    if (sliders.length < 2) return;
    const timer = setInterval(() => {
      const nextIndex = (bannerIndexRef.current + 1) % sliders.length;
      bannerScrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      bannerIndexRef.current = nextIndex;
      setActiveBannerIndex(nextIndex);
    }, 3000);
    return () => clearInterval(timer);
  }, [sliders]);



 
  // fetchAll — called on mount AND on pull-to-refresh
  const fetchAll = useCallback(async (isPullRefresh = false) => {
    if (!isPullRefresh) setIsLoading(true);
    try {
      const [categoriesRes, slidersRes, arrivalsRes, bestRes] = await Promise.all([
        api.get('/categories'),
        api.get('/sliders'),
        api.get('/new-arrivals'),
        api.get('/best-selling'),
      ]);

      if (categoriesRes.data?.status && Array.isArray(categoriesRes.data?.data)) {
        setApiCategories(categoriesRes.data.data);
      }
      if (slidersRes.data?.status && slidersRes.data?.data) {
        setSliders(slidersRes.data.data);
      }
      if (arrivalsRes.data?.status && arrivalsRes.data?.data) {
        const mapped = arrivalsRes.data.data.map((variant: any) => {
          const imageUrl = variant.thumbnail
            ? (variant.thumbnail.startsWith('http') ? variant.thumbnail : `${IMAGE_BASE_URL}${variant.thumbnail}`)
            : `https://loremflickr.com/250/350/fashion?lock=${variant.id}`;
          return {
            id: variant.id,
            product_id: variant.product_id,
            variant_id: variant.id,
            color_id: variant.color_id ?? null,
            size_id: variant.size_id ?? null,
            name: variant.product?.name || 'Product',
            image: imageUrl,
            price: `₹${parseFloat(variant.discount_price || variant.price).toFixed(0)}`,
            oldPrice: variant.discount_price ? `₹${parseFloat(variant.price).toFixed(0)}` : undefined,
            discount: variant.discount_percentage ? `${variant.discount_percentage}% OFF` : undefined,
            inStock: variant.stock > 0,
            is_wishlisted: Number(variant.is_wishlisted) === 1,
          };
        });
        setNewArrivals(mapped);
      }
      if (bestRes.data?.status && Array.isArray(bestRes.data?.data)) {
        const mapped = bestRes.data.data.map((variant: any) => {
          const imageUrl = variant.thumbnail
            ? (variant.thumbnail.startsWith('http') ? variant.thumbnail : `${IMAGE_BASE_URL}${variant.thumbnail}`)
            : `https://loremflickr.com/250/350/fashion?lock=${variant.id}`;
          return {
            id: variant.id,
            product_id: variant.product_id,
            variant_id: variant.id,
            color_id: variant.color_id ?? null,
            size_id: variant.size_id ?? null,
            name: variant.product?.name || 'Product',
            image: imageUrl,
            price: `₹${parseFloat(variant.discount_price || variant.price).toFixed(0)}`,
            oldPrice: variant.discount_price ? `₹${parseFloat(variant.price).toFixed(0)}` : undefined,
            discount: variant.discount_percentage ? `${variant.discount_percentage}% OFF` : undefined,
            inStock: variant.stock > 0,
            is_wishlisted: Number(variant.is_wishlisted) === 1,
          };
        });
        setBestSelling(mapped);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [wishlistUpdateTrigger]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAll(true);
  }, [fetchAll]);


  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn && user?.id) {
        api.get(`/address?user_id=${user.id}`).then(res => {
          if (res.data?.status && res.data?.data && res.data.data.length > 0) {
            setDefaultAddress(res.data.data[0]);
          } else {
            setDefaultAddress(null);
          }
        }).catch(err => {
          console.log('Error fetching address in home:', err);
        });
      } else {
        setDefaultAddress(null);
      }
    }, [isLoggedIn, user])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      
      {isLoggedIn && defaultAddress && (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.addressBarContainer}>
          <View style={styles.addressBarLeft}>
            <Ionicons name="location-sharp" size={scale(16)} color="#000" />
            <Text style={styles.addressBarName} numberOfLines={1}>{user?.name || defaultAddress.name}</Text>
            <Text style={styles.addressBarText} numberOfLines={1}>
               | {defaultAddress.address}, {defaultAddress.city} {defaultAddress.pincode}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('DeliveryAddress')}>
            <Text style={styles.addressBarChangeText}>Change</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <MainHeader onSearchPress={() => navigation.navigate('SearchScreen')} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: verticalScale(20) }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0A0A0A']}
            tintColor="#0A0A0A"
          />
        }
      >

        {/* Swipable Banner */}
        <View style={styles.bannerWrapper}>
          <ScrollView
            ref={bannerScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleBannerScroll}
            scrollEventThrottle={16}
            style={{ width }}
          >
            {sliders.map((slider) => {
              const imageUrl = slider.image?.startsWith('http')
                ? slider.image
                : `${IMAGE_BASE_URL}${slider.image}`;
              return (
                <View key={slider.id} style={{ width }}>
                  <ImageBackground
                    source={{ uri: imageUrl }}
                    style={styles.banner}
                    imageStyle={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                  >
                    {(slider.title || slider.subtitle || slider.button_text) ? (
                      <View style={styles.bannerOverlay}>
                        {slider.title ? <Text style={styles.bannerTag}>{slider.title}</Text> : null}
                        {slider.subtitle ? <Text style={styles.bannerTitle}>{slider.subtitle}</Text> : null}
                        {slider.button_text ? (
                          <TouchableOpacity style={styles.shopButton}>
                            <Text style={styles.shopButtonText}>{slider.button_text}</Text>
                            <Ionicons name="arrow-forward" size={14} color="#FFF" />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    ) : null}

                  </ImageBackground>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.bannerDots}>
            {sliders.map((_, dotIndex) => (
              <View
                key={dotIndex}
                style={[
                  styles.dot,
                  activeBannerIndex === dotIndex && { backgroundColor: '#000000', width: scale(18) }
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
          {apiCategories.map(cat => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onPress={() =>
                navigation.navigate('ProductsTab', {
                  mainCategoryId: cat.id,
                })
              }
            />
          ))}
        </ScrollView>

        {/* New Arrivals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Arrivals</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: HORIZONTAL_PADDING, paddingRight: HORIZONTAL_PADDING }}
        >
          {(isLoading ? [1, 2, 3, 4] : newArrivals).map((item: any, index: number) => (
            <View key={isLoading ? index : item.id}>
              {isLoading ? (
                <ProductCardSkeleton />
              ) : (
                <ProductCard item={item} onPress={() => console.log(item.name)} />
              )}
            </View>
          ))}
        </ScrollView>

        {/* Best Selling */}
        <View style={[styles.sectionHeader, { marginTop: verticalScale(16) }]}>
          <Text style={styles.sectionTitle}>Best Selling</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: HORIZONTAL_PADDING, paddingRight: HORIZONTAL_PADDING, paddingBottom: verticalScale(24) }}
        >
          {(isLoading ? [1, 2, 3, 4] : bestSelling).map((item: any, index: number) => (
            <View key={isLoading ? index : item.id}>
              {isLoading ? (
                <View style={{ width: 280, marginRight: 12 }}>
                  <ProductCardSkeleton />
                </View>
              ) : (
                <BestSellingCard item={item} index={index} />
              )}
            </View>
          ))}
        </ScrollView>
      </ScrollView>

    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
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
    width: width,
    height: scale(220),
    backgroundColor: '#F0F0F0',
    marginBottom: verticalScale(8),
  },
  bannerDots: {
    position: 'absolute',
    bottom: verticalScale(16),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: scale(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 2,
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HORIZONTAL_PADDING,
    justifyContent: 'space-between',
    paddingBottom: verticalScale(24),
  },
  gridItem: {
    width: '48%',
    marginBottom: verticalScale(16),
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

  addressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: verticalScale(8),
    backgroundColor: '#F5F9FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E8F5',
  },

  addressBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: scale(10),
  },

  addressBarName: {
    fontSize: scale(11),
    fontWeight: '700',
    color: '#111',
    marginLeft: scale(4),
    flexShrink: 0,
  },

  addressBarText: {
    fontSize: scale(11),
    color: '#555',
    flex: 1,
  },

  addressBarChangeText: {
    fontSize: scale(11),
    fontWeight: '700',
    color: '#007185',
  },
});

