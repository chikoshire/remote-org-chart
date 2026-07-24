import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

describe("settings density preview + Remote mark", () => {
  it("previews comfortable/compact cards and uses the Remote mark asset", () => {
    const settings = readFileSync(
      join(process.cwd(), "src/app/settings/page.tsx"),
      "utf8",
    );
    const preview = readFileSync(
      join(process.cwd(), "src/components/settings/DensityPreview.tsx"),
      "utf8",
    );
    const mark = readFileSync(
      join(process.cwd(), "src/components/brand/RemoteMark.tsx"),
      "utf8",
    );

    expect(settings).toContain("DensityPreview");
    expect(settings).toContain("RemoteMark");
    expect(settings).not.toMatch(/>\s*R\s*</);
    expect(preview).toContain("PersonNodeCard");
    expect(preview).toContain("density={density}");
    expect(mark).toContain("/brand/remote-mark.svg");
    expect(
      existsSync(join(process.cwd(), "public/brand/remote-mark.svg")),
    ).toBe(true);
  });
});
