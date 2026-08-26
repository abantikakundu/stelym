#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{StellarAssetClient, TokenClient},
    Address, Env, String,
};

struct Setup {
    env: Env,
    client: TippingContractClient<'static>,
    token: TokenClient<'static>,
    token_admin: StellarAssetClient<'static>,
    contract_id: Address,
    platform: Address,
    owner: Address,
    tipper: Address,
    stranger: Address,
}

fn setup() -> Setup {
    let env = Env::default();
    env.mock_all_auths();

    let issuer = Address::generate(&env);
    let sac = env.register_stellar_asset_contract_v2(issuer);
    let token_id = sac.address();
    let token = TokenClient::new(&env, &token_id);
    let token_admin = StellarAssetClient::new(&env, &token_id);

    let platform = Address::generate(&env);
    let owner = Address::generate(&env);
    let tipper = Address::generate(&env);
    let stranger = Address::generate(&env);

    let contract_id = env.register(TippingContract, (token_id.clone(), platform.clone()));
    let client = TippingContractClient::new(&env, &contract_id);

    Setup {
        env,
        client,
        token,
        token_admin,
        contract_id,
        platform,
        owner,
        tipper,
        stranger,
    }
}

fn mint(setup: &Setup, to: &Address, amount: i128) {
    setup.token_admin.mint(to, &amount);
}

#[test]
fn get_projects_is_empty_initially() {
    let setup = setup();
    assert_eq!(setup.client.get_projects().len(), 0);
}

#[test]
fn create_project_persists_owner_name_description_and_returns_id_1() {
    let setup = setup();
    let name = String::from_str(&setup.env, "Open Atlas");
    let description = String::from_str(&setup.env, "Public maps for coastal towns");

    let id = setup
        .client
        .create_project(&setup.owner, &name, &description);

    assert_eq!(id, 1);

    let project = setup.client.get_project(&id);
    assert_eq!(project.id, 1);
    assert_eq!(project.owner, setup.owner);
    assert_eq!(project.name, name);
    assert_eq!(project.description, description);
    assert_eq!(setup.client.get_balance(&id), 0);
    assert_eq!(setup.client.get_projects().len(), 1);
}

#[test]
fn tip_increases_balance_and_stores_amount_message_from() {
    let setup = setup();
    let id = setup.client.create_project(
        &setup.owner,
        &String::from_str(&setup.env, "Harbor Lights"),
        &String::from_str(&setup.env, "Lighthouse restoration"),
    );

    let amount: i128 = 25_000_000;
    mint(&setup, &setup.tipper, amount);
    let message = String::from_str(&setup.env, "Keep the lamp burning");

    setup.client.tip(&setup.tipper, &id, &amount, &message);

    assert_eq!(setup.client.get_balance(&id), amount);
    assert_eq!(setup.token.balance(&setup.contract_id), amount);
    assert_eq!(setup.token.balance(&setup.tipper), 0);

    let tips = setup.client.get_tips(&id);
    assert_eq!(tips.len(), 1);
    let tip = tips.get(0).unwrap();
    assert_eq!(tip.id, 1);
    assert_eq!(tip.project_id, id);
    assert_eq!(tip.from, setup.tipper);
    assert_eq!(tip.amount, amount);
    assert_eq!(tip.message, message);
}

#[test]
fn tip_to_missing_id_fails_with_project_not_found() {
    let setup = setup();
    mint(&setup, &setup.tipper, 1_000_000);
    let result = setup.client.try_tip(
        &setup.tipper,
        &99,
        &1_000_000,
        &String::from_str(&setup.env, "ghost"),
    );
    assert_eq!(result, Err(Ok(Error::ProjectNotFound)));
}

#[test]
fn withdraw_by_owner_pays_99_percent_to_owner_and_1_percent_to_platform() {
    let setup = setup();
    let id = setup.client.create_project(
        &setup.owner,
        &String::from_str(&setup.env, "North Wind"),
        &String::from_str(&setup.env, ""),
    );

    let amount: i128 = 100_000_000; // 10 XLM
    mint(&setup, &setup.tipper, amount);
    setup.client.tip(
        &setup.tipper,
        &id,
        &amount,
        &String::from_str(&setup.env, ""),
    );

    setup.client.withdraw(&setup.owner, &id);

    assert_eq!(setup.client.get_balance(&id), 0);
    assert_eq!(setup.token.balance(&setup.owner), 99_000_000);
    assert_eq!(setup.token.balance(&setup.platform), 1_000_000);
    assert_eq!(setup.token.balance(&setup.contract_id), 0);
    assert_eq!(setup.client.get_tips(&id).len(), 1);
}

#[test]
fn withdraw_by_non_owner_fails_with_not_owner() {
    let setup = setup();
    let id = setup.client.create_project(
        &setup.owner,
        &String::from_str(&setup.env, "Quiet Harbor"),
        &String::from_str(&setup.env, ""),
    );
    mint(&setup, &setup.tipper, 1_000_000);
    setup.client.tip(
        &setup.tipper,
        &id,
        &1_000_000,
        &String::from_str(&setup.env, ""),
    );

    let result = setup.client.try_withdraw(&setup.stranger, &id);
    assert_eq!(result, Err(Ok(Error::NotOwner)));
}

#[test]
fn tip_does_not_change_platform_wallet_balance() {
    let setup = setup();
    let id = setup.client.create_project(
        &setup.owner,
        &String::from_str(&setup.env, "Cedar Trail"),
        &String::from_str(&setup.env, ""),
    );
    mint(&setup, &setup.tipper, 50_000_000);
    setup.client.tip(
        &setup.tipper,
        &id,
        &50_000_000,
        &String::from_str(&setup.env, ""),
    );

    assert_eq!(setup.token.balance(&setup.platform), 0);
    assert_eq!(setup.client.get_balance(&id), 50_000_000);
}

#[test]
fn withdraw_dust_balance_sends_full_amount_to_owner_with_zero_fee() {
    let setup = setup();
    let id = setup.client.create_project(
        &setup.owner,
        &String::from_str(&setup.env, "Dust Bowl"),
        &String::from_str(&setup.env, ""),
    );
    mint(&setup, &setup.tipper, 99);
    setup
        .client
        .tip(&setup.tipper, &id, &99, &String::from_str(&setup.env, ""));

    setup.client.withdraw(&setup.owner, &id);

    assert_eq!(setup.token.balance(&setup.owner), 99);
    assert_eq!(setup.token.balance(&setup.platform), 0);
    assert_eq!(setup.client.get_balance(&id), 0);
}

#[test]
fn withdraw_with_zero_balance_fails() {
    let setup = setup();
    let id = setup.client.create_project(
        &setup.owner,
        &String::from_str(&setup.env, "Empty Well"),
        &String::from_str(&setup.env, ""),
    );

    let result = setup.client.try_withdraw(&setup.owner, &id);
    assert_eq!(result, Err(Ok(Error::ZeroBalance)));
}
