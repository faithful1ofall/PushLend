// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PushLend
 * @dev P2P Lending Platform on Push Network
 * Enables peer-to-peer lending with collateral, interest, and liquidation
 */
contract PushLend {
    // Loan status enum
    enum LoanStatus {
        Pending,
        Active,
        Repaid,
        Defaulted,
        Liquidated
    }

    // Loan structure
    struct Loan {
        address borrower;
        address lender;
        uint256 principalAmount;
        uint256 collateralAmount;
        uint256 interestRate; // Annual rate in basis points (e.g., 1000 = 10%)
        uint256 duration; // Duration in seconds
        uint256 startTime;
        uint256 dueTime;
        LoanStatus status;
        uint256 repaidAmount;
        uint256 createdAt;
    }

    // Loan offer structure
    struct LoanOffer {
        address lender;
        uint256 amount;
        uint256 interestRate;
        uint256 maxDuration;
        uint256 minCollateralRatio;
        bool active;
        uint256 createdAt;
    }

    // Credit score structure
    struct CreditScore {
        uint256 totalBorrowed;
        uint256 totalRepaid;
        uint256 loansCompleted;
        uint256 loansDefaulted;
        uint256 score; // 0-1000 score
    }

    // State variables
    address public owner;
    uint256 public platformFeeRate = 100; // 1% in basis points
    uint256 public minCollateralRatio = 15000; // 150% in basis points
    uint256 public liquidationThreshold = 12000; // 120% in basis points

    // Mappings
    mapping(uint256 => Loan) public loans;
    mapping(uint256 => LoanOffer) public loanOffers;
    mapping(address => CreditScore) public creditScores;

    // Counters
    uint256 public loanCounter;
    uint256 public offerCounter;

    // Events
    event LoanOfferCreated(uint256 indexed offerId, address indexed lender, uint256 amount);
    event LoanOfferCancelled(uint256 indexed offerId);
    event LoanCreated(uint256 indexed loanId, address indexed borrower, address indexed lender, uint256 amount);
    event LoanFunded(uint256 indexed loanId, address indexed lender);
    event LoanRepaid(uint256 indexed loanId, uint256 repaidAmount);
    event LoanLiquidated(uint256 indexed loanId);
    event CreditScoreUpdated(address indexed user, uint256 newScore);

    // Errors
    error Unauthorized();
    error InvalidAmount();
    error InsufficientCollateral();
    error LoanNotActive();
    error LoanNotLiquidatable();
    error OfferNotActive();
    error AlreadyExists();
    error NotFound();
    error TransferFailed();

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    /**
     * @dev Create a loan offer (lender)
     */
    function createOffer(
        uint256 amount,
        uint256 interestRate,
        uint256 maxDuration,
        uint256 minCollateralRatio_
    ) external returns (uint256) {
        if (amount == 0) revert InvalidAmount();
        if (minCollateralRatio_ < minCollateralRatio) revert InsufficientCollateral();

        uint256 offerId = ++offerCounter;

        loanOffers[offerId] = LoanOffer({
            lender: msg.sender,
            amount: amount,
            interestRate: interestRate,
            maxDuration: maxDuration,
            minCollateralRatio: minCollateralRatio_,
            active: true,
            createdAt: block.timestamp
        });

        emit LoanOfferCreated(offerId, msg.sender, amount);
        return offerId;
    }

    /**
     * @dev Accept a loan offer (borrower)
     */
    function acceptOffer(
        uint256 offerId,
        uint256 duration
    ) external payable returns (uint256) {
        LoanOffer storage offer = loanOffers[offerId];
        if (!offer.active) revert OfferNotActive();
        if (duration > offer.maxDuration) revert InvalidAmount();

        uint256 collateralAmount = msg.value;
        uint256 collateralRatio = (collateralAmount * 10000) / offer.amount;
        if (collateralRatio < offer.minCollateralRatio) revert InsufficientCollateral();

        uint256 loanId = ++loanCounter;

        loans[loanId] = Loan({
            borrower: msg.sender,
            lender: offer.lender,
            principalAmount: offer.amount,
            collateralAmount: collateralAmount,
            interestRate: offer.interestRate,
            duration: duration,
            startTime: block.timestamp,
            dueTime: block.timestamp + duration,
            status: LoanStatus.Active,
            repaidAmount: 0,
            createdAt: block.timestamp
        });

        // Transfer loan amount from lender to borrower
        (bool success, ) = payable(msg.sender).call{value: offer.amount}("");
        if (!success) revert TransferFailed();

        // Update credit score
        _updateCreditScoreBorrowed(msg.sender, offer.amount);

        // Deactivate offer
        offer.active = false;

        emit LoanCreated(loanId, msg.sender, offer.lender, offer.amount);
        return loanId;
    }

    /**
     * @dev Create a loan request (borrower creates, lender funds)
     */
    function createLoanRequest(
        uint256 amount,
        uint256 interestRate,
        uint256 duration
    ) external payable returns (uint256) {
        if (amount == 0) revert InvalidAmount();

        uint256 collateralAmount = msg.value;
        uint256 collateralRatio = (collateralAmount * 10000) / amount;
        if (collateralRatio < minCollateralRatio) revert InsufficientCollateral();

        uint256 loanId = ++loanCounter;

        loans[loanId] = Loan({
            borrower: msg.sender,
            lender: address(0), // Will be set when funded
            principalAmount: amount,
            collateralAmount: collateralAmount,
            interestRate: interestRate,
            duration: duration,
            startTime: 0, // Will be set when funded
            dueTime: 0,
            status: LoanStatus.Pending,
            repaidAmount: 0,
            createdAt: block.timestamp
        });

        emit LoanCreated(loanId, msg.sender, address(0), amount);
        return loanId;
    }

    /**
     * @dev Fund a loan request (lender)
     */
    function fundLoan(uint256 loanId) external payable {
        Loan storage loan = loans[loanId];
        if (loan.status != LoanStatus.Pending) revert AlreadyExists();
        if (msg.value != loan.principalAmount) revert InvalidAmount();

        loan.lender = msg.sender;
        loan.startTime = block.timestamp;
        loan.dueTime = block.timestamp + loan.duration;
        loan.status = LoanStatus.Active;

        // Transfer loan amount to borrower
        (bool success, ) = payable(loan.borrower).call{value: msg.value}("");
        if (!success) revert TransferFailed();

        // Update credit score
        _updateCreditScoreBorrowed(loan.borrower, loan.principalAmount);

        emit LoanFunded(loanId, msg.sender);
    }

    /**
     * @dev Repay loan
     */
    function repayLoan(uint256 loanId) external payable {
        Loan storage loan = loans[loanId];
        if (loan.borrower != msg.sender) revert Unauthorized();
        if (loan.status != LoanStatus.Active) revert LoanNotActive();

        uint256 totalRepayment = calculateTotalRepayment(loanId);
        if (msg.value != totalRepayment) revert InvalidAmount();

        uint256 interest = calculateInterest(
            loan.principalAmount,
            loan.interestRate,
            loan.duration
        );
        uint256 platformFee = (loan.principalAmount * platformFeeRate) / 10000;

        // Transfer principal + interest to lender
        (bool success1, ) = payable(loan.lender).call{value: loan.principalAmount + interest}("");
        if (!success1) revert TransferFailed();

        // Transfer platform fee to owner
        (bool success2, ) = payable(owner).call{value: platformFee}("");
        if (!success2) revert TransferFailed();

        // Return collateral to borrower
        (bool success3, ) = payable(loan.borrower).call{value: loan.collateralAmount}("");
        if (!success3) revert TransferFailed();

        loan.status = LoanStatus.Repaid;
        loan.repaidAmount = totalRepayment;

        // Update credit score
        _updateCreditScoreRepaid(loan.borrower, totalRepayment);

        emit LoanRepaid(loanId, totalRepayment);
    }

    /**
     * @dev Liquidate defaulted loan
     */
    function liquidateLoan(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        if (!isLoanLiquidatable(loanId)) revert LoanNotLiquidatable();

        // Transfer collateral to lender
        (bool success, ) = payable(loan.lender).call{value: loan.collateralAmount}("");
        if (!success) revert TransferFailed();

        loan.status = LoanStatus.Liquidated;

        // Update credit score (negative impact)
        _updateCreditScoreDefaulted(loan.borrower);

        emit LoanLiquidated(loanId);
    }

    /**
     * @dev Cancel offer (lender only)
     */
    function cancelOffer(uint256 offerId) external {
        LoanOffer storage offer = loanOffers[offerId];
        if (offer.lender != msg.sender) revert Unauthorized();
        if (!offer.active) revert NotFound();

        offer.active = false;

        emit LoanOfferCancelled(offerId);
    }

    /**
     * @dev Calculate interest
     */
    function calculateInterest(
        uint256 principalAmount,
        uint256 interestRate,
        uint256 duration
    ) public pure returns (uint256) {
        // Interest = Principal * Rate * Duration / (365 days * 10000)
        return (principalAmount * interestRate * duration) / (365 days * 10000);
    }

    /**
     * @dev Calculate total repayment amount
     */
    function calculateTotalRepayment(uint256 loanId) public view returns (uint256) {
        Loan storage loan = loans[loanId];
        uint256 interest = calculateInterest(
            loan.principalAmount,
            loan.interestRate,
            loan.duration
        );
        uint256 platformFee = (loan.principalAmount * platformFeeRate) / 10000;
        return loan.principalAmount + interest + platformFee;
    }

    /**
     * @dev Check if loan is liquidatable
     */
    function isLoanLiquidatable(uint256 loanId) public view returns (bool) {
        Loan storage loan = loans[loanId];
        if (loan.status != LoanStatus.Active) return false;

        uint256 currentRatio = (loan.collateralAmount * 10000) / loan.principalAmount;
        return currentRatio < liquidationThreshold;
    }

    /**
     * @dev Get credit score
     */
    function getCreditScore(address user) external view returns (CreditScore memory) {
        CreditScore memory score = creditScores[user];
        if (score.score == 0 && score.totalBorrowed == 0) {
            score.score = 500; // Default score
        }
        return score;
    }

    /**
     * @dev Get loan details
     */
    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }

    /**
     * @dev Get offer details
     */
    function getOffer(uint256 offerId) external view returns (LoanOffer memory) {
        return loanOffers[offerId];
    }

    // Private functions

    function _updateCreditScoreBorrowed(address user, uint256 amount) private {
        CreditScore storage score = creditScores[user];
        score.totalBorrowed += amount;
    }

    function _updateCreditScoreRepaid(address user, uint256 amount) private {
        CreditScore storage score = creditScores[user];
        score.totalRepaid += amount;
        score.loansCompleted += 1;
        score.score = _calculateCreditScore(
            score.totalRepaid,
            score.totalBorrowed,
            score.loansCompleted,
            score.loansDefaulted
        );
        emit CreditScoreUpdated(user, score.score);
    }

    function _updateCreditScoreDefaulted(address user) private {
        CreditScore storage score = creditScores[user];
        score.loansDefaulted += 1;
        score.score = _calculateCreditScore(
            score.totalRepaid,
            score.totalBorrowed,
            score.loansCompleted,
            score.loansDefaulted
        );
        emit CreditScoreUpdated(user, score.score);
    }

    function _calculateCreditScore(
        uint256 totalRepaid,
        uint256 totalBorrowed,
        uint256 completed,
        uint256 defaulted
    ) private pure returns (uint256) {
        if (totalBorrowed == 0) return 500;

        uint256 repaymentRatio = (totalRepaid * 1000) / totalBorrowed;
        uint256 defaultPenalty = defaulted * 100;
        uint256 completionBonus = completed * 50;

        if (repaymentRatio > defaultPenalty) {
            return repaymentRatio - defaultPenalty + completionBonus;
        }
        return 0;
    }

    // Admin functions

    function setPlatformFee(uint256 newFee) external onlyOwner {
        platformFeeRate = newFee;
    }

    function setMinCollateralRatio(uint256 newRatio) external onlyOwner {
        minCollateralRatio = newRatio;
    }

    function setLiquidationThreshold(uint256 newThreshold) external onlyOwner {
        liquidationThreshold = newThreshold;
    }

    // Receive function to accept ETH
    receive() external payable {}
}
