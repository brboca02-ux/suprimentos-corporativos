// ImobiHunter Pro - Extension Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  const statusContainer = document.getElementById('conn-status');
  const statusLabel = document.getElementById('conn-label');
  const tabTitleElem = document.getElementById('tab-site-title');
  const tabBadge = document.getElementById('tab-status-badge');
  const btnCapture = document.getElementById('btn-capture-now');
  const btnCaptureText = document.getElementById('btn-capture-text');
  const btnOpenCrm = document.getElementById('btn-open-crm');
  const feedbackBox = document.getElementById('feedback-box');
  const inputApiUrl = document.getElementById('input-api-url');
  const btnSaveApi = document.getElementById('btn-save-api');

  let currentApiUrl = 'https://ais-dev-7rflnxwdu42lapvwucpuhg-880574744309.us-east1.run.app';
  const CLOUD_URL = 'https://ais-dev-7rflnxwdu42lapvwucpuhg-880574744309.us-east1.run.app';
  const LOCAL_URL = 'http://localhost:3000';

  const btnSetCloud = document.getElementById('btn-set-cloud');
  const btnSetLocal = document.getElementById('btn-set-local');

  btnSetCloud?.addEventListener('click', () => {
    inputApiUrl.value = CLOUD_URL;
    saveAndCheckApi(CLOUD_URL);
  });

  btnSetLocal?.addEventListener('click', () => {
    inputApiUrl.value = LOCAL_URL;
    saveAndCheckApi(LOCAL_URL);
  });

  function saveAndCheckApi(url) {
    currentApiUrl = url.replace(/\/+$/, '');
    inputApiUrl.value = currentApiUrl;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ crmApiUrl: currentApiUrl }, () => {
        showFeedback(`Conectando a ${currentApiUrl}...`, 'success');
        checkApiHealth();
      });
    } else {
      checkApiHealth();
    }
  }

  // Load configured API URL
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['crmApiUrl'], (res) => {
      if (res && res.crmApiUrl) {
        currentApiUrl = res.crmApiUrl;
        inputApiUrl.value = currentApiUrl;
      } else {
        inputApiUrl.value = currentApiUrl;
      }
      checkApiHealth();
    });
  } else {
    checkApiHealth();
  }

  // Save API URL
  btnSaveApi?.addEventListener('click', () => {
    let url = inputApiUrl.value.trim().replace(/\/+$/, '');
    if (!url.startsWith('http')) {
      url = 'http://' + url;
    }
    saveAndCheckApi(url);
  });

  // Check Health of Backend API with auto-fallback
  async function checkApiHealth() {
    statusContainer.className = 'status-pill status-checking';
    statusLabel.innerText = 'Conectando...';

    try {
      const resp = await fetch(`${currentApiUrl}/api/health`, { method: 'GET', signal: AbortSignal.timeout(3000) });
      if (resp.ok) {
        statusContainer.className = 'status-pill status-online';
        statusLabel.innerText = 'CRM Online';
        return;
      }
      throw new Error('Status não 200');
    } catch {
      // If current was localhost and failed, test cloud
      if (currentApiUrl.includes('localhost')) {
        try {
          const cloudResp = await fetch(`${CLOUD_URL}/api/health`, { method: 'GET', signal: AbortSignal.timeout(3000) });
          if (cloudResp.ok) {
            statusContainer.className = 'status-pill status-online';
            statusLabel.innerText = 'CRM Online (Nuvem)';
            inputApiUrl.value = CLOUD_URL;
            currentApiUrl = CLOUD_URL;
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
              chrome.storage.local.set({ crmApiUrl: CLOUD_URL });
            }
            showFeedback('Servidor local offline. Conectado automaticamente à Nuvem!', 'success');
            return;
          }
        } catch (_) {}
      }

      statusContainer.className = 'status-pill status-offline';
      statusLabel.innerText = 'CRM Offline';
    }
  }

  // Query Active Tab
  let activeTab = null;
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        activeTab = tabs[0];
        tabTitleElem.innerText = activeTab.title || activeTab.url || 'Aba Ativa';

        const isZap = activeTab.url && (activeTab.url.includes('zapimoveis.com.br') || activeTab.url.includes('vivareal.com.br'));

        if (isZap) {
          tabBadge.innerText = '✓ Portal Zap Imóveis Detectado';
          tabBadge.className = 'tab-badge zap-active';
          btnCapture.disabled = false;
        } else {
          tabBadge.innerText = 'Navegue até o Zap Imóveis';
          tabBadge.className = 'tab-badge';
          btnCapture.disabled = false; // still allow capturing any page for testing
        }
      }
    });
  } else {
    tabTitleElem.innerText = 'Navegador Web';
    tabBadge.innerText = 'Modo Demonstração';
    btnCapture.disabled = false;
  }

  // Open CRM Button
  btnOpenCrm?.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: currentApiUrl });
    } else {
      window.open(currentApiUrl, '_blank');
    }
  });

  // Capture Button Click
  btnCapture?.addEventListener('click', async () => {
    btnCapture.disabled = true;
    btnCaptureText.innerText = 'Capturando imóveis...';
    hideFeedback();

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.sendMessage && activeTab?.id) {
      chrome.tabs.sendMessage(activeTab.id, { action: 'captureAndSave' }, (response) => {
        btnCapture.disabled = false;
        btnCaptureText.innerText = 'Capturar Imóveis & Salvar';

        if (chrome.runtime.lastError) {
          showFeedback('Abra a página do Zap Imóveis ou recarregue a aba (F5) para injetar o extrator.', 'error');
        } else if (response && response.success) {
          showFeedback(`✓ Sucesso! ${response.count} imóveis enviados ao CRM!`, 'success');
        } else {
          showFeedback(response?.error || 'Nenhum imóvel foi detectado nesta página.', 'error');
        }
      });
    } else {
      setTimeout(() => {
        btnCapture.disabled = false;
        btnCaptureText.innerText = 'Capturar Imóveis & Salvar';
        showFeedback('Para capturar, instale a extensão no Chrome e navegue até zapimoveis.com.br!', 'success');
      }, 800);
    }
  });

  function showFeedback(text, type) {
    feedbackBox.innerText = text;
    feedbackBox.className = `feedback-box feedback-${type}`;
    feedbackBox.style.display = 'block';
  }

  function hideFeedback() {
    feedbackBox.style.display = 'none';
  }
});
