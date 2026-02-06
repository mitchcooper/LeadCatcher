import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage, { PreviewPage } from "@/pages/landing";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminPages from "@/pages/admin/pages";
import AdminLeads from "@/pages/admin/leads";
import AdminAnalytics from "@/pages/admin/analytics";
import PageEditor from "@/pages/admin/page-editor";

function Router() {
  return (
    <Switch>
      <Route path="/"><Redirect to="/admin" /></Route>
      <Route path="/p/:slug" component={LandingPage} />
      <Route path="/preview/:slug" component={PreviewPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/pages" component={AdminPages} />
      <Route path="/admin/pages/new" component={PageEditor} />
      <Route path="/admin/pages/:id" component={PageEditor} />
      <Route path="/admin/leads" component={AdminLeads} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
