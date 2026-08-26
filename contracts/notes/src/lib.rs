#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env, String,
    Vec,
};

const NAME_MAX: u32 = 64;
const TEXT_MAX: u32 = 280;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    EmptyName = 1,
    NameTooLong = 2,
    DescriptionTooLong = 3,
    MessageTooLong = 4,
    InvalidAmount = 5,
    ProjectNotFound = 6,
    NotOwner = 7,
    ZeroBalance = 8,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Project {
    id: u64,
    owner: Address,
    name: String,
    description: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Tip {
    id: u64,
    project_id: u64,
    from: Address,
    amount: i128,
    message: String,
    timestamp: u64,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    XlmToken,
    Platform,
    NextProjectId,
    Project(u64),
    Balance(u64),
    NextTipId,
    Tip(u64),
    ProjectTipIds(u64),
}

#[contract]
pub struct TippingContract;

#[contractimpl]
impl TippingContract {
    pub fn __constructor(env: Env, xlm_token: Address, platform: Address) {
        env.storage().instance().set(&DataKey::XlmToken, &xlm_token);
        env.storage().instance().set(&DataKey::Platform, &platform);
    }

    pub fn create_project(
        env: Env,
        owner: Address,
        name: String,
        description: String,
    ) -> Result<u64, Error> {
        owner.require_auth();

        if name.len() == 0 {
            return Err(Error::EmptyName);
        }
        if name.len() > NAME_MAX {
            return Err(Error::NameTooLong);
        }
        if description.len() > TEXT_MAX {
            return Err(Error::DescriptionTooLong);
        }

        let id: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::NextProjectId)
            .unwrap_or(1);

        let project = Project {
            id,
            owner: owner.clone(),
            name,
            description,
        };
        env.storage()
            .persistent()
            .set(&DataKey::Project(id), &project);
        env.storage()
            .persistent()
            .set(&DataKey::Balance(id), &0i128);
        env.storage()
            .persistent()
            .set(&DataKey::ProjectTipIds(id), &Vec::<u64>::new(&env));
        env.storage()
            .persistent()
            .set(&DataKey::NextProjectId, &(id + 1));

        env.events().publish((symbol_short!("create"), owner), id);

        Ok(id)
    }

    pub fn get_projects(env: Env) -> Vec<Project> {
        let mut projects = Vec::new(&env);
        let next: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::NextProjectId)
            .unwrap_or(1);
        let mut id = 1u64;
        while id < next {
            if let Some(project) = env.storage().persistent().get(&DataKey::Project(id)) {
                projects.push_back(project);
            }
            id += 1;
        }
        projects
    }

    pub fn get_project(env: Env, id: u64) -> Result<Project, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Project(id))
            .ok_or(Error::ProjectNotFound)
    }

    pub fn get_tips(env: Env, project_id: u64) -> Result<Vec<Tip>, Error> {
        require_project(&env, project_id)?;
        let ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::ProjectTipIds(project_id))
            .unwrap_or(Vec::new(&env));
        let mut tips = Vec::new(&env);
        for i in 0..ids.len() {
            let tip_id = ids.get(i).unwrap();
            let tip: Tip = env
                .storage()
                .persistent()
                .get(&DataKey::Tip(tip_id))
                .unwrap();
            tips.push_back(tip);
        }
        Ok(tips)
    }

    pub fn get_balance(env: Env, project_id: u64) -> Result<i128, Error> {
        require_project(&env, project_id)?;
        Ok(env
            .storage()
            .persistent()
            .get(&DataKey::Balance(project_id))
            .unwrap_or(0))
    }

    pub fn tip(
        env: Env,
        from: Address,
        project_id: u64,
        amount: i128,
        message: String,
    ) -> Result<(), Error> {
        require_project(&env, project_id)?;
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        if message.len() > TEXT_MAX {
            return Err(Error::MessageTooLong);
        }

        from.require_auth();

        let token = token_client(&env);
        let contract = env.current_contract_address();
        token.transfer(&from, &contract, &amount);

        let balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Balance(project_id))
            .unwrap_or(0);
        env.storage()
            .persistent()
            .set(&DataKey::Balance(project_id), &(balance + amount));

        let tip_id: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::NextTipId)
            .unwrap_or(1);
        let recorded = Tip {
            id: tip_id,
            project_id,
            from: from.clone(),
            amount,
            message,
            timestamp: env.ledger().timestamp(),
        };
        env.storage()
            .persistent()
            .set(&DataKey::Tip(tip_id), &recorded);
        env.storage()
            .persistent()
            .set(&DataKey::NextTipId, &(tip_id + 1));

        let mut ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::ProjectTipIds(project_id))
            .unwrap_or(Vec::new(&env));
        ids.push_back(tip_id);
        env.storage()
            .persistent()
            .set(&DataKey::ProjectTipIds(project_id), &ids);

        env.events()
            .publish((symbol_short!("tip"), project_id, from), (amount, tip_id));

        Ok(())
    }

    pub fn withdraw(env: Env, caller: Address, project_id: u64) -> Result<(), Error> {
        let project: Project = env
            .storage()
            .persistent()
            .get(&DataKey::Project(project_id))
            .ok_or(Error::ProjectNotFound)?;

        caller.require_auth();
        if caller != project.owner {
            return Err(Error::NotOwner);
        }

        let balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Balance(project_id))
            .unwrap_or(0);
        if balance == 0 {
            return Err(Error::ZeroBalance);
        }

        let fee = balance / 100;
        let net = balance - fee;
        let token = token_client(&env);
        let contract = env.current_contract_address();
        let platform: Address = env.storage().instance().get(&DataKey::Platform).unwrap();

        token.transfer(&contract, &project.owner, &net);
        if fee > 0 {
            token.transfer(&contract, &platform, &fee);
        }

        env.storage()
            .persistent()
            .set(&DataKey::Balance(project_id), &0i128);

        env.events()
            .publish((symbol_short!("withdraw"), project_id, caller), (net, fee));

        Ok(())
    }
}

fn require_project(env: &Env, project_id: u64) -> Result<(), Error> {
    if env
        .storage()
        .persistent()
        .has(&DataKey::Project(project_id))
    {
        Ok(())
    } else {
        Err(Error::ProjectNotFound)
    }
}

fn token_client(env: &Env) -> token::TokenClient<'_> {
    let token_id: Address = env.storage().instance().get(&DataKey::XlmToken).unwrap();
    token::TokenClient::new(env, &token_id)
}

mod test;
