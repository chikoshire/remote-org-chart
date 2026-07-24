import { describe, expect, it } from "vitest";
import {
  extractProfilePicture,
  generatedAvatarUrl,
  isAllowedAvatarUrl,
  resolveAvatarSrc,
} from "@/lib/ui/avatar";

describe("avatar helpers", () => {
  it("accepts https Remote-ish hosts and rejects others", () => {
    expect(
      isAllowedAvatarUrl("https://cdn.remote.com/avatars/a.png"),
    ).toBe(true);
    expect(
      isAllowedAvatarUrl("https://files.remote-sandbox.com/x.jpg"),
    ).toBe(true);
    expect(isAllowedAvatarUrl("http://cdn.remote.com/a.png")).toBe(false);
    expect(isAllowedAvatarUrl("https://evil.example/a.png")).toBe(false);
  });

  it("extracts profile_picture from detail or nested user", () => {
    expect(
      extractProfilePicture({
        profile_picture: "https://cdn.remote.com/a.png",
      }),
    ).toBe("https://cdn.remote.com/a.png");
    expect(
      extractProfilePicture({
        user: { profile_picture: "https://cdn.remote.com/b.png" },
      }),
    ).toBe("https://cdn.remote.com/b.png");
    expect(extractProfilePicture({})).toBeNull();
  });

  it("falls back to a stable generated portrait", () => {
    const a = resolveAvatarSrc({ personId: "emp_1", fullName: "Ada" });
    const b = resolveAvatarSrc({ personId: "emp_1", fullName: "Ada" });
    expect(a).toBe(b);
    expect(a).toContain("dicebear.com");
    expect(generatedAvatarUrl("emp_1")).toContain("emp_1");
  });
});
