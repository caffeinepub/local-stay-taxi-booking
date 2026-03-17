import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const qc = useQueryClient();
  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      qc.clear();
    } else {
      try {
        await login();
      } catch (e: any) {
        if (e?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/stays", label: "Stays" },
    { to: "/taxis", label: "Taxis" },
    { to: "/restaurants", label: "Restaurants" },
    { to: "/booking-status", label: "Booking Status" },
    { to: "/admin", label: "Admin" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-xs">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center" data-ocid="nav.link">
          <img
            src="/assets/generated/stay-easy-logo-transparent.dim_480x140.png"
            alt="Stay Easy"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              activeProps={{
                className:
                  "px-4 py-2 rounded-md text-sm font-medium text-primary bg-primary/10",
              }}
              data-ocid="nav.link"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button
            onClick={handleAuth}
            disabled={loginStatus === "logging-in"}
            variant={isAuthenticated ? "outline" : "default"}
            size="sm"
            data-ocid="nav.primary_button"
          >
            {loginStatus === "logging-in"
              ? "Logging in..."
              : isAuthenticated
                ? "Logout"
                : "Login"}
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md hover:bg-muted"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          data-ocid="nav.toggle"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => setOpen(false)}
              data-ocid="nav.link"
            >
              {link.label}
            </Link>
          ))}
          <Button
            onClick={() => {
              handleAuth();
              setOpen(false);
            }}
            disabled={loginStatus === "logging-in"}
            variant={isAuthenticated ? "outline" : "default"}
            size="sm"
            className="mt-2 w-full"
            data-ocid="nav.primary_button"
          >
            {isAuthenticated ? "Logout" : "Login"}
          </Button>
        </div>
      )}
    </header>
  );
}
