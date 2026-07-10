import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale } from '../utils/responsive';
import api from '../config/apiConfig';
import { useNavigation } from '@react-navigation/native';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!searchQuery.trim()) return;

    const handler = setTimeout(async () => {
      try {
        // Call the search API to check if there are results
        const response = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
        
        // If response is successful, we navigate to ProductList passing the query
        if (response.data?.status) {
          // Replace current screen with ProductList so back button goes to previous screen instead of search screen again
          navigation.replace('ProductList', { searchQuery, focusSearch: true });
        }
      } catch (error) {
        console.error('Error during real-time search check:', error);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(handler);
  }, [searchQuery, navigation]);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigation.replace('ProductList', { searchQuery, focusSearch: true });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <View style={styles.searchHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.searchBackButton}>
          <Ionicons name="arrow-back" size={scale(24)} color="#0A0A0A" />
        </TouchableOpacity>

        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={scale(18)} color="#999" />
          <TextInput
            placeholder="Search for clothes, styles..."
            placeholderTextColor="#AAA"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={scale(18)} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Rest of the screen can be recent searches, trending etc. Empty for now */}
      <View style={styles.contentArea} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchBackButton: {
    padding: scale(4),
    marginRight: scale(12),
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: scale(12),
    paddingHorizontal: scale(12),
    height: verticalScale(40),
  },
  searchInput: {
    flex: 1,
    fontSize: scale(14),
    color: '#0A0A0A',
    paddingHorizontal: scale(8),
    paddingVertical: 0, // important for Android
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default SearchScreen;
