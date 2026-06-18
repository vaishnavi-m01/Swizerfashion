export type RootStackParamList = {
    Splash: undefined;
    MainTabs: { screen?: string; params?: any } | undefined;
    AddAddress: undefined;
    AddressScreen: undefined;
    Wishlist : undefined;
    CheckoutScreen : undefined;
    OrderDetailScreen: { orderId: string };
};