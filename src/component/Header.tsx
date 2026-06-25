import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Ionicons from 'react-native-vector-icons/Ionicons';
import { moderateScale, scale, verticalScale } from "../utils/responsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNativeGesture } from "react-native-gesture-handler";
import { useNavigation, useRoute } from '@react-navigation/native';

type props = {
  title: string;
}
const Header = ({ title }: props) => {

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + verticalScale(8) : verticalScale(14), paddingBottom: verticalScale(12) }]}>
      <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={moderateScale(24)} color="#0A0A0A" />
      </TouchableOpacity>

      <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>

      {/* <View style={{ flexDirection: "row", gap: scale(6) }}>
                        <TouchableOpacity
                            style={styles.headerBtn}
                            onPress={() => setInWishlist(!inWishlist)}
                        >
                            <Ionicons name={inWishlist ? "heart" : "heart-outline"} size={moderateScale(22)} color={inWishlist ? "#E84C3D" : "#0A0A0A"} />
                        </TouchableOpacity>
    
                        <TouchableOpacity
                            style={styles.headerBtn}
                            onPress={handleShare}
                        >
                            <Entypo name="share" color="#000" size={moderateScale(21)} />
                        </TouchableOpacity>
                    </View> */}
    </View>
  )
}

export default Header


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  headerBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: '#0A0A0A',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: scale(12),
  },
  scrollContent: {
    paddingBottom: verticalScale(40),
  },
})