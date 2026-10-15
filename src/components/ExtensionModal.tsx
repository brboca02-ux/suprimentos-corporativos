import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Puzzle, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Code, 
  FileCode, 
  Terminal, 
  ArrowRight,
  Sparkles,
  Wifi
} from 'lucide-react';
import { downloadExtensionZip } from '../utils/extensionZip';

interface ExtensionModalProps {
  onClose: () => void;
  isApiOnline: boolean;
}

export const ExtensionModal: React.FC<ExtensionModalProps> = ({
  onClose,
  isApiOnline
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [selectedFileCode, setSelectedFileCode] = useState<'manifest' | 'content' | 'popup' | 'css'>('content');
  const [copiedCode, setCopiedCode] = useState(false);

  const activeOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadExtensionZip(activeOrigin);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (e) {
      console.error(e);
      alert('Falha ao gerar o arquivo ZIP. Tente copiar os códigos das abas abaixo.');
    } finally {
      setIsDownloading(false);
    }
  };

  const codeSnippets = {
    manifest: `{
  "manifest_version": 3,
  "name": "ImobiHunter Pro - Captador Zap Imóveis",
  "version": "1.2.1",
  "description": "Captura imóveis, fotos em alta resolução, valores, m² e contatos/telefones no Zap Imóveis e envia para o CRM de prospecção.",
  "permissions": ["activeTab", "scripting", "storage"],
  "host_permissions": [
    "*://*.zapimoveis.com.br/*",
    "*://*.vivareal.com.br/*",
    "http://localhost:3000/*",
    "https://*/*"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": { "16": "icons/icon16.png", "48": "icons/icon48.png", "128": "icons/icon128.png" }
  },
  "content_scripts": [
    {
      "matches": ["*://*.zapimoveis.com.br/*", "*://*.vivareal.com.br/*"],
      "js": ["content.js"],
      "css": ["content.css"],
      "run_at": "document_idle"
    }
  ]
}`,
    content: `// ImobiHunter Pro - Content Script (Zap Imóveis Extractor)
(function () {
  let API_BASE_URL = '${activeOrigin}';

  // Extrai dados completos do script __NEXT_DATA__
  function extractFromNextData() {
    const nextScript = document.getElementById('__NEXT_DATA__');
    if (!nextScript) return null;
    const json = JSON.parse(nextScript.textContent || '{}');
    const listings = json?.props?.pageProps?.results?.listings || [];
    return listings.map(item => {
      const l = item.listing || item;
      const pricing = l.pricingInfos?.[0] || {};
      const address = l.address || {};
      return {
        code: String(l.id),
        url: window.location.href,
        title: l.title || 'Imóvel em ' + address.neighborhood,
        price: Number(pricing.price || 0),
        areaM2: Number(l.usableAreas?.[0] || 0),
        bedrooms: Number(l.bedrooms?.[0] || 0),
        bathrooms: Number(l.bathrooms?.[0] || 0),
        parkingSpots: Number(l.parkingSpaces?.[0] || 0),
        bairro: address.neighborhood || 'Bairro',
        cidade: address.city || 'São Paulo',
        images: (l.images || []).map(img => typeof img === 'string' ? img : img.url)
      };
    });
  }

  // Envia imóveis capturados diretamente para a API do CRM
  async function sendToCRM(items) {
    const resp = await fetch(\`\${API_BASE_URL}/api/imoveis\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items)
    });
    return resp.json();
  }
})();`,
    popup: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>ImobiHunter Pro</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="popup-container">
    <h1>ImobiHunter Pro</h1>
    <p>Captador Integrado Zap Imóveis</p>
    <button id="btn-capture-now" class="btn-main">
      ⚡ Capturar Imóveis da Página
    </button>
  </div>
  <script src="popup.js"></script>
</body>
</html>`,
    css: `/* Botão Flutuante injetado no Zap Imóveis */
.imobihunter-hud-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 99999999;
}
.imobihunter-badge {
  background: #0f172a;
  color: #fff;
  padding: 14px 18px;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.4);
}`
  };

  const copySelectedCode = () => {
    navigator.clipboard.writeText(codeSnippets[selectedFileCode]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Extensão do Google Chrome</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Manifest V3 Pronto
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Instale no Chrome, Edge ou Brave para capturar imóveis direto do Zap Imóveis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Big Download Banner */}
          <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-purple-950/60 border border-indigo-500/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-base">Pacote da Extensão Pronto para Download</h3>
              </div>
              <p className="text-xs text-slate-300 max-w-xl">
                O arquivo ZIP já vem 100% configurado com o endereço da sua API ativa (<strong className="text-sky-300 font-mono">{activeOrigin}</strong>).
                Basta descompactar e carregar no Chrome.
              </p>
            </div>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-700/30 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'Gerando ZIP...' : 'Baixar Extensão (.ZIP)'}</span>
            </button>
          </div>

          {/* Bookmarklet: Auto-updating without extension reinstall */}
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-extrabold text-xs px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40">
                  NOVIDADE
                </span>
                <h4 className="font-bold text-sm text-white">Opção 2: Favorito Mágico (Sem Extensão & Nunca precisa Atualizar)</h4>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">Auto-atualiza sempre</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Não quer ficar recarregando arquivos ou atualizando versões no Chrome? Arraste o botão abaixo para a sua <strong>Barra de Favoritos</strong> do navegador. Quando estiver no Zap Imóveis, basta dar 1 clique no favorito e os imóveis são capturados na hora!
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={`javascript:(function(){if(location.hostname.indexOf('zapimoveis')===-1&&location.hostname.indexOf('vivareal')===-1){alert('Abra o site do Zap Imóveis!');return;}var s=document.createElement('script');s.src='${activeOrigin}/extension/content.js?v='+Date.now();document.body.appendChild(s);var c=document.createElement('link');c.rel='stylesheet';c.href='${activeOrigin}/extension/content.css?v='+Date.now();document.head.appendChild(c);})();`}
                onClick={(e) => {
                  e.preventDefault();
                  alert('👉 Arraste este botão para a sua Barra de Favoritos do Chrome (Ctrl + Shift + B se a barra estiver oculta).');
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-emerald-400 shadow-md shadow-emerald-700/30 cursor-grab active:cursor-grabbing flex items-center gap-1.5"
                title="Arraste para a Barra de Favoritos do Chrome"
              >
                <span>⭐ ⚡ Capturar no Zap (ImobiHunter)</span>
              </a>

              <button
                onClick={() => {
                  const code = `javascript:(function(){if(location.hostname.indexOf('zapimoveis')===-1&&location.hostname.indexOf('vivareal')===-1){alert('Abra o site do Zap Imóveis!');return;}var s=document.createElement('script');s.src='${activeOrigin}/extension/content.js?v='+Date.now();document.body.appendChild(s);var c=document.createElement('link');c.rel='stylesheet';c.href='${activeOrigin}/extension/content.css?v='+Date.now();document.head.appendChild(c);})();`;
                  navigator.clipboard.writeText(code);
                  alert('Código do Favorito copiado! Cole na URL de um novo favorito no seu navegador.');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-xl border border-slate-700 transition-colors"
              >
                Copiar Código do Favorito
              </button>
            </div>
          </div>

          {/* Step by step installation for the Extension */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>Como Instalar no seu Navegador (Chrome / Brave / Edge)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1</div>
                <h5 className="font-bold text-sm text-slate-200">Descompacte o ZIP</h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Clique no botão acima para baixar <strong className="text-slate-300">imobihunter-extensao-zapimoveis.zip</strong> e extraia em qualquer pasta (ex: Documentos ou Área de Trabalho).
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">2</div>
                <h5 className="font-bold text-sm text-slate-200">Abra chrome://extensions</h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No navegador, acesse <code className="text-sky-300 font-mono bg-slate-950 px-1 py-0.5 rounded">chrome://extensions</code> e ative a chave <strong className="text-slate-300">"Modo do desenvolvedor"</strong> no canto superior direito.
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">3</div>
                <h5 className="font-bold text-sm text-slate-200">Carregar sem compactação</h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Clique no botão <strong className="text-slate-300">"Carregar sem compactação"</strong> (Load unpacked) no canto superior esquerdo e escolha a pasta que você extraiu!
                </p>
              </div>
            </div>
          </div>

          {/* How to use in Zap Imóveis */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <span>Como Capturar Imóveis no Zap Imóveis</span>
            </h4>
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>
                1. Entre no site oficial do Zap Imóveis: <a href="https://www.zapimoveis.com.br" target="_blank" rel="noreferrer" className="text-blue-400 underline font-semibold">https://www.zapimoveis.com.br</a>
              </p>
              <p>
                2. Busque o bairro ou região onde você deseja captar imóveis (ex: <em>Moema, Pinheiros, Itaim Bibi, Barra da Tijuca, Copacabana</em>).
              </p>
              <p>
                3. Na página de resultados, observe o botão flutuante azul no canto inferior direito da tela: <strong className="text-sky-400">"⚡ Capturar Imóveis Desta Página"</strong>.
              </p>
              <p>
                4. Ao clicar, a extensão extrai as fotos em alta resolução, preço, condomínio, IPTU, m², quartos, vagas e telefones dos anunciantes e envia diretamente para este CRM!
              </p>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-400" />
                <span>Inspecionar Código Fonte da Extensão</span>
              </h4>

              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                {(['content', 'manifest', 'popup', 'css'] as const).map((file) => (
                  <button
                    key={file}
                    onClick={() => setSelectedFileCode(file)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                      selectedFileCode === file ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {file === 'manifest' ? 'manifest.json' : file === 'content' ? 'content.js' : file === 'popup' ? 'popup.html' : 'content.css'}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-60">
              <pre>{codeSnippets[selectedFileCode]}</pre>
              <button
                onClick={copySelectedCode}
                className="absolute top-3 right-3 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded text-[11px] cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Wifi className={`w-4 h-4 ${isApiOnline ? 'text-emerald-400' : 'text-rose-400'}`} />
            <span className="text-slate-400">
              Status da API: <strong className={isApiOnline ? 'text-emerald-400' : 'text-rose-400'}>{isApiOnline ? 'Conectado (Pronto para receber dados)' : 'Aguardando Servidor'}</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
