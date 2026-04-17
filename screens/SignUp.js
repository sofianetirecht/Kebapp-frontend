import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
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
import { setUser } from "../reducers/user";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function SignInScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const fromOnboarding = route.params?.fromOnboarding ?? false;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || !password) {
      Alert.alert("Erreur", "Username, email et mot de passe requis.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (data.result) {
        dispatch(setToken(data.token));
        dispatch(setUser(data.user));

        if (fromOnboarding) {
          navigation.reset({
            index: 0,
            routes: [{ name: "OnboardingPreferences" }],
          });
        } else {
          navigation.navigate("OnboardingPreferences", { fromProfile: true });
        }
      } else {
        Alert.alert("Erreur", data.error || "Connexion impossible");
      }
    } catch (err) {
      Alert.alert("Erreur réseau", "Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => navigation.goBack();

  const handleGoogle = () => {
    Alert.alert("Info", "Google login à brancher ensuite");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() =>
                  fromOnboarding
                    ? navigation.replace("Geolocation")
                    : navigation.goBack()
                }
              >
                {fromOnboarding ? (
                  <Text style={styles.skip}>Passer</Text>
                ) : (
                  <Ionicons name="close" size={24} color={colors.textDark} />
                )}
              </TouchableOpacity>

              {/* Logo */}
              <View style={styles.logoWrap}>
                <View style={styles.logoBox}>
                  <Text style={styles.logoMark}>{"</>"}</Text>
                </View>
              </View>

              <Text style={styles.title}>Créer un compte</Text>
              <Text style={styles.subtitle}>
                Entre tes informations pour créer ton compte
              </Text>

              {/* Username */}
              <Text style={styles.label}>Nom d'utilisateur</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Choisis ton pseudo"
                  placeholderTextColor={colors.textLight}
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

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
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Entre ton mot de passe"
                  placeholderTextColor={colors.textLight}
                  secureTextEntry={!showPwd}
                  style={[styles.input, { paddingRight: 44 }]}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPwd((v) => !v)}
                  hitSlop={10}
                >
                  <Ionicons
                    name={showPwd ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={colors.textLight}
                  />
                </TouchableOpacity>
              </View>

              {/* Button */}
              <Button
                title={loading ? "Inscription..." : "S'inscrire"}
                onPress={handleSignup}
              />

              {/* Divider OR */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OU</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google */}
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={handleGoogle}
              >
                <View style={styles.secondaryInner}>
                  <View style={styles.googleDot} />
                  <Text style={styles.secondaryText}>
                    Continuer avec Google
                  </Text>
                </View>
              </TouchableOpacity>

              {fromOnboarding && (
                <View style={styles.backRow}>
                  <Text style={styles.backText}>Déjà un compte ? </Text>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("SignIn", { fromOnboarding })
                    }
                  >
                    <Text style={styles.backLink}>Se connecter</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.terms}>
                En t'inscrivant, tu acceptes nos{" "}
                <Text style={styles.link}>Conditions</Text> et notre{" "}
                <Text style={styles.link}>Politique de confidentialité</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.backgroundCream },
  container: { flex: 1, justifyContent: "center" },
  card: {
    backgroundColor: colors.backgroundCream,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 22,
    flex: 1,
  },
  closeBtn: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  skip: {
    fontFamily: fonts.family.bold,
    color: colors.primary,
    fontSize: fonts.size.body,
  },
  logoWrap: { alignItems: "center", marginTop: 30, marginBottom: 10 },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#F7E7DE",
    alignItems: "center",
    justifyContent: "center",
  },
  logoMark: {
    color: colors.primary,
    fontFamily: fonts.family.black,
    fontSize: fonts.size.h4,
  },
  title: {
    textAlign: "center",
    color: colors.textDark,
    fontFamily: fonts.family.black,
    fontSize: 30,
  },
  subtitle: {
    textAlign: "center",
    color: colors.textMuted,
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.small,
    marginTop: 6,
    marginBottom: 18,
  },
  label: {
    color: colors.textDark,
    fontFamily: fonts.family.extraBold,
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
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    height: 28,
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 14,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    paddingHorizontal: 12,
    color: colors.textLight,
    fontFamily: fonts.family.black,
    fontSize: fonts.size.caption,
  },
  secondaryBtn: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryInner: { flexDirection: "row", alignItems: "center", gap: 10 },
  googleDot: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  secondaryText: {
    color: colors.textDark,
    fontFamily: fonts.family.black,
    fontSize: fonts.size.body,
  },
  backLink: {
    color: colors.primary,
    fontFamily: fonts.family.black,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  backText: {
    color: colors.textMuted,
    fontFamily: fonts.family.semibold,
  },
  terms: {
    textAlign: "center",
    color: colors.textLight,
    fontFamily: fonts.family.regular,
    fontSize: 11,
    marginTop: 14,
    lineHeight: 16,
  },
  link: {
    color: colors.textLight,
    textDecorationLine: "underline",
  },
});
