export interface PaymentTransaction {
  hash: string;
  amount: number;
  recipient: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: Date;
  milestoneIndex: number;
}
