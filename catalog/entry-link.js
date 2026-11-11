import { initializeLanguage, t } from "./i18n.js";

const language = initializeLanguage();
const link = document.querySelector(".catalog-link");
if (link) {
  link.textContent = t("Objekt- & Klangkatalog ↗");
  link.lang = language === "zh" ? "zh-Hans" : language;
  link.href = `catalog.html?lang=${language}`;
}
