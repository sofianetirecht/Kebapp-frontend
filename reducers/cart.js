import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [], // { menuItem, quantity, selectedOptions }
    restaurantName: null,
  },
  reducers: {
    addToCart: (state, action) => {
      const { menuItem, selectedOptions } = action.payload;
      state.restaurantName = action.payload.restaurantName;

      // Vérifie si le même plat avec les mêmes options existe déjà
      const existing = state.items.find(
        (i) =>
          i.menuItem._id === menuItem._id &&
          JSON.stringify(i.selectedOptions) === JSON.stringify(selectedOptions),
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ menuItem, selectedOptions, quantity: 1 });
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((_, index) => index !== action.payload);
    },
    decreaseQuantity: (state, action) => {
      const index = action.payload;
      if (state.items[index]) {
        if (state.items[index].quantity > 1) {
          state.items[index].quantity -= 1;
        } else {
          state.items = state.items.filter((_, i) => i !== index);
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.restaurantName = null;
    },
    removeAllCart: (state) => {
      state.items = [];
      state.restaurantName = null;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  decreaseQuantity,
  clearCart,
  removeAllCart,
} = cartSlice.actions;
export default cartSlice.reducer;
