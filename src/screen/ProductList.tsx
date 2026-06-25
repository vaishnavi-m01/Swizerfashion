import React, { useRef, useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TextInput,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProductCard from '../component/ProductCard';
import ProductCardSkeleton from '../component/ProductCardSkeleton';
import { scale, verticalScale } from '../utils/responsive';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RBSheet from 'react-native-raw-bottom-sheet';

const products = [
    {
        id: 1,
        categoryId: 1,
        subCategoryId: 2,
        name: "Women's Dress",
        price: '₹1,499',
        image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=300',
    },
    {
        id: 2,
        categoryId: 2,
        subCategoryId: 3,
        name: "Men's Shirt",
        price: '₹999',
        image: 'https://loremflickr.com/250/350/fashion?lock=2',
    },
    {
        id: 3,
        categoryId: 3,
        subCategoryId: 5,
        name: "Women's Saree",
        price: '₹2,499',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300',
    },
    {
        id: 4,
        categoryId: 2,
        subCategoryId: 4,
        name: "Men's T-Shirt",
        price: '₹799',
        image: 'https://loremflickr.com/250/350/fashion?lock=4',
    },
    {
        id: 5,
        categoryId: 1,
        subCategoryId: 1,
        name: "Women's Kurti",
        price: '₹699',
        image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=300',
    },
    {
        id: 6,
        categoryId: 2,
        subCategoryId: 4,
        name: "Men's Chinos",
        price: '₹1,299',
        image: 'https://loremflickr.com/250/350/fashion?lock=6',
    },
];

const QUICK_FILTERS = ['All', 'Sarees', 'Kurtis', 'Under ₹999', 'Top Rated', 'New Arrivals'];

const FILTER_OPTIONS: Record<string, string[]> = {
    'Category': ['All', 'Men', 'Women', 'Accessories'],
    'Price': ['Under ₹500', '₹500 - ₹1000', '₹1000 - ₹2000', 'Over ₹2000'],
    'Brand': ['Swizer', 'Zara', 'H&M', 'Nike'],
    'Discount': ['10% and above', '20% and above', '50% and above'],
};

const ProductList = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeQuickFilter, setActiveQuickFilter] = useState('All');
    
    // Bottom Sheet Filter State
    const [activeFilterTab, setActiveFilterTab] = useState('Category');
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
    
    const navigation = useNavigation();
    const bottomSheetRef = useRef<any>(null);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const toggleFilterOption = (option: string) => {
        const currentSelected = selectedFilters[activeFilterTab] || [];
        const isSelected = currentSelected.includes(option);
        
        const newSelected = isSelected
            ? currentSelected.filter(item => item !== option)
            : [...currentSelected, option];
            
        setSelectedFilters({
            ...selectedFilters,
            [activeFilterTab]: newSelected
        });
    };

    const renderHeader = () => (
        <View style={[styles.headerContainer, { paddingTop: insets.top > 0 ? insets.top : verticalScale(16) }]}>
            <View style={styles.headerTopRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={scale(24)} color="#0A0A0A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Products</Text>
                <TouchableOpacity style={styles.filterButton} onPress={() => bottomSheetRef.current?.open()}>
                    <Ionicons name="options-outline" size={scale(22)} color="#0A0A0A" />
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
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={scale(16)} color="#888" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Quick Swipe Filters */}
            <View style={styles.quickFiltersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickFiltersContent}>
                    {QUICK_FILTERS.map(filter => (
                        <TouchableOpacity 
                            key={filter} 
                            style={[styles.quickFilterPill, activeQuickFilter === filter && styles.quickFilterPillActive]}
                            onPress={() => setActiveQuickFilter(filter)}
                        >
                            <Text style={[styles.quickFilterText, activeQuickFilter === filter && styles.quickFilterTextActive]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}
            
            {/* Product Grid */}
            <FlatList
                data={isLoading ? [1, 2, 3, 4, 5, 6] as any[] : products}
                keyExtractor={item => (isLoading ? item.toString() : item.id.toString())}
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

            {/* Advanced Split-View Bottom Sheet Filter */}
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
                    {/* Left Pane - Filter Types */}
                    <View style={styles.leftPane}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {Object.keys(FILTER_OPTIONS).map(tab => (
                                <TouchableOpacity 
                                    key={tab} 
                                    style={[styles.leftPaneItem, activeFilterTab === tab && styles.leftPaneItemActive]}
                                    onPress={() => setActiveFilterTab(tab)}
                                >
                                    <Text style={[styles.leftPaneText, activeFilterTab === tab && styles.leftPaneTextActive]}>
                                        {tab}
                                    </Text>
                                    {selectedFilters[tab]?.length > 0 && (
                                        <View style={styles.filterCountBadge}>
                                            <Text style={styles.filterCountText}>{selectedFilters[tab].length}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Right Pane - Filter Options */}
                    <View style={styles.rightPane}>
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.rightPaneContent}>
                            {FILTER_OPTIONS[activeFilterTab].map(option => {
                                const isSelected = selectedFilters[activeFilterTab]?.includes(option);
                                return (
                                    <TouchableOpacity 
                                        key={option} 
                                        style={styles.rightPaneOptionRow}
                                        onPress={() => toggleFilterOption(option)}
                                    >
                                        <Text style={[styles.rightPaneOptionText, isSelected && styles.rightPaneOptionTextActive]}>
                                            {option}
                                        </Text>
                                        <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                                            {isSelected && <Ionicons name="checkmark" size={scale(12)} color="#FFF" />}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>

                {/* Bottom Action Row */}
                <View style={[styles.sheetActionRow, { paddingBottom: verticalScale(30) }]}>
                    <TouchableOpacity 
                        style={styles.clearFilterButton} 
                        onPress={() => setSelectedFilters({})}
                    >
                        <Text style={styles.clearFilterText}>Clear All</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.applyFilterButton} 
                        onPress={() => bottomSheetRef.current?.close()}
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
        paddingBottom: verticalScale(16),
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
        height: verticalScale(32),
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
        color: '#FFF',
    },
    productListContent: {
        paddingHorizontal: scale(12),
        paddingTop: verticalScale(16),
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
});
