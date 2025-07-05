import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PaymentTransaction {
  id: string;
  orderId: string;
  method: 'mpesa' | 'card' | 'cash';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  checkoutRequestId?: string;
  mpesaReceiptNumber?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}

interface PaymentState {
  transactions: PaymentTransaction[];
  createTransaction: (transaction: Omit<PaymentTransaction, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTransactionStatus: (transactionId: string, status: PaymentTransaction['status'], data?: Partial<PaymentTransaction>) => void;
  getTransactionByOrderId: (orderId: string) => PaymentTransaction | undefined;
  getTransactionByCheckoutRequestId: (checkoutRequestId: string) => PaymentTransaction | undefined;
  getTransactionsByStatus: (status: PaymentTransaction['status']) => PaymentTransaction[];
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      transactions: [],
      
      createTransaction: (transactionData) => {
        const transactionId = `TXN-${Date.now()}`;
        const now = new Date().toISOString();
        
        const transaction: PaymentTransaction = {
          ...transactionData,
          id: transactionId,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          transactions: [...state.transactions, transaction],
        }));
        
        return transactionId;
      },
      
      updateTransactionStatus: (transactionId, status, data = {}) => {
        set((state) => ({
          transactions: state.transactions.map((transaction) =>
            transaction.id === transactionId
              ? {
                  ...transaction,
                  status,
                  updatedAt: new Date().toISOString(),
                  ...data,
                }
              : transaction
          ),
        }));
      },
      
      getTransactionByOrderId: (orderId) => {
        return get().transactions.find((transaction) => transaction.orderId === orderId);
      },
      
      getTransactionByCheckoutRequestId: (checkoutRequestId) => {
        return get().transactions.find((transaction) => transaction.checkoutRequestId === checkoutRequestId);
      },
      
      getTransactionsByStatus: (status) => {
        return get().transactions.filter((transaction) => transaction.status === status);
      },
    }),
    {
      name: 'payment-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);