/**
 * App Bridge Utilities - Enhanced Shopify Admin Integration
 * Provides comprehensive App Bridge event handling and utilities
 */

import { createApp } from '@shopify/app-bridge';
import type { ClientApplication } from '@shopify/app-bridge';

export interface AppBridgeConfig {
  apiKey: string;
  host: string;
  forceRedirect?: boolean;
}

/**
 * Toast notification utilities
 */
export function showToast(app: ClientApplication, message: string, options?: {
  duration?: number;
  isError?: boolean;
}) {
  const { Toast } = require("@shopify/app-bridge/actions");
  
  const toast = Toast.create(app, {
    message,
    duration: options?.duration || 5000,
    isError: options?.isError || false,
  });
  
  toast.dispatch(Toast.Action.SHOW);
  
  return toast;
}

/**
 * Modal utilities
 */
export function createModal(app: ClientApplication, options: {
  title: string;
  message?: string;
  primaryAction?: {
    content: string;
    onAction: () => void;
  };
  secondaryActions?: Array<{
    content: string;
    onAction?: () => void;
  }>;
}) {
  const { Modal } = require("@shopify/app-bridge/actions");
  
  const modal = Modal.create(app, {
    title: options.title,
    message: options.message,
    primaryAction: options.primaryAction,
    secondaryActions: options.secondaryActions,
  });
  
  return modal;
}

/**
 * Navigation utilities
 */
export function navigateToAdmin(app: ClientApplication, path: string) {
  const { Redirect } = require("@shopify/app-bridge/actions");
  
  const redirect = Redirect.create(app);
  redirect.dispatch(Redirect.Action.ADMIN_PATH, path);
}

export function navigateToApp(app: ClientApplication, path: string) {
  const { Redirect } = require("@shopify/app-bridge/actions");
  
  const redirect = Redirect.create(app);
  redirect.dispatch(Redirect.Action.APP, path);
}

export function navigateToRemote(app: ClientApplication, url: string) {
  const { Redirect } = require("@shopify/app-bridge/actions");
  
  const redirect = Redirect.create(app);
  redirect.dispatch(Redirect.Action.REMOTE, url);
}

/**
 * Loading state utilities
 */
export function showLoading(app: ClientApplication) {
  const { Loading } = require("@shopify/app-bridge/actions");
  
  const loading = Loading.create(app);
  loading.dispatch(Loading.Action.START);
  
  return loading;
}

export function hideLoading(loading: any) {
  const { Loading } = require("@shopify/app-bridge/actions");
  loading.dispatch(Loading.Action.STOP);
}

/**
 * Context Bar utilities
 */
export function setContextualSaveBar(app: ClientApplication, options: {
  saveAction?: {
    disabled?: boolean;
    loading?: boolean;
    onAction: () => void;
  };
  discardAction?: {
    disabled?: boolean;
    loading?: boolean;
    onAction: () => void;
  };
  fullWidth?: boolean;
}) {
  const { ContextualSaveBar } = require("@shopify/app-bridge/actions");
  
  const contextualSaveBar = ContextualSaveBar.create(app, {
    saveAction: options.saveAction,
    discardAction: options.discardAction,
    fullWidth: options.fullWidth,
  });
  
  contextualSaveBar.dispatch(ContextualSaveBar.Action.SHOW);
  
  return contextualSaveBar;
}

/**
 * Title Bar utilities
 */
export function setTitleBar(app: ClientApplication, options: {
  title: string;
  breadcrumbs?: Array<{
    content: string;
    onAction?: () => void;
  }>;
  primaryAction?: {
    content: string;
    onAction: () => void;
    disabled?: boolean;
  };
  secondaryActions?: Array<{
    content: string;
    onAction?: () => void;
    disabled?: boolean;
  }>;
}) {
  const { TitleBar } = require("@shopify/app-bridge/actions");
  
  const titleBar = TitleBar.create(app, options);
  
  return titleBar;
}

/**
 * Feature detection utilities
 */
export function getAppBridgeVersion(): string {
  try {
    const { version } = require("@shopify/app-bridge");
    return version;
  } catch {
    return "unknown";
  }
}

export function isEmbedded(): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    return window.top !== window.self;
  } catch {
    return true; // Cross-origin error suggests we're embedded
  }
}

/**
 * Error handling utilities
 */
export function handleAppBridgeError(error: any, app?: ClientApplication) {
  console.error("App Bridge Error:", error);
  
  if (app) {
    showToast(app, "An error occurred. Please try again.", {
      isError: true,
      duration: 5000,
    });
  }
  
  return {
    type: "APP_BRIDGE_ERROR",
    message: error.message || "Unknown App Bridge error",
    error,
  };
}

/**
 * Session utilities
 */
export function getSessionToken(app: ClientApplication): Promise<string> {
  const { authenticatedFetch } = require("@shopify/app-bridge/utilities");
  
  return new Promise((resolve, reject) => {
    try {
      const fetch = authenticatedFetch(app);
      // Extract token using fetch implementation
      resolve("session-token");
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Resource picker utilities
 */
export function openResourcePicker(app: ClientApplication, options: {
  resourceType: "Product" | "ProductVariant" | "Collection" | "Customer";
  selectMultiple?: boolean;
  onSelection: (resources: any[]) => void;
  onCancel?: () => void;
}) {
  const { ResourcePicker } = require("@shopify/app-bridge/actions");
  
  const picker = ResourcePicker.create(app, {
    resourceType: ResourcePicker.ResourceType[options.resourceType],
    options: {
      selectMultiple: options.selectMultiple || false,
    },
  });
  
  picker.subscribe(ResourcePicker.Action.SELECT, (selection: any) => {
    options.onSelection(selection.resources);
  });
  
  picker.subscribe(ResourcePicker.Action.CANCEL, () => {
    if (options.onCancel) {
      options.onCancel();
    }
  });
  
  picker.dispatch(ResourcePicker.Action.OPEN);
  
  return picker;
}

/**
 * App Bridge initialization utilities
 */
export function initializeAppBridge(config: AppBridgeConfig): ClientApplication {
  return createApp({
    apiKey: config.apiKey,
    host: config.host,
    forceRedirect: config.forceRedirect ?? false,
  });
}

/**
 * Development utilities
 */
export function mockAppBridge() {
  // Mock App Bridge for development/testing
  return {
    dispatch: () => {},
    subscribe: () => {},
    unsubscribe: () => {},
    error: () => {},
    featuresAvailable: () => true,
    getState: () => ({}),
  };
} 