import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { moderateScale, scale, verticalScale } from "../utils/responsive";
import { IMAGE_BASE_URL } from "../api/apiBaseUrl";


interface Product {
  id: string;
  image: string; 
  name: string;
  qty: number;
}

interface OrderCardProps {
  orderId: string;
  orderStatus: string;
  paymentStatus?: string;
  products: Product[];
  price: number;
  date: string;
  onPress: () => void;
}

const FALLBACK_IMAGE = "https://loremflickr.com/200/200/fashion";


const resolveImageUri = (image?: string) => {
  if (!image) return FALLBACK_IMAGE;

  if (image.includes("swizer/") && !image.includes("swizer/public/")) {
    return image.replace("swizer/", "swizer/public/");
  }

  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${IMAGE_BASE_URL}${image}`;
};

 console.log ("resolveImageUri",resolveImageUri)
const OrderCard: React.FC<OrderCardProps> = ({
  orderId,
  orderStatus,
  paymentStatus,
  products,
  price,
  date,
  onPress,
}) => {
  const firstProduct = products[0];
  const remainingCount = products.length - 1;
const getStatusStyle = () => {
  switch (orderStatus?.toLowerCase()) {
    case "pending":
      return { bg: "#FEF3C7", color: "#D97706" }; // Yellow

    case "confirmed":
      return { bg: "#DBEAFE", color: "#2563EB" }; // Blue

    case "processing":
      return { bg: "#E0F2FE", color: "#0284C7" }; // Sky Blue

    case "shipped":
      return { bg: "#EDE9FE", color: "#7C3AED" }; // Purple

    case "delivered":
      return { bg: "#DCFCE7", color: "#16A34A" }; // Green

    case "cancelled":
      return { bg: "#FEE2E2", color: "#DC2626" }; // Red


    case "returned":
      return { bg: "#FFEDD5", color: "#EA580C" }; // Orange

    default:
      return { bg: "#E5E7EB", color: "#374151" }; // Gray
  }
};

  
  const status = getStatusStyle();
  const imageUri = resolveImageUri(firstProduct?.image);
  console.log("firstProductImage",imageUri)

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.row}>
        <Text style={styles.orderId}>ID: #{orderId}</Text>

        <View style={styles.badgesRow}>
          {paymentStatus && (
            <View style={[styles.badge, styles.paymentBadge]}>
              <Text style={[styles.badgeText, styles.paymentBadgeText]}>
                {paymentStatus.toUpperCase()}
              </Text>
            </View>
          )}
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>
              {orderStatus}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.productSection}>
        <Image
          source={{ uri: imageUri }}
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
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
  },
  paymentBadge: {
    backgroundColor: "#F3F4F6", 
  },
  paymentBadgeText: {
    color: "#4B5563",
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
    backgroundColor: "#F3F4F6",
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