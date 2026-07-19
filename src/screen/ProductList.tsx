
import React, { useRef, useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProductCard from '../component/ProductCard';
import ProductCardSkeleton from '../component/ProductCardSkeleton';
import { scale, verticalScale, HORIZONTAL_PADDING } from '../utils/responsive';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RBSheet from 'react-native-raw-bottom-sheet';
import api from '../config/apiConfig';
import { IMAGE_BASE_URL } from '../api/apiBaseUrl';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppSelector } from '../store/hooks';
import { useCallback } from 'react';
import AddressHeaderBlock from '../component/AddressHeaderBlock';

const QUICK_FILTERS = ['All', 'Sarees', 'Kurtis', 'Under ₹999', 'Top Rated', 'New Arrivals'];

// Filter sheet now has 4 hierarchical tabs driven by the categories API
const FILTER_TABS = ['Main Category', 'Category', 'Sub Category', 'Price'] as const;
type FilterTab = typeof FILTER_TABS[number];

interface SubCategory {
    id: number;
    category_id: number;
    name: string;
    image: string;
    slug: string;
    status: number;
}

interface Category {
    id: number;
    main_category_id: number;
    name: string;
    image: string;
    slug: string;
    status: number;
    subcategories: SubCategory[];
}

interface MainCategory {
    id: number;
    name: string;
    categories: Category[];
}

const ProductList = () => {
    const route = useRoute<any>();
    const { category, subcategory, categoryId, mainCategoryId, subcategoryId, searchQuery: initialSearchQuery } = route.params || {};
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const [activeQuickFilter, setActiveQuickFilter] = useState('All');
    const [apiProducts, setApiProducts] = useState<any[]>([]);

    const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>('Main Category');

    const navigation = useNavigation();
    const bottomSheetRef = useRef<any>(null);
    const insets = useSafeAreaInsets();

    const effectiveCategoryId = categoryId || category;
    const effectiveSubcategoryId = subcategoryId || subcategory;

    // Horizontal round-chip subcategory list (shown under search bar)
    const [subcategoriesList, setSubcategoriesList] = useState<any[]>([]);
    const [activeSubcategoryId, setActiveSubcategoryId] = useState<number | 'all'>(effectiveSubcategoryId || 'all');

    const [defaultAddress, setDefaultAddress] = useState<any>(null);
    const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn);
    const user = useAppSelector(state => state.auth.user);
    const wishlistUpdateTrigger = useAppSelector(state => state.wishlist.wishlistUpdateTrigger);

    // --- Full category tree (Main Category -> Category -> Subcategory) ---
    const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
    const [categoryTreeLoading, setCategoryTreeLoading] = useState(true);

    // --- Filter bottom-sheet selections (in-progress, before "Apply Filters") ---
    // Always starts EMPTY — nothing pre-selected when the sheet opens for the first time.
    const [sheetMainCategoryId, setSheetMainCategoryId] = useState<number | null>(null);
    const [sheetCategoryId, setSheetCategoryId] = useState<number | null>(null);
    const [sheetSubcategoryId, setSheetSubcategoryId] = useState<number | null>(null);

    // --- Applied filters (these actually drive the product fetch) ---
    const [appliedMainCategoryId, setAppliedMainCategoryId] = useState<number | null>(mainCategoryId || null);
    const [appliedCategoryId, setAppliedCategoryId] = useState<number | null>(effectiveCategoryId || null);
    const [appliedSubcategoryId, setAppliedSubcategoryId] = useState<number | null>(effectiveSubcategoryId || null);

    // Tracks whether the user has actually applied a filter via the sheet —
    // drives the little warning/badge dot on the header filter icon.
    const [filtersActive, setFiltersActive] = useState(false);

    // --- Price filter state ---
    const [sheetMinPrice, setSheetMinPrice] = useState('');
    const [sheetMaxPrice, setSheetMaxPrice] = useState('');
    const [appliedMinPrice, setAppliedMinPrice] = useState('');
    const [appliedMaxPrice, setAppliedMaxPrice] = useState('');

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
                    console.log('Error fetching address in ProductList:', err);
                });
            } else {
                setDefaultAddress(null);
            }
        }, [isLoggedIn, user])
    );

    // Fetch the entire Main Category -> Category -> Subcategory tree once,
    // used to populate the filter bottom sheet.
    useEffect(() => {
        const fetchCategoryTree = async () => {
            setCategoryTreeLoading(true);
            try {
                const res = await api.get('/categories');
                if (res.data?.status && Array.isArray(res.data?.data)) {
                    setMainCategories(res.data.data);
                }
            } catch (err) {
                console.error('Error fetching category tree:', err);
            } finally {
                setCategoryTreeLoading(false);
            }
        };
        fetchCategoryTree();
    }, []);

    // Fetch the subcategories for the currently applied category (drives the
    // round horizontal chip list under the search bar).
    useEffect(() => {
        const mainId = appliedMainCategoryId || mainCategoryId;
        const catId = appliedCategoryId || effectiveCategoryId;

        if (catId && mainId) {
            api.get(`/categories?main_category_id=${mainId}&category_id=${catId}`)
                .then(res => {
                    if (res.data?.status && res.data?.data?.subcategories) {
                        setSubcategoriesList(res.data.data.subcategories);
                    } else {
                        setSubcategoriesList([]);
                    }
                })
                .catch(err => console.error('Error fetching subcategories for ProductList:', err));
        } else {
            setSubcategoriesList([]);
        }
    }, [appliedCategoryId, appliedMainCategoryId, effectiveCategoryId, mainCategoryId]);

    // Fetch products whenever the applied main category / category / subcategory changes.
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                if (apiProducts.length === 0) {
                    setIsLoading(true);
                }

                const params: string[] = [];

                // Subcategory (either from the round chips or from the filter sheet) wins.
                const finalSubcategoryId = activeSubcategoryId !== 'all' ? activeSubcategoryId : appliedSubcategoryId;
                const finalCategoryId = appliedCategoryId || effectiveCategoryId;
                const finalMainCategoryId = appliedMainCategoryId || mainCategoryId;

                if (finalSubcategoryId) {
                    params.push(`category=${finalSubcategoryId}`);
                } else if (finalCategoryId) {
                    params.push(`category=${finalCategoryId}`);
                }

                if (finalMainCategoryId) {
                    params.push(`main_category_id=${finalMainCategoryId}`);
                }

                if (appliedMinPrice) {
                    params.push(`min_price=${appliedMinPrice}`);
                }
                if (appliedMaxPrice) {
                    params.push(`max_price=${appliedMaxPrice}`);
                }

                let url = '/products';
                if (debouncedSearchQuery) {
                    url = `/search?q=${encodeURIComponent(debouncedSearchQuery)}`;
                } else if (params.length) {
                    url += `?${params.join('&')}`;
                }

                const response = await api.get(url);
                const dataPayload = response.data?.data;
                const fetchedVariants = dataPayload?.products?.data || (Array.isArray(dataPayload) ? dataPayload : []);
                
                if (response.data?.status && fetchedVariants.length > 0) {
                    const mapped = fetchedVariants.map((variant: any) => {
                        const imageUrl = variant.thumbnail
                            ? (variant.thumbnail.startsWith('http')
                                ? variant.thumbnail
                                : `${IMAGE_BASE_URL}${variant.thumbnail}`)
                            : `null`;
                        const price = `₹${parseFloat(variant.discount_price || variant.price).toFixed(0)}`;
                        const oldPrice = variant.discount_price ? `₹${parseFloat(variant.price).toFixed(0)}` : undefined;
                        const discount = variant.discount_percentage ? `${Math.round(parseFloat(variant.discount_percentage))}% OFF` : undefined;
                        return {
                            id: variant.id,
                            product_id: variant.product_id,
                            variant_id: variant.id,
                            product: variant.product,
                            name: variant.name || variant.product?.name || 'Product',
                            image: imageUrl,
                            price,
                            oldPrice,
                            discount,
                            inStock: variant.stock > 0,
                            is_wishlisted: Number(variant.is_wishlisted) === 1,
                        };
                    });
                    setApiProducts(mapped);
                } else {
                    setApiProducts([]);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [effectiveCategoryId, activeSubcategoryId, appliedCategoryId, appliedSubcategoryId, appliedMainCategoryId, wishlistUpdateTrigger, debouncedSearchQuery, appliedMinPrice, appliedMaxPrice]);

    // Filter sheet helpers 
    const categoriesForSheet: Category[] =
        mainCategories.find(m => m.id === sheetMainCategoryId)?.categories || [];

    const subcategoriesForSheet: SubCategory[] =
        categoriesForSheet.find(c => c.id === sheetCategoryId)?.subcategories || [];

    const handleSheetMainSelect = (id: number) => {
        setSheetMainCategoryId(id);
        setSheetCategoryId(null);
        setSheetSubcategoryId(null);
        setActiveFilterTab('Category');
    };

    const handleSheetCategorySelect = (id: number) => {
        setSheetCategoryId(id);
        setSheetSubcategoryId(null);
        setActiveFilterTab('Sub Category');
    };

    const handleSheetSubcategorySelect = (id: number) => {
        // toggle off if tapped again
        setSheetSubcategoryId(prev => (prev === id ? null : id));
    };

    const handleClearFilters = () => {
        setSheetMainCategoryId(null);
        setSheetCategoryId(null);
        setSheetSubcategoryId(null);
        setSheetMinPrice('');
        setSheetMaxPrice('');
        setAppliedMainCategoryId(null);
        setAppliedCategoryId(null);
        setAppliedSubcategoryId(null);
        setAppliedMinPrice('');
        setAppliedMaxPrice('');
        setActiveSubcategoryId('all');
        setFiltersActive(false);
    };

    const handleApplyFilters = () => {
        setAppliedMainCategoryId(sheetMainCategoryId);
        setAppliedCategoryId(sheetCategoryId);
        setAppliedSubcategoryId(sheetSubcategoryId);
        setAppliedMinPrice(sheetMinPrice);
        setAppliedMaxPrice(sheetMaxPrice);
        // keep the round chip row in sync with the sheet's subcategory choice
        setActiveSubcategoryId(sheetSubcategoryId || 'all');
        setFiltersActive(!!(sheetMainCategoryId || sheetCategoryId || sheetSubcategoryId || sheetMinPrice || sheetMaxPrice));
        bottomSheetRef.current?.close();
    };

    const selectedCountForTab = (tab: FilterTab) => {
        if (tab === 'Main Category') return sheetMainCategoryId ? 1 : 0;
        if (tab === 'Category') return sheetCategoryId ? 1 : 0;
        if (tab === 'Price') return (sheetMinPrice || sheetMaxPrice) ? 1 : 0;
        return sheetSubcategoryId ? 1 : 0;
    }; 


    const renderHeader = () => (
        <View style={[styles.headerContainer, { paddingTop: insets.top > 0 ? insets.top : verticalScale(16) }]}>
            {isLoggedIn && defaultAddress && (
                <Animated.View entering={FadeInDown.duration(400)} style={{ marginBottom: verticalScale(12) }}>
                    <AddressHeaderBlock />
                </Animated.View>
            )}

            <View style={styles.headerTopRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={scale(24)} color="#0A0A0A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Products</Text>
                <TouchableOpacity style={styles.filterButton} onPress={() => bottomSheetRef.current?.open()}>
                    <Ionicons name="options-outline" size={scale(22)} color="#0A0A0A" />
                    {filtersActive && <View style={styles.filterActiveDot} />}
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={scale(18)} color="#888" style={styles.searchIcon} />
                <TextInput
                    placeholder="Search for clothes, styles..."
                    placeholderTextColor="#888"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus={route.params?.focusSearch}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={scale(16)} color="#888" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Quick Swipe Filters / Subcategories Horizontal Scroll */}
            {/* <View style={subcategoriesList.length > 0 ? styles.subcategoriesListHeight : styles.quickFiltersContainer}>
                {subcategoriesList.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roundCategoryContent}>
                        <TouchableOpacity
                            style={styles.roundCategoryItem}
                            onPress={() => setActiveSubcategoryId('all')}
                        >
                            <View style={[styles.roundCategoryImageContainer, activeSubcategoryId === 'all' && styles.roundCategoryImageContainerActive]}>
                                <Ionicons name="grid" size={scale(22)} color={activeSubcategoryId === 'all' ? '#0A0A0A' : '#666'} />
                            </View>
                            <Text style={[styles.roundCategoryText, activeSubcategoryId === 'all' && styles.roundCategoryTextActive]} numberOfLines={1}>
                                All
                            </Text>
                        </TouchableOpacity>
                        {subcategoriesList.map((sub) => {
                            const imgUrl = sub.image ? (sub.image.startsWith('http') ? sub.image : `${IMAGE_BASE_URL}${sub.image}`) : `https://loremflickr.com/100/100/fashion?lock=${sub.id}`;
                            return (
                                <TouchableOpacity
                                    key={sub.id}
                                    style={styles.roundCategoryItem}
                                    onPress={() => setActiveSubcategoryId(sub.id)}
                                >
                                    <View style={[styles.roundCategoryImageContainer, activeSubcategoryId === sub.id && styles.roundCategoryImageContainerActive]}>
                                        <Image source={{ uri: imgUrl }} style={styles.roundCategoryImage} />
                                    </View>
                                    <Text style={[styles.roundCategoryText, activeSubcategoryId === sub.id && styles.roundCategoryTextActive]} numberOfLines={1}>
                                        {sub.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickFiltersContent}>
                        {QUICK_FILTERS.map((filter, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.quickFilterPill, activeQuickFilter === filter && styles.quickFilterPillActive]}
                                onPress={() => setActiveQuickFilter(filter)}
                            >
                                <Text style={[styles.quickFilterText, activeQuickFilter === filter && styles.quickFilterTextActive]}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View> */}
        </View>
    );

    // --- Right pane renderer for the filter sheet ------------------------------
    const renderFilterRightPane = () => {
        if (categoryTreeLoading) {
            return (
                <View style={styles.filterLoadingBox}>
                    <ActivityIndicator size="small" color="#0A0A0A" />
                </View>
            );
        }

        if (activeFilterTab === 'Main Category') {
            return mainCategories.map(main => {
                const isSelected = sheetMainCategoryId === main.id;
                return (
                    <TouchableOpacity
                        key={main.id}
                        style={styles.rightPaneOptionRow}
                        onPress={() => handleSheetMainSelect(main.id)}
                    >
                        <Text style={[styles.rightPaneOptionText, isSelected && styles.rightPaneOptionTextActive]}>
                            {main.name}
                        </Text>
                        <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                            {isSelected && <Ionicons name="checkmark" size={scale(12)} color="#FFF" />}
                        </View>
                    </TouchableOpacity>
                );
            });
        }

        if (activeFilterTab === 'Category') {
            if (!sheetMainCategoryId) {
                return (
                    <Text style={styles.filterHintText}>Please select a Main Category first</Text>
                );
            }
            if (categoriesForSheet.length === 0) {
                return <Text style={styles.filterHintText}>No categories found</Text>;
            }
            return categoriesForSheet.map(cat => {
                const isSelected = sheetCategoryId === cat.id;
                return (
                    <TouchableOpacity
                        key={cat.id}
                        style={styles.rightPaneOptionRow}
                        onPress={() => handleSheetCategorySelect(cat.id)}
                    >
                        <Text style={[styles.rightPaneOptionText, isSelected && styles.rightPaneOptionTextActive]}>
                            {cat.name}
                        </Text>
                        <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                            {isSelected && <Ionicons name="checkmark" size={scale(12)} color="#FFF" />}
                        </View>
                    </TouchableOpacity>
                );
            });
        }

        // Sub Category tab
        if (!sheetCategoryId) {
            return (
                <Text style={styles.filterHintText}>Please select a Category first</Text>
            );
        }
        if (subcategoriesForSheet.length === 0) {
            return <Text style={styles.filterHintText}>No subcategories found</Text>;
        }
        return subcategoriesForSheet.map(sub => {
            const isSelected = sheetSubcategoryId === sub.id;
            return (
                <TouchableOpacity
                    key={sub.id}
                    style={styles.rightPaneOptionRow}
                    onPress={() => handleSheetSubcategorySelect(sub.id)}
                >
                    <Text style={[styles.rightPaneOptionText, isSelected && styles.rightPaneOptionTextActive]}>
                        {sub.name}
                    </Text>
                    <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                        {isSelected && <Ionicons name="checkmark" size={scale(12)} color="#FFF" />}
                    </View>
                </TouchableOpacity>
            );
        });
    };

    // --- Price filter renderer ---
    const renderPriceFilter = () => (
        <View style={{ padding: scale(16), gap: verticalScale(16) }}>
            <Text style={{ fontSize: scale(13), color: '#6B7280', marginBottom: verticalScale(4) }}>
                Enter a price range to filter products
            </Text>
            <View style={{ gap: verticalScale(12) }}>
                <View>
                    <Text style={[styles.rightPaneOptionText, { marginBottom: verticalScale(6) }]}>Min Price (₹)</Text>
                    <TextInput
                        style={styles.priceInput}
                        placeholder="e.g. 500"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        value={sheetMinPrice}
                        onChangeText={setSheetMinPrice}
                    />
                </View>
                <View>
                    <Text style={[styles.rightPaneOptionText, { marginBottom: verticalScale(6) }]}>Max Price (₹)</Text>
                    <TextInput
                        style={styles.priceInput}
                        placeholder="e.g. 2000"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        value={sheetMaxPrice}
                        onChangeText={setSheetMaxPrice}
                    />
                </View>
            </View>
            {(sheetMinPrice || sheetMaxPrice) ? (
                <TouchableOpacity
                    onPress={() => { setSheetMinPrice(''); setSheetMaxPrice(''); }}
                    style={{ alignSelf: 'flex-start', marginTop: verticalScale(4) }}
                >
                    <Text style={{ color: '#EF4444', fontSize: scale(13), fontWeight: '600' }}>Clear Price</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}

            {/* Product Grid */}
            <FlatList
                data={isLoading ? [1, 2, 3, 4, 5, 6] as any[] : apiProducts}
                keyExtractor={(item, index) => (isLoading ? index.toString() : item.id.toString())}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.productListContent}
                columnWrapperStyle={styles.columnWrapper}
                renderItem={({ item }) => (
                    isLoading ? <ProductCardSkeleton isGrid={true} /> : <ProductCard item={item as any} isGrid={true} />
                )}
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="shirt-outline" size={scale(40)} color="#CCC" />
                            <Text style={styles.emptyText}>No Products Found</Text>
                        </View>
                    ) : null
                }
            />

            {/* Bottom Sheet Filter (Main Category / Category / Sub Category) */}
            <RBSheet
                ref={bottomSheetRef}
                height={verticalScale(480)}
                openDuration={300}
                customStyles={{
                    container: {
                        borderTopLeftRadius: scale(24),
                        borderTopRightRadius: scale(24),
                        backgroundColor: '#FFF'
                    }
                }}
            >
                <View style={styles.sheetHeader}>
                    <Text style={styles.sheetTitle}>Filters</Text>
                    <TouchableOpacity onPress={() => bottomSheetRef.current?.close()} style={styles.sheetCloseButton}>
                        <Ionicons name="close" size={scale(20)} color="#0A0A0A" />
                    </TouchableOpacity>
                </View>

                <View style={styles.splitViewContainer}>
                    <View style={styles.leftPane}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {FILTER_TABS.map(tab => (
                                <TouchableOpacity
                                    key={tab}
                                    style={[styles.leftPaneItem, activeFilterTab === tab && styles.leftPaneItemActive]}
                                    onPress={() => setActiveFilterTab(tab)}
                                >
                                    <Text style={[styles.leftPaneText, activeFilterTab === tab && styles.leftPaneTextActive]}>
                                        {tab}
                                    </Text>
                                    {selectedCountForTab(tab) > 0 && (
                                        <View style={styles.filterCountBadge}>
                                            <Text style={styles.filterCountText}>{selectedCountForTab(tab)}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.rightPane}>
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.rightPaneContent} keyboardShouldPersistTaps="handled">
                            {activeFilterTab === 'Price' ? renderPriceFilter() : renderFilterRightPane()}
                        </ScrollView>
                    </View>
                </View>

                <View style={[styles.sheetActionRow, { paddingBottom: verticalScale(30) }]}>
                    <TouchableOpacity
                        style={styles.clearFilterButton}
                        onPress={handleClearFilters}
                    >
                        <Text style={styles.clearFilterText}>Clear All</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.applyFilterButton}
                        onPress={handleApplyFilters}
                    >
                        <Text style={styles.applyFilterText}>Apply Filters</Text>
                    </TouchableOpacity>
                </View>
            </RBSheet>
        </View>
    );
};

export default ProductList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    headerContainer: {
        paddingBottom: verticalScale(8),
        backgroundColor: '#FFF',
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(12),
        marginBottom: verticalScale(12),
    },
    backButton: {
        padding: scale(4),
    },
    headerTitle: {
        fontSize: scale(18),
        fontWeight: '700',
        color: '#0A0A0A',
    },
    filterButton: {
        padding: scale(6),
        backgroundColor: '#F5F5F5',
        borderRadius: scale(20),
        position: 'relative',
    },
    filterActiveDot: {
        position: 'absolute',
        top: scale(4),
        right: scale(4),
        width: scale(8),
        height: scale(8),
        borderRadius: scale(4),
        backgroundColor: '#D10000',
        borderWidth: 1,
        borderColor: '#FFF',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F6F6F6',
        borderRadius: scale(12),
        paddingHorizontal: scale(12),
        marginHorizontal: scale(12),
        height: scale(45),
        marginBottom: verticalScale(12),
    },
    searchIcon: {
        marginRight: scale(8),
    },
    searchInput: {
        flex: 1,
        fontSize: scale(14),
        color: '#0A0A0A',
        fontWeight: '500',
    },
    quickFiltersContainer: {
        height: verticalScale(34),
    },
    subcategoriesListHeight: {
        height: verticalScale(90),
    },
    quickFiltersContent: {
        paddingHorizontal: scale(12),
        gap: scale(8),
        alignItems: 'center',
    },
    quickFilterPill: {
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(6),
        backgroundColor: '#F5F5F5',
        borderRadius: scale(16),
        borderWidth: 1,
        borderColor: 'transparent',
    },
    quickFilterPillActive: {
        backgroundColor: '#0A0A0A',
        borderColor: '#0A0A0A',
    },
    quickFilterText: {
        fontSize: scale(12),
        color: '#555',
        fontWeight: '600',
    },
    quickFilterTextActive: {
        fontWeight: '700',
    },
    roundCategoryContent: {
        paddingHorizontal: HORIZONTAL_PADDING,
        gap: scale(14),
        alignItems: 'center',
    },
    roundCategoryItem: {
        alignItems: 'center',
        width: scale(64),
    },
    roundCategoryImageContainer: {
        width: scale(56),
        height: scale(56),
        borderRadius: scale(28),
        backgroundColor: '#F6F6F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(6),
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    roundCategoryImageContainerActive: {
        borderWidth: 2,
        borderColor: '#0A0A0A',
        backgroundColor: '#FFF'
    },
    roundCategoryImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    roundCategoryText: {
        fontSize: scale(11),
        color: '#666',
        textAlign: 'center',
        fontWeight: '500',
    },
    roundCategoryTextActive: {
        color: '#0A0A0A',
        fontWeight: '700',
    },
    productListContent: {
        paddingHorizontal: scale(12),
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(30),
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    emptyContainer: {
        marginTop: verticalScale(80),
        alignItems: 'center',
    },
    emptyText: {
        fontSize: scale(14),
        color: '#888',
        marginTop: verticalScale(8),
    },

    // Bottom Sheet Styles
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    sheetTitle: {
        fontSize: scale(18),
        fontWeight: '700',
        color: '#0A0A0A',
    },
    sheetCloseButton: {
        padding: scale(4),
        backgroundColor: '#F5F5F5',
        borderRadius: scale(14),
    },
    splitViewContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    leftPane: {
        width: '35%',
        backgroundColor: '#F9F9F9',
        borderRightWidth: 1,
        borderRightColor: '#F0F0F0',
    },
    leftPaneItem: {
        paddingVertical: verticalScale(16),
        paddingHorizontal: scale(16),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftPaneItemActive: {
        backgroundColor: '#FFFFFF',
        borderLeftWidth: 3,
        borderLeftColor: '#0A0A0A',
    },
    leftPaneText: {
        fontSize: scale(14),
        color: '#666',
        fontWeight: '500',
    },
    leftPaneTextActive: {
        color: '#0A0A0A',
        fontWeight: '700',
    },
    filterCountBadge: {
        backgroundColor: '#0A0A0A',
        width: scale(18),
        height: scale(18),
        borderRadius: scale(9),
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterCountText: {
        color: '#FFF',
        fontSize: scale(10),
        fontWeight: '700',
    },
    rightPane: {
        width: '65%',
        backgroundColor: '#FFFFFF',
    },
    rightPaneContent: {
        padding: scale(16),
    },
    rightPaneOptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: verticalScale(14),
        borderBottomWidth: 1,
        borderBottomColor: '#F9F9F9',
    },
    rightPaneOptionText: {
        fontSize: scale(14),
        color: '#444',
        fontWeight: '400',
    },
    rightPaneOptionTextActive: {
        color: '#0A0A0A',
        fontWeight: '600',
    },
    checkbox: {
        width: scale(20),
        height: scale(20),
        borderRadius: scale(4),
        borderWidth: 1.5,
        borderColor: '#CCC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: '#0A0A0A',
        borderColor: '#0A0A0A',
    },
    filterHintText: {
        fontSize: scale(13),
        color: '#999',
        textAlign: 'center',
        marginTop: verticalScale(30),
    },
    filterLoadingBox: {
        paddingVertical: verticalScale(40),
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetActionRow: {
        flexDirection: 'row',
        padding: scale(16),
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        backgroundColor: '#FFF',
        gap: scale(12),
    },
    clearFilterButton: {
        flex: 1,
        paddingVertical: verticalScale(14),
        borderRadius: scale(12),
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    clearFilterText: {
        color: '#0A0A0A',
        fontSize: scale(14),
        fontWeight: '600',
    },
    applyFilterButton: {
        flex: 2,
        backgroundColor: '#0A0A0A',
        paddingVertical: verticalScale(14),
        borderRadius: scale(12),
        alignItems: 'center',
    },
    applyFilterText: {
        color: '#FFF',
        fontSize: scale(14),
        fontWeight: '600',
    },
    addressBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingVertical: verticalScale(10),
        borderBottomWidth: 1,
        borderBottomColor: '#EBEBEB',
    },
    addressBarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: scale(10),
    },
    addressBarName: {
        fontSize: scale(12),
        fontWeight: '700',
        color: '#0A0A0A',
        marginLeft: scale(4),
    },
    addressBarText: {
        fontSize: scale(12),
        color: '#666',
        marginLeft: scale(4),
        flex: 1,
    },
    addressBarChangeText: {
        fontSize: scale(12),
        color: '#D10000',
        fontWeight: '600',
    },
    priceInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: scale(10),
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(10),
        fontSize: scale(14),
        color: '#1F2937',
        backgroundColor: '#FAFAFA',
    },
});
