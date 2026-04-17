import { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SearchBar from "../components/SearchBar";
import FilterTags from "../components/FilterTags";
import RestaurantCard from "../components/RestaurantCard";
import colors from "../constants/colors";
import fonts from "../constants/fonts";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function RestaurantsList() {
  const navigation = useNavigation();
  const preferences = useSelector((state) => state.user.preferences);

  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    async function fetchRestaurants() {
      // 1. Récupérer la position
      const locationStr = await AsyncStorage.getItem("userLocation");
      const userCoords = locationStr ? JSON.parse(locationStr) : null;

      const SORT_TAGS = ["📍 près de vous", "⭐ mieux notés"];
      const backendTags = selectedTags.filter((t) => !SORT_TAGS.includes(t));
      const isSortByDistance = selectedTags.includes("📍 près de vous");
      const isSortByRating = selectedTags.includes("⭐ mieux notés");

      // 3. Construire l'URL
      let url = `${API_URL}/restaurants?`;

      if (search.trim()) {
        url += `search=${search.trim()}&`;
      }

      if (backendTags.length > 0) {
        url += `tags=${backendTags.join(",")}&`;
      }

      if (isSortByDistance || isSortByRating) {
        url += `limit=40&`;
      }

      if (userCoords) {
        url += `latitude=${userCoords.latitude}&longitude=${userCoords.longitude}&`;
      }

      // 4. Fetch
      const response = await fetch(url);
      const data = await response.json();

      if (data.result) {
        let sorted = data.restaurants;

        if (isSortByRating && !isSortByDistance) {
          sorted = [...sorted].sort((a, b) => b.rating - a.rating);
        }

        setRestaurants(sorted);
      }
    }

    fetchRestaurants();
  }, [search, selectedTags]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        <Text style={styles.headerText}>Retour</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* SearchBar */}
        <SearchBar value={search} onChangeText={setSearch} />

        {/* FilterTags */}
        <FilterTags selected={selectedTags} onToggle={toggleTag} />

        {/* Compteur */}
        <View style={styles.counterRow}>
          <Text style={styles.counterText}>
            {restaurants.length} restaurants
          </Text>
          <View style={styles.counterLine} />
        </View>

        {/* Liste */}
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          renderItem={({ item }) => {
            return (
              <RestaurantCard
                restaurant={item}
                variant="vertical"
                onPress={() => {
                  navigation.navigate("Restaurant", {
                    restaurantName: item.name,
                  });
                }}
              />
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerText: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.body,
    color: colors.textDark,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  counterRow: {
    marginTop: 8,
    marginBottom: 14,
  },
  counterText: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.small,
    color: colors.primary,
    marginBottom: 8,
  },
  counterLine: {
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
});
