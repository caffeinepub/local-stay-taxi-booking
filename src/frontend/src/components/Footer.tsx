import { Link } from "@tanstack/react-router";
import { Heart, MapPin } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="bg-foreground text-primary-foreground mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-semibold">
                Stay Easy
              </span>
            </div>
            <p className="text-sm opacity-70 leading-relaxed">
              Your trusted platform for booking local homestays, boutique
              hotels, and reliable taxi services.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider opacity-60">
              Services
            </h4>
            <ul className="space-y-2 text-sm opacity-75">
              <li>Hotel &amp; Homestay Stays</li>
              <li>Taxi &amp; Cab Bookings</li>
              <li>Restaurant &amp; Dhaba</li>
              <li>Group Packages</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider opacity-60">
              Support
            </h4>
            <ul className="space-y-2 text-sm opacity-75">
              <li>How It Works</li>
              <li>
                <Link
                  to="/booking-status"
                  className="hover:opacity-100 underline underline-offset-2"
                >
                  Booking Status
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:opacity-100 underline underline-offset-2"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm opacity-60">
          <span>© {year} Stay Easy. All rights reserved.</span>
          <a
            href={utmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:opacity-100 transition-opacity"
          >
            Built with <Heart className="w-3 h-3 fill-current mx-0.5" /> using
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
