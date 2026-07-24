import type { ReactNode } from "react";
import { SettingsSubnav } from "@/components/settings/SettingsSubnav";

type SettingsChromeProps = {
  children: ReactNode;
};

/**
 * Shared Settings chrome: fixed subnav strip under the primary header,
 * then full-bleed scrollable content. Keeps Preferences and Data Health aligned.
 */
export function SettingsChrome({ children }: SettingsChromeProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-norma-border/70 bg-white/75 px-4 py-3 backdrop-blur-sm md:px-6 lg:px-8 xl:px-10">
        <SettingsSubnav />
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
