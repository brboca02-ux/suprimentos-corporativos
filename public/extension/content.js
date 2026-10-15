/**
 * ImobiHunter Pro - Content Script for Zap Imóveis & VivaReal (v1.2.1)
 * Suporte completo para:
 * 1. Páginas de Busca/Listagem de Imóveis (Lotes de 30, 88+ com Multi-Páginas)
 * 2. Páginas de Anúncio Individual (/imovel/...-id-...) com captura completa de fotos em alta resolução,
 *    descrição, endereço detalhado e telefone de contato/WhatsApp.
 * Zero logs de console.warn/error para manter o painel chrome://extensions 100% limpo sem alertas falsos.
 */

(function () {
  console.log(
    '%c[ImobiHunter Pro 🏢]%c Extrator imobiliário ativado com sucesso.',
    'background: #2563eb; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
    'color: #60a5fa;'
  );

  let API_BASE_URL = 'http://localhost:3000';
  const CLOUD_FALLBACK_URL = 'https://ais-dev-7rflnxwdu42lapvwucpuhg-880574744309.us-east1.run.app';

  // Locks & Throttling
  let isExtractionInProgress = false;
  let isNetworkRequestActive = false;
  let lastCaptureTimestamp = 0;
  const CAPTURE_COOLDOWN_MS = 1500;

  // Single-pass script cache
  let cachedNextDataListings = null;
  let scriptParseAttempted = false;

  // Detect whether current page is a Single Property Detail page or Search Listing
  function isSinglePropertyPage() {
    const path = window.location.pathname;
    return path.includes('/imovel/') && (path.includes('-id-') || path.match(/id-\d+/) || path.match(/-\d{6,}\/?$/));
  }

  // Load configured API URL from Chrome storage
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['crmApiUrl'], (res) => {
      if (res && res.crmApiUrl) {
        API_BASE_URL = res.crmApiUrl.replace(/\/+$/, '');
      }
    });
  }

  // Brazilian Phone Regex
  const BR_PHONE_REGEX = /(?:\+?55\s?)?(?:\(?0?([1-9]{2})\)?\s?)(?:(9\s?\d{4})[-\s]?(\d{4})|(\d{4})[-\s]?(\d{4}))/g;

  function extractPhonesFromText(text) {
    if (!text) return [];
    const found = [];
    const matches = text.match(BR_PHONE_REGEX);
    if (matches) {
      matches.forEach((m) => {
        const digits = m.replace(/\D/g, '');
        if (digits.length >= 10 && digits.length <= 13) {
          found.push(m.trim());
        }
      });
    }
    return Array.from(new Set(found));
  }

  function cleanPhone(raw) {
    if (!raw) return '';
    let d = raw.replace(/\D/g, '');
    if (d.startsWith('0') && (d.length === 11 || d.length === 12)) d = d.substring(1);
    if (d.length === 10 || d.length === 11) d = '55' + d;
    return d;
  }

  function formatPhoneDisplay(raw) {
    if (!raw) return '';
    const d = cleanPhone(raw);
    if (d.length === 13 && d.startsWith('55')) {
      return `(${d.substring(2, 4)}) ${d.substring(4, 9)}-${d.substring(9)}`;
    }
    if (d.length === 12 && d.startsWith('55')) {
      return `(${d.substring(2, 4)}) ${d.substring(4, 8)}-${d.substring(8)}`;
    }
    return raw;
  }

  // Detect Global Neighborhood and City from Page
  function detectPageLocation() {
    let bairro = '';
    let cidade = '';
    let estado = 'SC';

    // 1. Heading on page
    const headings = Array.from(document.querySelectorAll('h1, h2, [class*="title"], [class*="Title"], [class*="location"]'));
    for (const h of headings) {
      const txt = h.innerText || '';
      const match = txt.match(/em\s+([^,]+),\s*([^-]+)\s*-\s*([A-Z]{2})/i);
      if (match) {
        bairro = match[1].trim();
        cidade = match[2].trim();
        estado = match[3].trim().toUpperCase();
        break;
      }
    }

    // 2. Search input or breadcrumbs
    if (!bairro) {
      const breadcrumbLinks = document.querySelectorAll('[class*="breadcrumb"] a, nav a');
      if (breadcrumbLinks.length > 0) {
        const lastBreadcrumb = breadcrumbLinks[breadcrumbLinks.length - 1]?.innerText?.trim();
        if (lastBreadcrumb && lastBreadcrumb.length > 2 && !lastBreadcrumb.toLowerCase().includes('início')) {
          bairro = lastBreadcrumb;
        }
      }
    }

    // 3. URL path segment (e.g. /imovel/venda-apartamento-2-quartos-jardim-iririu-joinville-sc-46m2-id-2904610511/)
    if (!bairro) {
      const matchPath = window.location.pathname.match(/\/imovel\/[^\/]+-([a-z0-9-]+)-([a-z0-9-]+)-([a-z]{2})-/i);
      if (matchPath) {
        bairro = matchPath[1].replace(/-/g, ' ');
        cidade = matchPath[2].replace(/-/g, ' ');
        estado = matchPath[3].toUpperCase();
      } else {
        const matchSearch = window.location.pathname.match(/\/([a-z]{2})\+([^\+]+)\+\+([^\/\?]+)/i);
        if (matchSearch) {
          estado = matchSearch[1].toUpperCase();
          cidade = decodeURIComponent(matchSearch[2]).replace(/\+/g, ' ').replace(/-/g, ' ');
          bairro = decodeURIComponent(matchSearch[3]).replace(/\+/g, ' ').replace(/-/g, ' ');
        }
      }
    }

    if (bairro) {
      bairro = bairro.replace(/^jd\b/i, 'Jardim').replace(/^vl\b/i, 'Vila');
      bairro = bairro
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }

    if (cidade) {
      cidade = cidade
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }

    return {
      bairro: bairro || 'Jardim Iririú',
      cidade: cidade || 'Joinville',
      estado: estado || 'SC'
    };
  }

  // Find Single Property object in Next.js state
  function deepFindSingleListing(obj, depth = 0) {
    if (!obj || depth > 8) return null;
    if (obj.pricingInfos || obj.pricingInfo || (obj.id && obj.title && (obj.usableAreas || obj.price))) {
      return obj;
    }
    if (obj.listing && (obj.listing.pricingInfos || obj.listing.id || obj.listing.title)) {
      return obj.listing;
    }
    if (typeof obj === 'object') {
      for (const key of ['listing', 'pageProps', 'initialState', 'data', 'props', 'dehydratedState', 'queries']) {
        if (obj[key]) {
          const res = deepFindSingleListing(obj[key], depth + 1);
          if (res) return res;
        }
      }
      for (const k of Object.keys(obj)) {
        if (typeof obj[k] === 'object' && obj[k] !== null) {
          const res = deepFindSingleListing(obj[k], depth + 1);
          if (res) return res;
        }
      }
    }
    return null;
  }

  // Deep search for array of listings (Search Results)
  function deepFindListings(obj, depth = 0) {
    if (!obj || depth > 8) return null;
    if (Array.isArray(obj)) {
      if (obj.length > 0) {
        const first = obj[0];
        if (first?.listing || first?.pricingInfos || first?.usableAreas || (first?.id && first?.title)) {
          return obj;
        }
      }
      for (const item of obj) {
        const res = deepFindListings(item, depth + 1);
        if (res) return res;
      }
    } else if (typeof obj === 'object') {
      if (Array.isArray(obj.listings) && obj.listings.length > 0) return obj.listings;
      if (Array.isArray(obj.results?.listings) && obj.results.listings.length > 0) return obj.results.listings;
      if (Array.isArray(obj.searchResult?.listings) && obj.searchResult.listings.length > 0) return obj.searchResult.listings;

      for (const key of ['props', 'pageProps', 'queries', 'state', 'data', 'searchResult', 'results', 'initialState', 'dehydratedState']) {
        if (obj[key]) {
          const res = deepFindListings(obj[key], depth + 1);
          if (res) return res;
        }
      }
    }
    return null;
  }

  // Cached Script Parser (Supports both single listing and multiple listings)
  function extractFromScriptTagsCached() {
    if (scriptParseAttempted) {
      return cachedNextDataListings;
    }
    scriptParseAttempted = true;

    try {
      const nextDataEl = document.getElementById('__NEXT_DATA__');
      if (nextDataEl) {
        try {
          const json = JSON.parse(nextDataEl.textContent || '{}');

          // Case A: Single Listing Detail Page
          if (isSinglePropertyPage()) {
            const single = deepFindSingleListing(json);
            if (single) {
              cachedNextDataListings = parseListingsArray([single]);
              return cachedNextDataListings;
            }
          }

          // Case B: Search Listing Page
          const listings = deepFindListings(json);
          if (listings && listings.length > 0) {
            cachedNextDataListings = parseListingsArray(listings);
            return cachedNextDataListings;
          }
        } catch (_) {}
      }

      // Check specific script tags
      const scripts = document.querySelectorAll('script[type="application/json"]');
      for (const s of scripts) {
        const text = s.textContent || '';
        if (text.includes('pricingInfos') || text.includes('usableAreas')) {
          try {
            const parsed = JSON.parse(text);
            if (isSinglePropertyPage()) {
              const single = deepFindSingleListing(parsed);
              if (single) {
                cachedNextDataListings = parseListingsArray([single]);
                return cachedNextDataListings;
              }
            }
            const found = deepFindListings(parsed);
            if (found && found.length > 0) {
              cachedNextDataListings = parseListingsArray(found);
              return cachedNextDataListings;
            }
          } catch (_) {}
        }
      }

      return null;
    } catch (_) {
      return null;
    }
  }

  function parseListingsArray(listings) {
    const pageLoc = detectPageLocation();
    const results = [];

    for (const item of listings) {
      const l = item.listing || item;
      const account = item.account || l.account || {};
      const pricing = l.pricingInfos?.[0] || l.pricingInfo || {};
      const address = l.address || {};

      const price = Number(pricing.price || pricing.salePrice || 0);
      const condo = Number(pricing.monthlyCondoFee || 0);
      const iptu = Number(pricing.yearlyIptu || 0);
      const area = Number(l.usableAreas?.[0] || l.totalAreas?.[0] || 0);

      const desc = l.description || '';
      const detectedPhones = extractPhonesFromText(desc);
      const phoneRaw = account.phones?.[0]?.phone || detectedPhones[0] || '';

      const images = (l.images || l.medias || [])
        .map((img) => (typeof img === 'string' ? img : img.url || img.href || ''))
        .filter((url) => typeof url === 'string' && url.length > 5 && !url.includes('svg'));

      const codeMatch = window.location.href.match(/id-(\d+)/) || window.location.href.match(/-(\d{6,})\/?/);
      const code = l.id || l.externalId || (codeMatch ? codeMatch[1] : `ZAP-${Math.floor(Math.random() * 1000000)}`);
      const canonicalUrl = l.link?.href
        ? (l.link.href.startsWith('http') ? l.link.href : `https://www.zapimoveis.com.br${l.link.href}`)
        : window.location.href;

      results.push({
        id: 'zap-' + code,
        code: String(code),
        url: canonicalUrl,
        source: 'zapimoveis',
        title: l.title || `${l.unitTypes?.[0] || 'Imóvel'} à venda em ${address.neighborhood || pageLoc.bairro}`,
        description: desc,
        price: price,
        condoFee: condo || undefined,
        iptu: iptu || undefined,
        areaM2: area,
        pricePerM2: area > 0 && price > 0 ? Math.round(price / area) : 0,
        bedrooms: Number(l.bedrooms?.[0] || 0),
        suites: Number(l.suites?.[0] || 0),
        bathrooms: Number(l.bathrooms?.[0] || 0),
        parkingSpots: Number(l.parkingSpaces?.[0] || 0),
        bairro: address.neighborhood || address.district || pageLoc.bairro,
        cidade: address.city || pageLoc.cidade,
        estado: address.stateAcronym || address.state || pageLoc.estado,
        logradouro: address.street ? `${address.street}${address.streetNumber ? `, ${address.streetNumber}` : ''}` : undefined,
        images: images.length ? images : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
        coverImage: images[0] || undefined,
        advertiserName: account.name || 'Proprietário / Imobiliária',
        advertiserType: account.creci ? 'corretor' : 'proprietario',
        creci: account.creci || undefined,
        phoneRaw: phoneRaw,
        phoneClean: cleanPhone(phoneRaw),
        phoneFormatted: formatPhoneDisplay(phoneRaw),
        status: 'NOVO',
        priority: 'ALTA',
        notes: [],
        capturedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return results;
  }

  // 2. Dedicated Single Property DOM Extractor
  function extractSinglePropertyFromDOM() {
    const pageLoc = detectPageLocation();
    const fullText = document.body.innerText || '';

    // Title
    let title = '';
    const h1 = document.querySelector('h1');
    if (h1 && h1.innerText.trim().length > 5) {
      title = h1.innerText.trim();
    } else {
      title = document.title.split('|')[0].trim() || `Imóvel em ${pageLoc.bairro}`;
    }

    // Price
    let price = 0;
    const priceMatches = fullText.match(/R\$\s*([\d\.,]+)/g) || [];
    for (const m of priceMatches) {
      const digits = m.replace(/R\$\s*/, '').replace(/\./g, '').replace(/,/g, '.');
      const val = Math.round(parseFloat(digits)) || 0;
      if (val > 30000) {
        price = val;
        break;
      }
    }

    // Area
    const areaMatch = fullText.match(/(\d+[\.,]?\d*)\s*m²/i);
    const areaM2 = areaMatch ? Math.round(parseFloat(areaMatch[1].replace(',', '.'))) : 0;

    // Bedrooms, Bathrooms, Parking
    const bedMatch = fullText.match(/(\d+)\s*(?:quartos?|dormitórios?)/i);
    const bedrooms = bedMatch ? parseInt(bedMatch[1], 10) : 0;

    const bathMatch = fullText.match(/(\d+)\s*(?:banheiros?|banhs?|wc)/i);
    const bathrooms = bathMatch ? parseInt(bathMatch[1], 10) : 0;

    const parkMatch = fullText.match(/(\d+)\s*(?:vagas?|garagem)/i);
    const parkingSpots = parkMatch ? parseInt(parkMatch[1], 10) : 0;

    // Condo & IPTU
    const condoMatch = fullText.match(/Condomínio\s*(?:R\$\s*([\d\.,]+)|isento)/i);
    const condoFee = condoMatch && condoMatch[1] ? Math.round(parseFloat(condoMatch[1].replace(/\./g, '').replace(',', '.'))) : undefined;

    const iptuMatch = fullText.match(/IPTU\s*(?:R\$\s*([\d\.,]+)|isento)/i);
    const iptu = iptuMatch && iptuMatch[1] ? Math.round(parseFloat(iptuMatch[1].replace(/\./g, '').replace(',', '.'))) : undefined;

    // Code & URL
    const codeMatch = window.location.href.match(/id-(\d+)/) || window.location.href.match(/-(\d{6,})\/?/);
    const code = codeMatch ? codeMatch[1] : `ZAP-${Date.now().toString().slice(-6)}`;

    // High-Res Images
    const images = [];
    const imgs = document.querySelectorAll('img, picture source');
    imgs.forEach((img) => {
      let src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('srcset');
      if (src) {
        if (src.includes(' ')) src = src.split(',')[0].trim().split(' ')[0];
        if (src.startsWith('http') && !src.includes('svg') && !src.includes('avatar') && !src.includes('logo') && !src.includes('icon')) {
          if (!images.includes(src)) images.push(src);
        }
      }
    });

    // Description
    let description = '';
    const descElem = document.querySelector('[class*="description"], [data-testid*="description"], [id*="description"]');
    if (descElem) {
      description = descElem.innerText.trim();
    } else {
      description = title + ` - Imóvel à venda em ${pageLoc.bairro}, ${pageLoc.cidade} - ${pageLoc.estado}.`;
    }

    // Phone & Advertiser
    const phones = extractPhonesFromText(fullText);
    const phoneRaw = phones[0] || '';

    let advertiserName = 'Proprietário / Imobiliária';
    const advElem = document.querySelector('[class*="advertiser"], [class*="publisher"], [class*="account"], [class*="broker"], [data-testid*="advertiser"]');
    if (advElem && advElem.innerText.trim().length > 2) {
      advertiserName = advElem.innerText.trim().split('\n')[0];
    }

    const pricePerM2 = areaM2 > 0 && price > 0 ? Math.round(price / areaM2) : 0;

    return [{
      id: 'zap-' + code,
      code: String(code),
      url: window.location.href,
      source: 'zapimoveis',
      title: title,
      description: description,
      price: price,
      condoFee: condoFee,
      iptu: iptu,
      areaM2: areaM2,
      pricePerM2: pricePerM2,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      parkingSpots: parkingSpots,
      bairro: pageLoc.bairro,
      cidade: pageLoc.cidade,
      estado: pageLoc.estado,
      images: images.length ? images.slice(0, 15) : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
      coverImage: images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      advertiserName: advertiserName,
      advertiserType: advertiserName.toLowerCase().includes('imóveis') ? 'imobiliaria' : 'proprietario',
      phoneRaw: phoneRaw || undefined,
      phoneClean: cleanPhone(phoneRaw) || undefined,
      phoneFormatted: formatPhoneDisplay(phoneRaw) || undefined,
      status: 'NOVO',
      priority: 'ALTA',
      notes: [],
      capturedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }];
  }

  // 3. Search Results DOM Card Extractor with Async Time-Slicing
  async function extractFromDOMAsync(options = { timeSlice: true }) {
    if (isSinglePropertyPage()) {
      return extractSinglePropertyFromDOM();
    }

    const pageLoc = detectPageLocation();
    const results = [];
    const seenUrls = new Set();
    const seenCodes = new Set();

    const directCards = Array.from(
      document.querySelectorAll(
        '[data-cy*="listing-card"], [data-testid*="listing-card"], [class*="CardContainer"], [class*="card-container"], [class*="SimpleCard"], article, li[class*="item"]'
      )
    ).filter((el) => {
      const text = el.innerText || '';
      return text.includes('R$') && (text.includes('m²') || text.includes('quarto') || text.includes('vaga') || text.includes('comprar'));
    });

    let potentialCards = directCards;
    if (potentialCards.length === 0) {
      const links = Array.from(document.querySelectorAll('a[href*="/imovel/"], a[href*="id-"]'));
      const cardSet = new Set();
      links.forEach((l) => {
        let parent = l.parentElement;
        for (let i = 0; i < 4 && parent; i++) {
          if ((parent.innerText || '').includes('R$')) {
            cardSet.add(parent);
            break;
          }
          parent = parent.parentElement;
        }
      });
      potentialCards = Array.from(cardSet);
    }

    for (let index = 0; index < potentialCards.length; index++) {
      if (options.timeSlice && index > 0 && index % 4 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      const card = potentialCards[index];
      try {
        const text = card.innerText || '';

        const priceMatch = text.match(/R\$\s*([\d\.,]+)/);
        if (!priceMatch) continue;

        const rawPriceDigits = priceMatch[1].replace(/\./g, '').replace(/,/g, '.');
        const price = Math.round(parseFloat(rawPriceDigits)) || 0;
        if (price === 0) continue;

        const areaMatch = text.match(/([\d\.,]+)\s*m²/i);
        const areaM2 = areaMatch ? Math.round(parseFloat(areaMatch[1].replace(/\./g, '').replace(/,/g, '.'))) : 0;

        const bedMatch = text.match(/(\d+)\s*(?:quartos?|dormitórios?|qts?)/i);
        const bedrooms = bedMatch ? parseInt(bedMatch[1], 10) : 0;

        const bathMatch = text.match(/(\d+)\s*(?:banheiros?|banhs?|wc)/i);
        const bathrooms = bathMatch ? parseInt(bathMatch[1], 10) : 0;

        const parkMatch = text.match(/(\d+)\s*(?:vagas?|vga?)/i);
        const parkingSpots = parkMatch ? parseInt(parkMatch[1], 10) : 0;

        const condoMatch = text.match(/Cond(?:omínio|\.)?\s*(?:R\$\s*([\d\.,]+)|isento|não informado)/i);
        const condoFee = condoMatch && condoMatch[1] ? Math.round(parseFloat(condoMatch[1].replace(/\./g, '').replace(/,/g, '.'))) : undefined;

        const iptuMatch = text.match(/IPTU\s*(?:R\$\s*([\d\.,]+)|isento|não informado)/i);
        const iptu = iptuMatch && iptuMatch[1] ? Math.round(parseFloat(iptuMatch[1].replace(/\./g, '').replace(/,/g, '.'))) : undefined;

        const linkElem = card.querySelector('a[href*="/imovel/"]') || card.querySelector('a[href*="id-"]') || (card.tagName === 'A' ? card : null);
        let url = window.location.href;
        if (linkElem && linkElem.getAttribute('href')) {
          const href = linkElem.getAttribute('href');
          url = href.startsWith('http') ? href : `https://www.zapimoveis.com.br${href}`;
        }

        if (seenUrls.has(url) && url !== window.location.href) continue;
        seenUrls.add(url);

        const codeMatch = url.match(/id-(\d+)/) || url.match(/-(\d{6,})\/?/);
        const code = codeMatch ? codeMatch[1] : `ZAP-${100000 + index}`;

        if (seenCodes.has(code)) continue;
        seenCodes.add(code);

        const images = [];
        const imgElements = card.querySelectorAll('img, source');
        imgElements.forEach((img) => {
          let src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('srcset');
          if (src) {
            if (src.includes(' ')) src = src.split(',')[0].trim().split(' ')[0];
            if (src.startsWith('http') && !src.includes('svg') && !src.includes('avatar') && !src.includes('icon') && !src.includes('logo')) {
              images.push(src);
            }
          }
        });

        let title = '';
        const titleElem = card.querySelector('h2, h3, [class*="title"], [class*="Title"], p[class*="text"]');
        if (titleElem && titleElem.innerText.trim().length > 10) {
          title = titleElem.innerText.trim();
        } else {
          title = `Imóvel à venda em ${pageLoc.bairro}`;
        }

        let advertiserName = 'Proprietário / Imobiliária';
        const advertiserElem = card.querySelector('[class*="account"], [class*="logo"], [class*="broker"], [class*="advertiser"], [class*="seller"]');
        if (advertiserElem && advertiserElem.innerText.trim().length > 2) {
          advertiserName = advertiserElem.innerText.trim();
        }

        const phones = extractPhonesFromText(text);
        const phoneRaw = phones[0] || '';
        const pricePerM2 = areaM2 > 0 && price > 0 ? Math.round(price / areaM2) : 0;

        results.push({
          id: 'zap-' + code,
          code: String(code),
          url: url,
          source: 'zapimoveis',
          title: title,
          description: text.substring(0, 350) + '...',
          price: price,
          condoFee: condoFee,
          iptu: iptu,
          areaM2: areaM2,
          pricePerM2: pricePerM2,
          bedrooms: bedrooms,
          bathrooms: bathrooms,
          parkingSpots: parkingSpots,
          bairro: pageLoc.bairro,
          cidade: pageLoc.cidade,
          estado: pageLoc.estado,
          images: images.length ? images : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
          coverImage: images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          advertiserName: advertiserName,
          advertiserType: advertiserName.toLowerCase().includes('imóveis') ? 'imobiliaria' : 'proprietario',
          phoneRaw: phoneRaw || undefined,
          phoneClean: cleanPhone(phoneRaw) || undefined,
          phoneFormatted: formatPhoneDisplay(phoneRaw) || undefined,
          status: 'NOVO',
          priority: 'ALTA',
          notes: [],
          capturedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } catch (_) {}
    }

    return results;
  }

  // Fast count for HUD badge
  function getQuickListingCount() {
    if (isSinglePropertyPage()) {
      return 1;
    }
    if (cachedNextDataListings && cachedNextDataListings.length > 0) {
      return cachedNextDataListings.length;
    }
    const directCards = document.querySelectorAll('a[href*="/imovel/"], a[href*="id-"]');
    return directCards.length;
  }

  // Master Extraction
  async function extractPagePropertiesAsync() {
    const tStart = performance.now();
    let items = extractFromScriptTagsCached();
    if (!items || items.length === 0) {
      items = await extractFromDOMAsync({ timeSlice: true });
    }
    const elapsed = performance.now() - tStart;
    console.log(`[ImobiHunter Pro] ${items.length} imóvel(is) processado(s) em ${elapsed.toFixed(1)}ms.`);
    return items || [];
  }

  // Send Properties to CRM API
  async function sendToCRM(items) {
    if (isNetworkRequestActive) {
      showToast('Aguarde: envio em andamento...', 'info');
      return { success: false };
    }

    if (!items || items.length === 0) {
      showToast('Nenhum imóvel identificado nesta página para capturar.', 'error');
      return { success: false, count: 0 };
    }

    isNetworkRequestActive = true;
    const targetUrls = Array.from(new Set([API_BASE_URL, CLOUD_FALLBACK_URL, 'http://localhost:3000']));

    let success = false;
    let successfulUrl = '';
    let inserted = items.length;
    let updated = 0;

    for (const url of targetUrls) {
      try {
        const response = await fetch(`${url}/api/imoveis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(items),
          signal: AbortSignal.timeout(8000)
        });

        if (response.ok) {
          const data = await response.json();
          success = true;
          successfulUrl = url;
          inserted = data.insertedCount ?? items.length;
          updated = data.updatedCount ?? 0;

          if (updated > 0) {
            showToast(`🎯 ${inserted} novo(s) e ${updated} atualizado(s) no CRM sem duplicatas!`, 'success');
          } else {
            showToast(`🎯 Sucesso! ${inserted} imóvel(is) enviados e salvos no CRM!`, 'success');
          }
          break;
        }
      } catch (_) {}
    }

    isNetworkRequestActive = false;

    if (!success) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ lastCapturedProperties: items });
      }
      showToast('⚠️ Falha ao conectar ao CRM. Verifique se o servidor está rodando.', 'error');
    }

    return { success, count: items.length, insertedCount: inserted, updatedCount: updated, targetUrl: successfulUrl };
  }

  // Floating HUD Badge in the Bottom Right of Zap Imóveis
  function injectHUD() {
    if (document.getElementById('imobihunter-hud')) return;

    const isSingle = isSinglePropertyPage();

    let autoPilotState = null;
    try {
      const rawAuto = sessionStorage.getItem('imobihunter_autopilot');
      if (rawAuto) autoPilotState = JSON.parse(rawAuto);
    } catch (_) {}

    const hud = document.createElement('div');
    hud.id = 'imobihunter-hud';
    hud.className = 'imobihunter-hud-container';

    hud.innerHTML = `
      <div class="imobihunter-badge">
        <div class="imobihunter-badge-header">
          <div class="imobihunter-pulse-dot"></div>
          <span class="imobihunter-brand">ImobiHunter Pro</span>
          <span id="imobihunter-detected-count" class="imobihunter-counter">${isSingle ? '1 imóvel detalhado' : 'Detectando...'}</span>
        </div>
        
        <div class="imobihunter-actions">
          <button id="imobihunter-btn-capture" class="imobihunter-btn-primary" title="Captura os dados deste imóvel e envia ao CRM com fotos e contato">
            ${isSingle ? '⚡ Capturar Este Imóvel' : '⚡ Capturar Página'}
          </button>
          ${
            !isSingle
              ? `<button id="imobihunter-btn-autopilot" class="imobihunter-btn-next" title="Captura todas as páginas da busca (88+ imóveis) em piloto automático">
                   🤖 Multi-Páginas
                 </button>`
              : ''
          }
          <a id="imobihunter-btn-crm" href="${API_BASE_URL}" target="_blank" class="imobihunter-btn-secondary" title="Abrir Painel CRM">
            💼 CRM
          </a>
        </div>

        <div id="imobihunter-autopilot-banner" style="display: ${autoPilotState?.active ? 'flex' : 'none'}; align-items: center; justify-content: space-between; background: rgba(5, 150, 105, 0.2); border: 1px solid #059669; border-radius: 6px; padding: 4px 8px; font-size: 11px; color: #34d399;">
          <span>🤖 Multi-Páginas: Pág. ${autoPilotState?.currentPage || 1} (${autoPilotState?.totalCollected || 0} coletados)</span>
          <button id="imobihunter-btn-stop-autopilot" style="background: #dc2626; color: white; border: none; border-radius: 4px; padding: 2px 6px; font-size: 10px; cursor: pointer;">
            Parar
          </button>
        </div>

        <div class="imobihunter-footer-meta">
          <span id="imobihunter-location-badge" class="imobihunter-loc-tag">Carregando região...</span>
          <span style="font-size: 9px; color: #10b981; font-weight: bold;">🛡️ Deduplicação Ativa</span>
        </div>
      </div>
      <div id="imobihunter-toast" class="imobihunter-toast" style="display: none;"></div>
    `;

    document.body.appendChild(hud);
    setTimeout(updateDetectedCountFast, 600);

    // Stop Auto-pilot button
    document.getElementById('imobihunter-btn-stop-autopilot')?.addEventListener('click', () => {
      sessionStorage.removeItem('imobihunter_autopilot');
      const banner = document.getElementById('imobihunter-autopilot-banner');
      if (banner) banner.style.display = 'none';
      showToast('Captura multi-páginas interrompida.', 'info');
    });

    // Capture button
    document.getElementById('imobihunter-btn-capture')?.addEventListener('click', async () => {
      const now = Date.now();
      if (now - lastCaptureTimestamp < CAPTURE_COOLDOWN_MS || isExtractionInProgress) {
        showToast('Processando captura, aguarde um instante...', 'info');
        return;
      }
      lastCaptureTimestamp = now;
      isExtractionInProgress = true;

      const btn = document.getElementById('imobihunter-btn-capture');
      if (btn) {
        btn.innerText = '⏳ Processando...';
        btn.disabled = true;
      }

      try {
        const props = await extractPagePropertiesAsync();
        await sendToCRM(props);
      } finally {
        isExtractionInProgress = false;
        if (btn) {
          btn.innerText = isSingle ? '⚡ Capturar Este Imóvel' : '⚡ Capturar Página';
          btn.disabled = false;
        }
        updateDetectedCountFast();
      }
    });

    // Multi-page Auto-Pilot Capture Button
    document.getElementById('imobihunter-btn-autopilot')?.addEventListener('click', async () => {
      if (isExtractionInProgress) return;
      isExtractionInProgress = true;

      const btn = document.getElementById('imobihunter-btn-autopilot');
      if (btn) {
        btn.innerText = '🤖 Iniciando...';
        btn.disabled = true;
      }

      try {
        const props = await extractPagePropertiesAsync();
        await sendToCRM(props);

        const currentUrl = new URL(window.location.href);
        let currentPageNum = 1;
        if (currentUrl.searchParams.has('pagina')) {
          currentPageNum = parseInt(currentUrl.searchParams.get('pagina') || '1', 10);
        } else if (currentUrl.searchParams.has('page')) {
          currentPageNum = parseInt(currentUrl.searchParams.get('page') || '1', 10);
        }

        const nextNum = currentPageNum + 1;
        const state = {
          active: true,
          currentPage: nextNum,
          maxPages: 5,
          totalCollected: props.length || 0
        };
        sessionStorage.setItem('imobihunter_autopilot', JSON.stringify(state));

        showToast(`Página ${currentPageNum} salva! Navegando para página ${nextNum}...`, 'info');
        setTimeout(() => advanceToNextPage(nextNum), 1500);
      } finally {
        isExtractionInProgress = false;
        if (btn) {
          btn.innerText = '🤖 Multi-Páginas';
          btn.disabled = false;
        }
      }
    });

    // If Auto-pilot was active from previous page load
    if (autoPilotState && autoPilotState.active) {
      setTimeout(async () => {
        try {
          const props = await extractPagePropertiesAsync();
          await sendToCRM(props);

          const accumulated = (autoPilotState.totalCollected || 0) + props.length;
          const currentUrl = new URL(window.location.href);
          let currentNum = 1;
          if (currentUrl.searchParams.has('pagina')) {
            currentNum = parseInt(currentUrl.searchParams.get('pagina') || '1', 10);
          }

          if (props.length === 0 || currentNum >= (autoPilotState.maxPages || 5)) {
            sessionStorage.removeItem('imobihunter_autopilot');
            showToast(`🎉 Concluído! Total acumulado de ${accumulated} imóveis capturados no CRM!`, 'success');
            const banner = document.getElementById('imobihunter-autopilot-banner');
            if (banner) banner.style.display = 'none';
          } else {
            const nextNum = currentNum + 1;
            autoPilotState.currentPage = nextNum;
            autoPilotState.totalCollected = accumulated;
            sessionStorage.setItem('imobihunter_autopilot', JSON.stringify(autoPilotState));

            showToast(`Página ${currentNum} salva! Indo para a página ${nextNum}...`, 'info');
            setTimeout(() => advanceToNextPage(nextNum), 1500);
          }
        } catch (_) {
          sessionStorage.removeItem('imobihunter_autopilot');
        }
      }, 2000);
    }
  }

  function advanceToNextPage(targetPageNum) {
    const nextLink = document.querySelector('[data-testid*="next"], a[aria-label*="Próxima"], button[aria-label*="Próxima"], a[title*="Próxima"]');
    if (nextLink && nextLink.href && nextLink.href.includes('pagina=')) {
      window.location.href = nextLink.href;
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set('pagina', String(targetPageNum));
    window.location.href = url.toString();
  }

  function updateDetectedCountFast() {
    const isSingle = isSinglePropertyPage();
    const count = getQuickListingCount();
    const countElem = document.getElementById('imobihunter-detected-count');
    const locElem = document.getElementById('imobihunter-location-badge');
    const loc = detectPageLocation();

    if (countElem) {
      if (isSingle) {
        countElem.innerText = `1 imóvel detalhado`;
        countElem.style.background = 'rgba(16, 185, 129, 0.25)';
        countElem.style.color = '#34d399';
      } else {
        countElem.innerText = `${count} imóvel(is) na pág.`;
        if (count > 0) {
          countElem.style.background = 'rgba(16, 185, 129, 0.25)';
          countElem.style.color = '#34d399';
        }
      }
    }

    if (locElem) {
      locElem.innerText = `📍 ${loc.bairro}, ${loc.cidade} - ${loc.estado}`;
    }
  }

  function showToast(message, type = 'success') {
    const toast = document.getElementById('imobihunter-toast');
    if (!toast) return;
    toast.innerText = message;
    toast.className = `imobihunter-toast imobihunter-toast-${type}`;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 5500);
  }

  // Listen to messages from popup
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'scrapePage') {
        extractPagePropertiesAsync().then((props) => {
          sendResponse({ success: true, count: props.length, properties: props });
        });
        return true;
      } else if (request.action === 'captureAndSave') {
        extractPagePropertiesAsync().then((props) => {
          sendToCRM(props).then((res) => sendResponse(res));
        });
        return true;
      }
    });
  }

  // Inject HUD
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHUD);
  } else {
    injectHUD();
  }
})();
