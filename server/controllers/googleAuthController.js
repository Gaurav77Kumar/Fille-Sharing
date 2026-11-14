import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import User from "../models/user.js";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

const GOOGLE_CALLBACK_URL = (process.env.GOOGLE_CALLBACK_URL || "").trim();
const CLIENT_URL = (process.env.CLIENT_URL || "").trim();

const TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};

// STEP 1 — Redirect the user to Google's consent screen
// GET /api/auth/google
const redirectToGoogle = (req, res) => {
  // random state param — stored in a short-lived cookie and compared on the
  // callback to stop attackers from forging/ replaying the auth round-trip (CSRF)
  const state = nanoid(32);

  res.cookie("g_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax", // lax survives the top-level redirect back from Google
    maxAge: 10 * 60 * 1000,
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_CALLBACK_URL,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
};

// STEP 2..5 — Google sends the user back here with ?code=...&state=...
// GET /api/auth/google/callback
const googleCallback = async (req, res) => {
  const clientRedirect = (path) => res.redirect(`${CLIENT_URL}${path}`);

  try {
    const { code, state } = req.query;
    const cookieState = req.cookies?.g_state;

    if (!code) {
      return clientRedirect("/login?error=google_cancelled");
    }

    // CSRF check — the state in the URL must match the one we set before redirecting
    if (!state || !cookieState || state !== cookieState) {
      res.clearCookie("g_state");
      return clientRedirect("/login?error=invalid_state");
    }
    res.clearCookie("g_state");

    // STEP 2 — exchange the one-time authorization code for tokens
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return clientRedirect("/login?error=token_exchange_failed");
    }
    const tokens = await tokenRes.json();

    // STEP 3 — fetch the user's Google profile with the access token
    const profileRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!profileRes.ok) {
      return clientRedirect("/login?error=profile_fetch_failed");
    }
    const profile = await profileRes.json(); // { sub, name, email, picture, email_verified }

    if (!profile.email || profile.email_verified !== true) {
      return clientRedirect("/login?error=email_not_verified");
    }

    // STEP 4 — find or create the local user (linking by verified email)
    let user = await User.findOne({ email: profile.email.toLowerCase() });

    if (!user) {
      const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
      const emailLocal = profile.email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase();
      const username = `${(emailLocal || "user").substring(0, 8)}${nanoid(4, ALPHABET)}`;

      user = await User.create({
        fullname: profile.name || emailLocal,
        username,
        email: profile.email,
        profilePic: profile.picture || "",
        authProvider: "google",
        role: "user",
        isEmailVerified: true, // Google already verified the address
      });
    } else if (user.authProvider !== "google") {
      user.authProvider = "google";
      user.isEmailVerified = true;
      if (profile.picture && !user.profilePic) user.profilePic = profile.picture;
      await user.save();
    }

    // STEP 5 — issue our own JWT session cookie (same session as /auth/login)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    res.cookie("token", token, TOKEN_COOKIE_OPTIONS);

    // STEP 6 — send them into the app; the frontend's /me session check picks
    clientRedirect("/dashboard");
  } catch (error) {
    console.error("[GoogleAuth] callback failed:", error.message);
    clientRedirect("/login?error=google_auth_failed");
  }
};

export { redirectToGoogle, googleCallback };
