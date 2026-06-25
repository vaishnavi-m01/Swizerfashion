import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/Colors';
import Entypo from 'react-native-vector-icons/Entypo';
import { scale, verticalScale, moderateScale, HORIZONTAL_PADDING } from '../utils/responsive';
import ProductCardSkeleton from '../component/ProductCardSkeleton';
import ProductCard from '../component/ProductCard';

import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';

const { width } = Dimensions.get('window');

// Local types for adaptation
export type ColorVariant = {
    colorName: string;
    colorHex: string;
    image: string;
    price: string;
};

const DUMMY_VARIANTS: ColorVariant[] = [
    { colorName: 'Black', colorHex: '#000000', image: 'https://loremflickr.com/400/500/fashion?lock=11', price: '799' },
    { colorName: 'White', colorHex: '#F5F5F5', image: 'https://loremflickr.com/400/500/fashion?lock=12', price: '799' },
    { colorName: 'Red', colorHex: '#D63031', image: 'https://loremflickr.com/400/500/fashion?lock=13', price: '799' },
];

const DUMMY_PRODUCT = {
    id: "1",
    name: "Premium Cotton T-Shirt",
    category: "Men's Apparel",
    rating: 4.5,
    price: "799",
    image: "https://loremflickr.com/400/500/fashion?lock=11",
    images: [
        "https://loremflickr.com/400/500/fashion?lock=14",
        "https://loremflickr.com/400/500/fashion?lock=15",
        "https://loremflickr.com/400/500/fashion?lock=16"
    ],
    isNew: true,
    description: "Experience premium comfort with our 100% cotton t-shirt. Designed for everyday wear, this piece offers a relaxed fit and highly breathable fabric that keeps you cool all day long.",
    sizes: ["S", "M", "L", "XL"],
    colorVariants: DUMMY_VARIANTS,
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

    // Use product from params if available and inject dummy variants if missing
    const paramProduct = route.params?.product;
    const product = paramProduct ? {
        ...paramProduct,
        category: paramProduct.category || "Apparel",
        rating: paramProduct.rating || 4.5,
        sizes: paramProduct.sizes || DUMMY_PRODUCT.sizes,
        colorVariants: paramProduct.colorVariants || DUMMY_VARIANTS,
        images: paramProduct.images || DUMMY_PRODUCT.images,
        description: paramProduct.description || DUMMY_PRODUCT.description,
        isNew: paramProduct.isNew !== undefined ? paramProduct.isNew : true,
    } : DUMMY_PRODUCT;

    const insets = useSafeAreaInsets();
    const inWishlist = wishlistItems.some((item: any) => item.id === product.id);

    const firstVariant: ColorVariant | null =
        product.colorVariants && product.colorVariants.length > 0
            ? product.colorVariants[0]
            : null;

    const [selectedVariant, setSelectedVariant] = useState<ColorVariant | null>(firstVariant);
    const [selectedSize, setSelectedSize] = useState<string>(
        product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M'
    );

    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [isImageModalVisible, setImageModalVisible] = useState(false);
    const [initialModalIndex, setInitialModalIndex] = useState(0);
    const modalScrollRef = useRef<ScrollView>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        // Simulate real-time fetching
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleScroll = (event: any) => {
        const slide = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
        if (slide !== activeImageIndex) {
            setActiveImageIndex(slide);
        }
    };

    const displayImage = selectedVariant ? selectedVariant.image : product.image;

    // Combine selected variant image with the multiple angles (removing duplicates)
    const productImages = product.images || [];
    const carouselImages = [displayImage, ...productImages.filter((img: string) => img !== displayImage)];
    // Fallback to original product price if variant price is missing
    let displayPrice = selectedVariant ? selectedVariant.price : product.price;
    if (!displayPrice) displayPrice = product.price;

    // Format price string to be just numbers
    const formattedPrice = typeof displayPrice === 'string' ? displayPrice.replace(/[^0-9.]/g, '') : displayPrice;

    const variantKey = selectedVariant ? selectedVariant.colorName : 'default';
    const currentQuantity = quantities[variantKey] || 1;

    const incrementQty = () => {
        setQuantities(prev => ({
            ...prev,
            [variantKey]: (prev[variantKey] || 1) + 1,
        }));
    };

    const decrementQty = () => {
        setQuantities(prev => {
            const current = prev[variantKey] || 1;
            return {
                ...prev,
                [variantKey]: current > 1 ? current - 1 : 1,
            };
        });
    };

    const handleAddToCart = () => {
        dispatch(addToCart({
            id: product.id,
            product,
            quantity: currentQuantity,
            selectedSize: selectedSize,
            selectedColor: selectedVariant?.colorName
        }));
        
        navigation.navigate('MainTabs', {
            screen: 'CartTab',
            params: { addedAt: Date.now() },
        });
    };

    const handleBuyNow = () => {
        // Placeholder for Buy Now logic

        navigation.navigate("CheckOutScreen")
        console.log("Buy Now", product.id, selectedVariant, selectedSize, currentQuantity);
    };

    const handleShare = async () => {
        try {
            const deepLink = `myshop://product/${product.id}`;
            const webLink = `https://myshop.com/product/${product.id}`;

            const message = `${product.name}\n\nPrice: ₹${formattedPrice}\nRating: ${product.rating}\n\n${displayImage}\n\nView Product:\n${webLink}\n\nOpen in App:\n${deepLink}`;

            await Share.share({
                title: product.name,
                message,
                url: webLink,
            });

        } catch (error) {
            console.log('Share error:', error);
        }
    };

    console.log("you may also like",popularProducts)

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

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Large Product Image Scrollable Gallery */}
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
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    activeImageIndex === index && styles.activeDot
                                ]}
                            />
                        ))}
                    </View>

                    {/* Floating Wishlist Button - Top Right */}
                    <TouchableOpacity
                        style={styles.floatingWishlistBtn}
                        onPress={() => dispatch(toggleWishlist(product))}
                    >
                        <Ionicons name={inWishlist ? "heart" : "heart-outline"} size={moderateScale(20)} color={inWishlist ? "#E84C3D" : "#0A0A0A"} />
                    </TouchableOpacity>

                    {/* Floating Share Button - Top Left */}
                    <TouchableOpacity
                        style={styles.floatingShareBtn}
                        onPress={handleShare}
                    >
                        <Entypo name="share" color="#0A0A0A" size={moderateScale(18)} />
                    </TouchableOpacity>
                </View>

                {/* {product.isNew && (
                    <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>NEW IN</Text>
                    </View>
                )} */}

                {/* Product Details Section */}
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

                    {/* Colour Variant Selector (image-based) */}
                    {product.colorVariants && product.colorVariants.length > 0 && (
                        <>
                            <View style={styles.variantHeaderRow}>
                                <Text style={styles.sectionHeading}>Select Colour</Text>
                                <View style={[styles.selectedColorDot, { backgroundColor: selectedVariant?.colorHex || '#ccc' }]} />
                                <Text style={styles.selectedVariantName}>{selectedVariant?.colorName}</Text>
                            </View>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.variantsRow}
                            >
                                {product.colorVariants.map((variant: ColorVariant) => {
                                    const isSelected = selectedVariant?.colorHex === variant.colorHex;
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
                                            <Text style={styles.variantPrice}>₹{variant.price}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                            <View style={styles.divider} />
                        </>
                    )}

                    {/* Product Description */}
                    <Text style={styles.sectionHeading}>Product Description</Text>
                    <Text style={styles.description}>{product.description}</Text>

                    <View style={styles.divider} />

                    {/* Size Selector */}
                    <Text style={styles.sectionHeading}>Select Size</Text>
                    <View style={styles.sizesRow}>
                        {product.sizes.map((size: string) => (
                            <TouchableOpacity
                                key={size}
                                style={[
                                    styles.sizePill,
                                    selectedSize === size && styles.selectedSizePill,
                                ]}
                                onPress={() => setSelectedSize(size)}
                            >
                                <Text
                                    style={[
                                        styles.sizeText,
                                        selectedSize === size && styles.selectedSizeText,
                                    ]}
                                >
                                    {size}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.divider} />

                    {/* Delivery Details Card */}
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


                    {/* <View style={styles.sectionHeader}>
                        <Text style={styles.sectionHeading}>You May Also Like</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>See all</Text>
                        </TouchableOpacity>
                    </View> */}
                    {/* you may also like */}
                    
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
                        scrollEventThrottle={16}
                        decelerationRate="fast"
                    />

                </View>

            </ScrollView>

            {/* Footer Checkout Buttons */}
            <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : verticalScale(16) }]}>
                <TouchableOpacity style={styles.cartAddBtn} onPress={handleAddToCart}>
                    <Ionicons name="cart-outline" size={moderateScale(20)} color="#0A0A0A" style={{ marginRight: scale(6) }} />
                    <Text style={styles.cartAddBtnText}>Add to Cart</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow}>
                    <Text style={styles.buyNowBtnText}>Buy Now</Text>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#FFFFFF',
        zIndex: 10,
    },
    headerBtn: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(18),
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: moderateScale(16),
        fontWeight: '800',
        color: '#0A0A0A',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: scale(12),
    },
    scrollContent: {
        paddingBottom: verticalScale(40),
    },
    galleryWrapper: {
        position: 'relative',
    },
    imageContainer: {
        width: width,
        height: verticalScale(340),
        backgroundColor: '#f8f9fa',
    },
    paginationDots: {
        position: 'absolute',
        bottom: verticalScale(14),
        flexDirection: 'row',
        alignSelf: 'center',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: scale(7),
        height: scale(7),
        borderRadius: scale(4),
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginHorizontal: scale(4),
    },
    activeDot: {
        backgroundColor: '#FFFFFF',
        width: scale(20),
        height: scale(7),
        borderRadius: scale(4),
    },
    floatingWishlistBtn: {
        position: 'absolute',
        top: verticalScale(16),
        right: scale(16),
        width: moderateScale(38),
        height: moderateScale(38),
        borderRadius: moderateScale(19),
        backgroundColor: 'rgba(255,255,255,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    floatingShareBtn: {
        position: 'absolute',
        top: verticalScale(16),
        left: scale(16),
        width: moderateScale(38),
        height: moderateScale(38),
        borderRadius: moderateScale(19),
        backgroundColor: 'rgba(255,255,255,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    headerNewBadge: {
        backgroundColor: '#0A0A0A',
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(3),
        borderRadius: moderateScale(4),
        marginRight: scale(8),
    },
    headerNewBadgeText: {
        color: '#FFFFFF',
        fontSize: moderateScale(9),
        fontWeight: '900',
        letterSpacing: 0.8,
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    newBadge: {
        position: 'absolute',
        top: verticalScale(16),
        left: scale(16),
        backgroundColor: '#0A0A0A',
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(4),
    },
    newBadgeText: {
        color: '#ffffff',
        fontSize: moderateScale(9),
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    detailsContainer: {
        padding: moderateScale(16),
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    category: {
        fontSize: moderateScale(12),
        color: '#0A0A0A',
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingVal: {
        fontSize: moderateScale(12),
        fontWeight: '700',
        color: '#0A0A0A',
        marginLeft: scale(4),
    },
    ratingReviews: {
        fontSize: moderateScale(11),
        color: '#888',
        marginLeft: scale(4),
    },
    name: {
        fontSize: moderateScale(22),
        fontWeight: '900',
        color: '#0A0A0A',
        marginTop: verticalScale(8),
        letterSpacing: -0.4,
    },
    price: {
        fontSize: moderateScale(20),
        fontWeight: '900',
        color: '#0A0A0A',
        marginTop: verticalScale(6),
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: verticalScale(16),
    },
    sectionHeading: {
        fontSize: moderateScale(14),
        fontWeight: '800',
        color: '#0A0A0A',
        marginBottom: verticalScale(8),
    },
    description: {
        fontSize: moderateScale(13),
        color: '#666',
        lineHeight: moderateScale(20),
    },
    sizesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: verticalScale(6),
    },
    sizePill: {
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(8),
        borderRadius: moderateScale(8),
        borderWidth: 1.5,
        borderColor: '#EFEFEF',
        marginRight: scale(10),
        marginBottom: verticalScale(10),
        minWidth: scale(44),
        alignItems: 'center',
    },
    selectedSizePill: {
        borderColor: '#0A0A0A',
        backgroundColor: 'rgba(10, 10, 10, 0.05)',
    },
    sizeText: {
        fontSize: moderateScale(13),
        fontWeight: '700',
        color: '#666',
    },
    selectedSizeText: {
        color: '#0A0A0A',
    },
    variantHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(10),
    },
    selectedColorDot: {
        width: moderateScale(14),
        height: moderateScale(14),
        borderRadius: moderateScale(7),
        marginLeft: scale(10),
        marginRight: scale(6),
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.15)',
    },
    selectedVariantName: {
        fontSize: moderateScale(13),
        fontWeight: '700',
        color: '#0A0A0A',
    },
    variantsRow: {
        paddingBottom: verticalScale(10),
        paddingRight: scale(8),
    },
    variantCard: {
        width: scale(82),
        borderRadius: moderateScale(10),
        borderWidth: 1.5,
        borderColor: '#EFEFEF',
        marginRight: scale(10),
        overflow: 'hidden',
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingBottom: verticalScale(8),
    },
    selectedVariantCard: {
        borderColor: '#0A0A0A',
        borderWidth: 2,
        shadowColor: '#0A0A0A',
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.2,
        shadowRadius: moderateScale(4),
        elevation: 4,
    },
    variantThumb: {
        width: '100%',
        height: verticalScale(80),
        resizeMode: 'cover',
    },
    variantCheckOverlay: {
        position: 'absolute',
        top: verticalScale(4),
        right: scale(4),
        backgroundColor: '#0A0A0A',
        borderRadius: moderateScale(12),
        width: moderateScale(22),
        height: moderateScale(22),
        justifyContent: 'center',
        alignItems: 'center',
    },
    variantColorDot: {
        width: moderateScale(10),
        height: moderateScale(10),
        borderRadius: moderateScale(5),
        marginTop: verticalScale(6),
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    variantLabel: {
        fontSize: moderateScale(10),
        fontWeight: '700',
        color: '#0A0A0A',
        marginTop: verticalScale(3),
        paddingHorizontal: scale(4),
        textAlign: 'center',
    },
    variantPrice: {
        fontSize: moderateScale(11),
        fontWeight: '800',
        color: '#0A0A0A',
        marginTop: verticalScale(2),
    },
    qtyRowInline: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(16),
    },
    qtyLabelInline: {
        fontSize: moderateScale(14),
        fontWeight: '700',
        color: '#0A0A0A',
        marginRight: scale(12),
    },
    qtyControlsInline: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#EFEFEF',
        borderRadius: moderateScale(8),
        height: verticalScale(32),
        backgroundColor: '#FFFFFF',
    },
    qtyBtnInline: {
        width: scale(32),
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyValInline: {
        fontSize: moderateScale(14),
        fontWeight: '800',
        color: '#0A0A0A',
        paddingHorizontal: scale(12),
    },
    deliveryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(12),
        padding: moderateScale(14),
        marginTop: verticalScale(20),
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    deliveryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: verticalScale(4),
    },
    deliveryText: {
        fontSize: moderateScale(12),
        color: '#666',
        fontWeight: '500',
        marginLeft: scale(10),
    },
    footer: {
        flexDirection: 'row',
        padding: moderateScale(16),
        borderTopWidth: 1,
        borderTopColor: '#EFEFEF',
        backgroundColor: '#ffffff',
    },
    cartAddBtn: {
        flex: 1,
        flexDirection: 'row',
        height: verticalScale(48),
        borderRadius: moderateScale(10),
        borderWidth: 1.5,
        borderColor: '#0A0A0A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    cartAddBtnText: {
        color: '#0A0A0A',
        fontSize: moderateScale(15),
        fontWeight: '800',
    },
    buyNowBtn: {
        flex: 1.2,
        height: verticalScale(48),
        borderRadius: moderateScale(10),
        backgroundColor: '#0A0A0A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(10)
    },
    buyNowBtnText: {
        color: '#ffffff',
        fontSize: moderateScale(15),
        fontWeight: '800',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseBtn: {
        position: 'absolute',
        right: scale(20),
        zIndex: 10,
        padding: moderateScale(8),
    },
    modalImage: {
        width: '100%',
        height: '80%',
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
});

export default ProductDetails;