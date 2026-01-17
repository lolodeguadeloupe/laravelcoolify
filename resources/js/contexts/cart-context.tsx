import { type Event, type TicketCategory } from '@/types';
import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';

export interface CartItem {
    event: Pick<Event, 'id' | 'title' | 'slug' | 'starts_at' | 'location' | 'city'>;
    category: TicketCategory;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    eventId: number | null;
}

type CartAction =
    | { type: 'ADD_ITEM'; payload: { event: CartItem['event']; category: TicketCategory; quantity: number } }
    | { type: 'UPDATE_QUANTITY'; payload: { categoryId: number; quantity: number } }
    | { type: 'REMOVE_ITEM'; payload: { categoryId: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'LOAD_CART'; payload: CartState };

interface CartContextType {
    items: CartItem[];
    eventId: number | null;
    addItem: (event: CartItem['event'], category: TicketCategory, quantity?: number) => void;
    updateQuantity: (categoryId: number, quantity: number) => void;
    removeItem: (categoryId: number) => void;
    clearCart: () => void;
    getItemQuantity: (categoryId: number) => number;
    getTotalItems: () => number;
    getSubtotal: () => number;
    getServiceFees: () => number;
    getTotal: () => number;
    isInCart: (categoryId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'event_cool_cart';

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const { event, category, quantity } = action.payload;

            if (state.eventId !== null && state.eventId !== event.id) {
                return {
                    eventId: event.id,
                    items: [{ event, category, quantity }],
                };
            }

            const existingItemIndex = state.items.findIndex((item) => item.category.id === category.id);

            if (existingItemIndex >= 0) {
                const newItems = [...state.items];
                const newQuantity = Math.min(
                    newItems[existingItemIndex].quantity + quantity,
                    category.max_per_order
                );
                newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    quantity: newQuantity,
                };
                return { ...state, items: newItems };
            }

            return {
                eventId: event.id,
                items: [...state.items, { event, category, quantity }],
            };
        }

        case 'UPDATE_QUANTITY': {
            const { categoryId, quantity } = action.payload;
            if (quantity <= 0) {
                return {
                    ...state,
                    items: state.items.filter((item) => item.category.id !== categoryId),
                };
            }
            return {
                ...state,
                items: state.items.map((item) =>
                    item.category.id === categoryId
                        ? { ...item, quantity: Math.min(quantity, item.category.max_per_order) }
                        : item
                ),
            };
        }

        case 'REMOVE_ITEM': {
            const newItems = state.items.filter((item) => item.category.id !== action.payload.categoryId);
            return {
                eventId: newItems.length > 0 ? state.eventId : null,
                items: newItems,
            };
        }

        case 'CLEAR_CART':
            return { eventId: null, items: [] };

        case 'LOAD_CART':
            return action.payload;

        default:
            return state;
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, { eventId: null, items: [] });

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                dispatch({ type: 'LOAD_CART', payload: parsed });
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const addItem = useCallback(
        (event: CartItem['event'], category: TicketCategory, quantity = 1) => {
            dispatch({ type: 'ADD_ITEM', payload: { event, category, quantity } });
        },
        []
    );

    const updateQuantity = useCallback((categoryId: number, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { categoryId, quantity } });
    }, []);

    const removeItem = useCallback((categoryId: number) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { categoryId } });
    }, []);

    const clearCart = useCallback(() => {
        dispatch({ type: 'CLEAR_CART' });
    }, []);

    const getItemQuantity = useCallback(
        (categoryId: number) => {
            const item = state.items.find((i) => i.category.id === categoryId);
            return item?.quantity ?? 0;
        },
        [state.items]
    );

    const getTotalItems = useCallback(() => {
        return state.items.reduce((total, item) => total + item.quantity, 0);
    }, [state.items]);

    const getSubtotal = useCallback(() => {
        return state.items.reduce((total, item) => total + item.category.price * item.quantity, 0);
    }, [state.items]);

    const getServiceFees = useCallback(() => {
        const subtotal = getSubtotal();
        if (subtotal === 0) return 0;
        return Math.round(subtotal * 0.05) + 50;
    }, [getSubtotal]);

    const getTotal = useCallback(() => {
        return getSubtotal() + getServiceFees();
    }, [getSubtotal, getServiceFees]);

    const isInCart = useCallback(
        (categoryId: number) => {
            return state.items.some((item) => item.category.id === categoryId);
        },
        [state.items]
    );

    return (
        <CartContext.Provider
            value={{
                items: state.items,
                eventId: state.eventId,
                addItem,
                updateQuantity,
                removeItem,
                clearCart,
                getItemQuantity,
                getTotalItems,
                getSubtotal,
                getServiceFees,
                getTotal,
                isInCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
