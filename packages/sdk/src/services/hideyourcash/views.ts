import {
  viewAccountHash,
  viewRelayerHash,
  viewIsInAllowlist,
  viewAllCurrencies,
  viewCurrencyContracts,
  viewIsContractAllowed,
  viewIsWithdrawValid,
  viewWasNullifierSpent,
  viewIsAllowlistRootValid,
  viewAccountBalance,
} from "../../views";
import axios from "axios";
import type {
  Currency,
  PublicArgsInterface,
  RelayerDataInterface,
} from "../../interfaces";

const baseRelayers = {
  test: "https://dev-relayer.hideyourcash.workers.dev",
  prod: "https://prod-relayer.hideyourcash.workers.dev",
  staging: 'https://staging-relayer.hideyourcash.workers.dev',
  local: "http://localhost:8787",
};

/**
 * This class provides common contract and node url for all view methods
 */
export class Views {
  readonly contract: string;
  readonly nodeUrl: string;

  constructor(nodeUrl: string, contract: string) {
    this.nodeUrl = nodeUrl;
    this.contract = contract;
  }

  /**
   * View Is In Allowlist
   *
   * This View Function returns if accountId included on registry allowlist
   *
   * @param accountId The user accountId to check if is on allowlist
   * @returns {Promise<any>}
   */
  viewIsInAllowlist(accountId: string) {
    return viewIsInAllowlist(this.nodeUrl, this.contract, accountId);
  }

  /**
   * View Account Hash
   *
   * This View Function returns a hash of an accountId.
   *
   * @param accountId The user accountId to be sent to get hash
   * @returns {Promise<any>}
   */
  viewAccountHash(accountId: string) {
    return viewAccountHash(this.nodeUrl, this.contract, accountId);
  }

  /**
   * View All Currencies
   *
   * This View Function returns all currencies included on registry contract
   *
   * @returns {Promise<any>}
   */
  viewAllCurrencies() {
    return viewAllCurrencies(this.nodeUrl, this.contract);
  }

  /**
   * View Currency Contracts
   *
   * This View Function returns all instances of an currency
   *
   * @param currency The currency accountId to get instances
   * @returns {Promise<any>}
   */
  viewCurrencyContracts(currency: Currency) {
    return viewCurrencyContracts(this.nodeUrl, this.contract, currency);
  }

  /**
   * View Is Contract Allowed
   *
   * This View Function returns if instanceId is allowed on HYC registry.
   *
   * @param contract The instance accountId to check if is allowed
   * @returns {Promise<any>}
   */
  viewIsContractAllowed(contract: string) {
    return viewIsContractAllowed(this.nodeUrl, this.contract, contract);
  }

  /**
   * View Is Allowlist Root Valid
   *
   * This View Function returns if allowlist root is valid.
   *
   * @param root The allowlist root
   * @returns {Promise<any>}
   */
  viewIsAllowlistRootValid(root: string) {
    return viewIsAllowlistRootValid(this.nodeUrl, this.contract, root);
  }

  /**
   * View Relayer Hash
   *
   * This View Function return the hash of relayer accountId.
   *
   * @param relayer The data of relayer with Near accountId
   * @returns {Promise<any>}
   */
  async viewRelayerHash(relayer: RelayerDataInterface) {
    return viewRelayerHash(this.nodeUrl, this.contract, relayer);
  }

  /**
   * View Is Withdraw Valid
   *
   * This View Function return if withdraw payload is valid.
   *
   * @param contract The instance accountId to check if withdraw is valid
   * @param payload The public args generated by plonk
   * @returns {Promise<any>}
   */
  async viewIsWithdrawValid(payload: PublicArgsInterface, contract: string) {
    return viewIsWithdrawValid(this.nodeUrl, this.contract, contract, payload);
  }

  /**
   * View Was Nullifier Spent
   *
   * This View Function return if nullifier already spent
   *
   * @param ticket The note to withdraw
   * @returns {Promise<any>}
   */
  async viewWasNullifierSpent(ticket: string) {
    return viewWasNullifierSpent(this.nodeUrl, ticket);
  }

  /**
   * View Account Balance
   *
   * This View Function returns the "Near" balance of an account.
   *
   * @param accountId The user accountId to check if is on allowlist
   * @returns {Promise<any>}
   */
  async viewAccountBalance(contract: string, accountId: string) {
    return viewAccountBalance(this.nodeUrl, contract, accountId);
  }

  /**
   * Get Random Relayer
   *
   * This method return a valid relayer.
   *
   * @param network Get relayer by network
   * @returns {Promise<any>}
   */
  async getRandomRelayer(
    network: "test" | "prod" | "local" = "test"
  ): Promise<RelayerDataInterface[]> {
    const relayerService = axios.create({
      baseURL: baseRelayers[network],
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

    const { data } = await relayerService.get("/data");

    return [
      {
        url: baseRelayers[network],
        account: data.data.account_id,
        feePercent: data.data.feePercent,
      },
    ];
  }
}
