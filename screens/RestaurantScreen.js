import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Linking,
  Share,
  useWindowDimensions,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  clearCart,
  removeFromCart,
  decreaseQuantity,
} from "../reducers/cart";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../constants/colors";
import fonts from "../constants/fonts";
import Button from "../components/Button";
import ModalBottomSheet from "../components/ModalBottomSheet";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { addFavorite, removeFavorite } from "../reducers/user";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function RestaurantScreen({ route, navigation }) {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const { restaurantName } = route.params;
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null); // plat sélectionné pour la modal
  const [selectedOptions, setSelectedOptions] = useState({}); // options choisies
  const cartSheetRef = useRef(null);
  const hourSheetRef = useRef(null);
  const reviewsSheetRef = useRef(null);
  const menuSheetRef = useRef(null);

  const token = useSelector((state) => state.user.token);
  const cartRestaurantName = useSelector((state) => state.cart.restaurantName);

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const totalCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const favorites = useSelector((state) => state.user.favorites);
  const isFavorite = restaurant && (favorites || []).includes(restaurant._id);
  const calculateItemPrice = (item) => {
    let price = item.menuItem.basePrice;

    // Ajouter les prix des suppléments
    if (item.selectedOptions?.supplements) {
      item.selectedOptions.supplements.forEach((sup) => {
        const supObj = item.menuItem.supplements?.find((s) => s.name === sup);
        if (supObj) {
          price += supObj.price || 0;
        }
      });
    }

    return price;
  };

  const totalPrice = cartItems.reduce(
    (sum, i) => sum + calculateItemPrice(i) * i.quantity,
    0,
  );
  const cartSheetMaxDynamicHeight = Math.floor(screenHeight * 0.86);
  const Api_Url = process.env.EXPO_PUBLIC_API_URL;
  useEffect(() => {
    // Vide le panier si on change de restaurant
    if (cartRestaurantName && cartRestaurantName !== restaurantName) {
      dispatch(clearCart());
    }

    fetch(`${Api_Url}/restaurants/${encodeURIComponent(restaurantName)}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Data restaurant reçue:", data);
        console.log("Photos:", data.restaurant?.photos);
        if (data.result) {
          setRestaurant(data.restaurant);
          const firstCategory = data.restaurant.menu[0]?.category;

          setActiveCategory(firstCategory);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleFavorite = async () => {
    if (!token) return;

    if (!restaurant) return;
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
  {
    // console.log("photo restaurant", restaurant.photos);
  }

  const openModal = (item) => {
    setSelectedItem(item);
    setSelectedOptions({});
    menuSheetRef.current?.expand();
  };
  const handleShare = async () => {
    try {
      await Share.share({
        message: `🥙 ${restaurant.name}\n📍 ${restaurant.address}\n⭐ ${restaurant.rating}/5\n\nDécouvre ce restaurant sur KebApp !`,
      });
    } catch (error) {
      // Error silently ignored
    }
  };
  const toggleOption = (label, option, multiple = true, maxCount = null) => {
    setSelectedOptions((prev) => {
      const current = prev[label] || [];
      if (multiple) {
        if (current.includes(option)) {
          return {
            ...prev,
            [label]: current.filter((o) => o !== option),
          };
        } else {
          // Si maxCount est défini et on a déjà atteint la limite, ne pas ajouter
          if (maxCount && current.length >= maxCount) {
            return prev;
          }
          return {
            ...prev,
            [label]: [...current, option],
          };
        }
      } else {
        return { ...prev, [label]: [option] };
      }
    });
  };

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        menuItem: selectedItem,
        selectedOptions,
        restaurantName,
      }),
    );
    menuSheetRef.current?.close();
  };

  const handleAddQuantity = (item) => {
    dispatch(
      addToCart({
        menuItem: item.menuItem,
        selectedOptions: item.selectedOptions,
        restaurantName,
      }),
    );
  };

  const handleDecreaseQuantity = (index) => {
    dispatch(decreaseQuantity(index));
  };
  if (loading)
    return (
      <ActivityIndicator
        style={{ flex: 1 }}
        size="large"
        color={colors.primary}
      />
    );
  if (!restaurant) return <Text>Restaurant non trouvé</Text>;
  const isOpenNow = restaurant.isOpenNow;
  const categories = [...new Set(restaurant.menu.map((item) => item.category))];
  const filteredMenu = restaurant.menu.filter(
    (item) => item.category === activeCategory,
  );

  // Affiche le formulaire de connexion si pas de token
  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.lockedContainer}>
          <Ionicons name="lock-closed" size={48} color={colors.textLight} />
          <Text style={styles.lockedTitle}>Contenu réservé aux membres</Text>
          <Text style={styles.lockedSubtitle}>
            Connectez-vous pour voir les infos et les menus de ce restaurant
          </Text>
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => navigation.navigate("SignIn")}
          >
            <Text style={styles.signInBtnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Affiche le restaurant et le menu
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={{ position: "relative" }}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const x = e.nativeEvent.contentOffset.x;
                setCarouselIndex(Math.round(x / screenWidth));
              }}
              scrollEventThrottle={16}
              style={{ width: screenWidth }}
            >
              {/* Photo de couverture */}
              {Array.isArray(restaurant.photos) &&
              restaurant.photos.length > 0 ? (
                restaurant.photos.map((photo, index) => (
                  <Image
                    key={index}
                    source={{ uri: photo }}
                    style={[styles.coverImage, { width: screenWidth }]}
                    onError={(error) =>
                      console.log(`Erreur chargement photo ${index}:`, error)
                    }
                    onLoadStart={() =>
                      console.log(`Chargement photo ${index}...`)
                    }
                  />
                ))
              ) : (
                <View
                  style={[styles.coverPlaceholder, { width: screenWidth }]}
                />
              )}
            </ScrollView>
            {/* Dots carousel par dessus l'image */}
            {Array.isArray(restaurant.photos) &&
              restaurant.photos.length > 1 && (
                <View style={styles.carouselDotsOverlay} pointerEvents="none">
                  {restaurant.photos.map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.carouselDot,
                        carouselIndex === idx && styles.carouselDotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
          </View>
          {/* Bouton retour */}
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => {
                  if (restaurant) toggleFavorite(restaurant._id);
                }}
              >
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={22}
                  color={isFavorite ? colors.primary : colors.textWhite}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Infos restaurant */}
          <View style={styles.infoCard}>
            <Text style={styles.name}>{restaurant.name}</Text>
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`,
                )
              }
            >
              <Text
                style={styles.address}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                📍 {restaurant.address}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#E8572A" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.linkBtn,
                !restaurant.phone && styles.linkBtnDisabled,
              ]}
              onPress={() =>
                restaurant.phone && Linking.openURL(`tel:${restaurant.phone}`)
              }
              disabled={!restaurant.phone}
            >
              <Text
                style={[
                  styles.phone,
                  !restaurant.phone && styles.phoneDisabled,
                ]}
              >
                📞 {restaurant.phone || "Numéro de téléphone inconnu"}
              </Text>
              {restaurant.phone && (
                <Ionicons name="chevron-forward" size={16} color="#E8572A" />
              )}
            </TouchableOpacity>

            <View style={styles.infoRow}>
              <TouchableOpacity
                style={styles.infoHalf}
                onPress={() => reviewsSheetRef.current?.expand()}
              >
                {/* Affiche la note et le nombre d'avis, ouvre la modal des avis au clic */}
                <View style={styles.reviewsBtnLeft}>
                  <Ionicons name="star" size={16} color={colors.primary} />
                  <Text style={styles.reviewsBtnText}>
                    {restaurant.rating} · {restaurant.totalRatings}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.primary}
                />
              </TouchableOpacity>
              {/*Affiche les horaires d'ouverture dans une modal*/}
              <TouchableOpacity
                style={styles.infoHalf}
                onPress={() => hourSheetRef.current?.expand()}
              >
                <View style={styles.reviewsBtnLeft}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={isOpenNow ? "#22C55E" : "#EF4444"}
                  />
                  <Text
                    style={[
                      styles.reviewsBtnText,
                      { color: isOpenNow ? "#22C55E" : "#EF4444" },
                    ]}
                  >
                    {isOpenNow ? "Ouvert" : "Fermé"}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filtres catégories */}
          <View style={styles.filterScrollContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filters}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterBtn,
                    activeCategory === cat && styles.filterBtnActive,
                  ]}
                  onPress={() => setActiveCategory(cat)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      activeCategory === cat && styles.filterTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <LinearGradient
              colors={["transparent", "rgba(0, 0, 0, 0.15)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.filterScrollShadow}
            />
          </View>

          {/* Liste des plats */}
          {filteredMenu.map((item) => (
            <TouchableOpacity
              onPress={() => openModal(item)}
              style={styles.menuCard}
              key={item._id}
            >
              <View style={styles.menuInfo}>
                <Text style={styles.menuName}>{item.name}</Text>
                <Text style={styles.menuDesc}>{item.description}</Text>
                <Text style={styles.menuPrice}>
                  {(item.basePrice / 100).toFixed(2)}€
                </Text>
              </View>
              <View style={styles.addBtn}>
                <Text style={styles.addBtnText}>+</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bouton panier */}
        <TouchableOpacity
          style={styles.cartBar}
          onPress={() => {
            cartSheetRef.current?.expand();
          }}
        >
          <View style={styles.cartCount}>
            <Text style={styles.cartCountText}>{totalCount}</Text>
          </View>
          <Text style={styles.cartBarText}>Panier</Text>
          <Text style={styles.cartBarPrice}>
            {(totalPrice / 100).toFixed(2)}€
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
      {/* Modale horaires */}
      <ModalBottomSheet
        sheetRef={hourSheetRef}
        enableDynamicSizing
        maxDynamicContentSize={600}
      >
        <View style={styles.hoursHeader}>
          <Text style={styles.hoursTitle}>Horaires</Text>

          <Text
            style={[
              styles.openBadgeText,
              { color: isOpenNow ? "#1dca5dff" : "#EF4444" },
            ]}
          >
            {isOpenNow ? "Ouvert" : "Fermé"}
          </Text>
        </View>

        {/* Liste horaires */}
        {restaurant.openingHours?.length > 0 ? (
          restaurant.openingHours.map((line, index) => {
            const [day, hours] = line.split(": ");
            return (
              <View key={index} style={styles.hoursRow}>
                <Text style={styles.hoursDay}>{day}</Text>
                <Text style={styles.hoursText}>{hours || line}</Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.hoursEmpty}>Horaires non disponibles</Text>
        )}
      </ModalBottomSheet>

      {/* BottomSheet des avis */}
      <ModalBottomSheet
        sheetRef={reviewsSheetRef}
        enableDynamicSizing
        maxDynamicContentSize={600}
      >
        <View style={styles.reviewsRating}>
          <Ionicons name="star" size={20} color={colors.primary} />
          <Text style={styles.reviewsRatingText}>{restaurant.rating}</Text>
          <Text style={styles.reviewsTotal}>({restaurant.totalRatings})</Text>
        </View>

        {restaurant.reviews?.map((review, index) => (
          <View key={index} style={styles.reviewCard}>
            {/* Auteur */}
            <View style={styles.reviewAuthor}>
              {review.profilePhoto ? (
                <Image
                  source={{ uri: review.profilePhoto }}
                  style={styles.reviewAvatar}
                />
              ) : (
                <View style={styles.reviewAvatarPlaceholder}>
                  <Text style={styles.reviewAvatarLetter}>
                    {review.author?.[0]?.toUpperCase()}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.reviewAuthorName}>{review.author}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
            </View>

            {/* Étoiles */}
            <View style={styles.reviewStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= review.rating ? "star" : "star-outline"}
                  size={14}
                  color={colors.primary}
                />
              ))}
            </View>

            {/* Commentaire */}
            <Text style={styles.reviewText}>{review.text}</Text>
          </View>
        ))}
      </ModalBottomSheet>

      {/* BottomSheet configuration plat */}
      <BottomSheet
        ref={menuSheetRef}
        index={-1}
        enableDynamicSizing
        maxDynamicContentSize={600}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: colors.backgroundLight }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.modalPrice}>
            {((selectedItem?.basePrice || 0) / 100).toFixed(2)}€
          </Text>

          {/* Sauces */}
          {selectedItem?.sauces?.length > 0 && (
            <View style={styles.optionSection}>
              <Text style={styles.optionLabel}>Sauce</Text>
              {selectedItem.sauces.map((sauce) => (
                <TouchableOpacity
                  key={sauce.name}
                  style={[
                    styles.optionBtn,
                    selectedOptions["sauce"]?.includes(sauce.name) &&
                      styles.optionBtnActive,
                  ]}
                  onPress={() => toggleOption("sauce", sauce.name, true)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedOptions["sauce"]?.includes(sauce.name) &&
                        styles.optionTextActive,
                    ]}
                  >
                    {sauce.name}{" "}
                    {sauce.extraPrice > 0 ? `+${sauce.extraPrice / 100}€` : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Customizations (garniture, pain, viandes...) */}
          {selectedItem?.customizations?.map((custom) => (
            <View key={custom.label} style={styles.optionSection}>
              <Text style={styles.optionLabel}>{custom.label}</Text>
              {custom.options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionBtn,
                    selectedOptions[custom.label]?.includes(option) &&
                      styles.optionBtnActive,
                  ]}
                  onPress={() =>
                    toggleOption(
                      custom.label,
                      option,
                      custom.label === "Garniture" ||
                        custom.label.includes("Choix des viandes"),
                      custom.label.includes("Choix des viandes") ? 2 : null,
                    )
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedOptions[custom.label]?.includes(option) &&
                        styles.optionTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* Suppléments */}
          {selectedItem?.supplements?.length > 0 && (
            <View style={styles.optionSection}>
              <Text style={styles.optionLabel}>Suppléments</Text>
              {selectedItem.supplements.map((sup) => (
                <TouchableOpacity
                  key={sup.name}
                  style={[
                    styles.optionBtn,
                    selectedOptions["supplements"]?.includes(sup.name) &&
                      styles.optionBtnActive,
                  ]}
                  onPress={() => toggleOption("supplements", sup.name, true)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedOptions["supplements"]?.includes(sup.name) &&
                        styles.optionTextActive,
                    ]}
                  >
                    {sup.name} +{(sup.price / 100).toFixed(2)}€
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </BottomSheetScrollView>

        {/* Boutons fixes en bas */}

        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>Ajouter au panier</Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* modal du panier */}
      <ModalBottomSheet
        sheetRef={cartSheetRef}
        enableDynamicSizing
        maxDynamicContentSize={cartSheetMaxDynamicHeight}
        contentContainerStyle={{
          paddingBottom: cartItems.length > 0 ? 120 : 20,
        }}
        footer={
          cartItems.length > 0 ? (
            <>
              <Text style={styles.cartTotal}>
                Total : {(totalPrice / 100).toFixed(2)}€
              </Text>
              <Button
                title="Procéder au paiement"
                onPress={() => {
                  navigation.navigate("Payment");
                }}
              />
            </>
          ) : null
        }
        footerStyle={styles.cartFooterFixed}
      >
        <Text style={styles.modalTitle}>Votre panier</Text>

        {cartItems.length === 0 ? (
          <Text style={styles.emptyCartText}>Panier vide</Text>
        ) : (
          <>
            {cartItems.map((item, index) => (
              <View key={index} style={styles.cartItem}>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.menuName}>{item.menuItem.name}</Text>
                  <View>
                    {item.selectedOptions &&
                      Object.entries(item.selectedOptions).map(
                        ([label, options], i) => (
                          <Text key={i} style={styles.menuDesc}>
                            {label} : {options.join(", ")}
                          </Text>
                        ),
                      )}
                  </View>
                  <Text style={styles.menuPrice}>
                    {(calculateItemPrice(item) / 100).toFixed(2)}€ x{" "}
                    {item.quantity}
                  </Text>
                </View>
                <View style={styles.cartItemActions}>
                  <TouchableOpacity
                    onPress={() => handleDecreaseQuantity(index)}
                  >
                    <Text style={styles.decreaseQuantityBtn}>-1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleAddQuantity(item)}>
                    <Text style={styles.addQuantityBtn}>+1</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </ModalBottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundLight },
  coverImage: {
    height: 220,
    resizeMode: "cover",
  },
  carouselDotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
    gap: 6,
  },
  carouselDotsOverlay: {
    position: "absolute",
    bottom: 18,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    gap: 6,
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 2,
  },
  carouselDotActive: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  coverPlaceholder: {
    width: "100%",
    height: 220,
    backgroundColor: colors.border,
  },
  headerButtons: {
    position: "absolute",
    top: 20,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRight: { flexDirection: "row", gap: 5 },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderWidth: 1.5,
    borderColor: colors.textWhite,
    justifyContent: "center",
    alignItems: "center",
  },
  infoCard: { padding: 16 },
  name: { fontSize: 24, fontFamily: fonts.family.bold, marginBottom: 8 },
  address: {
    fontSize: 14,
    fontFamily: fonts.family.regular,
    color: colors.textMuted,
  },
  phone: {
    fontSize: 14,
    fontFamily: fonts.family.regular,
    color: colors.textMuted,
  },
  filters: { paddingHorizontal: 16, marginVertical: 12 },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.border,
  },
  filterBtnActive: { backgroundColor: colors.primary },
  filterText: { fontFamily: fonts.family.semibold, color: colors.textMuted },
  filterTextActive: { color: colors.textWhite },
  filterScrollContainer: {
    position: "relative",
  },
  filterScrollShadow: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    pointerEvents: "none",
  },
  menuCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: colors.backgroundCream,
  },
  linkBtn: {
    backgroundColor: colors.border,
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  linkBtnDisabled: {
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  phoneDisabled: {
    color: colors.textMuted,
  },
  menuInfo: { flex: 1, marginRight: 12 },
  menuName: { fontSize: 16, fontFamily: fonts.family.semibold },
  menuDesc: {
    fontSize: 12,
    fontFamily: fonts.family.regular,
    color: colors.textLight,
    marginVertical: 4,
  },
  menuPrice: {
    fontSize: 14,
    fontFamily: fonts.family.bold,
    color: colors.primary,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtnText: {
    color: colors.textWhite,
    fontSize: 20,
    fontFamily: fonts.family.semibold,
  },
  cartBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primary,
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  cartCount: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cartCountText: {
    color: colors.primary,
    fontFamily: fonts.family.bold,
    fontSize: 12,
  },
  cartBarText: {
    color: colors.textWhite,
    fontFamily: fonts.family.bold,
    fontSize: 16,
  },
  cartBarPrice: {
    color: colors.textWhite,
    fontFamily: fonts.family.bold,
    fontSize: 16,
  },
  modalPrice: {
    fontSize: 16,
    fontFamily: fonts.family.semibold,
    color: colors.primary,
    marginBottom: 16,
  },
  optionSection: { marginBottom: 16 },
  optionLabel: {
    fontSize: 14,
    fontFamily: fonts.family.semibold,
    marginBottom: 8,
    color: colors.textDark,
  },
  optionBtn: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.border,
    marginBottom: 6,
  },
  optionBtnActive: { backgroundColor: colors.primary },
  optionText: { fontFamily: fonts.family.regular, color: colors.textDark },
  optionTextActive: {
    color: colors.textWhite,
    fontFamily: fonts.family.semibold,
  },
  addToCartBtn: {
    marginBottom: 20,
    marginHorizontal: 16,
    borderTopColor: colors.border,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  addToCartText: {
    color: colors.textWhite,
    fontFamily: fonts.family.bold,
    fontSize: 16,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  lockedTitle: {
    fontSize: 20,
    fontFamily: fonts.family.bold,
    color: colors.textDark,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  lockedSubtitle: {
    fontSize: 14,
    fontFamily: fonts.family.regular,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 24,
  },
  signInBtn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 200,
  },
  signInBtnText: {
    color: colors.textWhite,
    fontFamily: fonts.family.bold,
    fontSize: 16,
  },
  backBtn: {
    position: "absolute",
    top: 36,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewsBtnLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  reviewsBtnText: {
    fontFamily: fonts.family.semibold,
    fontSize: fonts.size.small,
    color: colors.primary,
  },
  reviewsRating: { flexDirection: "row", alignItems: "center", gap: 4 },
  reviewsRatingText: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h4,
    color: colors.textDark,
  },
  reviewsTotal: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.small,
    color: colors.textMuted,
  },
  reviewCard: {
    backgroundColor: colors.backgroundCream,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  reviewAuthor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20 },
  reviewAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewAvatarLetter: {
    color: colors.textWhite,
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.body,
  },
  reviewAuthorName: {
    fontFamily: fonts.family.semibold,
    fontSize: fonts.size.small,
    color: colors.textDark,
  },
  reviewDate: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.caption,
    color: colors.textMuted,
  },
  reviewStars: { flexDirection: "row", gap: 2, marginBottom: 6 },
  reviewText: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.small,
    color: colors.textMuted,
    lineHeight: 20,
  },
  infoRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  infoHalf: {
    flex: 1,
    backgroundColor: colors.backgroundCream,
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h3,
    color: colors.textDark,
    marginBottom: 20,
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.backgroundCream,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  addQuantityBtn: {
    backgroundColor: colors.primary,
    color: colors.textWhite,
    fontFamily: fonts.family.bold,
    fontSize: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  decreaseQuantityBtn: {
    backgroundColor: colors.textMuted,
    color: colors.textWhite,
    fontFamily: fonts.family.bold,
    fontSize: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  cartTotal: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h4,
    color: colors.textDark,
    marginBottom: 12,
  },
  cartFooterFixed: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,

    backgroundColor: colors.backgroundLight,
  },
  emptyCartText: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 24,
  },
  hoursHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  hoursTitle: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h3,
    color: colors.textDark,
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 6,
    borderRadius: 12,
  },
  hoursDay: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.small,
    color: colors.textMuted,
  },
  hoursText: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.small,
    color: colors.textMuted,
  },
  hoursEmpty: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.small,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 16,
  },
});
