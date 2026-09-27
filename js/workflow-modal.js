/* ==========================================================================
   TechMHA — Hero workflow preview modal
   Opens an enlarged, readable view of the real n8n workflow screenshot,
   with clickable hotspots over each node that show what it does.
   ========================================================================== */
(function () {
  "use strict";

  var nodeInfo = {
    trigger: {
      title: "Schedule Trigger",
      body: "Runs the workflow automatically on a recurring schedule — no manual kick-off needed."
    },
    nasa: {
      title: "NASA — get:donkiSolarFlare",
      body: "Calls NASA's DONKI API to fetch the latest solar flare data for this run."
    },
    if: {
      title: "If",
      body: "Branches the workflow based on a condition in the NASA response — e.g. whether a significant flare was detected."
    },
    posttrue: {
      title: "PostBin (true branch)",
      body: "Sends a webhook request when the condition is true — this is where an alert, notification or downstream system call would go."
    },
    postfalse: {
      title: "PostBin (false branch)",
      body: "Sends a separate webhook request when the condition is false, so both outcomes are logged and traceable."
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    var trigger = document.getElementById("workflow-open-trigger");
    var overlay = document.getElementById("workflow-modal");
    if (!trigger || !overlay) return;

    var closeBtns = [
      document.getElementById("workflow-modal-close"),
      document.getElementById("workflow-modal-close-2")
    ].filter(Boolean);
    var detail = document.getElementById("workflow-node-detail");
    var hotspots = overlay.querySelectorAll(".workflow-node-hotspot");
    var lastFocused = null;

    function openModal() {
      lastFocused = document.activeElement;
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
      if (closeBtns[0]) closeBtns[0].focus();
    }

    function closeModal() {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
      hotspots.forEach(function (h) { h.classList.remove("active"); });
      if (detail) {
        detail.innerHTML = '<p class="text-sm text-muted">Click a highlighted node on the workflow to read what it does.</p>';
      }
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    trigger.addEventListener("click", openModal);
    closeBtns.forEach(function (b) { b.addEventListener("click", closeModal); });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("open")) closeModal();
    });

    hotspots.forEach(function (h) {
      h.addEventListener("click", function () {
        hotspots.forEach(function (x) { x.classList.remove("active"); });
        h.classList.add("active");
        var key = h.getAttribute("data-node");
        var info = nodeInfo[key];
        if (info && detail) {
          detail.innerHTML =
            "<h4>" + info.title + "</h4><p>" + info.body + "</p>";
        }
      });
    });
  });
})();
