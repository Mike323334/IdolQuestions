export interface Transaction {
  id: string;
  userId: string;
  quizId: string;
  creatorId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paypalOrderId?: string;
  createdAt: string;
  deliveredAt?: string;
  contentAccessed?: boolean;
}

export class TransactionLogger {
  private static readonly STORAGE_KEY = 'transactions';

  static createTransaction(
    userId: string,
    quizId: string,
    creatorId: string,
    amount: number
  ): string {
    const transaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      quizId,
      creatorId,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const transactions = this.getTransactions();
    transactions.push(transaction);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions));

    return transaction.id;
  }

  static updateTransactionStatus(
    transactionId: string,
    status: Transaction['status'],
    paypalOrderId?: string
  ): void {
    const transactions = this.getTransactions();
    const transaction = transactions.find(t => t.id === transactionId);

    if (transaction) {
      transaction.status = status;
      if (paypalOrderId) {
        transaction.paypalOrderId = paypalOrderId;
      }
      if (status === 'completed') {
        transaction.deliveredAt = new Date().toISOString();
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions));
    }
  }

  static logContentDelivery(transactionId: string): void {
    const transactions = this.getTransactions();
    const transaction = transactions.find(t => t.id === transactionId);

    if (transaction) {
      transaction.contentAccessed = true;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions));
    }
  }

  static getTransaction(transactionId: string): Transaction | null {
    const transactions = this.getTransactions();
    return transactions.find(t => t.id === transactionId) || null;
  }

  static getTransactions(): Transaction[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static getUserTransactions(userId: string): Transaction[] {
    return this.getTransactions().filter(t => t.userId === userId);
  }

  static getCreatorTransactions(creatorId: string): Transaction[] {
    return this.getTransactions().filter(t => t.creatorId === creatorId);
  }
}

export default TransactionLogger;
