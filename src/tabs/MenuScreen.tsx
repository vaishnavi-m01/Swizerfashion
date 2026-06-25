import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    FlatList,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CategoryCard } from '../component/CategoryCard';
import SubCategoryList from '../component/SubCategoryList';
import { scale, verticalScale, HORIZONTAL_PADDING } from '../utils/responsive';

// ----- Data -----
const categories = [
    { id: 1, name: 'Women', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&auto=format&fit=crop' },
    { id: 2, name: 'Men', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop' },
    { id: 3, name: 'Accessories', image: 'https://loremflickr.com/200/200/fashion?lock=55' },
];

const subcategories = [
    // WOMEN (8)
    {
        id: 1,
        categoryId: 1,
        name: 'Tops',
        image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=300',
    },
    {
        id: 2,
        categoryId: 1,
        name: 'Dresses',
        image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=300',
    },
    {
        id: 3,
        categoryId: 1,
        name: 'Sarees',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300',
    },
    {
        id: 4,
        categoryId: 1,
        name: 'Kurtis',
        image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=300',
    },
    {
        id: 5,
        categoryId: 1,
        name: 'Jeans',
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300',
    },
    {
        id: 6,
        categoryId: 1,
        name: 'Leggings',
        image: 'https://images.unsplash.com/photo-1506629905607-d9c297d5f0d4?w=300',
    },
    {
        id: 7,
        categoryId: 1,
        name: 'Skirts',
        image: 'https://images.unsplash.com/photo-1583496661160-fb5886a13d77?w=300',
    },
    {
        id: 8,
        categoryId: 1,
        name: 'Handbags',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300',
    },

    // MEN (6)
    {
        id: 9,
        categoryId: 2,
        name: 'Shirts',
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300',
    },
    {
        id: 10,
        categoryId: 2,
        name: 'T-Shirts',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300',
    },
    {
        id: 11,
        categoryId: 2,
        name: 'Jeans',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300',
    },
    {
        id: 12,
        categoryId: 2,
        name: 'Trousers',
        image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300',
    },
    {
        id: 13,
        categoryId: 2,
        name: 'Jackets',
        image: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=300',
    },
    {
        id: 14,
        categoryId: 2,
        name: 'Shoes',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
    },

    // ACCESSORIES
    {
        id: 15,
        categoryId: 3,
        name: 'Jewelry',
        image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=300',
    },
    {
        id: 16,
        categoryId: 3,
        name: 'Watches',
        image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=300',
    },
    {
        id: 17,
        categoryId: 3,
        name: 'Bags',
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300',
    },
    {
        id: 18,
        categoryId: 3,
        name: 'Sunglasses',
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300',
    },
];


const MenuScreen = () => {
    const route = useRoute<any>();
    const initialCategoryId = route.params?.categoryId || categories[0].id;
    const [selectedCategory, setSelectedCategory] = useState(initialCategoryId);
    const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null);

    useEffect(() => {
        if (route.params?.categoryId) {
            setSelectedCategory(route.params.categoryId);
            setSelectedSubCategory(null);
        }
    }, [route.params?.categoryId]);



    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

            {/* ── Header ── */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Menu</Text>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="search-outline" size={scale(22)} color="#0A0A0A" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="heart-outline" size={scale(22)} color="#0A0A0A" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Divider ── */}
            <View style={styles.divider} />

            {/* ── Two-pane: left subcategory | right products ── */}
            <View style={styles.paneWrapper}>
                <View style={styles.leftPane}>

                    <View style={styles.categorySection}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                             contentContainerStyle={styles.categoryBar}
                        >
                            {categories.map((cat, index) => (
                                <View key={cat.id} style={{ alignItems: 'center' }}>
                                    <CategoryCard
                                        category={cat}
                                        active={selectedCategory === cat.id}
                                        style={{ marginRight: 0, marginBottom: verticalScale(12) }}
                                        onPress={() => {
                                            setSelectedCategory(cat.id);
                                            setSelectedSubCategory(null);
                                        }}
                                    />
                                    {index < categories.length - 1 && (
                                        <View style={{ width: scale(40), height: 1, backgroundColor: '#EFEFEF', marginBottom: verticalScale(12) }} />
                                    )}
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                <SubCategoryList
                    subcategories={subcategories}
                    selectedCategory={selectedCategory}
                    selectedSubCategory={selectedSubCategory}
                    onSelect={setSelectedSubCategory}
                />

            </View>
        </SafeAreaView>
    );
};

export default MenuScreen;

// ----- Styles -----
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingVertical: verticalScale(10),
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    headerSub: {
        fontSize: scale(10),
        color: '#888',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },

    headerTitle: {
        fontSize: scale(24),
        fontWeight: '800',
        color: '#000',
    },

    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
    },

    iconButton: {
        padding: scale(4),
    },

    headerBadge: {
        backgroundColor: '#000',
        borderRadius: scale(14),
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(5),
    },

    headerBadgeText: {
        color: '#FFF',
        fontWeight: '700',
    },

    categorySection: {
        paddingVertical: verticalScale(10),
    },

    categoryBar: {
        paddingVertical: verticalScale(16),
        alignItems: 'center',
    },

    divider: {
        height: 1,
        backgroundColor: '#EFEFEF',
    },

    paneWrapper: {
        flex: 1,
        flexDirection: 'row',
    },

    leftPane: {
        width: scale(90),
        borderRightWidth: 1,
        borderRightColor: '#F0F0F0',
        backgroundColor: '#FAFAFA',
    },

    productPane: {
        flex: 1,
        paddingHorizontal: scale(8),
    },

    productListContent: {
        paddingTop: verticalScale(10),
        paddingBottom: verticalScale(30),
    },

    columnWrapper: {
        justifyContent: 'space-between',
    },

    productItem: {
        width: '48%',
        marginBottom: verticalScale(12),
    },

    emptyContainer: {
        marginTop: verticalScale(50),
        alignItems: 'center',
    },

    emptyText: {
        fontSize: scale(14),
        color: '#999',
    },
});