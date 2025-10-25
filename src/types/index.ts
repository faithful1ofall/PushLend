export interface Loan {
  loanId: number;
  borrower: string;
  lender: string;
  amount: number;
  collateral: number;
  interestRate: number;
  duration: number;
  startBlock: number;
  status: string; // "pending", "active", "repaid", "liquidated"
  loanAsset?: number; // 1=STX, 2=sBTC
  collateralAsset?: number; // 1=STX, 2=sBTC
}

export interface LoanOffer {
  offerId: number;
  lender: string;
  amount: number;
  interestRate: number;
  maxDuration: number;
  minCollateral: number;
  active: boolean;
  loanAsset?: number; // 1=STX, 2=sBTC
  collateralAsset?: number; // 1=STX, 2=sBTC
}

export interface UserStats {
  totalBorrowed: number;
  totalRepaid: number;
  loansCompleted: number;
  creditScore: number;
}

export interface WalletInfo {
  address: string;
  balance: number;
  privateKey?: string;
}

export const LoanStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  REPAID: 'repaid',
  LIQUIDATED: 'liquidated',
} as const;

export const LoanStatusLabels: Record<string, string> = {
  'pending': 'Pending',
  'active': 'Active',
  'repaid': 'Repaid',
  'liquidated': 'Liquidated',
};
