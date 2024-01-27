#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod zkramp {
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;
    use ink_prelude::string::String;

    #[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    enum OrderStatus {
        Open,
        Filled,
        Canceled,
    }

    #[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum ClaimStatus {
        WaitingForBuyerProof,
        WaitingForSellerProof,
        Filled,
        Canceled,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum EscrowError {
        StatusCanNotBeChanged,
        OrderCancelled,
        OrderFinalised,
        OrderClaimed,
        OrderNotFound,
        Unauthorised,
    }

    #[derive(PartialEq, Debug, Clone, scale::Encode, scale::Decode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct Order {
        id: u32,
        owner: AccountId,
        total: Balance,
        amount_to_send: Balance,
        collateral: Balance,
        amount_to_receive: Balance,
        status: OrderStatus,
        payment_key: String,
        hash_name: String,
        name_length: u32,
    }

    #[derive(PartialEq, Debug, Clone, scale::Encode, scale::Decode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct OrderClaim {
        buyer: AccountId,
        order_index: u32,
        status: ClaimStatus,
        claim_expiration_time: u128,
    }

    #[ink(storage)]
    pub struct ZKRamp {
        orders: Mapping<u32, Order>,
        orders_claim: Mapping<u32, OrderClaim>,
        next_order_nonce: u32,
        owner: AccountId,
    }

    impl ZKRamp {
        /// Create new instance of ZKRamp contract.
        #[ink(constructor)]
        pub fn default() -> Self {
            let mut instance = ZKRamp {
                orders: Mapping::default(),
                orders_claim: Mapping::default(),
                next_order_nonce: 0,
                owner: Self::env().caller(),
            };
            instance
        }

        /// Get all orders.
        /// Returns an empty vector if there are no orders.
        #[ink(message)]
        pub fn get_all_orders(&self) -> Vec<Order> {
            let mut orders: Vec<Order> = Vec::new();
            for i in 0..self.next_order_nonce {
                orders.push(self.orders.get(&i).unwrap());
            }
            orders
        }

        /// Get all orders claim.
        #[ink(message)]
        pub fn get_all_orders_claim(&self) -> Vec<OrderClaim> {
            let mut orders_claim: Vec<OrderClaim> = Vec::new();
            for i in 0..self.next_order_nonce {
                let order_claim = self.orders_claim.get(&i);
                if let Some(claim) = order_claim {
                    orders_claim.push(claim);
                }
            }
            orders_claim
        }

        /// Get an order by its index.
        /// Returns an error if the order does not exist.
        #[ink(message)]
        pub fn get_order(&self, index: u32) -> Order {
            self.orders.get(index).unwrap()
        }

        /// Get the current block timestamp.
        #[ink(message)]
        pub fn get_time(&self) -> u128 {
            self.env().block_timestamp() as u128
        }

        /// Create a new liquidity pool order, which will be filled by a buyer.
        /// The order is created by the seller, who deposits the amount of tokens
        /// they want to sell into the contract.
        #[ink(message, payable)]
        pub fn create_order(
            &mut self,
            amount_to_receive: Balance,
            payment_key: String,
            hash_name: String,
            name_length: u32,
        ) -> Result<(), ()> {
            let caller = self.env().caller();
            let transferred_value = self.env().transferred_value(); // IS THIS AZERO????
            ink::env::debug_println!(
                "thanks for the funding of {:?} from {:?}",
                transferred_value,
                caller
            );

            let order = Order {
                id: self.next_order_nonce,
                owner: caller,
                total: transferred_value,
                amount_to_send: transferred_value / 2,
                collateral: transferred_value / 2, // Collateral is 50% of the total
                amount_to_receive: amount_to_receive,
                status: OrderStatus::Open,
                payment_key: payment_key,
                hash_name: hash_name,
                name_length: name_length,
            };
            self.orders.insert(self.next_order_nonce, &order);
            self.next_order_nonce += 1;
            Ok(())
        }

        /// Cancel an order that has not been filled yet.
        /// The seller can cancel an order at any time, and the tokens they deposited
        /// will be returned to them.
        #[ink(message)]
        pub fn cancel_order(&mut self, index: u32) -> Result<(), EscrowError> {
            let caller = self.env().caller();

            if !self.orders.contains(&index) {
                return Err(EscrowError::OrderNotFound);
            }
            if self.orders.get(&index).unwrap().owner != caller {
                return Err(EscrowError::Unauthorised);
            }
            if self.orders.get(&index).unwrap().status != OrderStatus::Open {
                return Err(EscrowError::StatusCanNotBeChanged);
            }
            if self.check_order_claim(index).is_err() {
                return Err(EscrowError::OrderClaimed);
            }

            let mut order = self.orders.get(index).unwrap();
            order.status = OrderStatus::Canceled;
            self.orders.insert(index, &order);

            let owner = self.orders.get(index).unwrap().owner;
            let deposited = self.orders.get(index).unwrap().total;
            self.env().transfer(owner, deposited).unwrap();

            Ok(())
        }

        /// Claim an order that has not been filled yet.
        #[ink(message)]
        pub fn claim_order(
            &mut self,
            index: u32,
            claim_expiration_time: u128,
        ) -> Result<(), EscrowError> {
            let caller = self.env().caller();

            if !self.orders.contains(&index) {
                return Err(EscrowError::OrderNotFound);
            }
            if self.orders.get(&index).unwrap().status != OrderStatus::Open {
                return Err(EscrowError::StatusCanNotBeChanged);
            }
            if self.check_order_claim(index).is_err() {
                return Err(EscrowError::OrderClaimed);
            }

            self.orders_claim.insert(
                index,
                &OrderClaim {
                    buyer: caller,
                    order_index: index,
                    status: ClaimStatus::WaitingForBuyerProof,
                    claim_expiration_time: claim_expiration_time,
                },
            );

            Ok(())
        }

        /// Cancel a claimed order that has not been filled yet.
        /// The buyer can cancel an order at any time, and it will be removed from the
        /// order book.
        #[ink(message)]
        pub fn cancel_claim_order(&mut self, index: u32) -> Result<(), EscrowError> {
            let caller = self.env().caller();

            if !self.orders_claim.contains(&index) {
                return Err(EscrowError::OrderNotFound);
            }

            if self.orders_claim.get(&index).unwrap().buyer != caller {
                return Err(EscrowError::Unauthorised);
            }

            if self.orders_claim.get(&index).unwrap().status != ClaimStatus::WaitingForBuyerProof {
                return Err(EscrowError::StatusCanNotBeChanged);
            }

            // TODO: remove the claim order from the order book
            let mut order_claim = self.orders_claim.get(index).unwrap();
            order_claim.status = ClaimStatus::Canceled;
            self.orders_claim.insert(index, &order_claim);

            Ok(())
        }

        /// Update the status of a claimed order.
        /// Only the owner of the contract can update the status of a claimed order.
        /// It will be responsible for updating the status of the order to Filled
        #[ink(message)]
        pub fn update_claim_order_status(
            &mut self,
            index_claim_order: u32,
            status: ClaimStatus,
            claim_expiration_time: Option<u128>,
        ) -> Result<(), EscrowError> {
            let caller = self.env().caller();

            if caller != self.owner {
                return Err(EscrowError::Unauthorised);
            }

            if !self.orders_claim.contains(&index_claim_order) {
                return Err(EscrowError::OrderNotFound);
            }

            if self.orders_claim.get(&index_claim_order).unwrap().status
                != ClaimStatus::WaitingForBuyerProof
                && self.orders_claim.get(&index_claim_order).unwrap().status
                    != ClaimStatus::WaitingForSellerProof
            {
                return Err(EscrowError::StatusCanNotBeChanged);
            }

            if status == ClaimStatus::Filled {
                self.release_order_funds(index_claim_order);
            } else {
                let mut order_claim = self.orders_claim.get(index_claim_order).unwrap();
                order_claim.status = status.clone();

                if status == ClaimStatus::WaitingForSellerProof {
                    order_claim.claim_expiration_time = claim_expiration_time.unwrap();
                }

                self.orders_claim.insert(index_claim_order, &order_claim);
            }

            Ok(())
        }

        /// Buyer claim order funds.
        /// Only the claim order buyer can get the funds if the time is expired and the seller did not provide the proof.
        #[ink(message)]
        pub fn buyer_claim_order_funds(
            &mut self,
            index_claim_order: u32,
        ) -> Result<(), EscrowError> {
            let caller = self.env().caller();

            if !self.orders_claim.contains(&index_claim_order) {
                return Err(EscrowError::OrderNotFound);
            }

            if self.orders_claim.get(&index_claim_order).unwrap().buyer != caller {
                return Err(EscrowError::Unauthorised);
            }

            if self.orders_claim.get(&index_claim_order).unwrap().status
                != ClaimStatus::WaitingForSellerProof
            {
                return Err(EscrowError::StatusCanNotBeChanged);
            }

            if self
                .orders_claim
                .get(&index_claim_order)
                .unwrap()
                .claim_expiration_time
                > self.env().block_timestamp() as u128
            {
                return Err(EscrowError::OrderClaimed);
            }

            self.release_order_funds(index_claim_order);

            Ok(())
        }

        /// Release order funds.
        fn release_order_funds(&mut self, index_claim_order: u32) {
            let mut order_claim = self.orders_claim.get(index_claim_order).unwrap();
            order_claim.status = ClaimStatus::Filled;
            self.orders_claim.insert(index_claim_order, &order_claim);

            let mut order = self.orders.get(order_claim.order_index).unwrap();
            order.status = OrderStatus::Filled;
            self.orders.insert(order_claim.order_index, &order);

            // Release 95% of collateral to the seller
            // 5% is kept by the contract
            self.env()
                .transfer(order.owner, (order.collateral as f64 * 0.95) as u128)
                .unwrap();

            // Transfer the funds to the buyer
            self.env()
                .transfer(order_claim.buyer, order.amount_to_send)
                .unwrap();
        }

        fn check_order_claim(&self, index: u32) -> Result<(), EscrowError> {
            if self.orders_claim.contains(&index)
                && (self.orders_claim.get(&index).unwrap().status != ClaimStatus::Canceled
                    && self.orders_claim.get(&index).unwrap().claim_expiration_time
                        > self.env().block_timestamp() as u128)
            {
                return Err(EscrowError::OrderClaimed);
            }

            Ok(())
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::{test::DefaultAccounts, DefaultEnvironment};
        use openbrush::test_utils;

        // === HELPERS ===
        fn init() -> (DefaultAccounts<DefaultEnvironment>, ZKRamp) {
            let accounts = test_utils::accounts();
            test_utils::change_caller(accounts.bob);
            let zkramp = ZKRamp::default();
            (accounts, zkramp)
        }

        #[ink::test]
        fn new_works() {
            let zkramp = ZKRamp::default();
            assert_eq!(zkramp.get_all_orders(), Vec::<Order>::new());
        }

        #[ink::test]
        fn should_create_order() {
            let (accounts, mut zkramp) = init();

            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(100);
            zkramp
                .create_order(100, String::from(""), String::from(""), 0)
                .unwrap();

            // didn't work on test env
            // assert_eq!(get_balance(accounts.bob), 0);

            let mut orders = Vec::<Order>::new();
            orders.push(Order {
                id: 0,
                owner: accounts.bob,
                total: 100,
                amount_to_send: 50,
                collateral: 50,
                amount_to_receive: 100,
                status: OrderStatus::Open,
                payment_key: String::from(""),
                hash_name: String::from(""),
                name_length: 0,
            });
            assert_eq!(zkramp.get_all_orders(), orders);
        }

        #[ink::test]
        fn should_cancel_order() {
            let (accounts, mut zkramp) = init();

            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(100);
            zkramp
                .create_order(100, String::from(""), String::from(""), 0)
                .unwrap();
            zkramp.cancel_order(0).unwrap();

            let mut orders = Vec::<Order>::new();
            orders.push(Order {
                id: 0,
                owner: accounts.bob,
                total: 100,
                amount_to_send: 50,
                collateral: 50,
                amount_to_receive: 100,
                status: OrderStatus::Canceled,
                payment_key: String::from(""),
                hash_name: String::from(""),
                name_length: 0,
            });
            assert_eq!(zkramp.get_all_orders(), orders);
        }

        #[ink::test]
        fn should_not_cancel_order() {
            let (accounts, mut zkramp) = init();

            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(100);
            zkramp
                .create_order(100, String::from(""), String::from(""), 0)
                .unwrap();
            let result = zkramp.cancel_order(1);
            assert!(!result.is_ok());

            // diff order owner
            test_utils::change_caller(accounts.alice);
            let result = zkramp.cancel_order(0);
            assert!(!result.is_ok());

            // order status is not open
            test_utils::change_caller(accounts.bob);
            zkramp.cancel_order(0).unwrap();
            let result: Result<(), EscrowError> = zkramp.cancel_order(0);
            assert!(!result.is_ok());

            // order claim status is not canceled
            zkramp
                .create_order(10, String::from(""), String::from(""), 0)
                .unwrap();
            zkramp.claim_order(1, 100).unwrap();
            let result: Result<(), EscrowError> = zkramp.cancel_order(1);
            assert!(!result.is_ok());
        }

        #[ink::test]
        fn should_claim_order() {
            let (accounts, mut zkramp) = init();

            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(100);
            zkramp
                .create_order(100, String::from(""), String::from(""), 0)
                .unwrap();
            zkramp.claim_order(0, 100).unwrap();

            let mut orders_claim = Vec::<OrderClaim>::new();
            orders_claim.push(OrderClaim {
                buyer: accounts.bob,
                order_index: 0,
                status: ClaimStatus::WaitingForBuyerProof,
                claim_expiration_time: 100,
            });
            assert_eq!(zkramp.get_all_orders_claim(), orders_claim);

            zkramp.cancel_claim_order(0).unwrap();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            zkramp.claim_order(0, 1000).unwrap();

            let mut orders_claim = Vec::<OrderClaim>::new();
            orders_claim.push(OrderClaim {
                buyer: accounts.alice,
                order_index: 0,
                status: ClaimStatus::WaitingForBuyerProof,
                claim_expiration_time: 1000,
            });
            assert_eq!(zkramp.get_all_orders_claim(), orders_claim);
        }

        #[ink::test]
        fn should_not_claim_order() {
            let (accounts, mut zkramp) = init();

            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(100);

            zkramp
                .create_order(100, String::from(""), String::from(""), 0)
                .unwrap();
            zkramp.claim_order(0, 100).unwrap();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            let error = zkramp.claim_order(0, 100);

            assert_eq!(error, Err(EscrowError::OrderClaimed));

            zkramp
                .create_order(100, String::from(""), String::from(""), 0)
                .unwrap();
            zkramp.cancel_order(1).unwrap();

            let error = zkramp.claim_order(1, 100);

            assert_eq!(error, Err(EscrowError::StatusCanNotBeChanged));

            let error = zkramp.claim_order(3, 100);
            assert_eq!(error, Err(EscrowError::OrderNotFound));
        }

        #[ink::test]
        fn should_cancel_claim_order() {
            let (accounts, mut zkramp) = init();

            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(100);
            zkramp
                .create_order(100, String::from(""), String::from(""), 0)
                .unwrap();
            zkramp.claim_order(0, 100).unwrap();
            zkramp.cancel_claim_order(0).unwrap();

            let mut orders_claim = Vec::<OrderClaim>::new();
            orders_claim.push(OrderClaim {
                buyer: accounts.bob,
                order_index: 0,
                status: ClaimStatus::Canceled,
                claim_expiration_time: 100,
            });
            assert_eq!(zkramp.get_all_orders_claim(), orders_claim);
        }

        #[ink::test]
        fn should_not_cancel_claim_order() {
            let (accounts, mut zkramp) = init();

            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(100);

            zkramp
                .create_order(100, String::from(""), String::from(""), 0)
                .unwrap();
            zkramp.claim_order(0, 100).unwrap();

            let error = zkramp.cancel_claim_order(1);

            assert_eq!(error, Err(EscrowError::OrderNotFound));

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            let error = zkramp.cancel_claim_order(0);

            assert_eq!(error, Err(EscrowError::Unauthorised));

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            zkramp
                .create_order(100, String::from(""), String::from(""), 0)
                .unwrap();
            zkramp.claim_order(1, 10000).unwrap();
            zkramp
                .update_claim_order_status(0, ClaimStatus::WaitingForSellerProof, Some(1000))
                .unwrap();

            let error = zkramp.cancel_claim_order(0);
            assert_eq!(error, Err(EscrowError::StatusCanNotBeChanged));
        }

        #[ink::test]
        fn should_update_claim_order_status() {
            let (accounts, mut zkramp) = init();

            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(100);
            zkramp
                .create_order(100, String::from(""), String::from(""), 0)
                .unwrap();
            zkramp.claim_order(0, 100).unwrap();
            zkramp
                .update_claim_order_status(0, ClaimStatus::WaitingForSellerProof, Some(1000))
                .unwrap();

            let mut orders_claim = Vec::<OrderClaim>::new();
            orders_claim.push(OrderClaim {
                buyer: accounts.bob,
                order_index: 0,
                status: ClaimStatus::WaitingForSellerProof,
                claim_expiration_time: 1000,
            });
            assert_eq!(zkramp.get_all_orders_claim(), orders_claim);

            zkramp
                .create_order(101, String::from(""), String::from(""), 0)
                .unwrap();
            zkramp.claim_order(1, 100).unwrap();
            zkramp
                .update_claim_order_status(1, ClaimStatus::Filled, None)
                .unwrap();

            orders_claim.push(OrderClaim {
                buyer: accounts.bob,
                order_index: 1,
                status: ClaimStatus::Filled,
                claim_expiration_time: 100,
            });
            assert_eq!(zkramp.get_all_orders_claim(), orders_claim);
        }

        #[ink::test]
        fn should_not_update_claim_order_status() {
            let (accounts, mut zkramp) = init();

            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(100);

            zkramp
                .create_order(100, String::from(""), String::from(""), 0)
                .unwrap();
            zkramp.claim_order(0, 100).unwrap();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            let error = zkramp.update_claim_order_status(0, ClaimStatus::Filled, None);

            assert_eq!(error, Err(EscrowError::Unauthorised));

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            let error =
                zkramp.update_claim_order_status(1, ClaimStatus::WaitingForSellerProof, Some(1000));
            assert_eq!(error, Err(EscrowError::OrderNotFound));

            zkramp
                .create_order(100, String::from(""), String::from(""), 0)
                .unwrap();
            zkramp.claim_order(1, 100).unwrap();
            zkramp
                .update_claim_order_status(1, ClaimStatus::Filled, None)
                .unwrap();
            let error =
                zkramp.update_claim_order_status(1, ClaimStatus::WaitingForSellerProof, Some(1000));
            assert_eq!(error, Err(EscrowError::StatusCanNotBeChanged));
        }

        #[ink::test]
        fn should_buyer_claim_order_funds() {
            let (accounts, mut zkramp) = init();

            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(100);
            zkramp
                .create_order(100, String::from(""), String::from(""), 0)
                .unwrap();
            zkramp.claim_order(0, 100).unwrap();
            zkramp
                .update_claim_order_status(0, ClaimStatus::WaitingForSellerProof, Some(0))
                .unwrap();
            zkramp.buyer_claim_order_funds(0).unwrap();

            let mut orders_claim = Vec::<OrderClaim>::new();
            orders_claim.push(OrderClaim {
                buyer: accounts.bob,
                order_index: 0,
                status: ClaimStatus::Filled,
                claim_expiration_time: 0,
            });
            assert_eq!(zkramp.get_all_orders_claim(), orders_claim);
        }

        #[ink::test]
        fn should_not_buyer_claim_order_funds() {
            let (accounts, mut zkramp) = init();

            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(100);
            zkramp
                .create_order(100, String::from(""), String::from(""), 0)
                .unwrap();
            zkramp.claim_order(0, 100).unwrap();
            let error = zkramp.buyer_claim_order_funds(0);

            assert_eq!(error, Err(EscrowError::StatusCanNotBeChanged));

            let error = zkramp.buyer_claim_order_funds(1);

            assert_eq!(error, Err(EscrowError::OrderNotFound));

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            let error = zkramp.buyer_claim_order_funds(0);
            assert_eq!(error, Err(EscrowError::Unauthorised));

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            zkramp
                .update_claim_order_status(0, ClaimStatus::WaitingForSellerProof, Some(10))
                .unwrap();
            let error = zkramp.buyer_claim_order_funds(0);
            assert_eq!(error, Err(EscrowError::OrderClaimed));
        }
    }
}
