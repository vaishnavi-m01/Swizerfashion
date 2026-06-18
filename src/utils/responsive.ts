import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const wp = (size: number) => (width / 100) * size;
export const hp = (size: number) => (height / 100) * size;

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const scale = (size: number) =>
  (width / guidelineBaseWidth) * size;

export const verticalScale = (size: number) =>
  (height / guidelineBaseHeight) * size;

export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export const fontScale = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(moderateScale(size)));

// Global Responsive Padding & Spacing
export const RESPONSIVE_PADDING = {
  xs: scale(8),
  sm: scale(12),
  md: scale(16),
  lg: scale(18),
  xl: scale(24),
  xxl: scale(32),
};

export const RESPONSIVE_MARGIN = {
  xs: verticalScale(4),
  sm: verticalScale(8),
  md: verticalScale(12),
  lg: verticalScale(16),
  xl: verticalScale(20),
  xxl: verticalScale(28),
};

// Horizontal Padding (left & right)
export const HORIZONTAL_PADDING = scale(18);

// Device Type Detection
export const isTablet = () => {
  const pixelRatio = PixelRatio.get();
  const adjustedWidth = width / pixelRatio;
  return adjustedWidth >= 600;
};

export const isMobileSmall = () => SCREEN_WIDTH < 375;
export const isMobileLarge = () => SCREEN_WIDTH > 400;

// Responsive sizes based on device
export const getResponsiveSize = (small: number, medium: number, large: number) => {
  if (isTablet()) return large;
  if (isMobileLarge()) return medium;
  return small;
};