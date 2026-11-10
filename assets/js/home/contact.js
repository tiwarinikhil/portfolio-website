/*
  Home page contact area: "Copy" email button and the contact form (sends to Formspree via formEndpoint in content/data.js).
*/
(function () {
  "use strict";
  var NK = window.NK, S = NK.site;
  if (!NK.$("#contact-form")) return;
  /* Copy email */
  NK.$("#copy-email").addEventListener("click", function () {
    var b = this;
    function done(msg) { b.textContent = msg; setTimeout(function () { b.textContent = "Copy"; }, 1800); }
    function selectIt() {
      var r = document.createRange(); r.selectNodeContents(NK.$("#email-link"));
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      done("Selected");
    }
    NK.copy(S.email).then(function () { done("Copied"); }, selectIt);
  });

  /* Contact form: sends to Formspree once formEndpoint is set in data.js */
  var form = NK.$("#contact-form"), status = NK.$("#form-status"), submit = NK.$("#f-submit");
  function setStatus(msg, kind) { status.textContent = msg; status.className = "form-status " + (kind || ""); }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    ["#f-name", "#f-email", "#f-what"].forEach(function (id) {
      var f = NK.$(id), good = f.value.trim() && (f.type !== "email" || /.+@.+\..+/.test(f.value));
      f.parentNode.classList.toggle("bad", !good);
      if (!good) ok = false;
    });
    if (!ok) { setStatus("Please fill in your name, a valid email and a few lines about the project.", "err"); return; }
    if (!S.formEndpoint) {
      setStatus("The form is not connected yet, so nothing was sent. Please email " + S.email + " instead.", "err");
      return;
    }
    submit.disabled = true; submit.textContent = "Sending";
    fetch(S.formEndpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then(function (r) {
        if (!r.ok) throw new Error("bad");
        form.reset();
        setStatus("Thanks, your message reached me. I'll reply within a few hours (IST).", "ok");
      })
      .catch(function () {
        setStatus("The message did not send. Please email " + S.email + " instead.", "err");
      })
      .then(function () { submit.disabled = false; submit.textContent = "Send message"; });
  });
})();
