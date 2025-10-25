;; StacksLend Multi-Asset - P2P Lending with Asset Type Tracking
;; Based on stackslend-simple with added asset type fields for future expansion

;; data vars
(define-data-var loan-counter uint u0)
(define-data-var offer-counter uint u0)

;; data maps
(define-map loans
  uint
  {
    borrower: principal,
    lender: principal,
    amount: uint,
    collateral: uint,
    interest-rate: uint,
    duration: uint,
    start-block: uint,
    status: (string-ascii 20),
    loan-asset: uint,
    collateral-asset: uint
  }
)

(define-map offers
  uint
  {
    lender: principal,
    amount: uint,
    interest-rate: uint,
    max-duration: uint,
    min-collateral: uint,
    active: bool,
    loan-asset: uint,
    collateral-asset: uint
  }
)

(define-map user-stats
  principal
  {
    total-borrowed: uint,
    total-repaid: uint,
    loans-completed: uint,
    credit-score: uint
  }
)

;; error codes
(define-constant err-not-found (err u404))
(define-constant err-unauthorized (err u403))
(define-constant err-invalid (err u400))
(define-constant err-inactive (err u401))

;; asset constants
(define-constant asset-stx u1)
(define-constant asset-sbtc u2)

;; read functions
(define-read-only (get-loan (id uint))
  (map-get? loans id)
)

(define-read-only (get-offer (id uint))
  (map-get? offers id)
)

(define-read-only (get-loan-count)
  (var-get loan-counter)
)

(define-read-only (get-offer-count)
  (var-get offer-counter)
)

(define-read-only (get-user-stats (user principal))
  (default-to 
    { total-borrowed: u0, total-repaid: u0, loans-completed: u0, credit-score: u500 }
    (map-get? user-stats user)
  )
)

;; create loan offer
(define-public (create-offer (amount uint) (interest-rate uint) (max-duration uint) (min-collateral uint) (loan-asset uint) (collateral-asset uint))
  (let ((id (+ (var-get offer-counter) u1)))
    (asserts! (> amount u0) err-invalid)
    (asserts! (is-eq loan-asset asset-stx) err-invalid)
    (asserts! (is-eq collateral-asset asset-stx) err-invalid)
    (map-set offers id {
      lender: tx-sender,
      amount: amount,
      interest-rate: interest-rate,
      max-duration: max-duration,
      min-collateral: min-collateral,
      active: true,
      loan-asset: loan-asset,
      collateral-asset: collateral-asset
    })
    (var-set offer-counter id)
    (ok id)
  )
)

;; create loan request
(define-public (create-loan (amount uint) (collateral uint) (interest-rate uint) (duration uint) (loan-asset uint) (collateral-asset uint))
  (let ((id (+ (var-get loan-counter) u1)))
    (asserts! (> amount u0) err-invalid)
    (asserts! (>= collateral (/ (* amount u150) u100)) err-invalid)
    (asserts! (is-eq loan-asset asset-stx) err-invalid)
    (asserts! (is-eq collateral-asset asset-stx) err-invalid)
    (map-set loans id {
      borrower: tx-sender,
      lender: tx-sender,
      amount: amount,
      collateral: collateral,
      interest-rate: interest-rate,
      duration: duration,
      start-block: u0,
      status: "pending",
      loan-asset: loan-asset,
      collateral-asset: collateral-asset
    })
    (var-set loan-counter id)
    (ok id)
  )
)

;; fund a loan (lender accepts)
(define-public (fund-loan (id uint))
  (let ((loan (unwrap! (map-get? loans id) err-not-found)))
    (asserts! (is-eq (get status loan) "pending") err-inactive)
    (map-set loans id (merge loan { 
      lender: tx-sender,
      start-block: stacks-block-height,
      status: "active"
    }))
    (ok true)
  )
)

;; mark loan as repaid
(define-public (repay-loan (id uint))
  (let ((loan (unwrap! (map-get? loans id) err-not-found)))
    (asserts! (is-eq tx-sender (get borrower loan)) err-unauthorized)
    (asserts! (is-eq (get status loan) "active") err-inactive)
    (map-set loans id (merge loan { status: "repaid" }))
    (update-user-stats (get borrower loan) (get amount loan))
    (ok true)
  )
)

;; liquidate loan
(define-public (liquidate-loan (id uint))
  (let ((loan (unwrap! (map-get? loans id) err-not-found)))
    (asserts! (is-eq tx-sender (get lender loan)) err-unauthorized)
    (asserts! (is-eq (get status loan) "active") err-inactive)
    (map-set loans id (merge loan { status: "liquidated" }))
    (ok true)
  )
)

;; cancel offer
(define-public (cancel-offer (id uint))
  (let ((offer (unwrap! (map-get? offers id) err-not-found)))
    (asserts! (is-eq tx-sender (get lender offer)) err-unauthorized)
    (asserts! (get active offer) err-inactive)
    (map-set offers id (merge offer { active: false }))
    (ok true)
  )
)

;; update offer price
(define-public (update-offer (id uint) (new-rate uint))
  (let ((offer (unwrap! (map-get? offers id) err-not-found)))
    (asserts! (is-eq tx-sender (get lender offer)) err-unauthorized)
    (asserts! (get active offer) err-inactive)
    (map-set offers id (merge offer { interest-rate: new-rate }))
    (ok true)
  )
)

;; private helper
(define-private (update-user-stats (user principal) (amount uint))
  (let ((stats (get-user-stats user)))
    (map-set user-stats user {
      total-borrowed: (get total-borrowed stats),
      total-repaid: (+ (get total-repaid stats) amount),
      loans-completed: (+ (get loans-completed stats) u1),
      credit-score: (+ (get credit-score stats) u50)
    })
  )
)
