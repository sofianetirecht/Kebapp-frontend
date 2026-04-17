import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import { useDispatch, useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import colors from "../constants/colors";
import fonts from "../constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { clearCart } from "../reducers/cart";
import CustomAlert from "../components/CustomAlert";

export default function PaymentScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const timeoutRef = useRef(null);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // 📦 État global Redux
  const cbCard = useSelector((state) => state.user.cbCard);
  const cartItems = useSelector((state) => state.cart.items);
  const restaurantName = useSelector((state) => state.cart.restaurantName);
  const token = useSelector((state) => state.user.token);

  // 💳 États pour la sélection et le paiement
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState({
    type: "warning",
    title: "",
    message: "",
  });

  // 💵 Calcul du prix total
  const totalPrice = cartItems.reduce(
    (sum, i) => sum + i.quantity * i.menuItem.basePrice,
    0,
  );

  console.log("💰 DEBUG totalPrice:", {
    cartItems: cartItems.length,
    items: cartItems.map((i) => ({
      name: i.menuItem.name,
      qty: i.quantity,
      price: i.menuItem.basePrice,
    })),
    totalPrice,
  });

  // 🔔 Afficher une alerte personnalisée
  const showCustomAlert = (type, title, message) => {
    setAlertData({ type, title, message });
    setAlertVisible(true);
    const timeout = type === "success" ? 3000 : 4000;
    timeoutRef.current = setTimeout(() => setAlertVisible(false), timeout);
  };

  // 📍 Nettoyer les timeouts au montage/démontage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // 💳 Créer la commande et payer
  const handlePay = async () => {
    console.log("🔵 handlePay called");
    console.log("📦 cartItems:", cartItems);
    console.log("🏪 restaurantName:", restaurantName);
    console.log("🔐 Token:", token);
    console.log("🌐 API_URL:", API_URL);

    if (cartItems.length === 0) {
      showCustomAlert(
        "warning",
        "Panier vide",
        "Ajoute des articles à ton panier avant de payer.",
      );
      return;
    }

    if (!restaurantName) {
      showCustomAlert(
        "error",
        "Erreur",
        "Informations manquantes du restaurant.",
      );
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Transformer les items du panier au format attendu par le backend
      const items = cartItems.map((cartItem) => ({
        name: cartItem.menuItem.name,
        quantity: cartItem.quantity,
        unitPrice: cartItem.menuItem.basePrice,
      }));

      console.log("✅ Items transformés:", JSON.stringify(items, null, 2));

      // Préparer le payload
      const payload = {
        restaurant: {
          name: restaurantName,
        },
        items,
        totalPrice: Math.round(totalPrice * 100) / 100,
      };

      console.log("📤 Envoi de la commande:", payload);
      console.log("📍 URL API:", `${API_URL}/commandes`);
      console.log("🔐 Token:", token);

      // Envoyer la commande au backend avec token en header
      const response = await fetch(`${API_URL}/commandes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("📨 Réponse reçue:", response.status);
      console.log("📦 Données reçues du backend:", data);

      if (data.result) {
        console.log("✅ Succès! Commande créée");
        const orderNumber = data.order?.orderNumber || "N/A";
        showCustomAlert(
          "success",
          "Commande validée ! Tu as gagne 100 points de fidélité 🎉",
          `Numéro: ${orderNumber}\nTa commande a été créée avec succès.`,
        );
        // Vider le panier et naviger
        dispatch(clearCart());
        setTimeout(() => {
          navigation.navigate("Main", { screen: "Commandes" });
        }, 2000);
      } else {
        console.log("❌ Erreur:", data.message);
        showCustomAlert(
          "error",
          "Erreur",
          data.message || "Impossible de créer la commande.",
        );
      }
    } catch (error) {
      console.error("❌ Erreur paiement:", error);
      showCustomAlert(
        "error",
        "Erreur réseau",
        "Impossible de traiter le paiement.",
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };
  const handleAddPoints = async (points) => {
    try {
      const response = await fetch(`${API_URL}/users/points`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ points }),
      });

      const data = await response.json();
      if (data.result) {
        console.log("✅ Points mis à jour:", data);
      } else {
        console.log("❌ Erreur mise à jour points:", data.message);
      }
    } catch (error) {
      console.error("❌ Erreur réseau mise à jour points:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundLight }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text style={styles.backText}>Retour à la commande</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Paiement</Text>
        </View>
        <View style={styles.totalPrice}>
          <Text style={styles.totalText}>Montant à payer</Text>
          <Text style={styles.totalValue}>
            {(totalPrice / 100).toFixed(2)}€
          </Text>
        </View>
        <View style={styles.paymentMethods}>
          <Button
            height={50}
            fontSize={20}
            backgroundColor="#191212ff"
            color={colors.textWhite}
            title="Apple Pay"
            onPress={() => {
              setAlertData({
                type: "warning",
                title: "Non disponible",
                message: "Apple Pay n'est pas encore implémenté.",
              });
              setAlertVisible(true);
            }}
          />
          <CustomAlert
            visible={alertVisible}
            type={alertData.type}
            title={alertData.title}
            message={alertData.message}
            onClose={() => setAlertVisible(false)}
          />
          <Button
            height={50}
            fontSize={20}
            backgroundColor="#4285F4"
            color={colors.textWhite}
            title="Google Pay"
            onPress={() => {
              setAlertData({
                type: "warning",
                title: "Non disponible",
                message: "Google Pay n'est pas encore implémenté.",
              });
              setAlertVisible(true);
            }}
          />
          <CustomAlert
            visible={alertVisible}
            type={alertData.type}
            title={alertData.title}
            message={alertData.message}
            onClose={() => setAlertVisible(false)}
          />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardText}>
            Sélectionnez une carte enregistrée :
          </Text>
          <ScrollView style={styles.cardActions}>
            {Array.isArray(cbCard) && cbCard.length > 0 ? (
              cbCard.map((card, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.cardItem,
                    selectedCardId === card.id && styles.cardItemSelected,
                  ]}
                  onPress={() => setSelectedCardId(card.id)}
                >
                  <Text style={styles.cardType}>{card.cardType}</Text>
                  <Text style={styles.cardText}>{card.cardholderName}</Text>
                  <Text
                    style={styles.cardText}
                  >{`**** **** **** ${card?.last4 ?? "----"}`}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                onPress={() => navigation.navigate("PaymentMethod")}
              >
                <Text style={styles.cardText}>Aucune carte enregistrée</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
        <Button
          backgroundColor="white"
          borderWidth={2}
          borderColor={colors.primary}
          color={colors.primary}
          fontSize={16}
          title="Ajouter une carte"
          onPress={() => navigation.navigate("PaymentMethod")}
        />
        <View style={styles.footer}>
          <Button
            disabled={!selectedCardId || isProcessingPayment}
            fontSize={18}
            title="payer"
            onPress={() => {
              handlePay();
              handleAddPoints(100); // +100 points fidélité
            }}
          />
        </View>
        <CustomAlert
          visible={alertVisible}
          type={alertData.type}
          title={alertData.title}
          message={alertData.message}
          onClose={() => setAlertVisible(false)}
        />
      </View>
      <CustomAlert
        visible={alertVisible}
        type={alertData.type}
        title={alertData.title}
        message={alertData.message}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: colors.backgroundLight,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  backText: {
    fontSize: fonts.size.body,
    fontFamily: fonts.family.semibold,
    color: colors.primary,
  },
  header: {
    width: "100%",
  },
  title: {
    fontSize: fonts.size.h3,
    fontFamily: fonts.family.bold,
    color: colors.textDark,
    textAlign: "center",
  },
  totalPrice: {
    marginVertical: 20,

    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "solid",
    padding: 10,
    borderRadius: 13,
    width: "100%",
    alignItems: "center",
    height: "15%",
    backgroundColor: colors.backgroundCream,
  },
  totalText: {
    fontSize: 15,
    fontFamily: fonts.family.regular,
    color: colors.textDark,
  },
  cardInfo: {
    width: "100%",
    marginTop: 20,
  },
  cardActions: {
    marginTop: 10,
    width: "100%",
    maxHeight: 200,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.backgroundCream,
  },
  cardText: {
    fontSize: fonts.size.body,
    fontFamily: fonts.family.regular,
    color: colors.textDark,
  },
  totalValue: {
    fontFamily: fonts.family.bold,
    fontSize: 26,
    color: colors.primary,
  },
  paymentMethods: {
    width: "100%",
    gap: 12,
  },
  cardItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.backgroundLight,
    marginBottom: 8,
  },
  cardItemSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.backgroundCream,
  },
  cardType: {
    fontSize: fonts.size.body,
    fontFamily: fonts.family.bold,
    color: colors.primary,
    marginBottom: 4,
  },
  footer: {
    width: "100%",
    alignItems: "center",
  },
};
