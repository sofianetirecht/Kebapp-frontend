import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../components/Button";
import colors from "../constants/colors";
import fonts from "../constants/fonts";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDispatch } from "react-redux";
import { setToken } from "../reducers/user";
import { setUser, setFavorites } from "../reducers/user";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function LoginScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const fromOnboarding = route.params?.fromOnboarding ?? false;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Erreur", "Email et mot de passe requis.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (data.result) {
        dispatch(setToken(data.token));
        dispatch(setUser(data.user)); // Passe tout l'objet, pas juste le username
        // Charger les favoris
        const favResponse = await fetch(`${API_URL}/users/favorites`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        const favData = await favResponse.json();
        if (favData.result) {
          dispatch(setFavorites(favData.favorites.map((r) => r._id)));
        }
        if (fromOnboarding) {
          navigation.reset({
            index: 0,
            routes: [{ name: "OnboardingPreferences" }],
          });
        } else {
          navigation.replace("Main");
        }
      } else {
        Alert.alert("Erreur", data.error || "Connexion impossible");
      }
    } catch (e) {
      Alert.alert("Erreur réseau", "Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert("Info", "À implémenter : reset password");
  };

  const handleGoogle = () => {
    Alert.alert("Info", "À implémenter : Sign in with Google");
  };

  const handleApple = () => {
    Alert.alert("Info", "À implémenter : Sign in with Apple");
  };

  const goToSignup = () => {
    navigation.navigate("SignUp", { fromOnboarding });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.canvas}>
            {/* Card */}
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.closeWrap}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="close" size={24} color={colors.textDark} />
              </TouchableOpacity>

              <View style={styles.iconWrap}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name="rocket-outline"
                    size={26}
                    color={colors.primary}
                  />
                </View>
              </View>

              <Text style={styles.title}>Bon retour !</Text>
              <Text style={styles.subtitle}>
                Entre tes identifiants pour accéder à ton compte
              </Text>

              {/* Email */}
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.textLight}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>

              {/* Password */}
              <View style={styles.passwordRow}>
                <Text style={styles.label}>Mot de passe</Text>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgot}>Mot de passe oublié ?</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrap}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textLight}
                  secureTextEntry={!showPwd}
                  style={styles.input}
                />
                <TouchableOpacity
                  onPress={() => setShowPwd((v) => !v)}
                  style={styles.eyeBtn}
                  hitSlop={10}
                >
                  <Ionicons
                    name={showPwd ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={colors.textLight}
                  />
                </TouchableOpacity>
              </View>

              {/* Login button */}
              <Button
                title={loading ? "Connexion ..." : "Se connecter"}
                onPress={handleSignin}
              />

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Ou continuer avec</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social buttons */}
              <View style={styles.socialRow}>
                <TouchableOpacity
                  style={styles.socialBtn}
                  onPress={handleGoogle}
                >
                  <View style={styles.socialInner}>
                    <Text style={styles.socialIcon}>G</Text>
                    <Text style={styles.socialText}>Google</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialBtn}
                  onPress={handleApple}
                >
                  <View style={styles.socialInner}>
                    <Ionicons
                      name="logo-apple"
                      size={18}
                      color={colors.textDark}
                    />
                    <Text style={styles.socialText}>Apple</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {fromOnboarding && (
                <TouchableOpacity
                  style={styles.bottomRow}
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons
                    name="arrow-back"
                    size={18}
                    color={colors.textMuted}
                  />
                  <Text style={styles.bottomText}> Retour à l'inscription</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.backgroundCream,
  },
  canvas: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.backgroundCream,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 22,
    flex: 1,
  },
  closeWrap: {
    position: "absolute",
    top: 18,
    right: 18,
    zIndex: 10,
  },
  skip: {
    fontFamily: fonts.family.bold,
    color: colors.primary,
    fontSize: fonts.size.body,
  },
  iconWrap: {
    alignItems: "center",
    marginTop: 22,
    marginBottom: 14,
  },
  iconBox: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: "#F7E7DE",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    color: colors.textDark,
    fontFamily: fonts.family.extraBold,
    fontSize: fonts.size.h1,
    marginTop: 4,
  },
  subtitle: {
    textAlign: "center",
    color: colors.textMuted,
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.small,
    marginTop: 6,
    marginBottom: 20,
  },
  label: {
    color: colors.textDark,
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.small,
    marginBottom: 8,
  },
  inputWrap: {
    position: "relative",
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  input: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.body,
    color: colors.textDark,
    paddingRight: 34,
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    height: 26,
    width: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  passwordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  forgot: {
    color: colors.primary,
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.caption,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: 12,
    color: colors.textLight,
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.caption,
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  socialBtn: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  socialInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  socialIcon: {
    width: 18,
    textAlign: "center",
    fontFamily: fonts.family.black,
    color: "#4285F4",
  },
  socialText: {
    color: colors.textDark,
    fontFamily: fonts.family.extraBold,
    fontSize: fonts.size.body,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },
  bottomText: {
    color: colors.textMuted,
    fontFamily: fonts.family.bold,
  },
  bottomLink: {
    color: colors.primary,
    fontFamily: fonts.family.black,
  },
});
