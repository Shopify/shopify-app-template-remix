/**
 * AdminLayout - Core layout component for admin interface
 * Provides Frame, Navigation, and App Bridge integration
 */

import { useState, useCallback, useEffect } from "react";
import { Frame, Navigation, TopBar, Toast } from "@shopify/polaris";
import {
  HomeIcon,
  OrderIcon,
  ProductIcon,
  PersonIcon,
  ChartVerticalIcon,
  SettingsIcon,
  CodeIcon,
  SearchIcon,
  ConnectIcon,
  BugIcon,
} from "@shopify/polaris-icons";
import { useNavigate, useLocation } from "@remix-run/react";
// import { initializeAppBridge } from "~/lib/app-bridge";
// import type { ClientApplication } from "@shopify/app-bridge";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Navigation items
  const navigationMarkup = (
    <Navigation location={location.pathname}>
      <Navigation.Section
        items={[
          {
            label: "Dashboard",
            icon: HomeIcon,
            url: "/admin",
            exactMatch: true,
            selected: location.pathname === "/admin",
          },
          {
            label: "Products",
            icon: ProductIcon,
            url: "/admin/products",
            selected: location.pathname.startsWith("/admin/products"),
          },
          {
            label: "Orders",
            icon: OrderIcon,
            url: "/admin/orders", 
            selected: location.pathname.startsWith("/admin/orders"),
          },
          {
            label: "Customers",
            icon: PersonIcon,
            url: "/admin/customers",
            selected: location.pathname.startsWith("/admin/customers"),
          },
          {
            label: "Analytics",
            icon: ChartVerticalIcon,
            url: "/admin/analytics",
            selected: location.pathname.startsWith("/admin/analytics"),
          },
        ]}
      />
      <Navigation.Section
        title="Developer Tools"
        items={[
          {
            label: "API Testing",
            icon: CodeIcon,
            url: "/admin/api-testing",
            selected: location.pathname.startsWith("/admin/api-testing"),
          },
          {
            label: "API Explorer",
            icon: SearchIcon,
            url: "/admin/api-explorer",
            selected: location.pathname.startsWith("/admin/api-explorer"),
          },
          {
            label: "Webhook Tester",
            icon: ConnectIcon,
            url: "/admin/webhook-tester",
            selected: location.pathname.startsWith("/admin/webhook-tester"),
          },
          {
            label: "Logging System",
            icon: BugIcon,
            url: "/admin/logging",
            selected: location.pathname.startsWith("/admin/logging"),
          },
          {
            label: "Performance Monitor",
            icon: ChartVerticalIcon,
            url: "/admin/performance",
            selected: location.pathname.startsWith("/admin/performance"),
          },
        ]}
        action={{
          icon: SettingsIcon,
          accessibilityLabel: "Settings",
          onClick: () => navigate("/admin/settings"),
        }}
      />
    </Navigation>
  );

  // Top bar markup
  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={
        <TopBar.UserMenu
          actions={[
            {
              items: [
                {
                  content: "Community forums",
                  onAction: () => {
                    window.open("https://community.shopify.com/", "_blank");
                  },
                },
                {
                  content: "Help center",
                  onAction: () => {
                    window.open("https://help.shopify.com/", "_blank");
                  },
                },
              ],
            },
            {
              items: [
                {
                  content: "Settings",
                  onAction: () => navigate("/admin/settings"),
                },
              ],
            },
          ]}
          name="Admin User"
          detail="Development"
          initials="AU"
          open={userMenuOpen}
          onToggle={() => setUserMenuOpen(!userMenuOpen)}
        />
      }
      onNavigationToggle={useCallback(
        () => setMobileNavigationActive(!mobileNavigationActive),
        [mobileNavigationActive]
      )}
    />
  );

  // Toast for notifications
  const toastMarkup = toastActive ? (
    <Toast
      content={toastMessage}
      onDismiss={() => setToastActive(false)}
    />
  ) : null;

  return (
    <div style={{ height: "100vh" }}>
      <Frame
        topBar={topBarMarkup}
        navigation={navigationMarkup}
        showMobileNavigation={mobileNavigationActive}
        onNavigationDismiss={() => setMobileNavigationActive(false)}
      >
        {children}
        {toastMarkup}
      </Frame>
    </div>
  );
} 