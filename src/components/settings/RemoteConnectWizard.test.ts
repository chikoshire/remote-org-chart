import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Remote connect Option B", () => {
  it("ships a Connect wizard and OAuth scaffold stubs", () => {
    const wizard = readFileSync(
      join(process.cwd(), "src/components/settings/RemoteConnectWizard.tsx"),
      "utf8",
    );
    const settings = readFileSync(
      join(process.cwd(), "src/app/settings/page.tsx"),
      "utf8",
    );
    const authorize = readFileSync(
      join(process.cwd(), "src/app/api/auth/remote/authorize/route.ts"),
      "utf8",
    );
    const connection = readFileSync(
      join(process.cwd(), "src/lib/ui/remote-connection.ts"),
      "utf8",
    );
    expect(wizard).toContain("Connect Remote");
    expect(wizard).toContain("will not enter an API token");
    expect(settings).toContain("RemoteConnectWizard");
    expect(settings).toContain("not a Remote OAuth login");
    expect(authorize).toContain("oauth_disabled");
    expect(connection).toContain("no re-entering secrets");
  });
});
