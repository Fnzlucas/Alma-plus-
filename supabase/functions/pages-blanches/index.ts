import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { nom, ville } = await req.json();

    if (!ville) {
      return new Response(JSON.stringify({ error: "ville requise" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Géocodage pour obtenir le code postal
    const geoRes = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(ville)}&limit=1`
    );
    const geoData = await geoRes.json();
    const feat = geoData.features?.[0];
    const nomVille = feat?.properties?.city || ville;
    const codePostal = feat?.properties?.postcode || "";

    // Scraping Pages Blanches
    const pbUrl = `https://www.pagesjaunes.fr/pagesblanches/recherche?quoiqui=${encodeURIComponent(nom || "")}&ou=${encodeURIComponent(codePostal || nomVille)}&univers=pagesblanches`;

    const pbRes = await fetch(pbUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9",
        "Referer": "https://www.pagesjaunes.fr/",
      },
    });

    const html = await pbRes.text();

    // Parser le HTML — extraction des contacts
    const contacts: Array<{nom: string; adresse: string; ville: string; tel: string}> = [];

    // Regex pour extraire les blocs de résultats Pages Blanches
    // Pattern pour les noms
    const nomPattern = /class="[^"]*denomination[^"]*"[^>]*>([^<]+)</gi;
    // Pattern pour les adresses
    const adressePattern = /class="[^"]*adresse[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/gi;
    // Pattern pour les téléphones
    const telPattern = /(?:data-href|href)="tel:([0-9+\s]+)"/gi;
    // Alternative : numéros dans le HTML
    const telPattern2 = /\b(0[1-9][0-9]{8})\b/g;

    // Extraction noms
    let match;
    const noms: string[] = [];
    const nomRe = /class="[^"]*denomination[^"]*"[^>]*>\s*<[^>]+>\s*([^<]+)/gi;
    while ((match = nomRe.exec(html)) !== null && noms.length < 20) {
      const n = match[1].trim();
      if (n.length > 2 && n.length < 60) noms.push(n);
    }

    // Alternative si denomination pas trouvé
    if (noms.length === 0) {
      const altNomRe = /<span[^>]*itemprop="name"[^>]*>([^<]+)<\/span>/gi;
      while ((match = altNomRe.exec(html)) !== null && noms.length < 20) {
        const n = match[1].trim();
        if (n.length > 2) noms.push(n);
      }
    }

    // Extraction téléphones
    const tels: string[] = [];
    const telRe = /href="tel:([0-9+\s]{10,14})"/gi;
    while ((match = telRe.exec(html)) !== null && tels.length < 20) {
      tels.push(match[1].trim().replace(/\s/g, ""));
    }
    if (tels.length === 0) {
      const telRe2 = /\b(0[1-9][.\s-]?(?:[0-9]{2}[.\s-]?){4})\b/g;
      while ((match = telRe2.exec(html)) !== null && tels.length < 20) {
        tels.push(match[1].replace(/[.\s-]/g, ""));
      }
    }

    // Extraction adresses
    const adresses: string[] = [];
    const adresseRe = /<span[^>]*itemprop="streetAddress"[^>]*>([^<]+)<\/span>/gi;
    while ((match = adresseRe.exec(html)) !== null && adresses.length < 20) {
      adresses.push(match[1].trim());
    }
    if (adresses.length === 0) {
      const adresseRe2 = /class="[^"]*street-address[^"]*"[^>]*>([^<]+)</gi;
      while ((match = adresseRe2.exec(html)) !== null && adresses.length < 20) {
        adresses.push(match[1].trim());
      }
    }

    // Assembler les contacts
    const count = Math.max(noms.length, tels.length);
    for (let i = 0; i < count && contacts.length < 20; i++) {
      if (noms[i] || tels[i]) {
        contacts.push({
          nom: noms[i] || "Particulier",
          adresse: adresses[i] || "",
          ville: nomVille,
          tel: tels[i] || "",
        });
      }
    }

    // Si aucun résultat parsé, Pages Blanches a peut-être bloqué
    if (contacts.length === 0) {
      return new Response(
        JSON.stringify({
          contacts: [],
          ville: nomVille,
          message: "Aucun résultat trouvé ou accès bloqué. Essayez avec un nom plus précis.",
          debug: html.slice(0, 500),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ contacts, ville: nomVille, total: contacts.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
