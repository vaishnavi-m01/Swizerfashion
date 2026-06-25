import React from "react";
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from "react-native";
import Header from "../component/Header";
import WishlistCard from "../component/WishlistCard";
import { moderateScale, scale, verticalScale } from "../utils/responsive";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { removeFromWishlist } from "../store/slices/wishlistSlice";
import { addToCart } from "../store/slices/cartSlice";

const Wishlist = () => {
    const navigation = useNavigation<any>();
    const dispatch = useAppDispatch();
    const wishlistItems = useAppSelector(state => state.wishlist.items);

    const handleRemove = (id: string | number) => {
        dispatch(removeFromWishlist(id));
    };

    const handleAddToCart = (item: any) => {
        dispatch(addToCart({ id: item.id, product: item, quantity: 1 }));
        navigation.navigate("MainTabs", { screen: "CartTab" });
    };

    return (
        <View style={styles.container}>

            {wishlistItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconBg}>
                        <Ionicons name="heart-dislike-outline" size={scale(60)} color="#CCCCCC" />
                    </View>
                    <Text style={styles.emptyTitle}>No Favorites Yet</Text>
                    <Text style={styles.emptySubtitle}>Tap the heart on any product to save it to your wishlist.</Text>
                    <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate("HomeTab")}>
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
                    renderItem={({ item }) => (
                        <WishlistCard 
                            item={item} 
                            onRemove={handleRemove}
                            onAddToCart={handleAddToCart}
                            onPress={() => navigation.navigate("ProductDetails", { product: item })}
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