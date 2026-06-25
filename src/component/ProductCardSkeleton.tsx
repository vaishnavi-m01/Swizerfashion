import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { scale, verticalScale } from '../utils/responsive';

interface Props {
  isGrid?: boolean;
}

const ProductCardSkeleton: React.FC<Props> = ({ isGrid = false }) => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <View style={[styles.cardWrapper, isGrid && styles.cardWrapperGrid]}>
      <View style={[styles.productCard, isGrid && styles.productCardGrid]}>
        {/* Image Placeholder */}
        <Animated.View style={[styles.imageSkeleton, { opacity: fadeAnim }]} />
        
        {/* Content Placeholder */}
        <View style={styles.contentContainer}>
          <Animated.View style={[styles.titleSkeleton, { opacity: fadeAnim }]} />
          <Animated.View style={[styles.titleSkeleton, { opacity: fadeAnim, width: '60%' }]} />
          
          <Animated.View style={[styles.priceSkeleton, { opacity: fadeAnim }]} />
        </View>
      </View>
    </View>
  );
};

export default ProductCardSkeleton;

const styles = StyleSheet.create({
  cardWrapper: {
    marginRight: scale(10),
    marginBottom: verticalScale(8),
  },
  cardWrapperGrid: {
    flex: 1,
    marginHorizontal: scale(5),
    marginRight: scale(5),
    marginBottom: verticalScale(12),
  },
  productCard: {
    width: scale(145),
    backgroundColor: "#FFFFFF",
    borderRadius: scale(14),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  productCardGrid: {
    width: "100%",
  },
  imageSkeleton: {
    width: '100%',
    height: verticalScale(160),
    backgroundColor: '#E0E0E0',
  },
  contentContainer: {
    padding: scale(10),
    gap: verticalScale(6),
  },
  titleSkeleton: {
    height: verticalScale(12),
    backgroundColor: '#E0E0E0',
    borderRadius: scale(4),
    width: '90%',
  },
  priceSkeleton: {
    height: verticalScale(14),
    backgroundColor: '#E0E0E0',
    borderRadius: scale(4),
    width: '40%',
    marginTop: verticalScale(6),
  },
});
