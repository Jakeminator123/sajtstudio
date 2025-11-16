(function () {
  // Initialize status early
  try {
    window.__didStatus = window.__didStatus || "pending";
  } catch (_) {}

  // Override console.error and console.warn to filter D-ID errors and antivirus blocks
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  const shouldFilterMessage = function (...args) {
    // Build a comprehensive message string from all arguments
    let fullMessage = "";
    for (const arg of args) {
      if (typeof arg === "string") {
        fullMessage += " " + arg;
      } else if (arg && typeof arg === "object") {
        // Check error objects, stack traces, etc.
        if (arg.stack) {
          fullMessage += " " + arg.stack;
        }
        if (arg.message) {
          fullMessage += " " + arg.message;
        }
        try {
          const stringified = JSON.stringify(arg);
          fullMessage += " " + stringified;
        } catch (e) {
          try {
            fullMessage += " " + String(arg);
          } catch (_) {
            fullMessage += " [object]";
          }
        }
      } else {
        fullMessage += " " + String(arg);
      }
    }
    const message = fullMessage.toLowerCase();

    return (
      message.includes("d-id.com") ||
      message.includes("agent.d-id.com") ||
      message.includes("api.d-id.com") ||
      message.includes("index-dqcaxkvx.js") ||
      message.includes("main-d6iamsoh.js") ||
      message.includes("failed to fetch") ||
      message.includes("typeerror") ||
      message.includes("cors policy") ||
      message.includes("access-control-allow-origin") ||
      message.includes("corb") ||
      message.includes("cross-origin read blocking") ||
      message.includes("cross-origin read blocking (corb)") ||
      message.includes("datadoghq.com") ||
      message.includes("dd-api-key") ||
      message.includes("rum?") ||
      message.includes("browser-intake-datadoghq.com") ||
      message.includes("401") ||
      message.includes("unauthorized") ||
      message.includes("err_failed") ||
      message.includes("net::err_failed") ||
      message.includes("kaspersky") ||
      message.includes("kis.v2.scr") ||
      message.includes("fd126c42-ebfa-4e12") ||
      message.includes("antivirus") ||
      // Check if it's a TypeError with fetch and has antivirus/D-ID in context
      (message.includes("typeerror") &&
        message.includes("fetch") &&
        (message.includes("kaspersky") ||
          message.includes("d-id") ||
          message.includes("agent")))
    );
  };

  // Helper function to log errors to API
  const logErrorToAPI = function (type, message, stack, source) {
    try {
      fetch("/api/errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: type,
          message: message,
          stack: stack,
          source: source,
          timestamp: new Date().toISOString(),
        }),
      }).catch(function () {
        // Silently fail if API is not available
      });
    } catch (e) {
      // Silently fail if fetch is not available
    }
  };

  console.error = function (...args) {
    if (shouldFilterMessage(...args)) {
      // Silently ignore D-ID and antivirus errors
      return;
    }
    // Log other errors normally
    originalConsoleError.apply(console, args);

    // Extract error message and stack
    let errorMessage = "";
    let errorStack = "";
    let errorSource = "";

    for (const arg of args) {
      if (typeof arg === "string") {
        errorMessage += (errorMessage ? " " : "") + arg;
      } else if (arg && typeof arg === "object") {
        if (arg.stack) {
          errorStack = arg.stack;
          errorMessage = arg.message || errorMessage || arg.toString();
        } else if (arg.message) {
          errorMessage = arg.message;
        } else {
          errorMessage = errorMessage || arg.toString();
        }
        if (arg.source || arg.filename) {
          errorSource = arg.source || arg.filename;
        }
      } else {
        errorMessage = errorMessage || String(arg);
      }
    }

    // Log to API if we have a meaningful error
    if (errorMessage || errorStack) {
      logErrorToAPI(
        "error",
        errorMessage || "Unknown error",
        errorStack,
        errorSource
      );
    }
  };

  console.warn = function (...args) {
    if (shouldFilterMessage(...args)) {
      // Silently ignore D-ID and antivirus warnings
      return;
    }
    // Log other warnings normally
    originalConsoleWarn.apply(console, args);

    // Extract warning message
    let warningMessage = "";
    for (const arg of args) {
      if (typeof arg === "string") {
        warningMessage += (warningMessage ? " " : "") + arg;
      } else if (arg && typeof arg === "object") {
        warningMessage = arg.message || warningMessage || arg.toString();
      } else {
        warningMessage = warningMessage || String(arg);
      }
    }

    // Log to API if we have a meaningful warning
    if (warningMessage) {
      logErrorToAPI("warning", warningMessage, null, null);
    }
  };

  // Suppress unhandled fetch errors from third-party scripts
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const url = args[0];
    let urlString = "";

    // Extract URL string from various formats
    if (typeof url === "string") {
      urlString = url;
    } else if (url && typeof url === "object") {
      urlString = url.url || url.href || url.toString() || "";
    }

    const isDIDRequest =
      urlString &&
      (urlString.includes("d-id.com") ||
        urlString.includes("agent.d-id.com") ||
        urlString.includes("api.d-id.com") ||
        urlString.includes("datadoghq.com") ||
        urlString.includes("dd-api-key") ||
        urlString.includes("rum?") ||
        urlString.includes("browser-intake-datadoghq.com") ||
        urlString.includes("/agents/"));

    // Get call stack to check if this fetch is from D-ID scripts
    let callStack = "";
    try {
      callStack = new Error().stack || "";
    } catch (_) {}

    const isFromDIDScript =
      callStack &&
      (callStack.includes("agent.d-id.com") ||
        callStack.includes("index-dqcaxkvx.js") ||
        callStack.includes("main-d6iamsoh.js") ||
        callStack.includes("d-id.com"));

    const fetchPromise = originalFetch.apply(this, args);

    // Handle errors silently for D-ID requests or requests from D-ID scripts
    if (isDIDRequest || isFromDIDScript) {
      return fetchPromise.catch(function (error) {
        // Check if it's a CORS error specifically
        const isCORSError =
          error &&
          ((error.message &&
            (error.message.includes("CORS") ||
              error.message.includes("Access-Control-Allow-Origin") ||
              error.message.includes("blocked by CORS policy"))) ||
            error.toString().includes("CORS") ||
            error.toString().includes("Access-Control-Allow-Origin"));

        // Silently handle D-ID fetch errors (including CORS)
        try {
          window.__didStatus = "error";
          window.dispatchEvent(new Event("did-status-change"));
        } catch (_) {}
        // Return a rejected promise with a generic error to prevent console logging
        // The error is still rejected so calling code can handle it, but it won't show in console
        return Promise.reject(new Error("Network request failed"));
      });
    }

    // For other requests, wrap to catch potential D-ID errors that weren't caught above
    return fetchPromise.catch(function (error) {
      // Check if error is from D-ID or antivirus by examining error message/stack
      const errorStr = (
        error?.message ||
        error?.toString() ||
        ""
      ).toLowerCase();
      const stackStr = (error?.stack || callStack || "").toLowerCase();
      const allErrorInfo = (errorStr + " " + stackStr).toLowerCase();

      const isDIDError =
        allErrorInfo.includes("d-id.com") ||
        allErrorInfo.includes("agent.d-id.com") ||
        allErrorInfo.includes("kaspersky") ||
        allErrorInfo.includes("kis.v2.scr") ||
        (allErrorInfo.includes("failed to fetch") &&
          (allErrorInfo.includes("agent") ||
            allErrorInfo.includes("d-id") ||
            allErrorInfo.includes("anonymous")));

      if (isDIDError) {
        try {
          window.__didStatus = "error";
          window.dispatchEvent(new Event("did-status-change"));
        } catch (_) {}
        // Return generic error to prevent console logging
        return Promise.reject(new Error("Network request failed"));
      }

      // Re-throw for non-D-ID errors so they're handled normally
      throw error;
    });
  };

  // Catch unhandled promise rejections from fetch (including from antivirus/extensions)
  window.addEventListener(
    "unhandledrejection",
    function (event) {
      const error = event.reason;
      const errorString = error
        ? error.message || error.toString() || String(error) || ""
        : "";
      const stackString = error?.stack || "";

      // Get current call stack to check for D-ID or antivirus
      let callStack = "";
      try {
        callStack = new Error().stack || "";
      } catch (_) {}

      // Combine all stack information - check both error stack and current call stack
      const allStackInfo = (
        stackString +
        " " +
        callStack +
        " " +
        errorString
      ).toLowerCase();

      // Check if error message or stack contains D-ID or antivirus references
      const hasDIDInStack =
        allStackInfo.includes("agent.d-id.com") ||
        allStackInfo.includes("d-id.com") ||
        allStackInfo.includes("api.d-id.com") ||
        allStackInfo.includes("index-dqcaxkvx.js") ||
        allStackInfo.includes("main-d6iamsoh.js");
      const hasAntivirusInStack =
        allStackInfo.includes("kaspersky") ||
        allStackInfo.includes("antivirus") ||
        allStackInfo.includes("kis.v2.scr") ||
        allStackInfo.includes("fd126c42-ebfa-4e12");

      // Check if it's a D-ID related error, antivirus block, or fetch error
      const isFailedFetch =
        errorString.toLowerCase().includes("failed to fetch") ||
        errorString.toLowerCase().includes("typeerror");
      const hasAnonymousInStack =
        allStackInfo.includes("<anonymous>") ||
        allStackInfo.includes("anonymous");

      const isDIDError =
        errorString.toLowerCase().includes("d-id.com") ||
        errorString.toLowerCase().includes("cors") ||
        errorString.toLowerCase().includes("401") ||
        errorString.toLowerCase().includes("unauthorized") ||
        errorString.toLowerCase().includes("networkerror") ||
        errorString.toLowerCase().includes("err_failed") ||
        hasDIDInStack ||
        (hasAntivirusInStack && isFailedFetch) ||
        (hasAntivirusInStack && hasDIDInStack) ||
        // Catch any TypeError with Failed to fetch when antivirus is present
        (hasAntivirusInStack && allStackInfo.includes("fetch")) ||
        // Catch "Failed to fetch" errors from anonymous sources when D-ID or antivirus is involved
        (isFailedFetch &&
          hasAnonymousInStack &&
          (hasAntivirusInStack ||
            hasDIDInStack ||
            allStackInfo.includes("window.fetch")));

      if (isDIDError) {
        // Suppress D-ID related fetch errors completely
        try {
          window.__didStatus = "error";
          window.dispatchEvent(new Event("did-status-change"));
        } catch (_) {}
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }

      // Log non-D-ID unhandled rejections to API
      if (errorString || stackString) {
        logErrorToAPI(
          "unhandled",
          errorString || "Unhandled promise rejection",
          stackString || callStack,
          null
        );
      }
    },
    true
  ); // Use capture phase to catch early

  // Also listen for error events that might be from fetch failures
  window.addEventListener(
    "error",
    function (event) {
      const error = event.error;
      const message = event.message || "";
      const filename = event.filename || "";
      const source = event.filename || event.target?.src || "";

      // Check if it's a fetch-related error from D-ID or antivirus
      const isDIDError =
        (message.includes("Failed to fetch") ||
          message.includes("fetch") ||
          message.includes("CORS")) &&
        (filename.includes("d-id.com") ||
          filename.includes("agent.d-id.com") ||
          source.includes("d-id.com") ||
          filename.includes("kaspersky") ||
          source.includes("kaspersky"));

      if (isDIDError) {
        try {
          window.__didStatus = "error";
          window.dispatchEvent(new Event("did-status-change"));
        } catch (_) {}
        event.preventDefault();
        event.stopPropagation();
        return false;
      }

      // Log non-D-ID errors to API
      if (message && !isDIDError) {
        const errorStack = error?.stack || "";
        logErrorToAPI("error", message, errorStack, filename || source);
      }
    },
    true
  );

  // Also catch TypeError: Failed to fetch errors specifically via window.onerror
  const originalErrorHandler = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    // Check if it's a D-ID or antivirus related error
    const messageStr = String(message || "").toLowerCase();
    const sourceStr = String(source || "").toLowerCase();
    const errorStr = error
      ? (error.stack || error.toString() || "").toLowerCase()
      : "";

    // Get call stack if available
    let callStack = "";
    try {
      callStack = (new Error().stack || "").toLowerCase();
    } catch (_) {}

    // Combine all context for checking
    const allContext =
      messageStr + " " + sourceStr + " " + errorStr + " " + callStack;

    // Check if error is related to D-ID (even if blocked by antivirus)
    const hasDIDInContext =
      allContext.includes("d-id.com") ||
      allContext.includes("agent.d-id.com") ||
      allContext.includes("api.d-id.com") ||
      allContext.includes("index-dqcaxkvx.js") ||
      allContext.includes("main-d6iamsoh.js");

    // Check if it's a "Failed to fetch" error that might be D-ID related
    const isFailedFetch =
      messageStr.includes("failed to fetch") ||
      messageStr.includes("typeerror");
    const hasAntivirus =
      allContext.includes("kaspersky") ||
      allContext.includes("kis.v2.scr") ||
      allContext.includes("fd126c42-ebfa-4e12");

    const isDIDRelated =
      hasDIDInContext ||
      (isFailedFetch && hasAntivirus) ||
      (isFailedFetch && hasDIDInContext) ||
      (hasAntivirus &&
        allContext.includes("fetch") &&
        allContext.includes("agent"));

    if (isDIDRelated) {
      try {
        window.__didStatus = "error";
        window.dispatchEvent(new Event("did-status-change"));
      } catch (_) {}
      return true; // Prevent default error handling
    }

    // Log non-D-ID errors to API
    if (!isDIDRelated && message) {
      const errorStack = error?.stack || "";
      logErrorToAPI("error", String(message), errorStack, String(source || ""));
    }

    // Call original handler for other errors
    if (originalErrorHandler) {
      return originalErrorHandler.call(
        this,
        message,
        source,
        lineno,
        colno,
        error
      );
    }
    return false;
  };
})();
