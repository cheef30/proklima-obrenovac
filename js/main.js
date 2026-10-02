(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var PHONE_WA = "38169625301";
  var fmt = function (n) { return n.toLocaleString("sr-RS").replace(/,/g, "."); };
  var ICON_STAR = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>';
  var ICON_G = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.8 3.6-4.9 6.7-4.9z"/></svg>';

  /* ---------- Godina u futeru ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Header pri skrolu + mobilna traka ---------- */
  var header = $("#header"), mbar = $("#mobileBar");
  var onScroll = function () {
    var y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 10);
    if (mbar) mbar.classList.toggle("show", y > 420);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobilni meni ---------- */
  var burger = $(".burger"), drawer = $("#drawer");
  var setNav = function (open) {
    document.body.classList.toggle("nav-open", open);
    if (burger) burger.setAttribute("aria-expanded", open);
    if (drawer) drawer.setAttribute("aria-hidden", !open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  if (burger) burger.addEventListener("click", function () { setNav(!document.body.classList.contains("nav-open")); });
  $$("[data-close]").forEach(function (b) { b.addEventListener("click", function () { setNav(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setNav(false); });

  /* ---------- Marquee: dupliranje sadržaja za beskonačnu petlju ---------- */
  var dupTrack = function (track) {
    var items = Array.prototype.slice.call(track.children);
    items.forEach(function (n) { var c = n.cloneNode(true); c.setAttribute("aria-hidden", "true"); track.appendChild(c); });
  };
  $$("[data-dup]").forEach(dupTrack);

  /* ---------- Recenzije ---------- */
  var reviews = window.RECENZIJE || [];
  var colors = ["#0b69ff", "#ff7a18", "#1aa260", "#7360f2", "#d62976", "#0e1725"];
  var esc = function (s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
  var card = function (r, i) {
    var stars = ""; for (var k = 0; k < (r.ocena || 5); k++) stars += ICON_STAR;
    return '<article class="review"><div class="review-top"><span class="stars">' + stars + '</span><span class="g">' + ICON_G + '</span></div>' +
      "<p>„" + esc(r.tekst) + "”</p>" +
      '<div class="review-who"><span class="av" style="background:' + colors[i % colors.length] + '">' + esc(r.ime.charAt(0)) + "</span>" +
      "<span><b>" + esc(r.ime) + "</b><small>" + esc(r.mesto) + (r.kada ? " · " + esc(r.kada) : "") + "</small></span></div></article>";
  };
  $$("[data-reviews]").forEach(function (host) {
    if (!reviews.length) { host.closest("section").style.display = "none"; return; }
    var half = Math.ceil(reviews.length / 2);
    var rows = [reviews.slice(0, half), reviews.slice(half)].filter(function (r) { return r.length; });
    host.innerHTML = rows.map(function (row, ri) {
      return '<div class="marquee' + (ri % 2 ? " reverse" : "") + '" style="--dur:' + (row.length * 9) + 's"><div class="marquee-track">' +
        row.map(function (r, i) { return card(r, i + ri * half); }).join("") + "</div></div>";
    }).join("");
    $$(".marquee-track", host).forEach(dupTrack);
  });
  if (reviews.length) {
    var avg = reviews.reduce(function (a, r) { return a + (r.ocena || 5); }, 0) / reviews.length;
    $$("[data-rating]").forEach(function (el) { el.textContent = avg.toFixed(1).replace(".", ","); });
  }

  /* ---------- Reveal animacije ---------- */
  var revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else revealEls.forEach(function (el) { el.classList.add("in"); });

  /* ---------- Galerija: filter + lightbox ---------- */
  var gallery = $("[data-gallery]");
  if (gallery) {
    var items = $$(".g-item", gallery);
    $$(".filter").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.getAttribute("data-filter");
        $$(".filter").forEach(function (b) { b.classList.toggle("active", b === btn); b.setAttribute("aria-selected", b === btn); });
        items.forEach(function (it) {
          var show = f === "all" || it.getAttribute("data-cat") === f;
          it.classList.toggle("is-hidden", !show);
          if (show) it.classList.add("in");
        });
      });
    });

    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Pregled fotografije");
    lb.innerHTML =
      '<img alt="">' +
      '<button class="lb-btn lb-close" aria-label="Zatvori"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '<button class="lb-btn lb-prev" aria-label="Prethodna"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>' +
      '<button class="lb-btn lb-next" aria-label="Sledeća"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>' +
      '<span class="lb-count"></span>';
    document.body.appendChild(lb);
    var lbImg = $("img", lb), lbCount = $(".lb-count", lb), current = 0, lastFocus = null;
    var visible = function () { return items.filter(function (i) { return !i.classList.contains("is-hidden"); }); };
    var show = function (idx) {
      var list = visible(); if (!list.length) return;
      current = (idx + list.length) % list.length;
      var img = $("img", list[current]);
      lbImg.src = img.getAttribute("data-full") || img.src;
      lbImg.alt = img.alt;
      lbCount.textContent = (current + 1) + " / " + list.length;
    };
    var open = function (it) { lastFocus = document.activeElement; show(visible().indexOf(it)); lb.classList.add("open"); document.body.style.overflow = "hidden"; $(".lb-close", lb).focus(); };
    var close = function () { lb.classList.remove("open"); document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); };
    items.forEach(function (it) {
      it.setAttribute("tabindex", "0");
      it.addEventListener("click", function () { open(it); });
      it.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(it); } });
    });
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", function () { show(current - 1); });
    $(".lb-next", lb).addEventListener("click", function () { show(current + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
    var tx = 0;
    lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) { var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1)); });
  }

  /* ---------- Kalkulator cene ugradnje ---------- */
  var calc = $("#calc");
  if (calc) {
    var meters = $("#meters"), metersOut = $("#metersOut"), unitsOut = $("#units");
    var units = 1, EXTRA_M = 2200, KANAL_M = 700;
    var update = function () {
      var btu = $('input[name="btu"]:checked', calc);
      var loc = $('input[name="loc"]:checked', calc);
      var m = +meters.value, extraM = Math.max(0, m - 3);
      meters.style.setProperty("--p", ((m - meters.min) / (meters.max - meters.min) * 100) + "%");
      metersOut.textContent = m + " m";
      unitsOut.textContent = units;

      var lines = [], total = 0;
      var add = function (label, val) { if (val > 0) { lines.push([label, val]); total += val; } };
      add("Ugradnja " + btu.getAttribute("data-label") + (units > 1 ? " × " + units : ""), +btu.value * units);
      add("Dodatna instalacija " + extraM + " m" + (units > 1 ? " × " + units : ""), extraM * EXTRA_M * units);
      $$('.toggles input[data-per-unit]', calc).forEach(function (cb) {
        if (cb.checked) add(cb.getAttribute("data-label") + (units > 1 ? " × " + units : ""), +cb.value * units);
      });
      if ($("#kanalica").checked) add("PVC kanalica " + m + " m" + (units > 1 ? " × " + units : ""), m * KANAL_M * units);
      lines.push(["Dolazak, " + loc.getAttribute("data-label"), +loc.value]); total += +loc.value;

      $("#total").textContent = fmt(total);
      $("#lines").innerHTML = lines.map(function (l) {
        return "<li><span>" + l[0] + "</span><b>" + (l[1] ? fmt(l[1]) + " RSD" : "Besplatno") + "</b></li>";
      }).join("");

      var msg = "Pozdrav! Zanima me ugradnja klime:\n" +
        lines.map(function (l) { return "• " + l[0] + ": " + (l[1] ? fmt(l[1]) + " RSD" : "besplatno"); }).join("\n") +
        "\nOkvirno ukupno: " + fmt(total) + " RSD\nKada biste mogli da dođete?";
      $("#calcSend").href = "https://wa.me/" + PHONE_WA + "?text=" + encodeURIComponent(msg);
    };
    calc.addEventListener("input", update);
    calc.addEventListener("change", update);
    $$("[data-step]", calc).forEach(function (b) {
      b.addEventListener("click", function () { units = Math.min(10, Math.max(1, units + +b.getAttribute("data-step"))); update(); });
    });
    update();
  }

  /* ---------- Kontakt forma → WhatsApp / Viber ---------- */
  var form = $("#contactForm");
  if (form) {
    var q = new URLSearchParams(location.search).get("usluga");
    if (q && form.usluga.querySelector('option[value="' + q + '"]')) form.usluga.value = q;
    var via = "wa";
    $$("button[data-via]", form).forEach(function (b) { b.addEventListener("click", function () { via = b.getAttribute("data-via"); }); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      ["ime", "telefon"].forEach(function (n) {
        var f = form[n], field = f.closest(".field"), bad = !f.value.trim();
        field.classList.toggle("invalid", bad);
        if (bad && ok) { f.focus(); ok = false; }
      });
      if (!ok) return;
      var svc = form.usluga.options[form.usluga.selectedIndex].text;
      var text = "Pozdrav! Upit sa sajta:\n" +
        "Ime: " + form.ime.value.trim() + "\n" +
        "Telefon: " + form.telefon.value.trim() + "\n" +
        (form.mesto.value.trim() ? "Mesto: " + form.mesto.value.trim() + "\n" : "") +
        "Usluga: " + svc +
        (form.poruka.value.trim() ? "\nPoruka: " + form.poruka.value.trim() : "");
      if (via === "viber") {
        var go = function () { location.href = "viber://chat?number=%2B" + PHONE_WA; };
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(go, go); else go();
      } else {
        window.open("https://wa.me/" + PHONE_WA + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      }
    });
    $$("input", form).forEach(function (i) { i.addEventListener("input", function () { i.closest(".field").classList.remove("invalid"); }); });
  }

  /* ---------- Radno vreme: otvoreno sada? ---------- */
  var openNow = $("[data-open-now]");
  if (openNow) {
    var now = new Date(), d = now.getDay(), h = now.getHours();
    var isOpen = d >= 1 && d <= 6 && h >= 8 && h < 20;
    openNow.classList.toggle("closed", !isOpen);
    $("span", openNow).textContent = isOpen ? "Sada radimo, slobodno pozovite" : "Sada ne radimo, pošaljite poruku";
  }
})();
