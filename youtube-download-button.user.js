// ==UserScript==
// @name         YouTube Download Buttons
// @namespace    http://tampermonkey.net/
// @version      2.2.7
// @description  Adds download buttons that reliably appear on initial load and navigation.
// @match        https://www.youtube.com/*
// @grant        none
// @run-at       document-start
// @homepageURL  https://github.com/serh007/youtube_download_user_script
// ==/UserScript==

(function () {
  "use strict";

  const LOCAL_SERVER = "http://127.0.0.1:5000";
  const PROTOCOL_URI = "start-youtube://";
  const PANEL_ID = "yt-download-panel-script";

  let observer = null;

  // Функція для показу сповіщень (toast)
  function showToast(message, duration = 4000) {
    const toast = document.createElement("div");
    toast.textContent = message;
    Object.assign(toast.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      padding: "12px 18px",
      borderRadius: "8px",
      zIndex: "10000",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      userSelect: "none",
      maxWidth: "300px",
      opacity: "0",
      transform: "translateY(20px)",
      transition: "opacity 0.3s ease, transform 0.3s ease",
    });
    document.body.appendChild(toast);

    // Плавна поява
    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    }, 10);

    // Плавне зникнення
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Функція, що створює та додає панель з кнопками
  function addDownloadPanel(container, videoId) {
    if (document.getElementById(PANEL_ID)) return; // Запобігаємо дублюванню

    const panel = document.createElement("div");
    panel.id = PANEL_ID;
    Object.assign(panel.style, {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginLeft: "8px",
    });

    const select = document.createElement("select");
    Object.assign(select.style, {
      background: "rgba(255, 255, 255, 0.1)",
      color: "#f1f1f1",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "18px",
      padding: "8px 12px",
      fontSize: "14px",
      cursor: "pointer",
      outline: "none",
    });

    ["360", "480", "720", "1080", "1440", "2160"].forEach((q) => {
      const option = document.createElement("option");
      option.value = q;
      option.textContent = q + "p";
      if (q === "1080") option.selected = true;
      option.style.background = "#212121";
      option.style.color = "#f1f1f1";
      select.appendChild(option);
    });

    const createButton = (text, title, hoverColor) => {
      const btn = document.createElement("button");
      btn.textContent = text;
      btn.title = title;
      Object.assign(btn.style, {
        background: "rgba(255, 255, 255, 0.1)",
        color: "#f1f1f1",
        border: "none",
        borderRadius: "50%",
        cursor: "pointer",
        fontSize: "18px",
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.2s ease, color 0.2s ease",
      });

      btn.onmouseenter = () =>
        (btn.style.backgroundColor = "rgba(255, 255, 255, 0.2)");
      btn.onmouseleave = () =>
        (btn.style.backgroundColor = "rgba(255, 255, 255, 0.1)");
      return btn;
    };

    const btnDownload = createButton("⇩", "Завантажити відео");
    const btnRunServer = createButton("⏻", "Запустити локальний сервер"); // '⇧' -> '⏻' (Power symbol)

    btnDownload.onclick = () => {
      const quality = select.value;
      fetch(`${LOCAL_SERVER}/download?v=${videoId}&quality=${quality}`)
        .then((res) =>
          res.ok ? res.json() : Promise.reject("Сервер не відповідає")
        )
        .then((data) => showToast(`✅ Завантаження: ${data.quality}p`))
        .catch(() => showToast(`❌ Помилка. Сервер не запущено?`));
    };

    btnRunServer.onclick = () => {
      window.location.href = PROTOCOL_URI;
      showToast("🚀 Спроба запуску сервера...");
    };

    panel.appendChild(select);
    panel.appendChild(btnDownload);
    panel.appendChild(btnRunServer);
    const threeDotMenu = container.querySelector('#menu') || container.querySelector('ytd-menu-renderer');
    if (threeDotMenu) {
      container.insertBefore(panel, threeDotMenu);
    } else {
      container.appendChild(panel);
    }
  }

  // Головна функція, яка запускає логіку
  function initialize() {
    
    // Спочатку видаляємо стару панель, якщо вона є
    document.getElementById(PANEL_ID)?.remove();

    if (observer) observer.disconnect();

    // Ми на сторінці відео?
    if (window.location.pathname !== "/watch") {
      
      return; // Якщо ні, нічого не робимо
    }

    const videoId = new URLSearchParams(window.location.search).get("v");
    if (!videoId) {
      
      return;
    }

    // Спробуємо основні селектори
    let buttonContainer =
      document.querySelector("#top-level-buttons-computed") ||
      document.querySelector("#top-level-buttons") ||
      document.querySelector("#flexible-item-buttons");

    // Якщо не знайдено, спробуємо меню з трьома крапками
    if (!buttonContainer) {
      buttonContainer =
        document.querySelector(
          "ytd-menu-renderer #top-level-buttons-computed"
        ) || document.querySelector("#menu");
    }

    if (buttonContainer && buttonContainer.id !== "menu") {
      
      setTimeout(() => {
        addDownloadPanel(buttonContainer, videoId);
        // Add observer to re-add panel if removed
        const toolbarObserver = new MutationObserver(() => {
          if (!document.getElementById(PANEL_ID)) {
            
            addDownloadPanel(buttonContainer, videoId);
          }
        });
        toolbarObserver.observe(buttonContainer, {
          childList: true,
          subtree: true,
        });
      }, 500);
      return;
    } else if (buttonContainer) {
      
    } else {
      
    }

    observer = new MutationObserver(() => {
      
      buttonContainer =
        document.querySelector("#top-level-buttons-computed") ||
        document.querySelector("#top-level-buttons") ||
        document.querySelector("#flexible-item-buttons");
      if (!buttonContainer) {
        buttonContainer =
          document.querySelector(
            "ytd-menu-renderer #top-level-buttons-computed"
          ) || document.querySelector("#menu");
      }
      if (buttonContainer && buttonContainer.id !== "menu") {
        
        setTimeout(() => {
          addDownloadPanel(buttonContainer, videoId);
          // Add toolbar observer
          const toolbarObserver = new MutationObserver(() => {
            if (!document.getElementById(PANEL_ID)) {
              
              addDownloadPanel(buttonContainer, videoId);
            }
          });
          toolbarObserver.observe(buttonContainer, {
            childList: true,
            subtree: true,
          });
        }, 500);
        observer.disconnect();
        observer = null;
      } else if (buttonContainer) {
        
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Fallback interval check
    let fallbackAttempts = 0;
    const fallbackInterval = setInterval(() => {
      
      buttonContainer =
        document.querySelector("#top-level-buttons-computed") ||
        document.querySelector("#top-level-buttons") ||
        document.querySelector("#flexible-item-buttons");
      if (!buttonContainer) {
        buttonContainer =
          document.querySelector(
            "ytd-menu-renderer #top-level-buttons-computed"
          ) || document.querySelector("#menu");
      }
      if (buttonContainer && buttonContainer.id !== "menu") {
        
        setTimeout(() => {
          addDownloadPanel(buttonContainer, videoId);
          // Add toolbar observer
          const toolbarObserver = new MutationObserver(() => {
            if (!document.getElementById(PANEL_ID)) {
              
              addDownloadPanel(buttonContainer, videoId);
            }
          });
          toolbarObserver.observe(buttonContainer, {
            childList: true,
            subtree: true,
          });
        }, 500);
        if (observer) observer.disconnect();
        observer = null;
        clearInterval(fallbackInterval);
      } else if (buttonContainer) {
        
      }
      fallbackAttempts++;
      if (fallbackAttempts > 20) {
        clearInterval(fallbackInterval);
      }
    }, 500);
  }

  // YouTube використовує подію 'yt-navigate-finish' для переходів між сторінками
  // Це найнадійніший спосіб відстежити зміну відео
  document.addEventListener("yt-navigate-finish", () => {
    
    initialize();
  });

  window.addEventListener("yt-navigate-start", () => {
    
    initialize();
  });

  window.addEventListener("spfdone", () => {
    
    initialize();
  });

  window.addEventListener("popstate", () => {
    
    initialize();
  });

  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      
      initialize();
    }
  }, 300);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      
      initialize();
    });
  } else {
    initialize();
  }
})();
