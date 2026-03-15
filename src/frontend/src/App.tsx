import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import ListingDetailPage from "./pages/ListingDetailPage";
import RestaurantsPage from "./pages/RestaurantsPage";
import StaysPage from "./pages/StaysPage";
import TaxisPage from "./pages/TaxisPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 2 } },
});

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const staysRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/stays",
  component: StaysPage,
});
const listingDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/stays/$id",
  component: ListingDetailPage,
});
const taxisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/taxis",
  component: TaxisPage,
});
const restaurantsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/restaurants",
  component: RestaurantsPage,
});
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  staysRoute,
  listingDetailRoute,
  taxisRoute,
  restaurantsRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
