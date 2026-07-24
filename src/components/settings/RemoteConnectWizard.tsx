"use client";

import { useState } from "react";

type RemoteConnectWizardProps = {
  healthOk: boolean | null;
  onConnected: () => void;
  onCancel: () => void;
};

type Step = "intro" | "confirm" | "done";

export function RemoteConnectWizard({
  healthOk,
  onConnected,
  onCancel,
}: RemoteConnectWizardProps) {
  const [step, setStep] = useState<Step>("intro");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="remote-connect-title"
      className="norma-glass mt-4 rounded-norma-lg border border-norma-border/80 p-5 shadow-norma-md"
    >
      <h3
        id="remote-connect-title"
        className="text-sm font-semibold text-norma-ink"
      >
        Connect Remote
      </h3>

      {step === "intro" ? (
        <div className="mt-3 space-y-3 text-sm text-norma-ink-muted">
          <p>
            Acme uses your company&apos;s Remote link that is already configured
            securely on the server. You will not enter an API token in the
            browser.
          </p>
          <p>
            This does not open a Remote login page. When company OAuth is
            enabled later, that flow can replace this step without changing how
            the chart works.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              className="norma-cta px-5 py-2 text-sm"
              onClick={() => setStep("confirm")}
            >
              Continue
            </button>
            <button
              type="button"
              className="rounded-full border border-norma-border px-4 py-2 text-sm font-medium text-norma-ink-muted hover:text-norma-ink"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {step === "confirm" ? (
        <div className="mt-3 space-y-3 text-sm text-norma-ink-muted">
          <p>
            Confirm you want this browser to load Acme people and reporting
            lines from Remote again.
          </p>
          <p
            className={`text-xs font-semibold ${
              healthOk === false
                ? "text-norma-danger"
                : healthOk
                  ? "text-norma-success"
                  : "text-norma-ink-subtle"
            }`}
          >
            {healthOk === false
              ? "Remote looks unreachable right now. You can still connect and retry from the chart."
              : healthOk
                ? "Remote is reachable."
                : "Checking Remote…"}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              className="norma-cta px-5 py-2 text-sm"
              onClick={() => {
                onConnected();
                setStep("done");
              }}
            >
              Connect
            </button>
            <button
              type="button"
              className="rounded-full border border-norma-border px-4 py-2 text-sm font-medium text-norma-ink-muted hover:text-norma-ink"
              onClick={() => setStep("intro")}
            >
              Back
            </button>
          </div>
        </div>
      ) : null}

      {step === "done" ? (
        <div className="mt-3 space-y-3 text-sm text-norma-ink-muted">
          <p className="font-medium text-norma-success">Connected</p>
          <p>
            Org data will load again on the chart and People surfaces. No
            secrets were entered in this browser.
          </p>
          <button
            type="button"
            className="norma-cta px-5 py-2 text-sm"
            onClick={onCancel}
          >
            Done
          </button>
        </div>
      ) : null}
    </div>
  );
}
