import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Share,
    Modal,
    FlatList,
    ToastAndroid,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { scale, verticalScale, moderateScale, HORIZONTAL_PADDING } from '../utils/responsive';
import ProductCardSkeleton from '../component/ProductCardSkeleton';
import ProductCard from '../component/ProductCard';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchWishlistAsync, removeFromWishlistAsync, addToWishlistAsync } from '../store/slices/wishlistSlice';
import { setCartCount } from '../store/slices/cartSlice';
import api from '../config/apiConfig';
import { IMAGE_BASE_URL } from '../api/apiBaseUrl';
import { defineAnimation } from 'react-native-reanimated';
import RNShare from 'react-native-share';
const { width } = Dimensions.get('window');
export type ColorVariant = {
    id: number;
    colorName: string;
    colorHex: string;
    image: string;
    price: string;
};
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
const ProductDetails = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const dispatch = useAppDispatch();
    const wishlistItems = useAppSelector(state => state.wishlist.items);
    const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn);
    const userId = useAppSelector(state => state.auth.userId);
    const wishlistUpdateTrigger = useAppSelector(state => state.wishlist.wishlistUpdateTrigger);
    const [apiProduct, setApiProduct] = useState<any>(null);
    const [apiVariants, setApiVariants] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isBuyingNow, setIsBuyingNow] = useState(false);

    let product: any = null;

    if (apiProduct) {
        const sizesMap = new Map();
        const colorsMap = new Map();
        apiVariants.forEach(v => {
            if (v.size && v.size.name) sizesMap.set(v.size.name, v.size);
            if (v.color && v.color.name) colorsMap.set(v.color.name, v.color);
        });
        if (apiProduct.size) sizesMap.set(apiProduct.size.name, apiProduct.size);
        if (apiProduct.color) colorsMap.set(apiProduct.color.name, apiProduct.color);
        const sizes = Array.from(sizesMap.values()).map(sizeObj => ({ id: sizeObj.id, name: sizeObj.name }));
        const colorVariants = Array.from(colorsMap.values()).map(colorObj => {
            const matchingVariant = apiVariants.find(v => v.color?.id === colorObj.id && v.thumbnail) || (apiProduct.color?.id === colorObj.id ? apiProduct : null);
            const thumbnail = matchingVariant?.thumbnail ? (matchingVariant.thumbnail.startsWith('http') ? matchingVariant.thumbnail : `${IMAGE_BASE_URL}${matchingVariant.thumbnail}`) : `https://loremflickr.com/250/350/fashion?lock=${colorObj.id}`;
            const price = matchingVariant ? `₹${parseFloat(matchingVariant.discount_price || matchingVariant.price).toFixed(0)}` : `₹${parseFloat(apiProduct.discount_price || apiProduct.price).toFixed(0)}`;
            return {
                id: colorObj.id,
                colorHex: colorObj.code || '#000',
                colorName: colorObj.name,
                image: thumbnail,
                price: price,
            };
        });
        const detailImages = apiProduct.detail?.images || [];
        const variantImages = apiProduct.images || [];
        let images = [...variantImages, ...detailImages].map((img: any) => img.image ? (img.image.startsWith('http') ? img.image : `${IMAGE_BASE_URL}${img.image}`) : null).filter(Boolean);
        if (images.length === 0) {
            images = [
                apiProduct.thumbnail ? (apiProduct.thumbnail.startsWith('http') ? apiProduct.thumbnail : `${IMAGE_BASE_URL}${apiProduct.thumbnail}`) : `https://loremflickr.com/250/350/fashion?lock=${apiProduct.id}`
            ];
        }
        const price = `₹${parseFloat(apiProduct.discount_price || apiProduct.price).toFixed(0)}`;
        const oldPrice = apiProduct.discount_price ? `₹${parseFloat(apiProduct.price).toFixed(0)}` : undefined;
        const discount = apiProduct.discount_percentage ? `${Math.round(parseFloat(apiProduct.discount_percentage))}% OFF` : undefined;
        product = {
            id: apiProduct.id,
            product_id: apiProduct.product_id,
            variant_id: apiProduct.id,
            // The variant object doesn't have its own name — it lives inside detail
            name: apiProduct.detail?.name || apiProduct.name || 'Product',
            image: apiProduct.thumbnail ? (apiProduct.thumbnail.startsWith('http') ? apiProduct.thumbnail : `${IMAGE_BASE_URL}${apiProduct.thumbnail}`) : `https://loremflickr.com/250/350/fashion?lock=${apiProduct.id}`,
            price: price,
            oldPrice: oldPrice,
            discount: discount,
            // Description and GST also live inside the nested detail object
            description: apiProduct.detail?.description || apiProduct.description || '',
            category: "Apparel",
            rating: apiProduct.avg_rating || 4.5,
            sizes: sizes,
            colorVariants: colorVariants,
            images: images,
            isNew: true,
            // stock is returned as a string from API — parse it before comparing
            inStock: parseInt(apiProduct.stock, 10) > 0,
            gst: apiProduct.detail?.gst ? parseFloat(apiProduct.detail.gst) : (apiProduct.gst ? parseFloat(apiProduct.gst) : 0),
        };
    }

    const insets = useSafeAreaInsets();

    let defaultVariant: ColorVariant | null = null;
    let defaultSize: any = null;

    if (product && apiVariants.length > 0) {
        const initialVariantId = route.params?.variant_id || route.params?.id || apiProduct?.id;
        if (initialVariantId) {
            const matchedApiVariant = apiVariants.find(v => String(v.id) === String(initialVariantId));
            if (matchedApiVariant) {
                if (matchedApiVariant.color) {
                    defaultVariant = product.colorVariants.find((cv: any) => cv.id === matchedApiVariant.color.id) || null;
                }
                if (matchedApiVariant.size) {
                    defaultSize = product.sizes.find((s: any) => s.id === matchedApiVariant.size.id) || null;
                }
            }
        }
    }

    const firstVariant: ColorVariant | null = product?.colorVariants && product.colorVariants.length > 0 ? product.colorVariants[0] : null;

    const [selectedVariant, setSelectedVariant] = useState<ColorVariant | null>(null);
    const [selectedSize, setSelectedSize] = useState<any>(null);

    // activeVariant / activeSize MUST be defined before anything that depends on them
    const activeVariant = selectedVariant || defaultVariant || firstVariant;
    const activeSize = selectedSize || defaultSize || (product?.sizes && product.sizes.length > 0 ? product.sizes[0] : null);

    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [isImageModalVisible, setImageModalVisible] = useState(false);
    const [initialModalIndex, setInitialModalIndex] = useState(0);
    const modalScrollRef = useRef<ScrollView>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                if (!apiProduct) {
                    setIsLoading(true);
                }
                const id = route.params?.product?.id || route.params?.id;
                if (!id) return;
                const response = await api.get(`/products/${id}`);
                if (response.data?.status && response.data?.data) {
                    setApiProduct(response.data.data.product);
                    setApiVariants(response.data.data.variants || []);
                }
            } catch (error) {
                console.error('Error fetching product details:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProductDetails();
    }, [route.params?.product?.id, route.params?.id, wishlistUpdateTrigger]);

    const onRefresh = () => {
        setRefreshing(true);
        const id = route.params?.product?.id || route.params?.id;
        if (!id) { setRefreshing(false); return; }
        api.get(`/products/${id}`).then(response => {
            if (response.data?.status && response.data?.data) {
                setApiProduct(response.data.data.product);
                setApiVariants(response.data.data.variants || []);
            }
        }).catch(err => console.error('Refresh error:', err))
          .finally(() => setRefreshing(false));
    };

    // Resolves the full API variant object matching the currently active color+size
    // Defined ONCE, right after activeVariant/activeSize are available.
    const getSelectedApiVariant = () => {
        if (activeVariant) {
            // 1. Exact match: same color + same size
            const matchedFull = apiVariants?.find(
                v =>
                    v.color?.id === activeVariant.id &&
                    (!activeSize || v.size?.id === activeSize.id)
            );
            if (matchedFull) return matchedFull;
            // 2. Color-only match (size combo not present)
            const matchedColorOnly = apiVariants?.find(v => v.color?.id === activeVariant.id);
            if (matchedColorOnly) return matchedColorOnly;
            // 3. The originally loaded apiProduct itself might BE this color
            if (apiProduct?.color?.id === activeVariant.id) return apiProduct;
        }
        // No variant selected — fall back to the originally loaded product
        return apiProduct;
    };

    // Single declaration — used by cart / checkout / share / wishlist
    const getSelectedVariantId = () => {
        return getSelectedApiVariant()?.id ?? apiProduct?.id;
    };

    // Now safe to compute — everything it depends on is already defined above
    const selectedApiVariant = product ? getSelectedApiVariant() : null;
    const inWishlist = selectedApiVariant
        ? (selectedApiVariant.is_wishlisted === '1' || selectedApiVariant.is_wishlisted === 1)
        : false;

    if (isLoading || !product) {
        return (
            <View style={[styles.container, { paddingTop: insets.top, paddingHorizontal: moderateScale(16) }]}>
                <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            </View>
        );
    }

    const handleScroll = (event: any) => {
        const slide = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
        if (slide !== activeImageIndex) {
            setActiveImageIndex(slide);
        }
    };

    // When a colour variant is selected, show that colour's images from the API variants list.
    // Fall back to the default loaded product images when no colour-specific images exist.
    const getActiveVariantImages = (): string[] => {
        if (activeVariant) {
            // Find any api variant for this colour that has images
            const colorVariantWithImages = apiVariants.find(
                v => v.color?.id === activeVariant.id && v.images && v.images.length > 0
            );
            if (colorVariantWithImages && colorVariantWithImages.images.length > 0) {
                return colorVariantWithImages.images
                    .map((img: any) =>
                        img.image
                            ? img.image.startsWith('http')
                                ? img.image
                                : `${IMAGE_BASE_URL}${img.image}`
                            : null
                    )
                    .filter(Boolean) as string[];
            }
        }
        return product.images || [];
    };
    const displayImage = activeVariant ? activeVariant.image : product.image;
    const activeVariantImages = getActiveVariantImages();
    // Build carousel: start with the colour thumbnail, then the rest of that colour's images
    const carouselImages = [
        displayImage,
        ...activeVariantImages.filter((img: string) => img !== displayImage),
    ];

    let displayPrice = activeVariant ? activeVariant.price : product.price;
    if (!displayPrice) displayPrice = product.price;

    const formattedPrice = typeof displayPrice === 'string' ? displayPrice.replace(/[^0-9.]/g, '') : displayPrice;
    const variantKey = activeVariant ? activeVariant.colorName : 'default';
    const currentQuantity = quantities[variantKey] || 1;

    const incrementQty = () => {
        setQuantities(prev => ({ ...prev, [variantKey]: (prev[variantKey] || 1) + 1 }));
    };

    const decrementQty = () => {
        setQuantities(prev => {
            const current = prev[variantKey] || 1;
            return { ...prev, [variantKey]: current > 1 ? current - 1 : 1 };
        });
    };

    const handleAddToCart = async () => {
        if (!isLoggedIn) {
            navigation.navigate('Login');
            return;
        }
        setIsAddingToCart(true);
        try {
            const variant_id = getSelectedVariantId();
            const response = await api.post('/cart/add', {
                user_id: userId ?? 0,
                product_id: product.product_id,
                variant_id: variant_id,
                quantity: currentQuantity,
                size_id: activeSize?.id,
                color_id: activeVariant?.id,
            });
            if (response.data.data?.cart_count !== undefined) {
                dispatch(setCartCount(response.data.data.cart_count));
            }
            ToastAndroid.show("Added to cart", ToastAndroid.SHORT);
            navigation.navigate('MainTabs', {
                screen: 'CartTab',
                params: { addedAt: Date.now() },
            });
        } catch (error) {
            console.log('Add To Cart Error:', error);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleBuyNow = () => {
        if (!isLoggedIn) {
            navigation.navigate('Login');
            return;
        }
        setIsBuyingNow(true);
        const variant_id = getSelectedVariantId();
        navigation.navigate("CheckOutScreen", {
            buyNow: true,
            product_id: product.product_id ?? product.id,
            variant_id: variant_id,
            quantity: currentQuantity,
            selectedSize: activeSize,
            selectedColor: activeVariant,
            price: formattedPrice,
            productName: product.name,
            productImage: displayImage,
            gstPercent: product.gst,
        });
        // Reset after navigation queued
        setTimeout(() => setIsBuyingNow(false), 800);
    };

    const handleShare = async () => {
        try {
            const variantId = getSelectedVariantId();
            const webLink = `https://www.swizerfashion.com/products/detail/${variantId}`;
            const message = `${product.name}\n\nPrice: ₹${formattedPrice}\nRating: ⭐ ${product.rating}\n\nCheck it out on Swizer Fashion:\n${webLink}`;
            const shareOptions: any = {
                title: product.name,
                message: message,
            };
            if (displayImage) {
                shareOptions.url = displayImage;
            }
            await RNShare.open(shareOptions);
        } catch (error: any) {
            if (error?.message !== 'User did not share') {
                console.log('Share error:', error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            {/* Detail Header */}
            <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + verticalScale(8) : verticalScale(14), paddingBottom: verticalScale(12) }]}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={moderateScale(24)} color="#0A0A0A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
                <View style={{ width: moderateScale(36) }} />
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#0A0A0A']}
                        tintColor="#0A0A0A"
                    />
                }
            >
                {/* Large Product Image Gallery */}
                <View style={styles.galleryWrapper}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        style={styles.imageContainer}
                    >
                        {carouselImages.map((img: string, index: number) => (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.9}
                                style={{ width: width, height: '100%' }}
                                onPress={() => {
                                    setInitialModalIndex(index);
                                    setImageModalVisible(true);
                                }}
                            >
                                <Image source={{ uri: img }} style={styles.productImage} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    {/* Pagination Dots */}
                    <View style={styles.paginationDots}>
                        {carouselImages.map((_, index) => (
                            <View key={index} style={[styles.dot, activeImageIndex === index && styles.activeDot]} />
                        ))}
                    </View>
                    {/* Wishlist Button */}
                    <TouchableOpacity
                        style={styles.floatingWishlistBtn}
                        onPress={() => {
                            if (!isLoggedIn) {
                                navigation.navigate('Register');
                                return;
                            }
                            const bestVariantId = getSelectedVariantId();
                            const wishlistPayload = {
                                product_id: product?.product_id ?? product?.id,
                                variant_id: bestVariantId,
                                product: {
                                    ...product,
                                    image: displayImage,
                                    price: displayPrice,
                                    colorName: activeVariant?.colorName,
                                    colorHex: activeVariant?.colorHex,
                                },
                            };
                            if (inWishlist) {
                                dispatch(removeFromWishlistAsync(wishlistPayload) as any).then(() => {
                                    ToastAndroid.show("Removed from wishlist", ToastAndroid.SHORT);
                                });
                            } else {
                                dispatch(addToWishlistAsync(wishlistPayload) as any).then(() => {
                                    ToastAndroid.show("Added to wishlist", ToastAndroid.SHORT);
                                });
                            }
                        }}
                    >
                        <Ionicons name={inWishlist ? "heart" : "heart-outline"} size={moderateScale(20)} color={inWishlist ? "#E84C3D" : "#0A0A0A"} />
                    </TouchableOpacity>
                    {/* Share Button */}
                    <TouchableOpacity style={styles.floatingShareBtn} onPress={handleShare}>
                        <Entypo name="share" color="#0A0A0A" size={moderateScale(18)} />
                    </TouchableOpacity>
                </View>
                {/* Details Section */}
                <View style={styles.detailsContainer}>
                    <View style={styles.metaRow}>
                        <Text style={styles.category}>{product.category}</Text>
                        <View style={styles.ratingBox}>
                            <Ionicons name="star" size={moderateScale(14)} color="#FFC107" />
                            <Text style={styles.ratingVal}>{product.rating}</Text>
                            <Text style={styles.ratingReviews}>({product.reviews || 48} reviews)</Text>
                        </View>
                    </View>
                    <Text style={styles.name}>{product.name}</Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'center' }}>
                        <Text style={styles.price}>₹{formattedPrice}</Text>
                        <View style={styles.qtyControlsInline}>
                            <TouchableOpacity style={styles.qtyBtnInline} onPress={decrementQty}>
                                <Ionicons name="remove" size={moderateScale(16)} color="#0A0A0A" />
                            </TouchableOpacity>
                            <Text style={styles.qtyValInline}>{currentQuantity}</Text>
                            <TouchableOpacity style={styles.qtyBtnInline} onPress={incrementQty}>
                                <Ionicons name="add" size={moderateScale(16)} color="#0A0A0A" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    {/* Color Selector */}
                    {product.colorVariants && product.colorVariants.length > 0 && (
                        <>
                            <View style={styles.variantHeaderRow}>
                                <Text style={styles.sectionHeading}>Select Colour</Text>
                                <View style={[styles.selectedColorDot, { backgroundColor: activeVariant?.colorHex || '#ccc' }]} />
                                <Text style={styles.selectedVariantName}>{activeVariant?.colorName}</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.variantsRow}>
                                {product.colorVariants.map((variant: ColorVariant) => {
                                    const isSelected = activeVariant?.colorHex === variant.colorHex;
                                    return (
                                        <TouchableOpacity
                                            key={variant.colorHex}
                                            style={[styles.variantCard, isSelected && styles.selectedVariantCard]}
                                            onPress={() => setSelectedVariant(variant)}
                                            activeOpacity={0.85}
                                        >
                                            <Image source={{ uri: variant.image }} style={styles.variantThumb} />
                                            {isSelected && (
                                                <View style={styles.variantCheckOverlay}>
                                                    <Ionicons name="checkmark-circle" size={moderateScale(20)} color="#fff" />
                                                </View>
                                            )}
                                            <View style={[styles.variantColorDot, { backgroundColor: variant.colorHex }]} />
                                            <Text style={styles.variantLabel} numberOfLines={1}>{variant.colorName}</Text>
                                            <Text style={styles.variantPrice}>{variant.price}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                            <View style={styles.divider} />
                        </>
                    )}
                    {/* Description */}
                    <Text style={styles.sectionHeading}>Product Description</Text>
                    <Text style={styles.description}>{product.description}</Text>
                    <View style={styles.divider} />
                    {/* Size Selector */}
                    <Text style={styles.sectionHeading}>Select Size</Text>
                    <View style={styles.sizesRow}>
                        {product.sizes.map((size: any) => (
                            <TouchableOpacity
                                key={size.id}
                                style={[styles.sizePill, activeSize?.id === size.id && styles.selectedSizePill]}
                                onPress={() => setSelectedSize(size)}
                            >
                                <Text style={[styles.sizeText, activeSize?.id === size.id && styles.selectedSizeText]}>
                                    {size.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.divider} />
                    {/* Delivery Card */}
                    <View style={styles.deliveryCard}>
                        <View style={styles.deliveryItem}>
                            <Ionicons name="bus-outline" size={moderateScale(20)} color="#0A0A0A" />
                            <Text style={styles.deliveryText}>Free delivery on orders above ₹1499</Text>
                        </View>
                        <View style={styles.deliveryItem}>
                            <Ionicons name="refresh-circle-outline" size={moderateScale(20)} color="#0A0A0A" />
                            <Text style={styles.deliveryText}>Easy 10-day exchange and returns policy</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <Text style={styles.sectionHeading}>You May Also Like</Text>
                    <FlatList
                        data={isLoading ? [1, 2, 3, 4] as any[] : popularProducts}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={item => (isLoading ? item.toString() : item.id.toString())}
                        contentContainerStyle={{ paddingLeft: HORIZONTAL_PADDING, paddingRight: HORIZONTAL_PADDING }}
                        renderItem={({ item }) => (
                            isLoading ? <ProductCardSkeleton /> : <ProductCard item={item as any} onPress={() => console.log(item.name)} />
                        )}
                    />
                </View>
            </ScrollView>
            {/* Footer Buttons */}
            <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : verticalScale(16) }]}>
                <TouchableOpacity
                    style={[styles.cartAddBtn, isAddingToCart && styles.processingBtn]}
                    onPress={handleAddToCart}
                    disabled={isAddingToCart || isBuyingNow}
                >
                    {isAddingToCart ? (
                        <ActivityIndicator size="small" color="#0A0A0A" style={{ marginRight: scale(6) }} />
                    ) : (
                        <Ionicons name="cart-outline" size={moderateScale(20)} color="#0A0A0A" style={{ marginRight: scale(6) }} />
                    )}
                    <Text style={styles.cartAddBtnText}>
                        {isAddingToCart ? 'Processing...' : 'Add to Cart'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.buyNowBtn, isBuyingNow && styles.processingBtnDark]}
                    onPress={handleBuyNow}
                    disabled={isAddingToCart || isBuyingNow}
                >
                    {isBuyingNow && (
                        <ActivityIndicator size="small" color="#FFF" style={{ marginRight: scale(6) }} />
                    )}
                    <Text style={styles.buyNowBtnText}>
                        {isBuyingNow ? 'Processing...' : 'Buy Now'}
                    </Text>
                </TouchableOpacity>
            </View>
            {/* Full Screen Image Modal */}
            <Modal
                visible={isImageModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setImageModalVisible(false)}
                onShow={() => {
                    modalScrollRef.current?.scrollTo({ x: initialModalIndex * width, animated: false });
                }}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={[styles.modalCloseBtn, { top: insets.top > 0 ? insets.top + verticalScale(10) : verticalScale(30) }]}
                        onPress={() => setImageModalVisible(false)}
                    >
                        <Ionicons name="close" size={moderateScale(32)} color="#fff" />
                    </TouchableOpacity>
                    <ScrollView
                        ref={modalScrollRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        style={{ width: '100%', height: '100%' }}
                    >
                        {carouselImages.map((img: string, index: number) => (
                            <View key={index} style={{ width: width, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                <Image source={{ uri: img }} style={styles.modalImage} resizeMode="contain" />
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
};
export default ProductDetails
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: scale(16), paddingVertical: verticalScale(12), borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: '#FFFFFF', zIndex: 10 },
    headerBtn: { width: moderateScale(36), height: moderateScale(36), borderRadius: moderateScale(18), backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: moderateScale(16), fontWeight: '800', color: '#0A0A0A', flex: 1, textAlign: 'center', marginHorizontal: scale(12) },
    scrollContent: { paddingBottom: verticalScale(40) },
    galleryWrapper: { position: 'relative' },
    imageContainer: { width: width, height: verticalScale(340), backgroundColor: '#f8f9fa' },
    paginationDots: { position: 'absolute', bottom: verticalScale(14), flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center' },
    dot: { width: scale(7), height: scale(7), borderRadius: scale(4), backgroundColor: 'rgba(0,0,0,0.25)', marginHorizontal: scale(4) },
    activeDot: { backgroundColor: '#000000', width: scale(20), height: scale(7), borderRadius: scale(4) },
    floatingWishlistBtn: { position: 'absolute', top: verticalScale(16), right: scale(16), width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(19), backgroundColor: 'rgba(255,255,255,0.95)', justifyContent: 'center', alignItems: 'center', elevation: 4 },
    floatingShareBtn: { position: 'absolute', top: verticalScale(16), left: scale(16), width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(19), backgroundColor: 'rgba(255,255,255,0.95)', justifyContent: 'center', alignItems: 'center', elevation: 4 },
    productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    detailsContainer: { padding: moderateScale(16) },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    category: { fontSize: moderateScale(12), color: '#0A0A0A', fontWeight: '800', textTransform: 'uppercase' },
    ratingBox: { flexDirection: 'row', alignItems: 'center' },
    ratingVal: { fontSize: moderateScale(12), fontWeight: '700', color: '#0A0A0A', marginLeft: scale(4) },
    ratingReviews: { fontSize: moderateScale(12), color: '#666', marginLeft: scale(4) },
    name: { fontSize: moderateScale(20), fontWeight: '700', color: '#0A0A0A', marginVertical: verticalScale(8) },
    price: { fontSize: moderateScale(22), fontWeight: '800', color: '#0A0A0A' },
    qtyControlsInline: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: moderateScale(20), padding: scale(4) },
    qtyBtnInline: { width: moderateScale(28), height: moderateScale(28), justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderRadius: moderateScale(14) },
    qtyValInline: { marginHorizontal: scale(12), fontWeight: '700', fontSize: moderateScale(14) },
    divider: { height: 1, backgroundColor: '#EFEFEF', marginVertical: verticalScale(16) },
    variantHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(10) },
    sectionHeading: { fontSize: moderateScale(16), fontWeight: '700', color: '#0A0A0A', marginBottom: verticalScale(8) },
    selectedColorDot: { width: scale(12), height: scale(12), borderRadius: scale(6), marginLeft: scale(8) },
    selectedVariantName: { fontSize: moderateScale(14), color: '#666', marginLeft: scale(6), fontWeight: '500' },
    variantsRow: { flexDirection: 'row' },
    variantCard: { width: scale(75), padding: scale(6), borderWidth: 1, borderColor: '#E0E0E0', borderRadius: moderateScale(8), marginRight: scale(10), alignItems: 'center', position: 'relative' },
    selectedVariantCard: { borderColor: '#000', borderWidth: 2 },
    variantThumb: { width: scale(60), height: verticalScale(70), borderRadius: moderateScale(6), marginBottom: scale(4) },
    variantCheckOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: moderateScale(8),
        height: verticalScale(82)
    }, variantColorDot: { width: scale(10), height: scale(10), borderRadius: scale(5), marginVertical: scale(2) },
    variantLabel: { fontSize: moderateScale(10), color: '#333' },
    variantPrice: { fontSize: moderateScale(11), fontWeight: '700' },
    description: { fontSize: moderateScale(14), color: '#444', lineHeight: verticalScale(20) },
    sizesRow: { flexDirection: 'row', flexWrap: 'wrap' },
    sizePill: { paddingHorizontal: scale(16), paddingVertical: verticalScale(8), borderWidth: 1, borderColor: '#E0E0E0', borderRadius: moderateScale(20), marginRight: scale(10), marginBottom: scale(10) },
    selectedSizePill: { backgroundColor: '#000', borderColor: '#000' },
    sizeText: { color: '#000', fontWeight: '600' },
    selectedSizeText: { color: '#FFF' },
    deliveryCard: { backgroundColor: '#F9F9F9', borderRadius: moderateScale(8), padding: scale(12) },
    deliveryItem: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(8) },
    deliveryText: { marginLeft: scale(8), fontSize: moderateScale(12), color: '#333' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', paddingHorizontal: scale(16), paddingTop: verticalScale(12), backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EFEFEF' },
    cartAddBtn: { flex: 1, flexDirection: 'row', height: verticalScale(48), borderWidth: 1, borderColor: '#000', borderRadius: moderateScale(8), justifyContent: 'center', alignItems: 'center', marginRight: scale(12) },
    cartAddBtnText: { fontWeight: '700', fontSize: moderateScale(14), color: '#000' },
    buyNowBtn: { flex: 1, flexDirection: 'row', height: verticalScale(48), backgroundColor: '#000', borderRadius: moderateScale(8), justifyContent: 'center', alignItems: 'center' },
    buyNowBtnText: { fontWeight: '700', fontSize: moderateScale(14), color: '#FFF' },
    processingBtn: { borderColor: '#999', opacity: 0.7 },
    processingBtnDark: { backgroundColor: '#555', opacity: 0.85 },
    modalContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
    modalCloseBtn: { position: 'absolute', right: scale(20), zIndex: 11 },
    modalImage: { width: width, height: '80%' }
});
