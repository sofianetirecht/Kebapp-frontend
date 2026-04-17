import { useState, useEffect, useRef } from "react";
import { StyleSheet, View, TouchableOpacity, FlatList } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../constants/colors";
import fonts from "../constants/fonts";
import * as Location from "expo-location";

import { useNavigation } from "@react-navigation/native";
import RestaurantCard from "../components/RestaurantCard";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function MapScreen() {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const flatListRef = useRef(null);

  const [region, setRegion] = useState({
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [restaurants, setRestaurants] = useState([]);
  const [currentRegion, setCurrentRegion] = useState(region);
  const [visibleRestaurants, setVisibleRestaurants] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    async function loadData() {
      // Permission déjà accordée, on récupère juste la position
      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        let currentRegion = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };

        setRegion(currentRegion);
      } catch (e) {
        console.warn("Impossible de récupérer la position :", e);
        // On garde Paris par défaut
      }

      // Récupérer les restaurants
      const response = await fetch(`${API_URL}/restaurants`);
      const data = await response.json();

      if (data.result) {
        setRestaurants(data.restaurants);

        const minLat = currentRegion.latitude - currentRegion.latitudeDelta / 2;
        const maxLat = currentRegion.latitude + currentRegion.latitudeDelta / 2;
        const minLng =
          currentRegion.longitude - currentRegion.longitudeDelta / 2;
        const maxLng =
          currentRegion.longitude + currentRegion.longitudeDelta / 2;

        setVisibleRestaurants(
          data.restaurants.filter((resto) => {
            const lat = resto.location.coordinates[1];
            const lng = resto.location.coordinates[0];
            return (
              lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng
            );
          }),
        );
      }
    }

    loadData();
  }, []);

  const filterVisibleRestaurants = (r) => {
    const minLat = r.latitude - r.latitudeDelta / 2;
    const maxLat = r.latitude + r.latitudeDelta / 2;
    const minLng = r.longitude - r.longitudeDelta / 2;
    const maxLng = r.longitude + r.longitudeDelta / 2;

    const visible = restaurants.filter((resto) => {
      const lat = resto.location.coordinates[1];
      const lng = resto.location.coordinates[0];
      return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
    });

    setVisibleRestaurants(visible);
  };

  const handleMarkerPress = (restaurant) => {
    setSelectedId(restaurant._id);

    const index = visibleRestaurants.findIndex((r) => r._id === restaurant._id);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        // provider="google"
        ref={mapRef}
        style={styles.map}
        // provider="google"
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        loadingEnabled={true}
        loadingIndicatorColor={colors.primary}
        zoomEnabled={true}
        scrollEnabled={true}
        onRegionChangeComplete={(r) => {
          setCurrentRegion(r);
          filterVisibleRestaurants(r);
          setSelectedId(null);
        }}
      >
        {visibleRestaurants.map((restaurant) => (
          <Marker
            key={restaurant._id}
            coordinate={{
              latitude: restaurant.location.coordinates[1],
              longitude: restaurant.location.coordinates[0],
            }}
            onPress={() => handleMarkerPress(restaurant)}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.markerWrapper}>
              <View
                style={[
                  styles.marker,
                  selectedId === restaurant._id && styles.markerSelected,
                ]}
              >
                <Ionicons
                  name="restaurant"
                  size={16}
                  color={colors.textWhite}
                />
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Boutons map */}
      <View style={styles.mapButtons}>
        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() => {
            mapRef.current?.animateToRegion(
              {
                ...currentRegion,
                latitudeDelta: currentRegion.latitudeDelta / 2,
                longitudeDelta: currentRegion.longitudeDelta / 2,
              },
              300,
            );
          }}
        >
          <Ionicons name="add" size={22} color={colors.textDark} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() => {
            const maxDelta = 2;
            if (currentRegion.latitudeDelta >= maxDelta) return;
            mapRef.current?.animateToRegion(
              {
                ...currentRegion,
                latitudeDelta: currentRegion.latitudeDelta * 2,
                longitudeDelta: currentRegion.longitudeDelta * 2,
              },
              300,
            );
          }}
        >
          <Ionicons name="remove" size={22} color={colors.textDark} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mapBtn, styles.locateBtn]}
          onPress={() => {
            mapRef.current?.animateToRegion(
              {
                latitude: region.latitude,
                longitude: region.longitude,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
              },
              500,
            );
          }}
        >
          <Ionicons name="locate" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Carousel restaurants */}
      <View style={styles.carousel}>
        <FlatList
          ref={flatListRef}
          data={visibleRestaurants}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          getItemLayout={(data, index) => ({
            length: 190,
            offset: 190 * index,
            index,
          })}
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              variant="map"
              onPress={() =>
                navigation.navigate("Restaurant", {
                  restaurantName: item.name,
                })
              }
            />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  // --- Marqueurs ---
  marker: {
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.textWhite,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  markerSelected: {
    backgroundColor: colors.textDark,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  markerWrapper: {
    alignItems: "center",
  },
  calloutBubble: {
    backgroundColor: colors.textDark,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 150,
    maxWidth: 220,
  },
  calloutText: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.small,
    color: colors.textWhite,
    textAlign: "center",
  },

  // --- Boutons ---
  mapButtons: {
    position: "absolute",
    right: 16,
    top: "45%",
    gap: 10,
  },
  mapBtn: {
    backgroundColor: colors.backgroundLight,
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  locateBtn: {
    marginTop: 6,
  },
  // --- Carousel ---
  carousel: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
  },
  carouselContent: {
    paddingHorizontal: 16,
  },
});
