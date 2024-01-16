#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod zkdex {
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;
    use ink_prelude::string::String;

    #[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    enum OrderStatus {
        Unopened,
        Open,
        Filled,
        Canceled,
    }

    #[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    enum ClaimStatus {
        Unsubmitted,
        Submitted,
        Used,
        Clawback,
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
        deposited: Balance,
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
    pub struct ZKDex {
        orders: Mapping<u32, Order>,
        orders_claim: Mapping<u32, OrderClaim>,
        next_order_nonce: u32,
    }

    impl ZKDex {
        #[ink(constructor)]
        pub fn default() -> Self {
            ZKDex {
                orders: Mapping::default(),
                orders_claim: Mapping::default(),
                next_order_nonce: 0,
            }
        }

        #[ink(message)]
        pub fn get_all_orders(&self) -> Vec<Order> {
            let mut orders: Vec<Order> = Vec::new();
            for i in 0..self.next_order_nonce {
                orders.push(self.orders.get(&i).unwrap());
            }
            orders
        }

        #[ink(message)]
        pub fn get_all_orders_claim(&self) -> Vec<OrderClaim> {
            let mut orders_claim: Vec<OrderClaim> = Vec::new();
            for i in 0..self.next_order_nonce {
                orders_claim.push(self.orders_claim.get(&i).unwrap());
            }
            orders_claim
        }

        #[ink(message)]
        pub fn get_order(&self, index: u32) -> Order {
            self.orders.get(index).unwrap()
        }

        #[ink(message)]
        pub fn get_time(&self) -> u128 {
            self.env().block_timestamp() as u128
        }

        #[ink(message, payable)]
        pub fn create_order(
            &mut self,
            amount_to_receive: Balance,
            payment_key: String,
            hash_name: String,
            name_length: u32,
        ) -> Result<(), ()> {
            let caller = self.env().caller();
            let transferred_value = self.env().transferred_value();
            ink::env::debug_println!(
                "thanks for the funding of {:?} from {:?}",
                transferred_value,
                caller
            );

            let order = Order {
                id: self.next_order_nonce,
                owner: caller,
                deposited: transferred_value,
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
            if self.orders_claim.contains(&index)
                && self.orders_claim.get(&index).unwrap().claim_expiration_time
                    > self.env().block_timestamp() as u128
            {
                return Err(EscrowError::OrderClaimed);
            }

            let mut order = self.orders.get(index).unwrap();
            order.status = OrderStatus::Canceled;
            self.orders.insert(index, &order);

            Ok(())
        }

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

            if self.orders_claim.contains(&index)
                && self.orders_claim.get(&index).unwrap().claim_expiration_time
                    > self.env().block_timestamp() as u128
            {
                return Err(EscrowError::OrderClaimed);
            }

            self.orders_claim.insert(
                index,
                &OrderClaim {
                    buyer: caller,
                    order_index: index,
                    status: ClaimStatus::Unsubmitted,
                    claim_expiration_time: claim_expiration_time,
                },
            );

            Ok(())
        }

        // TODO cancel_claim_order

        // TODO Submit BUYER proof

        // TODO Submit SELLER proof
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::{
            self,
            test::{get_account_balance, DefaultAccounts},
            DefaultEnvironment,
        };
        use openbrush::test_utils;

        // === HELPERS ===
        fn init() -> (DefaultAccounts<DefaultEnvironment>, ZKDex) {
            let accounts = test_utils::accounts();
            test_utils::change_caller(accounts.bob);
            let zkdex = ZKDex::default();
            (accounts, zkdex)
        }

        fn get_balance(account_id: AccountId) -> Balance {
            ink::env::test::get_account_balance::<ink::env::DefaultEnvironment>(account_id)
                .expect("Cannot get account balance")
        }

        fn set_balance(account_id: AccountId, balance: Balance) {
            ink::env::test::set_account_balance::<ink::env::DefaultEnvironment>(account_id, balance)
        }

        #[ink::test]
        fn new_works() {
            let zkdex = ZKDex::default();
            assert_eq!(zkdex.get_all_orders(), Vec::<Order>::new());
        }

        #[ink::test]
        fn should_create_order() {
            let (accounts, mut zkdex) = init();

            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(100);
            zkdex
                .create_order(100, String::from(""), String::from(""), 0)
                .unwrap();

            // didn't work on test env
            // assert_eq!(get_balance(accounts.bob), 0);

            let mut orders = Vec::<Order>::new();
            orders.push(Order {
                id: 0,
                owner: accounts.bob,
                deposited: 100,
                amount_to_receive: 100,
                status: OrderStatus::Open,
                payment_key: String::from(""),
                hash_name: String::from(""),
                name_length: 0,
            });
            assert_eq!(zkdex.get_all_orders(), orders);
        }

        #[ink::test]
        fn should_cancel_order() {
            let (accounts, mut zkdex) = init();

            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(100);
            zkdex
                .create_order(100, String::from(""), String::from(""), 0)
                .unwrap();
            zkdex.cancel_order(0).unwrap();

            let mut orders = Vec::<Order>::new();
            orders.push(Order {
                id: 0,
                owner: accounts.bob,
                deposited: 100,
                amount_to_receive: 100,
                status: OrderStatus::Canceled,
                payment_key: String::from(""),
                hash_name: String::from(""),
                name_length: 0,
            });
            assert_eq!(zkdex.get_all_orders(), orders);
        }

        #[ink::test]
        fn should_not_cancel_order() {
            let (accounts, mut zkdex) = init();

            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(100);
            zkdex
                .create_order(100, String::from(""), String::from(""), 0)
                .unwrap();
            let result = zkdex.cancel_order(1);
            assert!(!result.is_ok());
        }

        #[ink::test]
        fn should_claim_order() {
            let (accounts, mut zkdex) = init();

            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(100);
            zkdex
                .create_order(100, String::from(""), String::from(""), 0)
                .unwrap();
            zkdex.claim_order(0, 100).unwrap();

            let mut orders_claim = Vec::<OrderClaim>::new();
            orders_claim.push(OrderClaim {
                buyer: accounts.bob,
                order_index: 0,
                status: ClaimStatus::Unsubmitted,
                claim_expiration_time: 100,
            });
            assert_eq!(zkdex.get_all_orders_claim(), orders_claim);
        }

        #[ink::test]
        fn should_not_claim_order() {
            let (accounts, mut zkdex) = init();

            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(100);

            zkdex
                .create_order(100, String::from(""), String::from(""), 0)
                .unwrap();
            zkdex.claim_order(0, 100).unwrap();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            let error = zkdex.claim_order(0, 100);

            assert_eq!(error, Err(EscrowError::OrderClaimed));
        }

        // TODO check all validation for cancel_order
        // TODO check all validation for claim_order
    }
}
