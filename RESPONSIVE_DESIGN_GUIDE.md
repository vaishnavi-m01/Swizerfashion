# Global Responsive Design Guide

## Overview
A complete responsive design system for all device sizes with consistent left/right spacing and scaling utilities.

## Key Features

### 1. **Responsive Spacing System**

#### Padding Presets
```typescript
import { RESPONSIVE_PADDING, HORIZONTAL_PADDING } from '../utils/responsive';

// Predefined padding sizes
RESPONSIVE_PADDING.xs   // Extra small: 8px (scaled)
RESPONSIVE_PADDING.sm   // Small: 12px (scaled)
RESPONSIVE_PADDING.md   // Medium: 16px (scaled)
RESPONSIVE_PADDING.lg   // Large: 18px (scaled) - Default for sections
RESPONSIVE_PADDING.xl   // Extra large: 24px (scaled)
RESPONSIVE_PADDING.xxl  // 2X Large: 32px (scaled)

// Horizontal padding for all sections (left & right)
HORIZONTAL_PADDING  // 18px (scaled) - Use for marginHorizontal
```

#### Margin Presets
```typescript
import { RESPONSIVE_MARGIN } from '../utils/responsive';

RESPONSIVE_MARGIN.xs   // 4px (vertical scaled)
RESPONSIVE_MARGIN.sm   // 8px (vertical scaled)
RESPONSIVE_MARGIN.md   // 12px (vertical scaled)
RESPONSIVE_MARGIN.lg   // 16px (vertical scaled)
RESPONSIVE_MARGIN.xl   // 20px (vertical scaled)
RESPONSIVE_MARGIN.xxl  // 28px (vertical scaled)
```

### 2. **Scaling Functions**

```typescript
import { 
  scale,                // Horizontal scaling (width-based)
  verticalScale,        // Vertical scaling (height-based)
  moderateScale,        // Balanced scaling
  fontScale             // Font size scaling
} from '../utils/responsive';

// Example usage in styles
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: HORIZONTAL_PADDING,     // Global horizontal padding
    paddingVertical: scale(20),                // Responsive vertical
    marginHorizontal: scale(16),               // Responsive margin
    height: verticalScale(200),                // Responsive height
    fontSize: fontScale(16),                   // Responsive font
  },
});
```

### 3. **Device Detection**

```typescript
import { 
  isTablet,
  isMobileSmall,
  isMobileLarge,
  getResponsiveSize
} from '../utils/responsive';

// Check device type
if (isTablet()) {
  // Tablet-specific layout
}

if (isMobileLarge()) {
  // Large phone layout
}

if (isMobileSmall()) {
  // Small phone layout
}

// Get responsive size based on device
const fontSize = getResponsiveSize(14, 16, 18);  // (small, medium, large)
```

### 4. **Category Component**

New reusable category component with built-in responsive styling:

```typescript
import { CategoryCard, CategoriesList } from '../component/CategoryCard';

// Single category card
<CategoryCard
  category={{ id: 1, name: 'Women', image: 'url' }}
  onPress={() => console.log('Category pressed')}
/>

// List of categories (horizontal by default)
<CategoriesList
  categories={categories}
  onCategoryPress={(category) => console.log(category.name)}
  horizontal={true}
/>
```

## Best Practices

### 1. **Always Use HORIZONTAL_PADDING for Left/Right Spacing**
```typescript
// ✅ CORRECT - Consistent left/right padding
<View style={{ marginHorizontal: HORIZONTAL_PADDING }}>
  <Text>Content</Text>
</View>

// ❌ AVOID - Hard-coded values
<View style={{ marginHorizontal: 18 }}>
  <Text>Content</Text>
</View>
```

### 2. **Use Responsive Presets Over Manual Calculations**
```typescript
// ✅ CORRECT
paddingHorizontal: RESPONSIVE_PADDING.lg
marginTop: RESPONSIVE_MARGIN.md
fontSize: fontScale(16)

// ❌ AVOID - Manual hard-coding
paddingHorizontal: 18
marginTop: 12
fontSize: 16
```

### 3. **Section Layout Pattern**
Every screen section should follow this pattern:
```typescript
// Header
<View style={{ marginHorizontal: HORIZONTAL_PADDING }}>
  <Text>Section Title</Text>
</View>

// Content with horizontal scroll
<ScrollView
  horizontal
  contentContainerStyle={{
    paddingLeft: HORIZONTAL_PADDING,
    paddingRight: HORIZONTAL_PADDING,
  }}
>
  {/* Items */}
</ScrollView>
```

### 4. **FlatList Padding**
```typescript
<FlatList
  horizontal
  contentContainerStyle={{
    paddingLeft: HORIZONTAL_PADDING,
    paddingRight: HORIZONTAL_PADDING,
  }}
  // ... other props
/>
```

## Screen Structure Example

```typescript
import { HORIZONTAL_PADDING, scale, verticalScale } from '../utils/responsive';

const HomeScreen = () => (
  <ScrollView>
    {/* Section 1 */}
    <View style={{ marginHorizontal: HORIZONTAL_PADDING }}>
      <Text>Title</Text>
    </View>

    {/* Section 2 - Horizontal Scroll */}
    <ScrollView
      horizontal
      contentContainerStyle={{
        paddingLeft: HORIZONTAL_PADDING,
        paddingRight: HORIZONTAL_PADDING,
      }}
    >
      {/* Items */}
    </ScrollView>

    {/* Section 3 */}
    <View style={{ marginHorizontal: HORIZONTAL_PADDING }}>
      <Text>Another Section</Text>
    </View>
  </ScrollView>
);
```

## Device Coverage

- ✅ Small phones (iPhone SE): < 375px
- ✅ Standard phones (375px - 400px)
- ✅ Large phones (> 400px)
- ✅ Tablets (> 600px - PixelRatio adjusted)
- ✅ All aspect ratios

## Updated Components

1. **responsive.ts** - Enhanced with global padding/margin presets
2. **CategoryCard.tsx** - New reusable category component
3. **HomeScreen.tsx** - Updated to use responsive system and new CategoryCard

## Import Examples

```typescript
// Responsive utilities
import { 
  scale, 
  verticalScale, 
  RESPONSIVE_PADDING,
  HORIZONTAL_PADDING,
  RESPONSIVE_MARGIN,
  isTablet,
  getResponsiveSize 
} from '../utils/responsive';

// Components
import { CategoryCard, CategoriesList } from '../component/CategoryCard';
```

---

**All devices now have consistent, responsive left/right spacing. Apply these patterns to other screens for consistency!**
