import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ToastAndroid, RefreshControl } from "react-native";
import WishlistCard from "../component/WishlistCard";
import { moderateScale, scale, verticalScale } from "../utils/responsive";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { removeFromWishlistAsync, fetchWishlistAsync } from "../store/slices/wishlistSlice";
import { setCartCount } from '../store/slices/cartSlice';
import api from "../config/apiConfig";

const Wishlist = () => {
    const navigation = useNavigation<any>();
    const dispatch = useAppDispatch();
    const wishlistItems = useAppSelector(state => state.wishlist.items);
    const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn);
    const userId = useAppSelector(state => state.auth.userId);
    const [refreshing, setRefreshing] = useState(false);
    const [addingToCartId, setAddingToCartId] = useState<number | null>(null);

    // Fetch server wishlist when screen loads (if logged in)
    useFocusEffect(
        React.useCallback(() => {
            if (isLoggedIn && userId) {
                dispatch(fetchWishlistAsync() as any);
            }
        }, [isLoggedIn, userId])
    );

    const onRefresh = useCallback(() => {
        if (isLoggedIn && userId) {
            setRefreshing(true);
            dispatch(fetchWishlistAsync() as any).finally(() => setRefreshing(false));
        }
    }, [isLoggedIn, userId]);

    const handleRemove = (item: any) => {
        dispatch(removeFromWishlistAsync({
            productId: item.product_id ?? item.id,
            wishlistItemId: item.id,
            variantId: item.variant_id ?? item.product_varient?.id ?? item.product?.id ?? item.id,
        }) as any);
    };

    const handleAddToCart = async (item: any) => {
        const itemId = item.id;
        setAddingToCartId(itemId);
        try {
            const response = await api.post('/cart/add', {
                product_id: item.product_id ?? item.id,
                variant_id: item.variant_id ?? null,
                quantity: 1,
                user_id: userId,
            });
            if (response.data.data?.cart_count !== undefined) {
                dispatch(setCartCount(response.data.data.cart_count));
            }
            ToastAndroid.show("Added to cart", ToastAndroid.SHORT);
            navigation.navigate("MainTabs", { screen: "CartTab" });
        } catch (error) {
            console.log('Add to cart API error:', error);
        } finally {
            setAddingToCartId(null);
        }
    };


    if (!isLoggedIn) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconBg}>
                        <Ionicons name="lock-closed-outline" size={scale(60)} color="#CCCCCC" />
                    </View>
                    <Text style={styles.emptyTitle}>Please Login</Text>
                    <Text style={styles.emptySubtitle}>You need to be logged in to view your wishlist.</Text>
                    <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate("Register")}>
                        <Text style={styles.shopBtnText}>Login / Register</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>

            {wishlistItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconBg}>
                        <Ionicons name="heart-dislike-outline" size={scale(60)} color="#CCCCCC" />
                    </View>
                    <Text style={styles.emptyTitle}>No Favorites Yet</Text>
                    <Text style={styles.emptySubtitle}>Tap the heart on any product to save it to your wishlist.</Text>
                    <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate("MainTabs", { screen: "ProductsTab" })}>
                        <Text style={styles.shopBtnText}>Explore Products</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={wishlistItems}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                    columnWrapperStyle={styles.columnWrapper}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#0A0A0A']}
                            tintColor="#0A0A0A"
                        />
                    }
                    renderItem={({ item }) => (
                        <WishlistCard
                            item={item}
                            onRemove={handleRemove}
                            onAddToCart={handleAddToCart}
                            isAddingToCart={addingToCartId === item.id}
                        />
                    )}
                />
            )}
        </View>
    );
};

export default Wishlist;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    listContainer: {
        padding: moderateScale(16),
        paddingBottom: verticalScale(40),
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scale(32),
    },
    emptyIconBg: {
        width: scale(120),
        height: scale(120),
        borderRadius: scale(60),
        backgroundColor: '#F9F9F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    emptyTitle: {
        fontSize: moderateScale(20),
        fontWeight: '800',
        color: '#0A0A0A',
    },
    emptySubtitle: {
        fontSize: moderateScale(14),
        color: '#666',
        textAlign: 'center',
        marginTop: verticalScale(8),
        lineHeight: moderateScale(20),
    },
    shopBtn: {
        backgroundColor: '#0A0A0A',
        paddingHorizontal: scale(24),
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(10),
        marginTop: verticalScale(24),
    },
    shopBtnText: {
        color: '#ffffff',
        fontSize: moderateScale(14),
        fontWeight: '800',
    },
});