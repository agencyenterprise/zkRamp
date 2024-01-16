#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod ZKDex {
    use core::fmt::Error;

    use ink::prelude::{vec, vec::Vec};
    use ink::storage::Mapping;

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

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum EscrowError {
        AmountUnavailable,
        InsufficientFunds,
        ListingCanOnlyBeCreatedByAVendor,
        ListingLimitReached,
        ListingNotFound,
        StatusCanNotBeChanged,
        OrderCancelled,
        OrderFinalised,
        OrderNotFound,
        VendorAlreadyExists,
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
        amountToReceive: Balance,
        status: OrderStatus,
    }

    #[ink(storage)]
    pub struct ZKDex {
        orders: Mapping<u32, Order>,
        nextOrderNonce: u32,
    }

    impl ZKDex {
        #[ink(constructor)]
        pub fn default() -> Self {
            ZKDex {
                orders: Mapping::default(),
                nextOrderNonce: 0,
            }
        }

        #[ink(message)]
        pub fn get_all_orders(&self) -> Vec<Order> {
            let mut orders: Vec<Order> = Vec::new();
            for i in 0..self.nextOrderNonce {
                orders.push(self.orders.get(&i).unwrap());
            }
            orders
        }

        #[ink(message, payable)]
        pub fn create_order(&mut self, amount_to_receive: Balance) -> Result<(), ()> {
            let caller = self.env().caller();
            let transferred_value = self.env().transferred_value();
            ink::env::debug_println!(
                "thanks for the funding of {:?} from {:?}",
                transferred_value,
                caller
            );

            let order = Order {
                id: self.nextOrderNonce,
                owner: caller,
                deposited: transferred_value,
                amountToReceive: amount_to_receive,
                status: OrderStatus::Open,
            };
            self.orders.insert(self.nextOrderNonce, &order);
            self.nextOrderNonce += 1;
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

            let mut order = self.orders.get(index).unwrap();
            order.status = OrderStatus::Canceled;
            self.orders.insert(index, &order);

            Ok(())
        }

        // fill_order

        // withdraw

        // get_order
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
            zkdex.create_order(100).unwrap();

            // didn't work on test env
            // assert_eq!(get_balance(accounts.bob), 0);

            let mut orders = Vec::<Order>::new();
            orders.push(Order {
                id: 0,
                owner: accounts.bob,
                deposited: 100,
                amountToReceive: 100,
                status: OrderStatus::Open,
            });
            assert_eq!(zkdex.get_all_orders(), orders);
        }

        #[ink::test]
        fn should_cancel_order() {
            let (accounts, mut zkdex) = init();

            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(100);
            zkdex.create_order(100).unwrap();
            zkdex.cancel_order(0).unwrap();

            let mut orders = Vec::<Order>::new();
            orders.push(Order {
                id: 0,
                owner: accounts.bob,
                deposited: 100,
                amountToReceive: 100,
                status: OrderStatus::Canceled,
            });
            assert_eq!(zkdex.get_all_orders(), orders);
        }

        #[ink::test]
        fn should_not_cancel_order() {
            let (accounts, mut zkdex) = init();

            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(100);
            zkdex.create_order(100).unwrap();
            let result = zkdex.cancel_order(1);
            assert!(!result.is_ok());
        }
    }
}
