// App data layer on top of Supabase.
// Pages use `api.auth`, `api.entities.<Name>`, `api.uploadFile` and `api.compatibility`.

import { supabase } from "./supabaseClient";
import UserProfileSchema from "@/entities/UserProfile.json";
import RoomListingSchema from "@/entities/RoomListing.json";
import MatchSchema from "@/entities/Match.json";
import MessageSchema from "@/entities/Message.json";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

const toAppUser = (user) => ({
  id: user.id,
  email: user.email,
  full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
  role: user.app_metadata?.role || "user",
});

const loginUrl = (next) => {
  const target = next || window.location.pathname + window.location.search;
  return `/login?next=${encodeURIComponent(target)}`;
};

const auth = {
  /** Current user. Throws an ApiError with status 401 when signed out. */
  async me() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) throw new ApiError("Not signed in", 401);
    return toAppUser(data.user);
  },

  async isAuthenticated() {
    const { data } = await supabase.auth.getSession();
    return Boolean(data?.session);
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new ApiError(error.message, error.status);
    return toAppUser(data.user);
  },

  async signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) throw new ApiError(error.message, error.status);
    // `session` is null when email confirmation is turned on in Supabase.
    return { user: data.user ? toAppUser(data.user) : null, needsConfirmation: !data.session };
  },

  async logout(redirectTo = "/") {
    await supabase.auth.signOut();
    if (redirectTo) window.location.assign(redirectTo);
  },

  redirectToLogin(next) {
    window.location.assign(loginUrl(next));
  },

  onChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ? toAppUser(session.user) : null);
    });
    return () => data.subscription.unsubscribe();
  },
};

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

const BUILT_IN_FIELDS = new Set(["id", "created_date", "updated_date", "created_by"]);

// "-created_date" -> order by created_date descending
function applySort(query, sort) {
  if (!sort) return query;
  const descending = sort.startsWith("-");
  const column = descending ? sort.slice(1) : sort;
  return query.order(column, { ascending: !descending });
}

function entity(table, schema) {
  const allowed = new Set(Object.keys(schema.properties));

  // Only send columns that exist in the table, so extra form state never breaks a save.
  const clean = (data) => {
    const out = {};
    for (const [key, value] of Object.entries(data || {})) {
      if (!allowed.has(key) || BUILT_IN_FIELDS.has(key)) continue;
      if (value === undefined) continue;
      out[key] = value === "" ? null : value;
    }
    return out;
  };

  const run = async (query) => {
    const { data, error } = await query;
    if (error) throw new ApiError(error.message, error.code === "PGRST301" ? 401 : 400);
    return data;
  };

  return {
    async list(sort, limit) {
      let query = applySort(supabase.from(table).select("*"), sort);
      if (limit) query = query.limit(limit);
      return run(query);
    },

    async filter(conditions = {}, sort, limit) {
      let query = supabase.from(table).select("*");
      for (const [key, value] of Object.entries(conditions)) {
        query = Array.isArray(value) ? query.in(key, value) : query.eq(key, value);
      }
      query = applySort(query, sort);
      if (limit) query = query.limit(limit);
      return run(query);
    },

    async get(id) {
      return run(supabase.from(table).select("*").eq("id", id).single());
    },

    async create(data) {
      return run(supabase.from(table).insert(clean(data)).select().single());
    },

    async update(id, data) {
      return run(supabase.from(table).update(clean(data)).eq("id", id).select().single());
    },

    async delete(id) {
      return run(supabase.from(table).delete().eq("id", id));
    },
  };
}

const entities = {
  UserProfile: entity("user_profiles", UserProfileSchema),
  RoomListing: entity("room_listings", RoomListingSchema),
  Match: entity("matches", MatchSchema),
  Message: entity("messages", MessageSchema),
};

// ---------------------------------------------------------------------------
// File uploads (Supabase Storage, public "images" bucket)
// ---------------------------------------------------------------------------

async function uploadFile({ file }) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new ApiError("Sign in to upload files", 401);

  const extension = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "bin";
  const path = `${userData.user.id}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("images").upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw new ApiError(error.message, 400);

  const { data } = supabase.storage.from("images").getPublicUrl(path);
  return { file_url: data.publicUrl };
}

// ---------------------------------------------------------------------------
// Compatibility (Claude, via the `compatibility` Edge Function)
// ---------------------------------------------------------------------------

async function compatibility(otherEmail) {
  const { data, error } = await supabase.functions.invoke("compatibility", {
    body: { other_email: otherEmail },
  });
  if (error) throw new ApiError(error.message, 502);
  return data; // { compatibility_score, breakdown, cached }
}

// ---------------------------------------------------------------------------
// Home page counts (works when signed out)
// ---------------------------------------------------------------------------

async function publicStats() {
  const { data, error } = await supabase.rpc("public_stats");
  if (error) throw new ApiError(error.message, 400);
  return data; // { users, listings, matches }
}

export const api = { auth, entities, uploadFile, compatibility, publicStats };
