import React, { useEffect, useRef } from "react";
import { Modal, TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../constants/colors";
import fonts from "../constants/fonts";

export default function CustomAlert({
  type = "success",
  title = "",
  message = "",
  visible,
  onClose,
}) {
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (visible) {
      const timeout = type === "success" ? 3000 : 4000;
      timeoutRef.current = setTimeout(() => {
        onClose && onClose();
      }, timeout);
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [visible, type, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.alertOverlay}
        onPress={() => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          onClose && onClose();
        }}
        activeOpacity={1}
      >
        <TouchableOpacity
          style={[
            styles.alertBox,
            type === "success" && { borderLeftColor: "#4CAF50" },
            type === "error" && { borderLeftColor: "#F44336" },
            type === "warning" && { borderLeftColor: "#FF9800" },
          ]}
          onPress={() => {}}
          activeOpacity={1}
        >
          <View
            style={[
              styles.alertIcon,
              type === "success" && { backgroundColor: "#4CAF50" },
              type === "error" && { backgroundColor: "#F44336" },
              type === "warning" && { backgroundColor: "#FF9800" },
            ]}
          >
            <Ionicons
              name={
                type === "success"
                  ? "checkmark-circle"
                  : type === "error"
                    ? "close-circle"
                    : "alert-circle"
              }
              size={24}
              color="white"
            />
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>{title}</Text>
            <Text style={styles.alertMessage}>{message}</Text>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  alertBox: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderLeftWidth: 5,
    maxWidth: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  alertContent: {
    flex: 1,
    gap: 4,
  },
  alertTitle: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.body,
    color: colors.textDark,
  },
  alertMessage: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.caption,
    color: colors.textMuted,
  },
});
