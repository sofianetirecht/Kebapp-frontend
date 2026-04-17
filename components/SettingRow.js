import React from "react";
import { TouchableOpacity, View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../constants/colors";
import fonts from "../constants/fonts";

/**
 * Ligne de réglage cliquable avec icône + label + chevron
 * Réutilisable pour les listes de réglages, options, etc.
 *
 * @param {string} icon - Nom de l'icône Ionicons (ex: "heart-outline")
 * @param {string} label - Texte affiché
 * @param {function} onPress - Callback au clic
 * @param {string} iconColor - Couleur de l'icône (défaut: colors.primary)
 */
export default function SettingRow({
  icon,
  label,
  onPress,
  iconColor = colors.primary,
}) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.leftContent}>
        <Ionicons name={icon} size={24} color={iconColor} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },

  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  label: {
    marginLeft: 14,
    fontSize: fonts.size.body,
    fontFamily: fonts.family.regular,
    color: colors.textDark,
  },
});
