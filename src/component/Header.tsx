import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import React from 'react';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import { LinearGradient } from 'react-native-linear-gradient';
import { colors } from '../theme/Colors';

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  rightActions?: {
    icon: string;
    iconFamily?: 'Ionicons' | 'MaterialIcons';
    onPress: () => void;
    badgeCount?: number;
    showDot?: boolean;
  }[];
  rightText?: string;
  onRightTextPress?: () => void;
  hideBorder?: boolean;
  searchMode?: boolean;
  searchText?: string;
  onSearchTextChange?: (text: string) => void;
  onCloseSearch?: () => void;
  scrollY?: Animated.Value;
};

export function Header({
  title,
  subtitle,
  showBack,
  onBack,
  leftElement,
  rightElement,
  rightActions,
  rightText,
  onRightTextPress,
  hideBorder,
  searchMode,
  searchText,
  onSearchTextChange,
  onCloseSearch,
  scrollY,
}: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [localSearch, setLocalSearch] = React.useState('');

  
  const statusBarHeight = insets.top;
  const HEADER_CONTENT_HEIGHT = verticalScale(50);
  const headerHeight = statusBarHeight + HEADER_CONTENT_HEIGHT;

  const renderIcon = (action: any) => {
    const IconComponent =
      action.iconFamily === 'MaterialIcons' ? MaterialIcons : Ionicons;
    return (
      <IconComponent
        name={action.icon}
        size={moderateScale(22)}
        color={colors.text}
      />
    );
  };

  if (searchMode) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: statusBarHeight, height: headerHeight },
          hideBorder && styles.noBorder,
        ]}
      >
        <View style={styles.headerContentSearch}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={moderateScale(18)}
              color={colors.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search..."
              placeholderTextColor="#9CA3AF"
              style={[styles.searchInput, { color: colors.text }]}
              keyboardAppearance="light"
              value={searchText !== undefined ? searchText : localSearch}
              onChangeText={t => {
                setLocalSearch(t);
                onSearchTextChange?.(t);
              }}
            />
            <TouchableOpacity onPress={onCloseSearch} style={styles.closeBtn}>
              <Ionicons
                name="close-circle"
                size={moderateScale(18)}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#7c4dff', '#b39ddb']}
      style={[
        styles.container,
        {
          paddingTop: statusBarHeight,
          height: headerHeight,
        },
        hideBorder && styles.noBorder,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.left}>
          {leftElement
            ? leftElement
            : showBack && (
                <TouchableOpacity
                  onPress={onBack}
                  style={styles.iconBtn}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons
                    name="chevron-back"
                    size={moderateScale(24)}
                    color={colors.text}
                  />
                </TouchableOpacity>
              )}
        </View>

        <View style={styles.center}>
          <Text
            style={[styles.title, { fontFamily: 'System', fontWeight: '700' }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.subtitle, { fontFamily: 'System' }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.right}>
          {rightElement}
          {rightActions?.map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={action.onPress}
              style={[styles.iconBtn, index > 0 && styles.marginLeft12]}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              {renderIcon(action)}
              {action.badgeCount ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {action.badgeCount > 9 ? '9+' : action.badgeCount}
                  </Text>
                </View>
              ) : action.showDot ? (
                <View style={styles.dotIndicator} />
              ) : null}
            </TouchableOpacity>
          ))}
          {rightText && (
            <TouchableOpacity
              onPress={onRightTextPress}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.rightText}>{rightText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(1) },
        shadowOpacity: 0.02,
        shadowRadius: moderateScale(1.5),
      },
      android: {
        elevation: 0.8,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(4),
    width: '100%',
    height: '100%',
  },
  left: {
    width: scale(44),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  right: {
    width: 'auto',
    minWidth: scale(44),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconBtn: { padding: moderateScale(4) },
  title: {
    fontSize: moderateScale(17.5),
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: moderateScale(9),
    color: colors.textMuted,
    marginTop: verticalScale(0.5),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rightText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: colors.accentDark,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(10),
    height: verticalScale(36),
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: { marginRight: scale(6) },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(14),
    color: colors.text,
    padding: 0,
  },
  closeBtn: { padding: moderateScale(4) },
  badge: {
    position: 'absolute',
    top: verticalScale(-2),
    right: scale(-2),
    backgroundColor: colors.accentDark,
    minWidth: scale(16),
    height: verticalScale(16),
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.surface,
    paddingHorizontal: scale(2),
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: moderateScale(8),
    fontWeight: '900',
    textAlign: 'center',
  },
  dotIndicator: {
    position: 'absolute',
    top: verticalScale(2),
    right: scale(2),
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: colors.badge,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  noBorder: { borderBottomWidth: 0 },
  headerContentSearch: {
    height: verticalScale(50),
    paddingHorizontal: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
  },
  marginLeft12: { marginLeft: scale(12) },
});
