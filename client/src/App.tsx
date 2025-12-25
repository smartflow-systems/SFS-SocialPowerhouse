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
import LiveDashboard from "@/pages/live-dashboard/index";
import GrowthTools from "@/pages/growth-tools/index";
import SocialInbox from "@/pages/social-inbox/index";
import SocialListening from "@/pages/social-listening/index";
import CompetitorIntelligence from "@/pages/competitor-intelligence/index";
import AIVisualCreator from "@/pages/ai-visual-creator/index";
import AutomationRules from "@/pages/automation-rules/index";

// Content Pages
import PostsList from "@/pages/posts/index";
import PostDetail from "@/pages/posts/detail";
import CreatePost from "@/pages/posts/create";
import ScheduledPosts from "@/pages/posts/scheduled";
import Drafts from "@/pages/posts/drafts";
import Templates from "@/pages/templates/index";

// Connection Pages
import SocialAccounts from "@/pages/connections/social-accounts";
import TeamMembers from "@/pages/connections/team";
import Integrations from "@/pages/connections/integrations";
import Automation from "@/pages/connections/automation";
import Alerts from "@/pages/connections/alerts";

// Team & Approval Pages
import AccountsPage from "@/pages/accounts/index";
import TeamPage from "@/pages/team/index";
import ApprovalsPage from "@/pages/approvals/index";

// Settings Pages
import Profile from "@/pages/settings/profile";
import Billing from "@/pages/settings/billing";
import Notifications from "@/pages/settings/notifications";
import Preferences from "@/pages/settings/preferences";

// Scheduler
import Scheduler from "@/pages/scheduler/index";

// Help
import Help from "@/pages/help/index";

// Chat
import ChatUI from "@/pages/chat/index";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ChatUI} />
      <Route path="/home" component={Home} />

      {/* Authentication Routes */}
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Dashboard Routes */}
      <Route path="/dashboard" component={Dashboard} />

      {/* Main Pages */}
      <Route path="/calendar" component={Calendar} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/content-library" component={ContentLibrary} />
      <Route path="/live-dashboard" component={LiveDashboard} />
      <Route path="/growth-tools" component={GrowthTools} />
      <Route path="/social-inbox" component={SocialInbox} />
      <Route path="/social-listening" component={SocialListening} />
      <Route path="/competitor-intelligence" component={CompetitorIntelligence} />
      <Route path="/ai-visual-creator" component={AIVisualCreator} />
      <Route path="/automation" component={AutomationRules} />

      {/* AI Studio Routes */}
      <Route path="/ai-studio" component={AIStudio} />
      <Route path="/ai/generator" component={AIStudio} />

      {/* Content Routes */}
      <Route path="/posts" component={PostsList} />
      <Route path="/posts/create" component={CreatePost} />
      <Route path="/posts/scheduled" component={ScheduledPosts} />
      <Route path="/posts/drafts" component={Drafts} />
      <Route path="/posts/:id" component={PostDetail} />
      <Route path="/templates" component={Templates} />

      {/* Scheduler Route */}
      <Route path="/scheduler" component={Scheduler} />

      {/* Connection Routes */}
      <Route path="/connections/social-accounts" component={SocialAccounts} />
      <Route path="/connections/team" component={TeamMembers} />
      <Route path="/connections/integrations" component={Integrations} />
      <Route path="/connections/automation" component={Automation} />
      <Route path="/connections/alerts" component={Alerts} />

      {/* Team & Collaboration Routes */}
      <Route path="/accounts" component={AccountsPage} />
      <Route path="/team" component={TeamPage} />
      <Route path="/approvals" component={ApprovalsPage} />

      {/* Settings Routes */}
      <Route path="/settings/profile" component={Profile} />
      <Route path="/settings/billing" component={Billing} />
      <Route path="/settings/notifications" component={Notifications} />
      <Route path="/settings/preferences" component={Preferences} />

      {/* Help Route */}
      <Route path="/help" component={Help} />

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
