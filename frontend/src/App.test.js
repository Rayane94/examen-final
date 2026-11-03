import { cartReducer } from "./context/CartContext";
test("ajout et suppression du panier", () => {
  const initial = { cart: [], shippingMethod: null, paymentMethod: null, shippingAddress: {} };
  const added = cartReducer(initial, { type:"ADD_TO_CART", payload: { id:"1", name:"Test", price:10 }});
  expect(added.cart).toHaveLength(1);
  expect(cartReducer(added, { type:"REMOVE_FROM_CART", payload:{id:"1"} }).cart).toHaveLength(0);
});
