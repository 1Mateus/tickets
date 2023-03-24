import { create } from "zustand";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupWelldoneWallet } from "@near-wallet-selector/welldone-wallet";
import { setupXDEFI } from "@near-wallet-selector/xdefi";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { useEnv } from "@/hooks/useEnv";
import { WalletStore } from "@/interfaces";
import { hycService } from "@/lib";
import { viewAccountBalance, getAccountBalance } from "hideyourcash-sdk";

interface Balance {
  available: string;
}

const nodeUrl = useEnv("VITE_NEAR_NODE_URL");

export const useWallet = create<WalletStore>((set, get) => ({
  accountId: "",
  selector: null,
  showWalletModal: false,
  haveBalance: true,

  toggleModal: () => {
    const { showWalletModal } = get();

    set(() => ({ showWalletModal: !showWalletModal }));
  },

  initWallet: async () => {
    const newSelector = await setupWalletSelector({
      network: useEnv("VITE_NEAR_NETWORK"),
      debug: true,
      modules: [
        setupMeteorWallet(),
        setupNearWallet(),
        setupMyNearWallet(),
        setupSender(),
        setupNightly(),
        setupWelldoneWallet(),
        setupXDEFI(),
        setupHereWallet(),
      ],
    });

    const state = newSelector.store.getState();

    const newAccount =
      state?.accounts.find((account) => account.active)?.accountId || "";

    try {
      set(() => ({
        accountId: newAccount,
        selector: newSelector,
      }));
    } catch (e) {
      console.warn(e);

      return "";
    }

    return newAccount;
  },

  signOut: async () => {
    const { selector } = get();

    if (!selector) {
      return;
    }

    const wallet = await selector.wallet();

    try {
      await wallet.signOut();
    } catch (e) {
      console.warn(e);

      return;
    }

    set(() => ({ accountId: "" }));
  },

  viewBalance: async (
    tokenType: string,
    tokenContract: string,
    tokenValue: number,
  ) => {
    console.log(tokenType, tokenContract, tokenValue);

    return;
  },

  sendWhitelist: async () => {
    const { selector, accountId } = get();
    if (!accountId) return;
    await hycService.sendAllowlist(accountId!, selector);
  },

  viewNearBalance: async (): Promise<any> => {
    const { accountId } = get();

    if (!accountId) {
      return {
        available: '0',
      };
    }

    const {
      amount
    } = await getAccountBalance({
      nodeUrl,
      accountId,
    }) as any;

    return {
      available: amount,
    } as Balance;

    set({ haveBalance: +balance.available < tokenValue ? false : true });
    return;
  },
}));
