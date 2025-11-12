import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard/index";
import AIStudio from "@/pages/ai/studio";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";

// Main Pages
import Calendar from "@/pages/calendar/index";
import Analytics from "@/pages/analytics/index";
import ContentLibrary from "@/pages/content-library/index";

// Content Pages
import PostsList from "@/pages/posts/index";
import CreatePost from "@/pages/posts/create";
import ScheduledPosts from "@/pages/posts/scheduled";
import Drafts from "@/pages/posts/drafts";
import Templates from "@/pages/templates/index";

// Connection Pages
import SocialAccounts from "@/pages/connections/accounts";
import TeamMembers from "@/pages/connections/team";
import Integrations from "@/pages/connections/integrations";

// Team & Approval Pages
import AccountsPage from "@/pages/accounts/index";
import TeamPage from "@/pages/team/index";
import ApprovalsPage from "@/pages/approvals/index";

// Settings Pages
import Profile from "@/pages/settings/profile";
import Billing from "@/pages/settings/billing";
import Notifications from "@/pages/settings/notifications";
import Preferences from "@/pages/settings/preferences";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />

      {/* Authentication Routes */}
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />

      {/* Dashboard Routes */}
      <Route path="/dashboard" component={Dashboard} />

      {/* Main Pages */}
      <Route path="/calendar" component={Calendar} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/content-library" component={ContentLibrary} />

      {/* AI Studio Routes */}
      <Route path="/ai-studio" component={AIStudio} />
      <Route path="/ai/generator" component={AIStudio} />

      {/* Content Routes */}
      <Route path="/posts" component={PostsList} />
      <Route path="/posts/create" component={CreatePost} />
      <Route path="/posts/scheduled" component={ScheduledPosts} />
      <Route path="/posts/drafts" component={Drafts} />
      <Route path="/templates" component={Templates} />

      {/* Connection Routes */}
      <Route path="/connections/accounts" component={SocialAccounts} />
      <Route path="/connections/team" component={TeamMembers} />
      <Route path="/connections/integrations" component={Integrations} />

      {/* Team & Collaboration Routes */}
      <Route path="/accounts" component={AccountsPage} />
      <Route path="/team" component={TeamPage} />
      <Route path="/approvals" component={ApprovalsPage} />

      {/* Settings Routes */}
      <Route path="/settings/profile" component={Profile} />
      <Route path="/settings/billing" component={Billing} />
      <Route path="/settings/notifications" component={Notifications} />
      <Route path="/settings/preferences" component={Preferences} />

      {/* Catch all - 404 */}
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
