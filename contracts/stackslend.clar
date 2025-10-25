;; StacksLend - P2P Lending Platform Smart Contract
;; Enables peer-to-peer lending with collateral, interest, and liquidation

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-already-exists (err u103))
(define-constant err-invalid-amount (err u104))
(define-constant err-insufficient-collateral (err u105))
(define-constant err-loan-not-active (err u106))
(define-constant err-loan-not-due (err u107))
(define-constant err-already-repaid (err u108))
(define-constant err-insufficient-balance (err u109))

;; Loan status constants
(define-constant status-active u1)
(define-constant status-repaid u2)
(define-constant status-defaulted u3)
(define-constant status-liquidated u4)

;; Platform parameters (in basis points, 100 = 1%)
(define-data-var platform-fee-rate uint u100) ;; 1% platform fee
(define-data-var min-collateral-ratio uint u15000) ;; 150% minimum collateral
(define-data-var liquidation-threshold uint u12000) ;; 120% liquidation threshold

;; Data structures
(define-map loans
  { loan-id: uint }
  {
    borrower: principal,
    lender: principal,
    principal-amount: uint,
    collateral-amount: uint,
    interest-rate: uint, ;; Annual rate in basis points (e.g., 1000 = 10%)
    duration: uint, ;; Duration in blocks (~10 min per block)
    start-block: uint,
    due-block: uint,
    status: uint,
    repaid-amount: uint,
    created-at: uint
  }
)

(define-map loan-offers
  { offer-id: uint }
  {
    lender: principal,
    amount: uint,
    interest-rate: uint,
    max-duration: uint,
    min-collateral-ratio: uint,
    active: bool,
    created-at: uint
  }
)

(define-map user-credit-score
  { user: principal }
  {
    total-borrowed: uint,
    total-repaid: uint,
    loans-completed: uint,
    loans-defaulted: uint,
    score: uint ;; 0-1000 score
  }
)

;; Counters
(define-data-var loan-counter uint u0)
(define-data-var offer-counter uint u0)

;; Read-only functions
(define-read-only (get-loan (loan-id uint))
  (map-get? loans { loan-id: loan-id })
)

(define-read-only (get-offer (offer-id uint))
  (map-get? loan-offers { offer-id: offer-id })
)

(define-read-only (get-credit-score (user principal))
  (default-to 
    { total-borrowed: u0, total-repaid: u0, loans-completed: u0, loans-defaulted: u0, score: u500 }
    (map-get? user-credit-score { user: user })
  )
)

(define-read-only (get-loan-count)
  (var-get loan-counter)
)

(define-read-only (get-offer-count)
  (var-get offer-counter)
)

(define-read-only (calculate-interest (principal-amount uint) (interest-rate uint) (duration uint))
  ;; Interest = Principal * Rate * Duration / (365 * 144 * 10000)
  ;; Duration in blocks, ~144 blocks per day
  (/ (* (* principal-amount interest-rate) duration) u52560000)
)

(define-read-only (calculate-total-repayment (loan-id uint))
  (match (get-loan loan-id)
    loan-data
      (let
        (
          (interest (calculate-interest 
            (get principal-amount loan-data)
            (get interest-rate loan-data)
            (get duration loan-data)
          ))
          (platform-fee (/ (* (get principal-amount loan-data) (var-get platform-fee-rate)) u10000))
        )
        (ok (+ (+ (get principal-amount loan-data) interest) platform-fee))
      )
    (err err-not-found)
  )
)

(define-read-only (is-loan-liquidatable (loan-id uint))
  (match (get-loan loan-id)
    loan-data
      (let
        (
          (current-ratio (/ (* (get collateral-amount loan-data) u10000) (get principal-amount loan-data)))
        )
        (ok (and 
          (is-eq (get status loan-data) status-active)
          (< current-ratio (var-get liquidation-threshold))
        ))
      )
    (err err-not-found)
  )
)

;; Public functions

;; Create a loan offer (lender)
(define-public (create-offer (amount uint) (interest-rate uint) (max-duration uint) (min-collateral-ratio uint))
  (let
    (
      (offer-id (+ (var-get offer-counter) u1))
    )
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (>= min-collateral-ratio (var-get min-collateral-ratio)) err-insufficient-collateral)
    
    (map-set loan-offers
      { offer-id: offer-id }
      {
        lender: tx-sender,
        amount: amount,
        interest-rate: interest-rate,
        max-duration: max-duration,
        min-collateral-ratio: min-collateral-ratio,
        active: true,
        created-at: block-height
      }
    )
    (var-set offer-counter offer-id)
    (ok offer-id)
  )
)

;; Accept a loan offer (borrower)
(define-public (accept-offer (offer-id uint) (collateral-amount uint) (duration uint))
  (let
    (
      (offer (unwrap! (get-offer offer-id) err-not-found))
      (loan-id (+ (var-get loan-counter) u1))
      (collateral-ratio (/ (* collateral-amount u10000) (get amount offer)))
    )
    (asserts! (get active offer) err-not-found)
    (asserts! (<= duration (get max-duration offer)) err-invalid-amount)
    (asserts! (>= collateral-ratio (get min-collateral-ratio offer)) err-insufficient-collateral)
    
    ;; Transfer collateral from borrower to contract
    (try! (stx-transfer? collateral-amount tx-sender (as-contract tx-sender)))
    
    ;; Transfer loan amount from lender to borrower
    (try! (as-contract (stx-transfer? (get amount offer) tx-sender tx-sender)))
    
    ;; Create loan record
    (map-set loans
      { loan-id: loan-id }
      {
        borrower: tx-sender,
        lender: (get lender offer),
        principal-amount: (get amount offer),
        collateral-amount: collateral-amount,
        interest-rate: (get interest-rate offer),
        duration: duration,
        start-block: block-height,
        due-block: (+ block-height duration),
        status: status-active,
        repaid-amount: u0,
        created-at: block-height
      }
    )
    
    ;; Update credit score
    (update-credit-score-borrowed tx-sender (get amount offer))
    
    ;; Deactivate offer
    (map-set loan-offers
      { offer-id: offer-id }
      (merge offer { active: false })
    )
    
    (var-set loan-counter loan-id)
    (ok loan-id)
  )
)

;; Create a direct loan request (borrower creates, lender accepts)
(define-public (create-loan-request (amount uint) (collateral-amount uint) (interest-rate uint) (duration uint))
  (let
    (
      (loan-id (+ (var-get loan-counter) u1))
      (collateral-ratio (/ (* collateral-amount u10000) amount))
    )
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (>= collateral-ratio (var-get min-collateral-ratio)) err-insufficient-collateral)
    
    ;; Transfer collateral from borrower to contract
    (try! (stx-transfer? collateral-amount tx-sender (as-contract tx-sender)))
    
    ;; Create loan record (lender is zero address initially)
    (map-set loans
      { loan-id: loan-id }
      {
        borrower: tx-sender,
        lender: contract-owner, ;; Placeholder, will be updated when funded
        principal-amount: amount,
        collateral-amount: collateral-amount,
        interest-rate: interest-rate,
        duration: duration,
        start-block: u0, ;; Will be set when funded
        due-block: u0,
        status: u0, ;; Pending status
        repaid-amount: u0,
        created-at: block-height
      }
    )
    
    (var-set loan-counter loan-id)
    (ok loan-id)
  )
)

;; Fund a loan request (lender)
(define-public (fund-loan (loan-id uint))
  (let
    (
      (loan (unwrap! (get-loan loan-id) err-not-found))
    )
    (asserts! (is-eq (get status loan) u0) err-already-exists)
    
    ;; Transfer loan amount from lender to borrower
    (try! (stx-transfer? (get principal-amount loan) tx-sender (get borrower loan)))
    
    ;; Update loan record
    (map-set loans
      { loan-id: loan-id }
      (merge loan {
        lender: tx-sender,
        start-block: block-height,
        due-block: (+ block-height (get duration loan)),
        status: status-active
      })
    )
    
    ;; Update credit score
    (update-credit-score-borrowed (get borrower loan) (get principal-amount loan))
    
    (ok true)
  )
)

;; Repay loan
(define-public (repay-loan (loan-id uint))
  (let
    (
      (loan (unwrap! (get-loan loan-id) err-not-found))
      (total-repayment (unwrap! (calculate-total-repayment loan-id) err-not-found))
      (interest (calculate-interest 
        (get principal-amount loan)
        (get interest-rate loan)
        (get duration loan)
      ))
      (platform-fee (/ (* (get principal-amount loan) (var-get platform-fee-rate)) u10000))
    )
    (asserts! (is-eq (get borrower loan) tx-sender) err-unauthorized)
    (asserts! (is-eq (get status loan) status-active) err-loan-not-active)
    
    ;; Transfer repayment to lender
    (try! (stx-transfer? (+ (get principal-amount loan) interest) tx-sender (get lender loan)))
    
    ;; Transfer platform fee to contract owner
    (try! (stx-transfer? platform-fee tx-sender contract-owner))
    
    ;; Return collateral to borrower
    (try! (as-contract (stx-transfer? (get collateral-amount loan) tx-sender (get borrower loan))))
    
    ;; Update loan status
    (map-set loans
      { loan-id: loan-id }
      (merge loan {
        status: status-repaid,
        repaid-amount: total-repayment
      })
    )
    
    ;; Update credit score
    (update-credit-score-repaid (get borrower loan) total-repayment)
    
    (ok true)
  )
)

;; Liquidate defaulted loan
(define-public (liquidate-loan (loan-id uint))
  (let
    (
      (loan (unwrap! (get-loan loan-id) err-not-found))
      (is-liquidatable (unwrap! (is-loan-liquidatable loan-id) err-not-found))
    )
    (asserts! is-liquidatable err-loan-not-due)
    
    ;; Transfer collateral to lender
    (try! (as-contract (stx-transfer? (get collateral-amount loan) tx-sender (get lender loan))))
    
    ;; Update loan status
    (map-set loans
      { loan-id: loan-id }
      (merge loan {
        status: status-liquidated
      })
    )
    
    ;; Update credit score (negative impact)
    (update-credit-score-defaulted (get borrower loan))
    
    (ok true)
  )
)

;; Cancel offer (lender only)
(define-public (cancel-offer (offer-id uint))
  (let
    (
      (offer (unwrap! (get-offer offer-id) err-not-found))
    )
    (asserts! (is-eq (get lender offer) tx-sender) err-unauthorized)
    (asserts! (get active offer) err-not-found)
    
    (map-set loan-offers
      { offer-id: offer-id }
      (merge offer { active: false })
    )
    (ok true)
  )
)

;; Private functions

(define-private (update-credit-score-borrowed (user principal) (amount uint))
  (let
    (
      (current-score (get-credit-score user))
      (new-total-borrowed (+ (get total-borrowed current-score) amount))
    )
    (map-set user-credit-score
      { user: user }
      (merge current-score {
        total-borrowed: new-total-borrowed
      })
    )
  )
)

(define-private (update-credit-score-repaid (user principal) (amount uint))
  (let
    (
      (current-score (get-credit-score user))
      (new-total-repaid (+ (get total-repaid current-score) amount))
      (new-loans-completed (+ (get loans-completed current-score) u1))
      (new-score (calculate-credit-score 
        new-total-repaid 
        (get total-borrowed current-score)
        new-loans-completed
        (get loans-defaulted current-score)
      ))
    )
    (map-set user-credit-score
      { user: user }
      (merge current-score {
        total-repaid: new-total-repaid,
        loans-completed: new-loans-completed,
        score: new-score
      })
    )
  )
)

(define-private (update-credit-score-defaulted (user principal))
  (let
    (
      (current-score (get-credit-score user))
      (new-loans-defaulted (+ (get loans-defaulted current-score) u1))
      (new-score (calculate-credit-score 
        (get total-repaid current-score)
        (get total-borrowed current-score)
        (get loans-completed current-score)
        new-loans-defaulted
      ))
    )
    (map-set user-credit-score
      { user: user }
      (merge current-score {
        loans-defaulted: new-loans-defaulted,
        score: new-score
      })
    )
  )
)

(define-private (calculate-credit-score (total-repaid uint) (total-borrowed uint) (completed uint) (defaulted uint))
  (let
    (
      (repayment-ratio (if (> total-borrowed u0)
        (/ (* total-repaid u1000) total-borrowed)
        u500
      ))
      (default-penalty (* defaulted u100))
      (completion-bonus (* completed u50))
    )
    (if (> repayment-ratio default-penalty)
      (+ (- repayment-ratio default-penalty) completion-bonus)
      u0
    )
  )
)

;; Admin functions
(define-public (set-platform-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set platform-fee-rate new-fee)
    (ok true)
  )
)

(define-public (set-min-collateral-ratio (new-ratio uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set min-collateral-ratio new-ratio)
    (ok true)
  )
)

(define-public (set-liquidation-threshold (new-threshold uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set liquidation-threshold new-threshold)
    (ok true)
  )
)
