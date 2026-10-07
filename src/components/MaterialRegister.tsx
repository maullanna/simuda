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
  }, []);

  return null;
}
