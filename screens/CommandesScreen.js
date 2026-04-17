import React from "react";
import {
  View,
  Button,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaViewBase,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import colors from "../constants/colors";
import fonts from "../constants/fonts";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
export default function CommandesScreen({ navigation }) {
  const token = useSelector((state) => state.user.token);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const interval = setInterval(() => {
      setRefresh((prev) => prev + 1); // toutes les 20s → incrémente refresh
    }, 20000);
    return () => clearInterval(interval); // stoppe le timer quand on quitte la page
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      console.log("token:", token);
      fetch(`${apiUrl}/commandes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.result) {
            const orders = data.orders;

            if (orders.length === 0) {
              return;
            }

            setOrders(orders);
          } else {
            console.error("Error fetching orders:", data.message);
          }
        })
        .catch((error) => {
          console.error("Network error:", error);
        });
      fetch(`${apiUrl}/restaurants`)
        .then((res) => res.json())
        .then((data) => {
          if (data.result) setRestaurants(data.restaurants);
        })
        .catch((error) => console.error("Erreur fetch restaurants:", error));
    }, [refresh]),
  );
  const getLogoUrl = (restaurantName) => {
    const resto = restaurants.find((r) => r.name === restaurantName);
    return resto?.photos?.[0];
  };
  const handleDevOrderUpdate = async (orderId, status) => {
    const response = await fetch(`${apiUrl}/commandes/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ton token JWT
      },
      body: JSON.stringify({
        status: "DELIVERED", // ou "PENDING", "IN_PROGRESS", etc.
      }),
    });

    const data = await response.json();

    if (data.result) {
      console.log("Commande mise à jour :", data.order);
    } else {
      console.log("Erreur :", data.message);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.title}>
            <Text style={styles.titleText}>Vos commandes</Text>
          </View>
        </View>

        {/* Current Orders */}
        <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
          <Text style={styles.sectionTitle}>
            Commandes en cours{" "}
            <Text
              style={
                orders.filter((order) => !order.orderStatus.isFinalized)
                  .length === 0
                  ? [styles.orangeDot, { color: "#222" }]
                  : styles.orangeDot
              }
            >
              •
            </Text>
          </Text>
          {orders.filter((order) => !order.orderStatus.isFinalized).length ===
            0 && (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="file-tray-outline"
                size={48}
                color={colors.gray}
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.emptyText}>Aucune commande en cours</Text>
            </View>
          )}
          {orders
            .filter((order) => !order.orderStatus.isFinalized)
            .map((order) => (
              <View key={order._id} style={styles.card}>
                <View style={styles.cardHeader}>
                  {getLogoUrl(order.restaurant.name) ? (
                    <Image
                      source={{ uri: getLogoUrl(order.restaurant.name) }}
                      style={styles.logoPlaceholder}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.logoPlaceholder} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.restaurantName}>
                      {order.restaurant.name}
                      {/* Button de dev (DELIVERED) /* À supprimer en prod */}
                      <TouchableOpacity
                        onPress={() => {
                          handleDevOrderUpdate(order._id, "DELIVERED");
                          setRefresh((prev) => prev + 1);
                        }}
                        style={{
                          backgroundColor: "#FF6600",
                          paddingHorizontal: 2,
                          paddingVertical: 2,
                          borderRadius: 4,
                          marginLeft: 10,
                          gap: 4,
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 7,
                            fontWeight: "bold",
                          }}
                        >
                          DELIVERED
                        </Text>
                      </TouchableOpacity>
                    </Text>

                    <Text style={styles.orderNumber}>
                      N° de commande :{" "}
                      {order?.orderNumber?.slice(0, 3) +
                        "..." +
                        order?.orderNumber?.slice(-3)}
                    </Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      order.orderStatus.step === "ACCEPTED" && {
                        width: "33%",
                      },
                      order.orderStatus.step === "PREPARING" && {
                        width: "66%",
                      },
                      order.orderStatus.step === "READY" && { width: "100%" },
                    ]}
                  />
                </View>
                <View style={styles.progressLabels}>
                  <Text
                    style={[
                      styles.progressLabel,
                      order.orderStatus.step === "ACCEPTEE" &&
                        styles.activeStep,
                    ]}
                  >
                    ACCEPTÉE
                  </Text>
                  <Text
                    style={[
                      styles.progressLabel,
                      order.orderStatus.step === "PREPARING" &&
                        styles.activeStep,
                    ]}
                  >
                    EN PRÉPARATION
                  </Text>
                  <Text
                    style={[
                      styles.progressLabel,
                      order.orderStatus.step === "READY" && styles.activeStep,
                    ]}
                  >
                    PRÊTE
                  </Text>
                </View>

                <View style={styles.arrivalRow}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={colors.primary}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.arrivalText}>
                    Arrivée prévue à :{" "}
                    {order.estimatedArrivalTime
                      ? new Date(order.estimatedArrivalTime).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" },
                        )
                      : "Tqt ca arrive frère"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.moreButton}
                  onPress={() => setSelectedOrderId(order._id)}
                >
                  <Text style={styles.moreButtonText}>En savoir plus</Text>
                </TouchableOpacity>
                {/* Modal pour les détails de la commande */}
                <Modal
                  visible={selectedOrderId === order._id}
                  animationType="slide"
                  transparent={true}
                  onRequestClose={() => setSelectedOrderId(null)}
                >
                  <TouchableOpacity
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={() => setSelectedOrderId(null)}
                  >
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={(e) => e.stopPropagation()}
                    >
                      <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                          Détails de la commande
                        </Text>
                        <Text style={styles.modalItems}>
                          {order.items
                            .map((item) => `${item.quantity}x ${item.name}`)
                            .join("\n")}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setSelectedOrderId(null)}
                          style={styles.closeButton}
                        >
                          <Text style={styles.closeButtonText}>Fermer</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </Modal>
              </View>
            ))}
        </View>

        {/* Past Orders */}
        <Text style={[styles.sectionTitle, { paddingLeft: 20 }]}>
          Commandes précédentes
        </Text>
        <ScrollView
          style={{ paddingHorizontal: 20, marginTop: 20, marginBottom: 20 }}
        >
          {orders.filter((order) => order.orderStatus.isFinalized).length ===
            0 && (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="time-outline"
                size={48}
                color={colors.gray}
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.emptyText}>
                {" "}
                Vos commandes apparaîtront ici une fois passées.
              </Text>
            </View>
          )}
          {orders
            .filter((order) => order.orderStatus.isFinalized)
            .map((order) => (
              <View key={order._id} style={styles.card}>
                <View style={styles.cardHeader}>
                  {getLogoUrl(order.restaurant.name) ? (
                    <Image
                      source={{ uri: getLogoUrl(order.restaurant.name) }}
                      style={styles.logoPlaceholder}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.logoPlaceholder} />
                  )}

                  <View style={{ flex: 1 }}>
                    <Text style={styles.restaurantName}>
                      {order.restaurant.name}
                    </Text>
                    <Text style={styles.orderDate}>
                      {order.orderDate
                        ? new Date(order.orderDate).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "long",
                            },
                          )
                        : "Date inconnue"}{" "}
                      • {(order.totalPrice / 100).toFixed(2)}€
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.moreButton}
                  onPress={() => setSelectedOrderId(order._id)}
                >
                  <Text style={styles.moreButtonText}>En savoir plus</Text>
                </TouchableOpacity>
                <Modal
                  visible={selectedOrderId === order._id}
                  animationType="slide"
                  transparent={true}
                  onRequestClose={() => setSelectedOrderId(null)}
                >
                  <TouchableOpacity
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={() => setSelectedOrderId(null)}
                  >
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={(e) => e.stopPropagation()}
                    >
                      <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                          Détails de la commande
                        </Text>
                        <Text style={styles.modalItems}>
                          {order.items
                            .map((item) => `${item.quantity}x ${item.name}`)
                            .join("\n")}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setSelectedOrderId(null)}
                          style={styles.closeButton}
                        >
                          <Text style={styles.closeButtonText}>Fermer</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </Modal>
              </View>
            ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  modalContainer: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  modalContent: {
    width: "100%",
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 1,

    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 30,
    paddingHorizontal: 50,
    alignItems: "center",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 50,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 16,
  },
  modalItems: {
    fontSize: 15,
    color: "#333",
    lineHeight: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#3834343b",
    backgroundColor: "#fff",
  },
  backButton: {
    marginRight: 20,
  },
  searchButton: {
    marginLeft: 20,
  },
  title: {
    flex: 1,
    alignItems: "center",
  },
  titleText: {
    fontSize: fonts.size.large,
    fontWeight: "bold",
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#222",
  },
  orangeDot: {
    color: "#FF6600",
    fontSize: 18,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 32,
  },
  emptyText: {
    color: colors.gray,
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logoPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: "#E8D7C3",
    marginRight: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },
  orderNumber: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#E8E8E8",
    borderRadius: 3,
    marginVertical: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#FF6600",
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 11,
    color: "#999",
    fontWeight: "600",
  },
  activeStep: {
    color: "#FF6600",
    fontWeight: "bold",
  },
  arrivalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  arrivalText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  moreButton: {
    backgroundColor: "#FFF3EB",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 4,
  },
  moreButtonText: {
    color: "#FF6600",
    fontWeight: "bold",
    fontSize: 15,
  },
  orderDate: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  itemsText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
    marginTop: 2,
  },
  pastOrderButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  reorderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6600",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    justifyContent: "center",
  },
  reorderButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  helpButton: {
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginLeft: 10,
  },
  helpButtonText: {
    color: "#666",
    fontWeight: "bold",
    fontSize: 15,
  },
  currentOrders: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  currentOrdersList: {
    marginTop: 10,
  },
});
