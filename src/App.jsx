import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { pagesConfig } from "./pages.config";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import Login from "@/pages/Login";

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = Pages[mainPageKey];

// Page name for the current URL, e.g. "/browseroommates" -> "BrowseRoommates".
function usePageName() {
  const { pathname } = useLocation();
  const segment = pathname.replace(/^\//, "").split("/")[0];
  if (!segment) return mainPageKey;
  return Object.keys(Pages).find((key) => key.toLowerCase() === segment.toLowerCase()) ?? null;
}

const AppRoutes = () => {
  const { isLoadingAuth } = useAuth();
  const currentPageName = usePageName();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="*"
        element={
          <Layout currentPageName={currentPageName}>
            <Routes>
              <Route path="/" element={<MainPage />} />
              {Object.entries(Pages).map(([path, Page]) => (
                <Route key={path} path={`/${path}`} element={<Page />} />
              ))}
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
