import { createSlice } from '@reduxjs/toolkit';
import { createAction } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';

import { CartItem } from '../../models/CartItem';
import { RootState } from '../state';


/* Actions */
export const addToCartAction = createAction<CartItem>('ADD_TO_CART');
export const removeFromCartAction = createAction<string>('REMOVE_FROM_CART');
export const incrementCartItemAction = createAction<string>('INCREMENT_CART_ITEM');
export const decrementCartItemAction = createAction<string>('DECREMENT_CART_ITEM');
export const clearCartAction = createAction('CLEAR_CART');

const adjustQuantity = (cartItem: CartItem, amount: number) => {
    return new CartItem(
        cartItem.id,
        cartItem.name,
        cartItem.price,
        cartItem.quantity + amount
    );
};

const handleCartAdjustment = (cartItems: ReadonlyArray<CartItem>, cartItemId: string, adjustmentAmount: number) => {
    const existingItemIndex = cartItems.findIndex((item) => item.id === cartItemId);

    let updatedCartItems: CartItem[] = [...cartItems]
    const cartItemExists = existingItemIndex !== -1;

    if (cartItemExists) {
        const adjustedCartItems = cartItems.map((item, index) => {
            if (index === existingItemIndex) {
                return adjustQuantity(item, adjustmentAmount);
            }
            return item;
        });

        updatedCartItems = adjustedCartItems.filter((item) => item.quantity > 0);
    }

    return updatedCartItems;
};

/* Slice (Reducers) */
export const cartSlice = createSlice({
    name: 'cart',
    initialState: { cartItems: [] as ReadonlyArray<CartItem> },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addToCartAction, (state, action) => {
                const cartItem = action.payload as CartItem;
                const existingItemIndex = state.cartItems.findIndex((item) => item.id === cartItem.id);

                if (existingItemIndex !== -1) {
                    state.cartItems = handleCartAdjustment(state.cartItems, cartItem.id, 1);
                } else {
                    state.cartItems.push(cartItem);
                }
            })
            .addCase(incrementCartItemAction, (state, action) => {
                state.cartItems = handleCartAdjustment(state.cartItems, action.payload, 1);
            })
            .addCase(decrementCartItemAction, (state, action) => {
                state.cartItems = handleCartAdjustment(state.cartItems, action.payload, -1);
            })
            .addCase(removeFromCartAction, (state, action) => {
                const id = action.payload;
                state.cartItems = state.cartItems.filter((item) => item.id !== id);
            })
            .addCase(clearCartAction, (state, _action) => {
                state.cartItems = [];
            });
    },
});

export default cartSlice.reducer;


/* Selectors */

export const selectCartItems$ = (state: RootState) => state.cart.cartItems.map((item) => item);
