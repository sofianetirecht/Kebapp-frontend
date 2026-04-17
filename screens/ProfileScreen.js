import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { logout, resetOnboarding, setUser } from "../reducers/user";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Button from "../components/Button";
import SettingRow from "../components/SettingRow";
import colors from "../constants/colors";
import fonts from "../constants/fonts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { removeAllUsers } from "../reducers/user";
import { removeAllCart } from "../reducers/cart";
import { SafeAreaView } from "react-native-safe-area-context";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ==================== COMPONENTS ====================

function PointsCard({ points = 0 }) {
  const nextRewardAt = 2000;
  const progress = Math.min(points / nextRewardAt, 1);
  const percentageText = Math.floor(progress * 100);

  return (
    <View style={styles.pointsCard}>
      <View style={styles.pointsHeader}>
        <Text style={styles.pointsLabel}>Points</Text>
        <Text style={styles.pointsValue}>{points}</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${percentageText}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {percentageText}% vers votre prochaine récompense
      </Text>
    </View>
  );
}

// ==================== MAIN SCREEN ====================

export default function ProfileScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const username = useSelector((state) => state.user.username);
  const email = useSelector((state) => state.user.email);
  const avatar = useSelector((state) => state.user.avatar);
  const user = useSelector((state) => state.user);
  const cart = useSelector((state) => state.cart);
  const [points, setPoints] = useState(0);
  const [loadingPoints, setLoadingPoints] = useState(false);

  // 📊 Fetch points actualisés depuis la BDD
  useEffect(() => {
    const fetchPoints = async () => {
      if (!token) return;
      setLoadingPoints(true);
      try {
        const res = await fetch(`${API_URL}/users/points`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.result) {
          setPoints(data.points);
        }
      } catch (e) {
        // Error silently ignored
      } finally {
        setLoadingPoints(false);
      }
    };
    fetchPoints();
  }, [token]);

  const handleEditProfile = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission refusée", "Autorise l'accès à ta galerie.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    const formData = new FormData();
    formData.append("avatar", { uri, type: "image/jpeg", name: "avatar.jpg" });

    try {
      const response = await fetch(`${API_URL}/users/avatar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (data.result) {
        dispatch(setUser({ username, email, avatar: data.avatar }));
      } else {
        Alert.alert("Erreur", data.error || "Upload impossible");
      }
    } catch (err) {
      Alert.alert("Erreur réseau", "Impossible de contacter le serveur.");
    }
  };

  const handleLogout = () => dispatch(logout());

  const handleSettingPress = (routeName) => {
    navigation.navigate(routeName);
  };

  // ========== VUE DÉCONNECTÉE ==========
  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <Ionicons
          name="person-circle-outline"
          size={80}
          color={colors.textLight}
        />
        <Text style={styles.title}>Mon Profil</Text>
        <Text style={styles.subtitle}>
          Connecte-toi pour accéder à ton profil et tes commandes.
        </Text>
        <Button
          title="Se connecter"
          onPress={() =>
            navigation.navigate("SignIn", { fromOnboarding: false })
          }
        />
        <TouchableOpacity
          style={styles.signupLink}
          onPress={() =>
            navigation.navigate("SignUp", { fromOnboarding: false })
          }
        >
          <Text style={styles.signupText}>
            Pas de compte ?{" "}
            <Text style={styles.signupBold}>Créer un compte</Text>
          </Text>
        </TouchableOpacity>
        {/* RESET (DEV) */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={async () => {
            await AsyncStorage.clear();
            dispatch(removeAllUsers());
            dispatch(removeAllCart());
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={20} color={colors.primary} />
          <Text
            style={[
              styles.resetButtonText,
              { width: "80%", textAlign: "center" },
            ]}
          >
            RESET (dev)
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const initial = username ? username[0].toUpperCase() : "?";

  // ========== VUE CONNECTÉE ==========
  return (
    <SafeAreaView style={styles.connectedContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TITRE */}
        <Text style={styles.headerTitle}>Profil</Text>

        {/* AVATAR */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initial}</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
              activeOpacity={0.8}
            >
              <Feather name="edit-2" size={14} color={colors.backgroundLight} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{username}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>

        {/* POINTS */}
        <PointsCard points={points} />

        {/* ========== SECTION FAVORIS & PRÉFÉRENCES ========== */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Favoris & Préférences</Text>

          <SettingRow
            icon="heart-outline"
            label="Favoris"
            iconColor={colors.primary}
            onPress={() => handleSettingPress("Favorites")}
          />

          <SettingRow
            icon="options-outline"
            label="Préférences alimentaires"
            iconColor={colors.primary}
            onPress={() => handleSettingPress("Preferences")}
          />
        </View>

        {/* ========== SECTION RÉGLAGES ========== */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Réglages</Text>

          <SettingRow
            icon="card-outline"
            label="Méthode de paiement"
            iconColor={colors.primary}
            onPress={() => handleSettingPress("PaymentMethod")}
          />

          <SettingRow
            icon="location-outline"
            label="Adresse"
            iconColor={colors.primary}
            onPress={() => handleSettingPress("Address")}
          />

          <SettingRow
            icon="lock-closed-outline"
            label="Mot de passe"
            iconColor={colors.primary}
            onPress={() => handleSettingPress("ChangePassword")}
          />
        </View>

        {/* DÉCONNEXION */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.primary} />
          <Text style={styles.logoutButtonText}>Déconnexion</Text>
        </TouchableOpacity>

        {/* RESET (DEV) */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={async () => {
            await AsyncStorage.clear();
            dispatch(removeAllUsers());
            dispatch(removeAllCart());
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={20} color={colors.primary} />
          <Text style={styles.resetButtonText}>RESET (dev)</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Kebapp v1.0.0 • Fait avec amour</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // DÉCONNECTÉ
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h3,
    color: colors.textDark,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.body,
    color: colors.textLight,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  signupLink: { marginTop: 18 },
  signupText: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.small,
    color: colors.textMuted,
  },
  signupBold: {
    fontFamily: fonts.family.bold,
    color: colors.primary,
  },

  // CONNECTÉ
  connectedContainer: { flex: 1, backgroundColor: "#F6F7FB" },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // HEADER
  headerTitle: {
    fontSize: fonts.size.h3,
    fontFamily: fonts.family.semibold,
    color: colors.textDark,
    textAlign: "center",
    marginBottom: 28,
  },

  // AVATAR
  avatarSection: { alignItems: "center", marginBottom: 32 },
  avatarContainer: { position: "relative", marginBottom: 12 },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFE8D6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFDCC9",
    overflow: "hidden",
  },
  avatarImage: { width: 120, height: 120, borderRadius: 60 },
  avatarText: {
    fontSize: 42,
    fontFamily: fonts.family.bold,
    color: colors.primary,
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: { elevation: 5 },
    }),
  },
  userName: {
    fontSize: fonts.size.h4,
    fontFamily: fonts.family.bold,
    color: colors.textDark,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: fonts.size.small,
    fontFamily: fonts.family.regular,
    color: colors.textMuted,
  },

  // POINTS
  pointsCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  pointsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  pointsLabel: {
    fontSize: fonts.size.body,
    fontFamily: fonts.family.regular,
    color: colors.textDark,
  },
  pointsValue: {
    fontSize: fonts.size.h2,
    fontFamily: fonts.family.bold,
    color: colors.primary,
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E8E8E8",
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: fonts.size.small,
    fontFamily: fonts.family.regular,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 12,
  },

  // SECTIONS
  settingsSection: { marginBottom: 28 },
  sectionTitle: {
    fontSize: fonts.size.body,
    fontFamily: fonts.family.semibold,
    color: colors.textDark,
    marginBottom: 12,
  },

  // LOGOUT
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF3E8",
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  logoutButtonText: {
    marginLeft: 10,
    fontSize: fonts.size.body,
    fontFamily: fonts.family.semibold,
    color: colors.primary,
  },

  // RESET
  resetButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF3E8",
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#FFD699",
  },
  resetButtonText: {
    marginLeft: 10,
    fontSize: fonts.size.body,
    fontFamily: fonts.family.semibold,
    color: colors.primary,
  },

  // FOOTER
  footer: {
    fontSize: fonts.size.caption,
    fontFamily: fonts.family.regular,
    color: colors.textLight,
    textAlign: "center",
    marginTop: 12,
  },
});
