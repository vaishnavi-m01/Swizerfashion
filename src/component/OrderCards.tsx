import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { moderateScale, scale, verticalScale } from "../utils/responsive";
import { useNavigation } from '@react-navigation/native';

interface Product {
  id: string;
  image: string;
  name: string;
  qty: number;
}

interface OrderCardProps {
  orderId: string;
  orderStatus: string;
  products: Product[];
  price: number;
  date: string;
}

const OrderCard: React.FC<OrderCardProps> = ({
  orderId,
  orderStatus,
  products,
  price,
  date,
}) => {
  const firstProduct = products[0];
  const remainingCount = products.length - 1;

  const getStatusStyle = () => {
    switch (orderStatus) {
      case "Delivered":
        return {
          bg: "#DCFCE7",
          color: "#16A34A",
        };

      case "Pending":
        return {
          bg: "#FEF3C7",
          color: "#D97706",
        };

      case "Cancelled":
        return {
          bg: "#FEE2E2",
          color: "#DC2626",
        };

      default:
        return {
          bg: "#E5E7EB",
          color: "#374151",
        };
    }
  };

  const status = getStatusStyle();
  const navigation = useNavigation<any>();
  return (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("OrderDetails")}>
      <View style={styles.row}>
        <Text style={styles.orderId}>ID: #{orderId}</Text>

        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>
            {orderStatus}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.productSection}>
        <Image
          source={{ uri: firstProduct.image }}
          style={styles.productImage}
        />

        <View style={styles.productInfo}>
          <Text numberOfLines={1} style={styles.productName}>
            {firstProduct.name}
          </Text>

          <Text style={styles.productVariant}>
            Qty : {firstProduct.qty}
          </Text>

          {remainingCount > 0 && (
            <Text style={styles.moreItems}>
              +{remainingCount} more item{remainingCount > 1 ? "s" : ""}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.captionText}>{date}</Text>

        <Text style={styles.priceText}>₹{price}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default OrderCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: moderateScale(14),
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: verticalScale(12),
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  orderId: {
    fontSize: scale(14),
    fontWeight: "600",
    color: "#1F2937",
  },

  badge: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(20),
  },

  badgeText: {
    fontSize: scale(12),
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: verticalScale(14),
  },

  productSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  productImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: moderateScale(8),
  },

  productInfo: {
    flex: 1,
    marginLeft: moderateScale(12),
  },

  productName: {
    fontSize: scale(14),
    fontWeight: "600",
    color: "#374151",
  },

  productVariant: {
    marginTop: verticalScale(4),
    color: "#777",
  },

  moreItems: {
    marginTop: verticalScale(4),
    color: "#2563EB",
    fontSize: scale(13),
    fontWeight: "600",
  },

  captionText: {
    color: "#888",
    fontSize: scale(13),
  },

  priceText: {
    fontSize: scale(15),
    fontWeight: "700",
    color: "#111",
  },
});