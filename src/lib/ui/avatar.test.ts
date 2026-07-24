import { describe, expect, it } from "vitest";
import {
  extractProfilePicture,
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
    expect(
      isAllowedAvatarUrl("https://cdn.employ-assets.remote.com/a.png"),
    ).toBe(true);
    expect(isAllowedAvatarUrl("http://cdn.remote.com/a.png")).toBe(false);
    expect(isAllowedAvatarUrl("https://evil.example/a.png")).toBe(false);
    expect(isAllowedAvatarUrl("https://api.dicebear.com/9.x/x.svg")).toBe(
      false,
    );
  });

  it("extracts profile_picture / profilePicture from detail or nested user", () => {
    expect(
      extractProfilePicture({
        profile_picture: "https://cdn.remote.com/a.png",
      }),
    ).toBe("https://cdn.remote.com/a.png");
    expect(
      extractProfilePicture({
        user: { profilePicture: "https://cdn.employ-assets.remote.com/b.png" },
      }),
    ).toBe("https://cdn.employ-assets.remote.com/b.png");
    expect(extractProfilePicture({})).toBeNull();
  });

  it("does not invent third-party portraits when Remote has no photo", () => {
    expect(resolveAvatarSrc({ avatarUrl: null })).toBeNull();
    expect(resolveAvatarSrc({})).toBeNull();
    expect(
      resolveAvatarSrc({
        avatarUrl: "https://cdn.remote.com/real.png",
      }),
    ).toBe("https://cdn.remote.com/real.png");
  });
});
