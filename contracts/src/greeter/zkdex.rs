#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod ZKDex {
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
        /// Creates a new greeter contract initialized to 'Hello ink!'.
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

        // updateStatusOrder function
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

            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(1000);
            zkdex.create_order(1000).unwrap();

            // assert_eq!(get_balance(accounts.bob), 0);

            let mut orders = Vec::<Order>::new();
            orders.push(Order {
                id: 0,
                owner: accounts.bob,
                deposited: 1000,
                amountToReceive: 1000,
                status: OrderStatus::Open,
            });
            assert_eq!(zkdex.get_all_orders(), orders);
        }
    }
}
