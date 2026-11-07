"use client";

import { useEffect } from "react";

// @material/web adalah web component: tag <md-...> baru "hidup" setelah kodenya
// didaftarkan ke browser lewat customElements. API itu hanya ada di browser,
// jadi pendaftarannya dijalankan di useEffect, yang tidak pernah berjalan di server.
// Kalau nanti butuh komponen lain (chip, dialog, dll.), tambahkan import-nya di sini.
export function MaterialRegister() {
  useEffect(() => {
    import("@material/web/button/filled-button.js");
    import("@material/web/button/filled-tonal-button.js");
    import("@material/web/button/outlined-button.js");
    import("@material/web/button/text-button.js");
    import("@material/web/textfield/outlined-text-field.js");

    // Tombol <md-... type="submit"> mengirim form lewat form.requestSubmit(), lalu menulis dirinya
    // sebagai event.submitter. React 19 membuat new FormData(form, submitter) saat ada Server Action
    // berjalan, dan browser menolak karena tombol Material bukan tombol submit bawaan
    // ("The specified element is not a submit button"). Pendengar ini berjalan setelah Material
    // (di <form>) dan sebelum React (di document), lalu mengembalikan submitter ke null.
    function rapikanSubmitter(e: SubmitEvent) {
      if (e.submitter?.tagName.includes("-")) {
        Object.defineProperty(e, "submitter", { configurable: true, enumerable: true, value: null });
      }
    }
    const html = document.documentElement;
    html.addEventListener("submit", rapikanSubmitter);
    return () => html.removeEventListener("submit", rapikanSubmitter);
  }, []);

  return null;
}
