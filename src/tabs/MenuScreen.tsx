import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../config/apiConfig';
import { IMAGE_BASE_URL } from '../api/apiBaseUrl';
import { CategoryCard } from '../component/CategoryCard';
import { scale, verticalScale, HORIZONTAL_PADDING } from '../utils/responsive';
import { useAppSelector } from '../store/hooks';

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

const MenuScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();

    const initialMainCategoryId: number | null =
        route.params?.mainCategoryId ?? route.params?.categoryId ?? null;

    const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
    const [selectedMainId, setSelectedMainId] = useState<number | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const currentMain = mainCategories.find(m => m.id === selectedMainId);
    const categoryList: Category[] = currentMain?.categories ?? [];

    const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);
    const [expandedCategoryData, setExpandedCategoryData] = useState<SubCategory[]>([]);
    const [isExpanding, setIsExpanding] = useState(false);
    const wishlistItems = useAppSelector(state => state.wishlist.items);


    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const res = await api.get('/categories');
                if (res.data?.status && Array.isArray(res.data?.data)) {
                    const mains: MainCategory[] = res.data.data;
                    setMainCategories(mains);

                    const targetMain = initialMainCategoryId
                        ? mains.find(m => m.id === initialMainCategoryId) ?? mains[0]
                        : mains[0];

                    if (targetMain) {
                        setSelectedMainId(targetMain.id);
                        if (targetMain.categories?.length > 0) {
                            setSelectedCategoryId(targetMain.categories[0].id);
                        }
                    }
                }
            } catch (err) {
                console.error('[MenuScreen] fetchAll error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    useEffect(() => {
        if (!initialMainCategoryId || mainCategories.length === 0) return;
        const targetMain = mainCategories.find(m => m.id === initialMainCategoryId);
        if (targetMain && targetMain.id !== selectedMainId) {
            setSelectedMainId(targetMain.id);
            setSelectedCategoryId(targetMain.categories?.[0]?.id ?? null);
        }
    }, [initialMainCategoryId]);

    const handleMainCategoryPress = (mainId: number) => {
        if (mainId === selectedMainId) return;
        setSelectedMainId(mainId);
        const main = mainCategories.find(m => m.id === mainId);
        setSelectedCategoryId(main?.categories?.[0]?.id ?? null);
    };

    const handleCategoryPress = async (cat: Category) => {
        if (isExpanding) return;

        setSelectedCategoryId(cat.id);

        if (expandedCategoryId === cat.id) {
            setExpandedCategoryId(null);
            return;
        }

        setIsExpanding(true);
        try {
            const res = await api.get(`/categories?main_category_id=${selectedMainId}&category_id=${cat.id}`);
            if (res.data?.status && res.data?.data?.subcategories) {
                const fetchedSubs = res.data.data.subcategories;
                if (fetchedSubs.length > 0) {
                    setExpandedCategoryData(fetchedSubs);
                    setExpandedCategoryId(cat.id);
                } else {
                    navigation.navigate('ProductList', {
                        categoryId: cat.id,
                        categoryName: cat.name,
                        mainCategoryId: selectedMainId,
                    });
                }
            } else {
                navigation.navigate('ProductList', {
                    categoryId: cat.id,
                    categoryName: cat.name,
                    mainCategoryId: selectedMainId,
                });
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            navigation.navigate('ProductList', {
                categoryId: cat.id,
                categoryName: cat.name,
                mainCategoryId: selectedMainId,
            });
        } finally {
            setIsExpanding(false);
        }
    };

    const handleSubCategoryPress = (sub: SubCategory, cat: Category) => {
        navigation.navigate('ProductList', {
            categoryId: cat.id,
            categoryName: cat.name,
            mainCategoryId: selectedMainId,
            subcategoryId: sub.id,
        });
    };

    const resolveImage = (img?: string, id?: number) => {
        if (!img) return `https://loremflickr.com/300/300/fashion?lock=${id ?? 0}`;
        return img.startsWith('http') ? img : `${IMAGE_BASE_URL}${img}`;
    };

    const groupedCategoryRows = (): Category[][] => {
        const rows: Category[][] = [];
        for (let i = 0; i < categoryList.length; i += 2) {
            rows.push(categoryList.slice(i, i + 2));
        }
        return rows;
    };

    const renderCategoryTile = (item: Category) => {
        const isActive = item.id === selectedCategoryId;
        const isExpanded = item.id === expandedCategoryId;
        const imageUri = resolveImage(item.image, item.id);
        const hasSubcategories = item.subcategories && item.subcategories.length > 0;

        return (
            <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                style={[styles.categoryTile, isActive && styles.categoryTileActive]}
                onPress={() => handleCategoryPress(item)}
            >
                <Image source={{ uri: imageUri }} style={styles.categoryTileImage} />
                <Text numberOfLines={2} style={styles.categoryTileName}>
                    {item.name}
                </Text>
                {hasSubcategories && (
                    <View style={styles.accordionIcon}>
                        {isExpanding && isActive && !isExpanded ? (
                            <ActivityIndicator size="small" color="#0A0A0A" />
                        ) : (
                            <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={scale(16)} color="#555" />
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderCategoryRows = () => {
        const rows = groupedCategoryRows();
        return rows.map((row, rowIndex) => {
            const expandedInRow = row.find(cat => cat.id === expandedCategoryId);
            return (
                <View key={rowIndex}>
                    <View style={styles.categoryRow}>
                        {row.map(cat => renderCategoryTile(cat))}
                        {row.length === 1 && <View style={[styles.categoryTile, { backgroundColor: 'transparent', borderWidth: 0 }]} />}
                    </View>
                    {expandedInRow && (
                        <View style={styles.subcategoriesContainer}>
                            {expandedCategoryData.map((sub) => (
                                <TouchableOpacity
                                    key={sub.id}
                                    style={styles.subcategoryItem}
                                    onPress={() => handleSubCategoryPress(sub, expandedInRow)}
                                >
                                    <Image source={{ uri: resolveImage(sub.image, sub.id) }} style={styles.subcategoryImage} />
                                    <Text style={styles.subcategoryName} numberOfLines={2}>{sub.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            );
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
                <View style={styles.loadingFull}>
                    <ActivityIndicator size="large" color="#0A0A0A" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Shop</Text>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('SearchScreen')}>
                        <Ionicons name="search-outline" size={scale(22)} color="#0A0A0A" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.headerIcon}
                        onPress={() => navigation.navigate("Wishlist")}
                    >
                        <Ionicons name="heart-outline" size={scale(20)} color="#1A1A1A" />
                        {wishlistItems.length > 0 && <View style={styles.notificationDot} />}
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.divider} />

            {/* Layout */}
            <View style={styles.paneWrapper}>
                {/* Left Pane */}
                <View style={styles.leftPane}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.leftPaneContent}>
                        {mainCategories.map((main, index) => {
                            const isActive = main.id === selectedMainId;
                            return (
                                <View key={main.id} style={{ alignItems: 'center' }}>
                                    <CategoryCard
                                        category={{
                                            id: main.id,
                                            name: main.name,
                                            image: main.image || '', // API இலிருந்து வரும் இமேஜ்
                                        }}
                                        active={isActive}
                                        style={{ marginRight: 0, marginBottom: verticalScale(8) }}
                                        onPress={() => handleMainCategoryPress(main.id)}
                                    />
                                    {index < mainCategories.length - 1 && (
                                        <View style={styles.leftDivider} />
                                    )}
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Right Pane */}
                <View style={styles.rightPane}>
                    {currentMain && (
                        <View style={styles.rightPaneHeader}>
                            <Text style={styles.rightPaneTitle}>{currentMain.name}</Text>
                            <Text style={styles.rightPaneSubtitle}>
                                {categoryList.length} categories
                            </Text>
                        </View>
                    )}

                    {categoryList.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="grid-outline" size={scale(40)} color="#CCC" />
                            <Text style={styles.emptyText}>No categories available</Text>
                        </View>
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
                            {renderCategoryRows()}
                        </ScrollView>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

export default MenuScreen;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    loadingFull: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingVertical: verticalScale(10),
    },
    headerTitle: {
        fontSize: scale(24),
        fontWeight: '800',
        color: '#000',
        letterSpacing: -0.5,
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
    },
    iconButton: {
        padding: scale(4),
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
    },
    paneWrapper: {
        flex: 1,
        flexDirection: 'row',
    },
    // Left Pane
    leftPane: {
        width: scale(96),
        borderRightWidth: 1,
        borderRightColor: '#F0F0F0',
        backgroundColor: '#FAFAFA',
    },
    leftPaneContent: {
        paddingVertical: verticalScale(16),
        alignItems: 'center',
    },
    leftDivider: {
        width: scale(40),
        height: 1,
        backgroundColor: '#EFEFEF',
        marginBottom: verticalScale(12),
    },
    // Right Pane
    rightPane: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    rightPaneHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(12),
        paddingTop: verticalScale(12),
        paddingBottom: verticalScale(8),
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    rightPaneTitle: {
        fontSize: scale(14),
        fontWeight: '700',
        color: '#0A0A0A',
        letterSpacing: 0.3,
    },
    rightPaneSubtitle: {
        fontSize: scale(11),
        color: '#999',
    },
    categoryList: {
        padding: scale(10),
        paddingBottom: verticalScale(30),
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(12),
    },
    categoryTile: {
        width: '48%',
        backgroundColor: '#F9F9F9',
        borderRadius: scale(8),
        padding: scale(10),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    categoryTileActive: {
        backgroundColor: '#F0F7FF',
        borderColor: '#0A0A0A',
    },
    categoryTileImage: {
        width: scale(70),
        height: scale(70),
        borderRadius: scale(35),
        backgroundColor: '#EAEAEA',
        marginBottom: verticalScale(6),
    },
    categoryTileName: {
        fontSize: scale(12),
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    accordionIcon: {
        marginTop: scale(4),
    },
    subcategoriesContainer: {
        backgroundColor: '#F9F9F9',
        padding: scale(8),
        borderRadius: scale(8),
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: verticalScale(12),
    },
    subcategoryItem: {
        width: '33.33%',
        marginBottom: verticalScale(10),
        alignItems: 'center',
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(4),
    },
    subcategoryImage: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(25),
        marginBottom: verticalScale(6),
        backgroundColor: '#EAEAEA',
    },
    subcategoryName: {
        fontSize: scale(11),
        color: '#555',
        textAlign: 'center',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: verticalScale(12),
    },
    emptyText: {
        fontSize: scale(14),
        color: '#999',
    },
    headerIcon: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: scale(12),
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    notificationDot: {
        position: 'absolute',
        top: scale(11),
        right: scale(11),
        width: scale(7),
        height: scale(7),
        borderRadius: scale(3.5),
        backgroundColor: '#FF3B30',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
});