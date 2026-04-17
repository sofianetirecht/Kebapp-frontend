import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import colors from "../constants/colors";
import fonts from "../constants/fonts";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PasswordScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mot de passe</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Info card */}
        <View style={styles.infoCard}>
          <Ionicons
            name="lock-closed-outline"
            size={32}
            color={colors.primary}
          />
          <Text style={styles.infoTitle}>Sécurité du compte</Text>
          <Text style={styles.infoText}>
            Pour des raisons de sécurité, ton mot de passe est chiffré et ne
            peut pas être affiché. Tu peux le réinitialiser à tout moment via un
            lien envoyé par email.
          </Text>
        </View>

        {/* Password field (fake, juste visuel) */}
        <Text style={styles.label}>Mot de passe actuel</Text>
        <View style={styles.fakeInput}>
          <Text style={styles.fakePassword}>••••••••••••</Text>
          <Ionicons name="eye-off-outline" size={20} color={colors.textLight} />
        </View>

        {/* Bouton reset */}
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={() => navigation.navigate("ForgotPassword")}
          activeOpacity={0.8}
        >
          <Ionicons name="mail-outline" size={20} color="#fff" />
          <Text style={styles.resetBtnText}>
            Réinitialiser mon mot de passe
          </Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          Tu recevras un lien de réinitialisation par email, valable 1 heure.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7FB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h4,
    color: colors.textDark,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  infoCard: {
    backgroundColor: "#FFF3E8",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
  },
  infoTitle: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.body,
    color: colors.textDark,
  },
  infoText: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.small,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  label: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.small,
    color: colors.textDark,
    marginBottom: 8,
  },
  fakeInput: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  fakePassword: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.body,
    color: colors.textLight,
    letterSpacing: 3,
  },
  resetBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },
  resetBtnText: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.body,
    color: "#fff",
  },
  hint: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.caption,
    color: colors.textLight,
    textAlign: "center",
    lineHeight: 18,
  },
});
