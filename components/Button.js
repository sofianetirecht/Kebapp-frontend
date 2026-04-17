import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import colors from "../constants/colors";
import fonts from "../constants/fonts";

export default function Button({
  title,
  onPress,
  backgroundColor,
  color,
  borderColor,
  disabled,
  borderWidth,
  height,
  width,
  fontSize,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        backgroundColor ? { backgroundColor } : null,
        borderColor ? { borderColor } : null,
        borderWidth ? { borderWidth } : null,
        disabled ? { opacity: 0.6 } : null,
        height ? { height } : null,
        width ? { width } : null,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.buttonText,
          color ? { color } : null,
          fontSize ? { fontSize } : null,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    height: 60,
    textAlign: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  buttonText: {
    color: colors.textWhite,
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.button,
  },
});
