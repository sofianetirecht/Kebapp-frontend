import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState, useRef } from "react";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import colors from "../constants/colors";
import fonts from "../constants/fonts";
import { useSelector, useDispatch } from "react-redux";
import { addCbCard, removeCbCard } from "../reducers/user";
import CustomAlert from "../components/CustomAlert";

export default function PaymentMethodScreen() {
  const navigation = useNavigation();
  const timeoutRef = useRef(null);
  const dispatch = useDispatch();

  const savedCards = useSelector((state) => state.user?.cbCard ?? []);

  const addCardSheetRef = useRef(null);
  const deleteConfirmSheetRef = useRef(null);

  const [deleteCardId, setDeleteCardId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState({
    type: "success",
    title: "",
    message: "",
  });

  const [formData, setFormData] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  const showCustomAlert = (type, title, message) => {
    setAlertData({ type, title, message });
    setShowAlert(true);
    const timeout = type === "success" ? 3000 : 4000;
    timeoutRef.current = setTimeout(() => setShowAlert(false), timeout);
  };

  const openAddCard = () => {
    addCardSheetRef.current?.expand();
  };

  const closeAddCard = () => {
    addCardSheetRef.current?.close();
    setFormData({
      cardholderName: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
    });
  };

  const openDeleteConfirm = (id) => {
    setDeleteCardId(id);
    deleteConfirmSheetRef.current?.expand();
  };

  const closeDeleteConfirm = () => {
    deleteConfirmSheetRef.current?.close();
    setDeleteCardId(null);
  };

  const handleAddCard = async () => {
    const { cardholderName, cardNumber, expiryMonth, expiryYear, cvv } =
      formData;

    if (
      !cardholderName.trim() ||
      !cardNumber.trim() ||
      !expiryMonth.trim() ||
      !expiryYear.trim() ||
      !cvv.trim()
    ) {
      showCustomAlert(
        "warning",
        "Information manquante",
        "Complète tous les champs.",
      );
      return;
    }

    if (cardNumber.replace(/\s/g, "").length !== 16) {
      showCustomAlert(
        "warning",
        "Numéro invalide",
        "Le numéro de carte doit contenir 16 chiffres.",
      );
      return;
    }

    setLoading(true);
    try {
      const last4 = cardNumber.slice(-4);
      const cardType = cardNumber.startsWith("4")
        ? "Visa"
        : cardNumber.startsWith("5")
          ? "Mastercard"
          : "Carte bancaire";

      const newCard = {
        id: Date.now().toString(),
        cardholderName: cardholderName.trim(),
        cardType,
        last4,
        expiry: `${expiryMonth}/${expiryYear}`,
      };
      dispatch(addCbCard(newCard));
      closeAddCard();
      showCustomAlert("success", "Succès", "Carte ajoutée!");
    } catch (error) {
      showCustomAlert("error", "Erreur", "Impossible d'ajouter la carte.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteCard = async () => {
    if (!deleteCardId) return;
    try {
      dispatch(removeCbCard(deleteCardId));
      closeDeleteConfirm();
      showCustomAlert("success", "Succès", "Carte supprimée!");
    } catch (error) {
      showCustomAlert("error", "Erreur", "Impossible de supprimer la carte.");
      closeDeleteConfirm();
    }
  };

  const renderBackdrop = (props) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
  );

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
        <Text style={styles.headerTitle}>Méthode de paiement</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionLabel}>Vos cartes bancaires</Text>

        {savedCards.length > 0 ? (
          savedCards.map((card) => (
            <View key={card.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <Ionicons
                  name="card-outline"
                  size={28}
                  color={colors.primary}
                />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardType}>
                    {card.cardType} •••• {card.last4}
                  </Text>
                  <Text style={styles.cardExpiry}>Expire {card.expiry}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => openDeleteConfirm(card.id)}
                style={styles.deleteCardBtn}
              >
                <Ionicons
                  name="trash-outline"
                  size={22}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyTitle}>Aucune carte enregistrée</Text>
            <Text style={styles.emptyMessage}>
              Ajoute une carte bancaire pour payer tes commandes facilement.
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.addBtn} onPress={openAddCard}>
          <Ionicons
            name="add-circle-outline"
            size={22}
            color={colors.primary}
          />
          <Text style={styles.addBtnText}>Ajouter une carte</Text>
        </TouchableOpacity>
      </View>

      {/* BottomSheet: Ajouter une carte */}
      <BottomSheet
        ref={addCardSheetRef}
        index={-1}
        snapPoints={["90%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onClose={closeAddCard}
      >
        <BottomSheetView style={styles.sheetContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <Text style={styles.sheetTitle}>Ajouter une carte</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nom du titulaire</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Jean Dupont"
                  placeholderTextColor={colors.textLight}
                  value={formData.cardholderName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, cardholderName: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Numéro de carte</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                  maxLength={19}
                  value={formData.cardNumber}
                  onChangeText={(text) => {
                    const formatted = text
                      .replace(/\s/g, "")
                      .replace(/(\d{4})/g, "$1 ")
                      .trim();
                    setFormData({ ...formData, cardNumber: formatted });
                  }}
                />
              </View>

              <View style={styles.rowGroup}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.label}>Mois</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM"
                    placeholderTextColor={colors.textLight}
                    keyboardType="numeric"
                    maxLength={2}
                    value={formData.expiryMonth}
                    onChangeText={(text) =>
                      setFormData({ ...formData, expiryMonth: text })
                    }
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.label}>Année</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YY"
                    placeholderTextColor={colors.textLight}
                    keyboardType="numeric"
                    maxLength={2}
                    value={formData.expiryYear}
                    onChangeText={(text) =>
                      setFormData({ ...formData, expiryYear: text })
                    }
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor={colors.textLight}
                    keyboardType="numeric"
                    maxLength={3}
                    value={formData.cvv}
                    onChangeText={(text) =>
                      setFormData({ ...formData, cvv: text })
                    }
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.6 }]}
                onPress={handleAddCard}
                disabled={loading}
              >
                <Text style={styles.submitBtnText}>Ajouter la carte</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </BottomSheetView>
      </BottomSheet>

      {/* BottomSheet: Confirmer suppression */}
      <BottomSheet
        ref={deleteConfirmSheetRef}
        index={-1}
        snapPoints={["35%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onClose={closeDeleteConfirm}
      >
        <BottomSheetView style={styles.sheetContainer}>
          <Ionicons
            name="trash-outline"
            size={40}
            color="#F44336"
            style={{ marginBottom: 16, alignSelf: "center" }}
          />
          <Text style={styles.confirmTitle}>Supprimer la carte ?</Text>
          <Text style={styles.confirmMessage}>
            Cette action ne peut pas être annulée.
          </Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={closeDeleteConfirm}
            >
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtnConfirm}
              onPress={confirmDeleteCard}
            >
              <Text style={styles.deleteBtnText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>

      <CustomAlert
        type={alertData.type}
        title={alertData.title}
        message={alertData.message}
        visible={showAlert}
        onClose={() => setShowAlert(false)}
      />
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
  sectionLabel: {
    fontFamily: fonts.family.semibold,
    fontSize: fonts.size.body,
    color: colors.textDark,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  cardInfo: { gap: 2 },
  cardType: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.body,
    color: colors.textDark,
  },
  cardExpiry: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.caption,
    color: colors.textMuted,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  addBtnText: {
    fontFamily: fonts.family.semibold,
    fontSize: fonts.size.body,
    color: colors.primary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 40,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h4,
    color: colors.textDark,
  },
  emptyMessage: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.body,
    color: colors.textMuted,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  deleteCardBtn: { padding: 8 },
  // BottomSheet
  sheetContainer: {
    justifyContent: "flex-end",
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  sheetTitle: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h4,
    color: colors.textDark,
    marginBottom: 24,
    textAlign: "center",
  },
  formGroup: { marginBottom: 20 },
  rowGroup: { flexDirection: "row" },
  label: {
    fontFamily: fonts.family.semibold,
    fontSize: fonts.size.body,
    color: colors.textDark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.body,
    color: colors.textDark,
    backgroundColor: colors.backgroundLight,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  submitBtnText: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.body,
    color: "white",
  },
  confirmTitle: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h4,
    color: colors.textDark,
    textAlign: "center",
    marginBottom: 8,
  },
  confirmMessage: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.body,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 24,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    fontFamily: fonts.family.semibold,
    fontSize: fonts.size.body,
    color: colors.textDark,
  },
  deleteBtnConfirm: {
    flex: 1,
    backgroundColor: "#F44336",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  deleteBtnText: {
    fontFamily: fonts.family.semibold,
    fontSize: fonts.size.body,
    color: "white",
  },
});
