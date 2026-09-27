/* ==========================================================================
   TechMHA — Supabase data layer
   Loaded on every page (public + admin). Wraps the Supabase JS client with
   small helpers for reading/writing team members, services and editable
   site content, plus admin auth. Public pages only ever read; only a
   signed-in admin can write (enforced by Supabase Row Level Security, not
   just by this file — see supabase-schema.sql).
   ========================================================================== */
(function (window) {
  "use strict";

  var configured =
    window.SUPABASE_URL &&
    window.SUPABASE_ANON_KEY &&
    window.SUPABASE_URL.indexOf("YOUR_SUPABASE") !== 0;

  var client = null;
  if (configured && window.supabase && window.supabase.createClient) {
    client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }

  function isConfigured() {
    return !!client;
  }

  function requireClient() {
    if (!client) {
      return Promise.reject(
        new Error(
          "Supabase isn't configured yet. Add your project URL and anon key to js/supabase-config.js."
        )
      );
    }
    return Promise.resolve(client);
  }

  /* ---------------- Public reads ---------------- */

  function getTeamMembers() {
    if (!client) return Promise.resolve([]);
    return client
      .from("team_members")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(function (res) {
        if (res.error) throw res.error;
        return res.data || [];
      });
  }

  function getCEO() {
    return getTeamMembers().then(function (rows) {
      return rows.find(function (r) { return r.is_ceo; }) || null;
    });
  }

  function getTeamOnly() {
    return getTeamMembers().then(function (rows) {
      return rows.filter(function (r) { return !r.is_ceo; });
    });
  }

  function getServices() {
    if (!client) return Promise.resolve([]);
    return client
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(function (res) {
        if (res.error) throw res.error;
        return res.data || [];
      });
  }

  function getSiteContent() {
    if (!client) return Promise.resolve({});
    return client
      .from("site_content")
      .select("*")
      .then(function (res) {
        if (res.error) throw res.error;
        var map = {};
        (res.data || []).forEach(function (row) {
          map[row.key] = row.value;
        });
        return map;
      });
  }

  /* ---------------- Auth ---------------- */

  function getSession() {
    return requireClient().then(function (c) {
      return c.auth.getSession().then(function (res) { return res.data.session; });
    });
  }

  function signIn(email, password) {
    return requireClient().then(function (c) {
      return c.auth.signInWithPassword({ email: email, password: password }).then(function (res) {
        if (res.error) throw res.error;
        return res.data.session;
      });
    });
  }

  function signOut() {
    return requireClient().then(function (c) { return c.auth.signOut(); });
  }

  function onAuthChange(cb) {
    if (!client) return;
    client.auth.onAuthStateChange(function (_event, session) { cb(session); });
  }

  /* ---------------- Admin writes (require an authenticated session; RLS
     policies on the Supabase side reject these if the caller isn't
     signed in, regardless of what this file does) ---------------- */

  function upsertTeamMember(row) {
    return requireClient().then(function (c) {
      var q = row.id ? c.from("team_members").update(row).eq("id", row.id) : c.from("team_members").insert(row);
      return q.select().then(function (res) {
        if (res.error) throw res.error;
        return res.data[0];
      });
    });
  }

  function deleteTeamMember(id) {
    return requireClient().then(function (c) {
      return c.from("team_members").delete().eq("id", id).then(function (res) {
        if (res.error) throw res.error;
        return true;
      });
    });
  }

  function upsertService(row) {
    return requireClient().then(function (c) {
      var q = row.id ? c.from("services").update(row).eq("id", row.id) : c.from("services").insert(row);
      return q.select().then(function (res) {
        if (res.error) throw res.error;
        return res.data[0];
      });
    });
  }

  function deleteService(id) {
    return requireClient().then(function (c) {
      return c.from("services").delete().eq("id", id).then(function (res) {
        if (res.error) throw res.error;
        return true;
      });
    });
  }

  function setSiteContent(key, value) {
    return requireClient().then(function (c) {
      return c
        .from("site_content")
        .upsert({ key: key, value: value }, { onConflict: "key" })
        .select()
        .then(function (res) {
          if (res.error) throw res.error;
          return res.data[0];
        });
    });
  }

  window.TechMHA = window.TechMHA || {};
  window.TechMHA.db = {
    isConfigured: isConfigured,
    getTeamMembers: getTeamMembers,
    getCEO: getCEO,
    getTeamOnly: getTeamOnly,
    getServices: getServices,
    getSiteContent: getSiteContent,
    getSession: getSession,
    signIn: signIn,
    signOut: signOut,
    onAuthChange: onAuthChange,
    upsertTeamMember: upsertTeamMember,
    deleteTeamMember: deleteTeamMember,
    upsertService: upsertService,
    deleteService: deleteService,
    setSiteContent: setSiteContent
  };
})(window);
