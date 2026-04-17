import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    token: null,
    username: null,
    email: null,
    avatar: null,
    preferences: [],
    hasOnboarded: false,
    favorites: [],
    cbCard: [],
  },
  reducers: {
    setUser: (state, action) => {
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.avatar = action.payload.avatar;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setPreferences: (state, action) => {
      state.preferences = action.payload;
    },
    setHasOnboarded: (state) => {
      state.hasOnboarded = true;
    },
    logout: (state) => {
      state.token = null;
      state.username = null;
      state.email = null;
      state.avatar = null;
      console.log("Token reducer =>", state.token);
      // On ne reset PAS hasOnboarded — même après un logout,
      // l'utilisateur ne doit pas revoir l'onboarding
    },
    // Reset Onboarding spécialement pour la période de développement, permet de reset le store persistant
    // A SUPPRIMER POUR LE MVP DE FIN
    resetOnboarding: (state) => {
      state.token = null;
      state.preferences = [];
      state.hasOnboarded = false;
    },
    setFavorites: (state, action) => {
      state.favorites = action.payload;
    },
    addFavorite: (state, action) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
        console.log("favorites reducer =>", state.favorites);
      }
    },
    removeFavorite: (state, action) => {
      state.favorites = state.favorites.filter((id) => id !== action.payload);
      console.log("favorites reducer =>", state.favorites);
    },
    addCbCard: (state, action) => {
      if (!Array.isArray(state.cbCard)) {
        state.cbCard = [];
      }
      state.cbCard.push(action.payload);
    },
    setCbCards: (state, action) => {
      state.cbCard = Array.isArray(action.payload) ? action.payload : [];
    },
    removeCbCard: (state, action) => {
      if (!Array.isArray(state.cbCard)) {
        state.cbCard = [];
      }
      state.cbCard = state.cbCard.filter((card) => card.id !== action.payload);
    },
    removeAllUsers: (state) => {
      state.token = null;
      state.username = null;
      state.email = null;
      state.avatar = null;
      state.preferences = [];
      state.hasOnboarded = false;
      state.favorites = [];
      state.cbCard = [];
    },
  },
});

export const {
  setToken,
  setUser,
  removeCbCard,
  addCbCard,
  setCbCards,
  setPreferences,
  setHasOnboarded,
  logout,
  resetOnboarding,
  setFavorites,
  addFavorite,
  removeFavorite,
  removeAllUsers,
} = userSlice.actions;
export default userSlice.reducer;
