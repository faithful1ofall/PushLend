// Push Network Configuration
export const PUSH_NETWORK_CONFIG = {
  chainId: 42101,
  chainName: 'Push Chain Donut Testnet',
  rpcUrl: 'https://evm.rpc-testnet-donut-node1.push.org/',
  explorerUrl: 'https://donut.push.network',
  nativeCurrency: {
    name: 'PC',
    symbol: 'PC',
    decimals: 18,
  },
};

// Contract addresses
export const CONTRACT_ADDRESSES = {
  pushLend: '0x368831E75187948d722e3648C02C8D50d668a46c',
};

// ABI for PushLend contract
export const PUSHLEND_ABI = [
  "function createOffer(uint256 amount, uint256 interestRate, uint256 maxDuration, uint256 minCollateralRatio) external returns (uint256)",
  "function acceptOffer(uint256 offerId, uint256 duration) external payable returns (uint256)",
  "function createLoanRequest(uint256 amount, uint256 interestRate, uint256 duration) external payable returns (uint256)",
  "function fundLoan(uint256 loanId) external payable",
  "function repayLoan(uint256 loanId) external payable",
  "function liquidateLoan(uint256 loanId) external",
  "function cancelOffer(uint256 offerId) external",
  "function calculateInterest(uint256 principalAmount, uint256 interestRate, uint256 duration) external pure returns (uint256)",
  "function calculateTotalRepayment(uint256 loanId) external view returns (uint256)",
  "function isLoanLiquidatable(uint256 loanId) external view returns (bool)",
  "function getCreditScore(address user) external view returns (tuple(uint256 totalBorrowed, uint256 totalRepaid, uint256 loansCompleted, uint256 loansDefaulted, uint256 score))",
  "function getLoan(uint256 loanId) external view returns (tuple(address borrower, address lender, uint256 principalAmount, uint256 collateralAmount, uint256 interestRate, uint256 duration, uint256 startTime, uint256 dueTime, uint8 status, uint256 repaidAmount, uint256 createdAt))",
  "function getOffer(uint256 offerId) external view returns (tuple(address lender, uint256 amount, uint256 interestRate, uint256 maxDuration, uint256 minCollateralRatio, bool active, uint256 createdAt))",
  "function loanCounter() external view returns (uint256)",
  "function offerCounter() external view returns (uint256)",
  "function platformFeeRate() external view returns (uint256)",
  "function minCollateralRatio() external view returns (uint256)",
  "function liquidationThreshold() external view returns (uint256)",
  "event LoanOfferCreated(uint256 indexed offerId, address indexed lender, uint256 amount)",
  "event LoanOfferCancelled(uint256 indexed offerId)",
  "event LoanCreated(uint256 indexed loanId, address indexed borrower, address indexed lender, uint256 amount)",
  "event LoanFunded(uint256 indexed loanId, address indexed lender)",
  "event LoanRepaid(uint256 indexed loanId, uint256 repaidAmount)",
  "event LoanLiquidated(uint256 indexed loanId)",
  "event CreditScoreUpdated(address indexed user, uint256 newScore)"
];

export enum LoanStatus {
  Pending = 0,
  Active = 1,
  Repaid = 2,
  Defaulted = 3,
  Liquidated = 4,
}
