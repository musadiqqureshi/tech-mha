/* ==========================================================================
   TechMHA — Public page rendering from Supabase
   Progressive enhancement: every page ships with real, hand-written fallback
   content in the HTML so it always looks complete even with JS off or
   Supabase not configured yet. Where a data-driven section exists
   (#team-grid, #ceo-spotlight, [data-services-grid]), this script replaces
   the fallback with live data from Supabase once it loads.
   ========================================================================== */
(function () {
  "use strict";

  function escapeHTML(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function initials(name) {
    if (!name) return "?";
    var parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
  }

  function socialIcon(kind) {
    if (kind === "linkedin") {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10.5V17M8 7.2v.01M12.5 17v-4a2.2 2.2 0 0 1 4.4 0v4M12.5 10.5V17"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>';
  }

  function renderCEO(member) {
    var el = document.getElementById("ceo-spotlight");
    if (!el || !member) return;
    var photo = member.photo_url
      ? '<img src="' + escapeHTML(member.photo_url) + '" alt="' + escapeHTML(member.name) + '">'
      : '<span class="initials">' + escapeHTML(initials(member.name)) + "</span>";

    el.innerHTML =
      '<div class="ceo-photo reveal">' +
      photo +
      '<div class="ceo-badge"><span class="pulse-dot"></span>' + escapeHTML(member.name) + "</div>" +
      "</div>" +
      '<div class="ceo-body reveal">' +
      '<span class="ceo-role">' + escapeHTML(member.role || "Founder & CEO") + "</span>" +
      "<h2>" + escapeHTML(member.headline || member.name) + "</h2>" +
      (member.bio ? "<p>" + escapeHTML(member.bio) + "</p>" : "") +
      (member.tags && member.tags.length
        ? '<div class="ceo-tags">' +
          member.tags.map(function (t) { return '<span class="pill">' + escapeHTML(t) + "</span>"; }).join("") +
          "</div>"
        : "") +
      "</div>";
  }

  function renderTeamGrid(members) {
    var el = document.getElementById("team-grid");
    if (!el) return;
    if (!members.length) {
      el.innerHTML = '<div class="team-empty">Team members will appear here once added from the admin panel.</div>';
      return;
    }
    el.innerHTML = members
      .map(function (m) {
        var avatar = m.photo_url
          ? '<img src="' + escapeHTML(m.photo_url) + '" alt="' + escapeHTML(m.name) + '">'
          : escapeHTML(initials(m.name));
        var social = [];
        if (m.linkedin_url) social.push('<a class="social-btn" href="' + escapeHTML(m.linkedin_url) + '" target="_blank" rel="noopener" aria-label="LinkedIn">' + socialIcon("linkedin") + "</a>");
        if (m.email) social.push('<a class="social-btn" href="mailto:' + escapeHTML(m.email) + '" aria-label="Email">' + socialIcon("email") + "</a>");
        return (
          '<div class="team-card reveal">' +
          '<div class="team-avatar">' + avatar + "</div>" +
          "<h3>" + escapeHTML(m.name) + "</h3>" +
          '<div class="team-role">' + escapeHTML(m.role || "") + "</div>" +
          (m.bio ? '<p class="team-bio">' + escapeHTML(m.bio) + "</p>" : "") +
          (social.length ? '<div class="team-social">' + social.join("") + "</div>" : "") +
          "</div>"
        );
      })
      .join("");
    document.querySelectorAll("#team-grid .reveal").forEach(function (r) { r.classList.add("in-view"); });
  }

  function serviceIconFallback() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="3.6"/></svg>';
  }

  function renderServices(services) {
    var grids = document.querySelectorAll("[data-services-grid]");
    if (!grids.length || !services.length) return; // keep static fallback markup
    grids.forEach(function (grid) {
      grid.innerHTML = services
        .map(function (s) {
          return (
            '<div class="card reveal">' +
            '<div class="card-icon">' + serviceIconFallback() + "</div>" +
            "<h3>" + escapeHTML(s.title) + "</h3>" +
            "<p>" + escapeHTML(s.description || "") + "</p>" +
            (s.tags_label ? '<div class="card-foot">' + escapeHTML(s.tags_label) + "</div>" : "") +
            "</div>"
          );
        })
        .join("");
      grid.querySelectorAll(".reveal").forEach(function (r) { r.classList.add("in-view"); });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.TechMHA || !window.TechMHA.db || !window.TechMHA.db.isConfigured()) return;
    var db = window.TechMHA.db;

    if (document.getElementById("ceo-spotlight") || document.getElementById("team-grid")) {
      db.getTeamMembers()
        .then(function (members) {
          renderCEO(members.find(function (m) { return m.is_ceo; }));
          renderTeamGrid(members.filter(function (m) { return !m.is_ceo; }));
        })
        .catch(function (err) { console.warn("TechMHA: could not load team members", err); });
    }

    if (document.querySelector("[data-services-grid]")) {
      db.getServices()
        .then(renderServices)
        .catch(function (err) { console.warn("TechMHA: could not load services", err); });
    }
  });
})();
