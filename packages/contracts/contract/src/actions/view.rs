use crate::*;
use near_bigint::U256;
use crate::hashes::account_hash;
use near_mimc::u256_mimc_sponge_single;

#[near_bindgen]
impl Contract {
  pub fn view_account_hash(&self, account_id: AccountId) -> U256 {
    account_hash(&account_id, self.verifier.q)
  }

  pub fn view_nullifier_hash(&self, nullifier: U256) -> U256 {
    u256_mimc_sponge_single(U256::zero(), [nullifier])[0]
  }

  pub fn view_commitments_root(&self) -> U256 {
    self.commitments.get_last_root()
  }

  pub fn view_allowlist_root(&self) -> U256 {
    self.allowlist.get_last_root()
  }

  pub fn view_is_in_allowlist(&self, account_id: AccountId) -> bool {
    self.allowlist.is_in_allowlist(&account_hash(&account_id, self.verifier.q))
  }

  pub fn view_was_nullifier_spent(&self, nullifier: U256) -> bool {
    self.nullifier.contains(&nullifier)
  }

  pub fn view_kill_switch(&self) -> bool {
    self.kill_switch
  }

  pub fn view_is_withdraw_valid(
    &self,
    root: U256,
    nullifier_hash: U256,
    recipient: AccountId,
    relayer: Option<AccountId>,
    fee: U256,
    refund: U256,
    allowlist_root: U256,
    // proof params
    a: G1Point,
    b: G1Point,
    c: G1Point,
    z: G1Point,
    t_1: G1Point,
    t_2: G1Point,
    t_3: G1Point,
    eval_a: U256,
    eval_b: U256,
    eval_c: U256,
    eval_s1: U256,
    eval_s2: U256,
    eval_zw: U256,
    eval_r: U256,
    wxi: G1Point,
    wxi_w: G1Point,
  ) -> bool {
    self.evaluate_proof(
      root,
      nullifier_hash,
      recipient,
      relayer,
      fee,
      refund,
      allowlist_root,
      a,
      b,
      c,
      z,
      t_1,
      t_2,
      t_3,
      eval_a,
      eval_b,
      eval_c,
      eval_s1,
      eval_s2,
      eval_zw,
      eval_r,
      wxi,
      wxi_w,
    );
    true
  }
}
