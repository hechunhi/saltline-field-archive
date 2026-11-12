import { initializeLanguage, t } from "./i18n.js";

const language = initializeLanguage();
const link = document.querySelector(".catalog-link");
if (link) {
  link.textContent = t("Objekt- & Klangkatalog ↗");
  link.lang = language === "zh" ? "zh-Hans" : language;
  const catalogUrl = new URL("../catalog.html", import.meta.url.split("?")[0]);
  catalogUrl.searchParams.set("lang", language);
  link.href = catalogUrl.href;
}
