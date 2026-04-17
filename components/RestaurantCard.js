import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { addFavorite, removeFavorite } from "../reducers/user";
import colors from "../constants/colors";
import fonts from "../constants/fonts";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function RestaurantCard({
  restaurant,
  variant,
  onPress,
  preferences = [],
}) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const favorites = useSelector((state) => state.user.favorites);
  const isFavorite = (favorites || []).includes(restaurant._id);

  const toggleFavorite = async () => {
    if (!token) return;

    if (isFavorite) {
      dispatch(removeFavorite(restaurant._id));
      await fetch(`${API_URL}/users/favorites`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ restaurantId: restaurant._id }),
      });
    } else {
      dispatch(addFavorite(restaurant._id));
      await fetch(`${API_URL}/users/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ restaurantId: restaurant._id }),
      });
    }
  };

  const isHorizontal = variant === "horizontal";
  const isMap = variant === "map";
  const formattedDistance = restaurant.distance
    ? restaurant.distance < 1000
      ? `${Math.round(restaurant.distance)} m`
      : `${(restaurant.distance / 1000).toFixed(1)} km`
    : null;

  // Première photo dispo ou placeholder
  const image =
    restaurant.photos && restaurant.photos.length > 0
      ? { uri: restaurant.photos[0] }
      : require("../assets/placeholder.png");

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isHorizontal && styles.cardHorizontal,
        isMap && styles.cardMap,
        !isHorizontal && !isMap && styles.cardVertical,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Image */}
      <View style={styles.imageWrap}>
        <Image
          source={image}
          style={[styles.image, isMap && styles.imageMap]}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.heartBtn} onPress={toggleFavorite}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={22}
            color={isFavorite ? colors.primary : colors.textWhite}
          />
        </TouchableOpacity>
      </View>

      {/* Infos */}
      <View style={styles.infoWrap}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {restaurant.name}
          </Text>
          {restaurant.rating > 0 && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color={colors.primary} />
              <Text style={styles.ratingText}>
                {restaurant.rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        {!isMap && restaurant.address && (
          <Text style={styles.address} numberOfLines={1}>
            {restaurant.address}
          </Text>
        )}

        {formattedDistance && (
          <Text style={styles.distance}>{formattedDistance}</Text>
        )}

        {/* Tags preview */}
        {!isMap && (
          <View style={styles.tagsRow}>
            {(preferences.length > 0
              ? restaurant.tags.filter((tag) => preferences.includes(tag))
              : restaurant.tags.slice(0, 3)
            ).map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagChipText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHorizontal: {
    width: 260,
    marginRight: 14,
  },
  cardVertical: {
    width: "100%",
    marginBottom: 14,
  },
  imageWrap: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 160,
  },
  heartBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 6,
  },
  infoWrap: {
    padding: 12,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.body,
    color: colors.textDark,
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.small,
    color: colors.primary,
  },
  address: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.caption,
    color: colors.textLight,
    marginTop: 4,
  },
  distance: {
    fontFamily: fonts.family.semibold,
    fontSize: fonts.size.caption,
    color: colors.primary,
    marginTop: 4,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  tagChip: {
    backgroundColor: colors.backgroundCream,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tagChipText: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.caption,
    color: colors.textMuted,
  },
  cardMap: {
    width: 180,
    marginRight: 10,
  },
  imageMap: {
    height: 90,
  },
});
