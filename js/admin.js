/* ==========================================================================
   TechMHA — Admin panel logic
   ========================================================================== */
(function () {
  "use strict";

  var db = window.TechMHA && window.TechMHA.db;

  var loginScreen = document.getElementById("login-screen");
  var adminShell = document.getElementById("admin-shell");
  var loginForm = document.getElementById("login-form");
  var loginError = document.getElementById("login-error");
  var loginSubmit = document.getElementById("login-submit");

  function escapeHTML(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function toast(message, kind) {
    var stack = document.getElementById("toast-stack");
    var el = document.createElement("div");
    el.className = "toast " + (kind || "");
    el.textContent = message;
    stack.appendChild(el);
    setTimeout(function () { el.remove(); }, 3200);
  }

  /* ---------------- Config guard ---------------- */
  if (!db || !db.isConfigured()) {
    if (loginForm) {
      loginSubmit.disabled = true;
      loginError.textContent =
        "Supabase isn't configured yet. Add your project URL and anon key to js/supabase-config.js, then reload this page.";
      loginError.classList.add("show");
    }
    return;
  }

  /* ---------------- Auth ---------------- */
  function showLogin() {
    loginScreen.style.display = "flex";
    adminShell.style.display = "none";
  }
  function showAdmin() {
    loginScreen.style.display = "none";
    adminShell.style.display = "flex";
    loadTeam();
    loadServices();
  }

  db.getSession().then(function (session) {
    if (session) showAdmin();
    else showLogin();
  });

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    loginError.classList.remove("show");
    loginSubmit.disabled = true;
    loginSubmit.textContent = "Signing in…";

    var email = document.getElementById("login-email").value.trim();
    var password = document.getElementById("login-password").value;

    db.signIn(email, password)
      .then(function () {
        showAdmin();
      })
      .catch(function (err) {
        loginError.textContent = err.message || "Sign-in failed. Check your email and password.";
        loginError.classList.add("show");
      })
      .finally(function () {
        loginSubmit.disabled = false;
        loginSubmit.textContent = "Sign In";
      });
  });

  document.getElementById("logout-btn").addEventListener("click", function () {
    db.signOut().then(function () {
      showLogin();
      loginForm.reset();
    });
  });

  /* ---------------- Panel switching ---------------- */
  document.querySelectorAll(".admin-nav-link[data-panel]").forEach(function (link) {
    link.addEventListener("click", function () {
      document.querySelectorAll(".admin-nav-link[data-panel]").forEach(function (l) { l.classList.remove("active"); });
      document.querySelectorAll(".admin-panel").forEach(function (p) { p.classList.remove("active"); });
      link.classList.add("active");
      document.getElementById(link.getAttribute("data-panel")).classList.add("active");
    });
  });

  /* ---------------- Team ---------------- */
  var teamModal = document.getElementById("team-modal");
  var teamForm = document.getElementById("team-form");

  function loadTeam() {
    var wrap = document.getElementById("team-table");
    wrap.innerHTML = '<div class="admin-empty">Loading…</div>';
    db.getTeamMembers()
      .then(function (rows) {
        if (!rows.length) {
          wrap.innerHTML = '<div class="admin-empty">No team members yet. Click "Add team member" to add the first one.</div>';
          return;
        }
        wrap.innerHTML = rows.map(teamRow).join("");
        wrap.querySelectorAll("[data-edit-team]").forEach(function (btn) {
          btn.addEventListener("click", function () { openTeamModal(rows.find(function (r) { return r.id === btn.getAttribute("data-edit-team"); })); });
        });
        wrap.querySelectorAll("[data-delete-team]").forEach(function (btn) {
          btn.addEventListener("click", function () { deleteTeam(btn.getAttribute("data-delete-team")); });
        });
      })
      .catch(function (err) {
        wrap.innerHTML = '<div class="admin-empty">Couldn\'t load team members: ' + escapeHTML(err.message) + "</div>";
      });
  }

  function initials(name) {
    if (!name) return "?";
    var parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
  }

  function teamRow(m) {
    var avatar = m.photo_url ? '<img src="' + escapeHTML(m.photo_url) + '" alt="">' : escapeHTML(initials(m.name));
    return (
      '<div class="admin-row">' +
      '<div class="row-avatar">' + avatar + "</div>" +
      "<div><div class=\"row-title\">" + escapeHTML(m.name) + (m.is_ceo ? ' <span class="pill" style="padding:2px 8px;font-size:0.68rem;">CEO</span>' : "") + "</div><div class=\"row-sub\">" + escapeHTML(m.role || "") + "</div></div>" +
      '<div class="row-sub-col text-sm text-muted">#' + (m.sort_order || 0) + "</div>" +
      '<div class="admin-row-actions">' +
      '<button class="icon-btn" data-edit-team="' + m.id + '" aria-label="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>' +
      '<button class="icon-btn danger" data-delete-team="' + m.id + '" aria-label="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button>' +
      "</div>" +
      "</div>"
    );
  }

  function openTeamModal(row) {
    teamForm.reset();
    document.getElementById("team-modal-title").textContent = row ? "Edit team member" : "Add team member";
    document.getElementById("team-id").value = row ? row.id : "";
    document.getElementById("team-name").value = row ? row.name || "" : "";
    document.getElementById("team-role").value = row ? row.role || "" : "";
    document.getElementById("team-order").value = row ? row.sort_order || 0 : 0;
    document.getElementById("team-headline").value = row ? row.headline || "" : "";
    document.getElementById("team-bio").value = row ? row.bio || "" : "";
    document.getElementById("team-photo").value = row ? row.photo_url || "" : "";
    document.getElementById("team-linkedin").value = row ? row.linkedin_url || "" : "";
    document.getElementById("team-email").value = row ? row.email || "" : "";
    document.getElementById("team-tags").value = row && row.tags ? row.tags.join(", ") : "";
    document.getElementById("team-is-ceo").checked = row ? !!row.is_ceo : false;
    teamModal.classList.add("open");
  }
  function closeTeamModal() { teamModal.classList.remove("open"); }

  document.getElementById("add-team-btn").addEventListener("click", function () { openTeamModal(null); });
  document.getElementById("team-modal-cancel").addEventListener("click", closeTeamModal);
  teamModal.addEventListener("click", function (e) { if (e.target === teamModal) closeTeamModal(); });

  teamForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var id = document.getElementById("team-id").value;
    var tagsRaw = document.getElementById("team-tags").value.trim();
    var row = {
      name: document.getElementById("team-name").value.trim(),
      role: document.getElementById("team-role").value.trim(),
      sort_order: parseInt(document.getElementById("team-order").value, 10) || 0,
      headline: document.getElementById("team-headline").value.trim(),
      bio: document.getElementById("team-bio").value.trim(),
      photo_url: document.getElementById("team-photo").value.trim(),
      linkedin_url: document.getElementById("team-linkedin").value.trim(),
      email: document.getElementById("team-email").value.trim(),
      tags: tagsRaw ? tagsRaw.split(",").map(function (t) { return t.trim(); }).filter(Boolean) : [],
      is_ceo: document.getElementById("team-is-ceo").checked
    };
    if (id) row.id = id;

    db.upsertTeamMember(row)
      .then(function () {
        toast(id ? "Team member updated" : "Team member added", "success");
        closeTeamModal();
        loadTeam();
      })
      .catch(function (err) { toast(err.message || "Couldn't save team member", "error"); });
  });

  function deleteTeam(id) {
    if (!confirm("Remove this team member? This can't be undone.")) return;
    db.deleteTeamMember(id)
      .then(function () { toast("Team member removed", "success"); loadTeam(); })
      .catch(function (err) { toast(err.message || "Couldn't remove team member", "error"); });
  }

  /* ---------------- Services ---------------- */
  var serviceModal = document.getElementById("service-modal");
  var serviceForm = document.getElementById("service-form");

  function loadServices() {
    var wrap = document.getElementById("services-table");
    wrap.innerHTML = '<div class="admin-empty">Loading…</div>';
    db.getServices()
      .then(function (rows) {
        if (!rows.length) {
          wrap.innerHTML = '<div class="admin-empty">No services yet. Click "Add service" to add the first one.</div>';
          return;
        }
        wrap.innerHTML = rows.map(serviceRow).join("");
        wrap.querySelectorAll("[data-edit-service]").forEach(function (btn) {
          btn.addEventListener("click", function () { openServiceModal(rows.find(function (r) { return r.id === btn.getAttribute("data-edit-service"); })); });
        });
        wrap.querySelectorAll("[data-delete-service]").forEach(function (btn) {
          btn.addEventListener("click", function () { deleteService(btn.getAttribute("data-delete-service")); });
        });
      })
      .catch(function (err) {
        wrap.innerHTML = '<div class="admin-empty">Couldn\'t load services: ' + escapeHTML(err.message) + "</div>";
      });
  }

  function serviceRow(s) {
    return (
      '<div class="admin-row">' +
      '<div class="row-avatar">' + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="18" height="18"><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="3.6"/></svg>' + "</div>" +
      "<div><div class=\"row-title\">" + escapeHTML(s.title) + "</div><div class=\"row-sub\">" + escapeHTML(s.tags_label || "") + "</div></div>" +
      '<div class="row-sub-col text-sm text-muted">#' + (s.sort_order || 0) + "</div>" +
      '<div class="admin-row-actions">' +
      '<button class="icon-btn" data-edit-service="' + s.id + '" aria-label="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>' +
      '<button class="icon-btn danger" data-delete-service="' + s.id + '" aria-label="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button>' +
      "</div>" +
      "</div>"
    );
  }

  function openServiceModal(row) {
    serviceForm.reset();
    document.getElementById("service-modal-title").textContent = row ? "Edit service" : "Add service";
    document.getElementById("service-id").value = row ? row.id : "";
    document.getElementById("service-title").value = row ? row.title || "" : "";
    document.getElementById("service-description").value = row ? row.description || "" : "";
    document.getElementById("service-tags-label").value = row ? row.tags_label || "" : "";
    document.getElementById("service-order").value = row ? row.sort_order || 0 : 0;
    serviceModal.classList.add("open");
  }
  function closeServiceModal() { serviceModal.classList.remove("open"); }

  document.getElementById("add-service-btn").addEventListener("click", function () { openServiceModal(null); });
  document.getElementById("service-modal-cancel").addEventListener("click", closeServiceModal);
  serviceModal.addEventListener("click", function (e) { if (e.target === serviceModal) closeServiceModal(); });

  serviceForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var id = document.getElementById("service-id").value;
    var row = {
      title: document.getElementById("service-title").value.trim(),
      description: document.getElementById("service-description").value.trim(),
      tags_label: document.getElementById("service-tags-label").value.trim(),
      sort_order: parseInt(document.getElementById("service-order").value, 10) || 0
    };
    if (id) row.id = id;

    db.upsertService(row)
      .then(function () {
        toast(id ? "Service updated" : "Service added", "success");
        closeServiceModal();
        loadServices();
      })
      .catch(function (err) { toast(err.message || "Couldn't save service", "error"); });
  });

  function deleteService(id) {
    if (!confirm("Remove this service? This can't be undone.")) return;
    db.deleteService(id)
      .then(function () { toast("Service removed", "success"); loadServices(); })
      .catch(function (err) { toast(err.message || "Couldn't remove service", "error"); });
  }

  /* ---------------- Site content ---------------- */
  db.getSiteContent().then(function (map) {
    if (map.hero_heading) document.getElementById("content-hero-heading").value = map.hero_heading;
    if (map.hero_lead) document.getElementById("content-hero-lead").value = map.hero_lead;
    if (map.contact_email) document.getElementById("content-contact-email").value = map.contact_email;
    if (map.contact_phone) document.getElementById("content-contact-phone").value = map.contact_phone;
    if (map.location) document.getElementById("content-location").value = map.location;
  });

  document.getElementById("save-content-btn").addEventListener("click", function () {
    var fields = {
      hero_heading: document.getElementById("content-hero-heading").value.trim(),
      hero_lead: document.getElementById("content-hero-lead").value.trim(),
      contact_email: document.getElementById("content-contact-email").value.trim(),
      contact_phone: document.getElementById("content-contact-phone").value.trim(),
      location: document.getElementById("content-location").value.trim()
    };
    var keys = Object.keys(fields);
    Promise.all(
      keys.map(function (k) { return fields[k] ? db.setSiteContent(k, fields[k]) : Promise.resolve(); })
    )
      .then(function () { toast("Site content saved", "success"); })
      .catch(function (err) { toast(err.message || "Couldn't save content", "error"); });
  });
})();
