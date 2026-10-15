import JSZip from 'jszip';

export async function downloadExtensionZip(apiUrl: string = window.location.origin) {
  const zip = new JSZip();

  // Fetch or construct files
  const manifest = {
    manifest_version: 3,
    name: "ImobiHunter Pro - Captador Zap Imóveis",
    version: "1.2.1",
    description: "Captura imóveis, fotos em alta resolução, valores, m² e contatos/telefones no Zap Imóveis e envia para o CRM de prospecção.",
    permissions: [
      "activeTab",
      "scripting",
      "storage"
    ],
    host_permissions: [
      "*://*.zapimoveis.com.br/*",
      "*://*.vivareal.com.br/*",
      "http://localhost:3000/*",
      "http://127.0.0.1:3000/*",
      "https://*/*"
    ],
    action: {
      default_popup: "popup.html",
      default_icon: {
        "16": "icons/icon16.png",
        "48": "icons/icon48.png",
        "128": "icons/icon128.png"
      }
    },
    content_scripts: [
      {
        matches: [
          "*://*.zapimoveis.com.br/*",
          "*://*.vivareal.com.br/*"
        ],
        js: ["content.js"],
        css: ["content.css"],
        run_at: "document_idle"
      }
    ],
    icons: {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  };

  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  // Get content.js and replace default API_BASE_URL with the active apiUrl
  try {
    const resContent = await fetch('/extension/content.js');
    let contentCode = await resContent.text();
    contentCode = contentCode.replace(/let API_BASE_URL = ['"][^'"]+['"];/, `let API_BASE_URL = '${apiUrl}';`);
    zip.file("content.js", contentCode);
  } catch {
    zip.file("content.js", `console.log('ImobiHunter Pro Active');`);
  }

  // Get content.css
  try {
    const resCss = await fetch('/extension/content.css');
    zip.file("content.css", await resCss.text());
  } catch {
    zip.file("content.css", "/* ImobiHunter styles */");
  }

  // Get popup.html
  try {
    const resHtml = await fetch('/extension/popup.html');
    zip.file("popup.html", await resHtml.text());
  } catch {}

  // Get popup.css
  try {
    const resPopCss = await fetch('/extension/popup.css');
    zip.file("popup.css", await resPopCss.text());
  } catch {}

  // Get popup.js and inject active apiUrl
  try {
    const resPopJs = await fetch('/extension/popup.js');
    let popJs = await resPopJs.text();
    popJs = popJs.replace("let currentApiUrl = 'http://localhost:3000';", `let currentApiUrl = '${apiUrl}';`);
    popJs = popJs.replace('value="http://localhost:3000"', `value="${apiUrl}"`);
    zip.file("popup.js", popJs);
  } catch {}

  // Add Icons folder
  const iconsFolder = zip.folder("icons");
  if (iconsFolder) {
    for (const size of [16, 48, 128]) {
      try {
        const iconRes = await fetch(`/extension/icons/icon${size}.png`);
        const blob = await iconRes.blob();
        iconsFolder.file(`icon${size}.png`, blob);
      } catch (e) {
        console.warn(`Could not load icon${size}.png`, e);
      }
    }
  }

  // Add a clear README inside the zip
  zip.file("LEIA-ME_COMO_INSTALAR.txt", `========================================================
🏢 IMOBIHUNTER PRO - GUIA DE INSTALAÇÃO NO NAVEGADOR
========================================================

Passo a Passo Rápido (Leva menos de 1 minuto):

1. Descompacte esta pasta ZIP em qualquer lugar do seu computador
   (ex: na sua área de trabalho ou Documentos).

2. Abra o Google Chrome, Brave ou Microsoft Edge e acesse:
   chrome://extensions

3. No canto superior direito, ATIVE a chave "Modo do desenvolvedor" (Developer mode).

4. No canto superior esquerdo, clique no botão "Carregar sem compactação" (Load unpacked).

5. Selecione a pasta descompactada que contém este arquivo LEIA-ME e o manifest.json.

6. Pronto! O ícone do ImobiHunter Pro aparecerá nas suas extensões. Fixe-o na barra do navegador.

COMO USAR NO ZAP IMÓVEIS:
1. Acesse https://www.zapimoveis.com.br
2. Busque qualquer bairro (ex: Moema, Pinheiros, Barra da Tijuca, etc.)
3. Veja o botão azul flutuante no canto inferior direito: "⚡ Capturar Imóveis Desta Página".
4. Ao clicar, os dados, fotos, contatos e telefones serão enviados diretamente para o seu CRM:
   ${apiUrl}
`);

  // Generate blob and download
  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'imobihunter-extensao-zapimoveis.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
