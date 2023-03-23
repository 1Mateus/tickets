import ConfirmModal from "./confirm-modal";
import { useRelayer, useWithdraw } from "@/store";
import { useState } from "react";
import { toast } from "react-toastify";
import { LoadingModal } from "@/components/modals/loading";
import { ToastCustom } from "@/components/shared/toast-custom";
import { useWithdrawalScore } from "@/hooks/useWithdrawalScore";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { WhatIsThisModal } from "@/components/modals/poolAnonymity";
import Countdown from "react-countdown";
import type { Logger } from "hideyourcash-sdk";

const transactionHashes = new URLSearchParams(window.location.search).get(
  "transactionHashes"
);

const getHumanFormat = (value: number | string): string =>
  value < 10 ? `0${value}` : String(value);

const hycTransaction = "hyc-transaction";

let totalProgress = 40;

export function Withdraw() {
  const [showModal, setShowModal] = useState(false);
  const [showModalPoolAnonymity, setShowModalPoolAnonymity] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientTicket, setRecipientTicket] = useState("");
  const [progress, setProgress] = useState(40);
  const {
    errorMessage,
    ticket,
    buttonText,
    generatingProof,
    preWithdraw,
    validateTicket,
  } = useWithdraw();
  const {
    loadingDynamicFee,
    dynamicFee,
    recipientAddressError,
    checkRelayerFee,
  } = useRelayer();

  const logger: Logger = {
    debug: (message: string) => {
      totalProgress = totalProgress + 0.37;

      setProgress(totalProgress);

      return message;
    },
  };

  const handleRecipientAddress = (value: string) => {
    setRecipientAddress(value);

    if (value.length < 10) {
      return;
    }

    checkRelayerFee(value);
  };

  const { withdrawalScore } = useWithdrawalScore(ticket ? ticket.value : "");

  if (transactionHashes) {
    localStorage.setItem(hycTransaction, JSON.stringify(true));
  }

  const handleWithdraw = async () => {
    try {
      await preWithdraw(recipientAddress, recipientTicket, logger);
      setShowModal(true);
    } catch (err) {
      console.warn(err);
      toast(
        <ToastCustom
          icon="/error-circle-icon.svg"
          title="Withdraw error"
          message="An error occured. It may be intermittent due to RPC cache, please try again in 10 minutes."
        />,
        {
          toastId: "error-toast",
        }
      );
    } finally {
      totalProgress = 40;
      setProgress(40);
    }
  };

  return (
    <>
      <div>
        <div>
          <div className={`mb-5`}>
            <div className="flex items-center justify-between">
              <span className="text-black text-[1.1rem] font-bold">
                Withdrawal ticket{" "}
                {errorMessage && <span className="text-error"> * </span>}
              </span>
            </div>
            <div>
              <div>
                <input
                  className={`
                mt-2
                p-[8px]
                h-[43px]
                bg-soft-blue-normal
                rounded-[15px]
                text-dark-grafiti-light
                w-full
                flex items-center justify-between
                border-[2px]
                focus:outline-none
                ${errorMessage ? "border-error" : "border-transparent"}
              `}
                  autoComplete="off"
                  autoFocus
                  value={recipientTicket}
                  placeholder="Paste your withdraw ticked"
                  onInput={(e) => validateTicket(e.currentTarget.value)}
                />
              </div>
              <p className="text-error mt-2 text-sm font-normal">
                {errorMessage && errorMessage}
              </p>
              {ticket.contract && !errorMessage && (
                <div className="my-5">
                  <div className="flex items-center justify-between">
                    <span className="text-black text-[1.1rem] font-bold ">
                      Transaction Anonymity
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {withdrawalScore < 30 ? (
                      <>
                        {[1, 2, 3].map((item) => (
                          <div
                            key={item}
                            className={`w-[77px] h-[9px] ${
                              item === 1 ? "bg-deep-blue" : "bg-gray-300"
                            } rounded-full`}
                          />
                        ))}
                      </>
                    ) : withdrawalScore > 30 && withdrawalScore < 60 ? (
                      <>
                        {[1, 2, 3].map((item) => (
                          <div
                            key={item}
                            className={`w-[77px] h-[9px] ${
                              item !== 3
                                ? "bg-intermediate-score"
                                : "bg-gray-300"
                            } rounded-full`}
                          />
                        ))}
                      </>
                    ) : (
                      withdrawalScore > 60 && (
                        <>
                          {[1, 2, 3].map((item) => (
                            <div
                              key={item}
                              className={`w-[77px] h-[9px] bg-success rounded-full`}
                            />
                          ))}
                        </>
                      )
                    )}
                  </div>
                  <p
                    className="text-info font-normal text-sm underline flex items-center gap-2 mt-2 cursor-pointer"
                    title="Coming soon"
                    onClick={() => setShowModalPoolAnonymity(true)}
                  >
                    What is this <QuestionMarkCircleIcon className="w-4 h-4" />
                  </p>
                </div>
              )}
            </div>
            <div className="mt-8 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-black text-[1.1rem] font-bold">
                  Recipient Address{" "}
                  {recipientAddressError && (
                    <span className="text-error"> * </span>
                  )}
                </span>
              </div>

              <div>
                <input
                  className={`
               mt-2
               p-[8px]
               h-[43px]
               bg-soft-blue-normal
               rounded-[15px]
               text-dark-grafiti-light
               w-full
               flex items-center justify-between
               border-[2px]
               focus:outline-none
               ${recipientAddressError ? "border-error" : "border-transparent"}
             `}
                  placeholder="Wallet Address"
                  autoComplete="off"
                  value={recipientAddress}
                  onChange={(e) => handleRecipientAddress(e.target.value)}
                />
              </div>
              <p className="text-error mt-2 text-sm font-normal">
                {recipientAddressError && recipientAddressError}
              </p>
            </div>
          </div>

          {dynamicFee.token && !loadingDynamicFee && (
            <div className="mt-[24px] mb-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <span className="text-black font-bold">Total</span>
                </div>

                <div className="text-black text-sm">
                  {(!generatingProof || showModal) && (
                    <Countdown
                      date={Date.now() + dynamicFee.valid_fee_for_ms}
                      key={dynamicFee.token}
                      renderer={({ hours, minutes, seconds }) => (
                        <span className="w-[65px] flex items-center">
                          {getHumanFormat(hours)}:{getHumanFormat(minutes)}:
                          {getHumanFormat(seconds)}
                        </span>
                      )}
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col w-full mt-2">
                <div className="flex items-center justify-between pb-[12px]">
                  <span className="text-black text-[14px]">Protocol fee:</span>

                  <span className="text-black font-bold">
                    {dynamicFee.human_network_fee}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-[12px]">
                  <span className="text-black text-[14px]">Relayer fee:</span>

                  <span className="text-black font-bold">
                    {dynamicFee.formatted_token_fee}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-black text-[14px]">
                    Total to receive:
                  </span>

                  <span className="text-black font-bold">
                    {dynamicFee.formatted_user_will_receive}
                  </span>
                </div>
              </div>
            </div>
          )}

          {generatingProof ? (
            <LoadingModal loading={generatingProof} progress={progress} />
          ) : (
            <div>
              <button
                type="button"
                disabled={!dynamicFee.token || loadingDynamicFee}
                onClick={() => handleWithdraw()}
                className="bg-soft-blue-from-deep-blue mt-[12px] p-[12px] rounded-full w-full font-[400] hover:opacity-[.9] disabled:opacity-[.6] disabled:cursor-not-allowed"
              >
                {loadingDynamicFee && (
                  <>
                    <div className="flex items-center justify-center w-full my-auto text-black">
                      <svg
                        className="animate-spin h-6 w-6 border border-l-current rounded-full"
                        viewBox="0 0 24 24"
                      />
                    </div>
                  </>
                )}

                {!loadingDynamicFee && (
                  <> {!showModal ? "Withdraw" : buttonText} </>
                )}
              </button>
            </div>
          )}
          {showModal && (
            <ConfirmModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              cleanupInputsCallback={() => {
                setRecipientTicket("");
                setRecipientAddress("");
              }}
            />
          )}
        </div>
      </div>
      {showModalPoolAnonymity && (
        <WhatIsThisModal
          isOpen={showModalPoolAnonymity}
          onClose={() => setShowModalPoolAnonymity(false)}
        />
      )}
    </>
  );
}
