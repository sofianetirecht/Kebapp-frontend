import { useCallback, useEffect, useRef } from "react";
import { View, Image, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from "@expo-google-fonts/poppins";
import * as SplashScreen from "expo-splash-screen";
import * as Linking from "expo-linking";
import colors from "./constants/colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Platform, StatusBar } from "react-native";

// Redux + Persist
import { Provider, useSelector } from "react-redux";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import user from "./reducers/user";
import cart from "./reducers/cart";

// Screens
import RestaurantScreen from "./screens/RestaurantScreen";
import HomeScreen from "./screens/HomeScreen";
import MapScreen from "./screens/MapScreen";
import CommandesScreen from "./screens/CommandesScreen";
import ProfileScreen from "./screens/ProfileScreen";
import Geolocation from "./screens/Geolocation";
import OnboardingWelcome from "./screens/OnboardingWelcome";
import OnboardingPreferences from "./screens/OnboardingPreferences";
import OnboardingReady from "./screens/OnboardingReady";
import SignIn from "./screens/SignIn";
import SignUp from "./screens/SignUp";
import RestaurantsList from "./screens/RestaurantsList";
import FavoritesScreen from "./screens/FavoritesScreen";
import PreferencesEditScreen from "./screens/PreferencesEditScreen";
import PaymentMethodScreen from "./screens/PaymentMethodScreen";
import AddressScreen from "./screens/AddressScreen";
import PasswordScreen from "./screens/PasswordScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import PaymentScreen from "./screens/PayementScreen";

// Config redux-persist
const persistConfig = {
  key: "kebapp",
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({ user, cart }),
);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

const persistor = persistStore(store);

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  const avatar = useSelector((state) => state.user.avatar);
  const username = useSelector((state) => state.user.username);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarIcon: ({ color, size, focused }) => {
          // Profile tab: show user avatar or initial
          if (route.name === "Profile") {
            if (avatar) {
              return (
                <Image
                  source={{ uri: avatar }}
                  style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: focused ? 2 : 0,
                    borderColor: focused ? colors.primary : "transparent",
                  }}
                />
              );
            } else if (username) {
              const initial = username[0].toUpperCase();
              return (
                <View
                  style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: colors.primary,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: focused ? 2 : 0,
                    borderColor: colors.primary,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: size / 2,
                      fontWeight: "bold",
                    }}
                  >
                    {initial}
                  </Text>
                </View>
              );
            } else {
              return (
                <Ionicons name="person-outline" size={size} color={color} />
              );
            }
          }

          // Other tabs: show icons
          let iconName = "";
          if (route.name === "Home") iconName = "home";
          if (route.name === "Map") iconName = "map-outline";
          if (route.name === "Commandes") iconName = "bag-handle-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Commandes" component={CommandesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const hasOnboarded = useSelector((state) => state.user.hasOnboarded);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {hasOnboarded ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen
            name="OnboardingPreferences"
            component={OnboardingPreferences}
          />
          <Stack.Screen name="RestaurantsList" component={RestaurantsList} />
          <Stack.Screen name="Restaurant" component={RestaurantScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
          <Stack.Screen name="Preferences" component={PreferencesEditScreen} />
          <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
          <Stack.Screen name="Address" component={AddressScreen} />
          <Stack.Screen name="ChangePassword" component={PasswordScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      ) : (
        <>
          <Stack.Screen
            name="OnboardingWelcome"
            component={OnboardingWelcome}
          />
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen
            name="OnboardingPreferences"
            component={OnboardingPreferences}
          />
          <Stack.Screen name="OnboardingReady" component={OnboardingReady} />
          <Stack.Screen name="Geolocation" component={Geolocation} />
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
          <Stack.Screen name="Preferences" component={PreferencesEditScreen} />
          <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
          <Stack.Screen name="Address" component={AddressScreen} />
          <Stack.Screen name="ChangePassword" component={PasswordScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const navigationRef = useRef();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // 🔗 Écouter les deep links entrants
  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      const parsed = Linking.parse(url);

      // Extract token from query params
      const token = parsed.queryParams?.token;
      if (token) {
        navigationRef.current?.navigate("ResetPassword", { token });
      }
    });

    return () => subscription.remove();
  }, []);

  if (!fontsLoaded) return null;

  // ✅ Linking compatible Expo Go (exp://.../--/reset-password?token=xxx)
  // Plus tard (build), tu pourras aussi ajouter "kebapp://"
  const linking = {
    prefixes: [Linking.createURL("/")],
    config: {
      screens: {
        ResetPassword: {
          path: "reset-password",
          parse: {
            token: (token) => token,
          },
        },
      },
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <StatusBar
              barStyle="dark-content"
              backgroundColor="transparent"
              translucent={true}
            />
            <NavigationContainer linking={linking} ref={navigationRef}>
              <AppNavigator />
            </NavigationContainer>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

//   PersistGate — il attend que le store soit rechargé depuis AsyncStorage avant d'afficher l'app.
// Comme ça on sait si hasOnboarded est true ou false avant de décider quel screen afficher.
//  AppNavigator en composant séparé — on ne peut pas utiliser useSelector dans App directement car useSelector a besoin d'être à l'intérieur du Provider.
// C'est pour ça qu'on extrait la navigation dans un composant enfant.
//   Navigation conditionnelle — si hasOnboarded est true, la Stack ne contient que Main.
// L'utilisateur ne voit plus aucun screen d'onboarding. Si false, il a le flow complet.
