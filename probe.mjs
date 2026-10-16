// Test : quelles boutiques bloquées depuis Vercel répondent depuis GitHub Actions ?
// N'affiche que le code HTTP, la taille et des indices de page produit (aucune donnée privée).
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const SITES = {
  fnac: "https://www.fnac.com/SearchResult/ResultList.aspx?Search=iphone+17",
  darty: "https://www.darty.com/nav/recherche?text=iphone+17",
  boulanger: "https://www.boulanger.com/resultats?tr=iphone+17",
  cdiscount: "https://www.cdiscount.com/search/10/iphone+17.html",
  carrefour: "https://www.carrefour.fr/s?q=iphone+17",
  dyson: "https://www.dyson.fr/aspirateurs/sans-fil",
  idealo: "https://www.idealo.fr/prechcat.html?q=iphone+17",
  ledenicheur: "https://ledenicheur.fr/search?search=iphone%2017",
  rakuten: "https://fr.shopping.rakuten.com/search/iphone+17",
  backmarket: "https://www.backmarket.fr/fr-fr/search?q=iphone%2017",
  ebay: "https://www.ebay.fr/sch/i.html?_nkw=iphone+17",
  ubaldi: "https://www.ubaldi.com/recherche/iphone-17.php",
  kelkoo: "https://www.kelkoo.fr/recherche?query=iphone+17",
};
const results = await Promise.all(Object.entries(SITES).map(async ([name, url]) => {
  const t = Date.now();
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, "accept": "text/html,application/xhtml+xml", "accept-language": "fr-FR,fr;q=0.9" },
      redirect: "follow", signal: AbortSignal.timeout(20000),
    });
    const html = await res.text();
    const prices = (html.match(/\d{2,4}[,.]\d{2}\s?(€|&euro;)/g) || []).length;
    const challenge = /captcha|datadome|challenge|cf-chl|Access Denied|Pardon Our Interruption/i.test(html);
    const verdict = res.ok && prices >= 3 && !challenge ? "OK" : res.ok && prices >= 3 ? "OK?" : "BLOQUÉ";
    return `${verdict.padEnd(7)} ${name.padEnd(12)} HTTP ${res.status}  ${Math.round(html.length / 1024)} Ko  ${prices} prix  ${challenge ? "défi anti-robot" : ""}  ${Date.now() - t} ms`;
  } catch (e) {
    return `ERREUR  ${name.padEnd(12)} ${e.name}: ${e.message}`;
  }
}));
console.log(results.join("\n"));
