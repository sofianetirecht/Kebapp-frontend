import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import colors from "../constants/colors";
import fonts from "../constants/fonts";

export default function OnboardingReady({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../assets/onboarding-ready.png")}
        style={styles.image}
        resizeMode="cover"
      />

      <Text style={styles.title}>Tu es prêt</Text>
      <Text style={styles.subtitle}>
        Découvre les meilleurs kebabs de Paris dès maintenant.
      </Text>

      <Button
        title="Commencez"
        onPress={() => navigation.navigate("Geolocation")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  image: {
    width: 300,
    height: 280,
    borderRadius: 20,
    marginBottom: 30,
  },
  title: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h2,
    color: colors.textDark,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.body,
    color: colors.textLight,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
});
