import { useEffect, useState } from "react";
import { SignIn, ConnectBank } from "./screens/AuthScreens";
import Onboarding from "./screens/Screen1310";
import Accounts from "./screens/Screen1203";
import Home from "./screens/Screen942";
import Transactions from "./screens/Screen858";
import TransactionDetail from "./screens/Screen784";
import Budgets from "./screens/Screen524";
import BudgetDetail from "./screens/Screen413";
import Spending from "./screens/Screen308";
import Bills from "./screens/Screen229";
import Recurring from "./screens/Screen151";
import Savings from "./screens/Screen1751";
import Notifications from "./screens/Screen1674";
import Settings from "./screens/Screen1525";
import CashFlow from "./screens/Screen1426";
import TrendScore from "./screens/Screen1364";
import TabletOnboarding from "./tablet/Tablet2197";
import TabletBank from "./tablet/Tablet2272";
import TabletAccounts from "./tablet/Tablet2353";
import TabletHome from "./tablet/Tablet2893";
import TabletTransactions from "./tablet/Tablet2442";
import TabletTransactionDetail from "./tablet/Tablet2604";
import TabletBudgets from "./tablet/Tablet2701";
import TabletBudgetDetail from "./tablet/Tablet3664";
import TabletSpending from "./tablet/Tablet3775";
import TabletBills from "./tablet/Tablet3880";
import TabletRecurring from "./tablet/Tablet3961";
import TabletSavings from "./tablet/Tablet3233";
import TabletNotifications from "./tablet/Tablet3317";
import TabletSettings from "./tablet/Tablet3398";
import TabletCashFlow from "./tablet/Tablet3563";
import TabletTrendScore from "./tablet/Tablet3169";

type Screen = "signin"|"onboarding"|"bank"|"onboardingAccounts"|"accounts"|"home"|"transactions"|"transaction"|"budgets"|"budget"|"spending"|"bills"|"recurring"|"savings"|"notifications"|"settings"|"cashflow"|"trends"|"trendscore";
const screens: Record<Screen, React.ComponentType> = { signin:SignIn, onboarding:Onboarding, bank:ConnectBank, onboardingAccounts:Accounts, accounts:Accounts, home:Home, transactions:Transactions, transaction:TransactionDetail, budgets:Budgets, budget:BudgetDetail, spending:Spending, bills:Bills, recurring:Recurring, savings:Savings, notifications:Notifications, settings:Settings, cashflow:CashFlow, trends:Spending, trendscore:TrendScore };
const tabletScreens: Record<Screen, React.ComponentType> = {
  signin: SignIn,
  onboarding: TabletOnboarding,
  bank: TabletBank,
  onboardingAccounts: TabletAccounts,
  accounts: TabletAccounts,
  home: TabletHome,
  transactions: TabletTransactions,
  transaction: TabletTransactionDetail,
  budgets: TabletBudgets,
  budget: TabletBudgetDetail,
  spending: TabletSpending,
  bills: TabletBills,
  recurring: TabletRecurring,
  savings: TabletSavings,
  notifications: TabletNotifications,
  settings: TabletSettings,
  cashflow: TabletCashFlow,
  trends: TabletSpending,
  trendscore: TabletTrendScore,
};

export default function App() {
  const [isTablet, setIsTablet] = useState(() => matchMedia("(min-width: 700px)").matches);
  const [screen, setScreen] = useState<Screen>(() => (location.hash.slice(1) as Screen) || "signin");
  const [history, setHistory] = useState<Screen[]>([]);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = (next: Screen, replace = false) => {
    if (next === screen) return;
    if (!replace) setHistory(h => [...h, screen]);
    setScreen(next); location.hash = next; window.scrollTo({top:0, behavior:"instant"});
  };
  const back = () => setHistory(h => { const next = h.at(-1) || "home"; setScreen(next); location.hash = next; return h.slice(0,-1); });
  useEffect(() => { const fn=()=>{ const next=location.hash.slice(1) as Screen; if (screens[next] && next!==screen) setScreen(next); }; addEventListener("hashchange",fn); return()=>removeEventListener("hashchange",fn); },[screen]);
  useEffect(() => {
    const media = matchMedia("(min-width: 700px)");
    const update = () => setIsTablet(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => { const input=document.querySelector<HTMLInputElement>('input[aria-label="Password"]'); if(input) input.type=passwordVisible?"text":"password"; },[passwordVisible,screen]);

  const activate = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const named = target.closest<HTMLElement>("[data-name]");
    const namedPath: HTMLElement[] = [];
    for (let element: HTMLElement | null = target; element; element = element.parentElement) {
      if (element.dataset.name) namedPath.push(element);
    }
    const names = namedPath.map((element) => element.dataset.name || "").join(" ").toLowerCase();
    const text = (target.closest("button")?.textContent || named?.textContent || target.textContent || "").replace(/\s+/g," ").trim().toLowerCase();
    const nav = target.closest<HTMLElement>('[data-name="Navigation destination"]');
    const navText = nav?.textContent?.trim().toLowerCase();
    if (navText === "home") return navigate("home");
    if (navText === "transactions") return navigate("transactions");
    if (navText === "spending") return navigate("spending");
    if (navText === "budgets") return navigate("budgets");
    if (navText === "bills") return navigate("bills");
    if (names.includes("arrow-left") || names.includes("backbutton") || names.includes("back-btn") || names.includes("leading icon")) return back();
    if (names.includes("show-password")) return setPasswordVisible(v=>!v);

    if (screen === "signin") {
      if (text.includes("create account") || text.includes("continue with")) return navigate("onboarding");
      if (text === "sign in") return navigate("home");
    }
    if (screen === "onboarding" && (text.includes("continue") || text === "skip")) return navigate("bank");
    if (screen === "bank" && (text.includes("connect with plaid") || text.includes("not now"))) return navigate("onboardingAccounts");
    if (screen === "onboardingAccounts" && (text.includes("reconnect") || text.includes("not now"))) return navigate("home");
    if (screen === "onboardingAccounts" && (text.includes("link another account") || text.includes("add account"))) return navigate("bank");
    if (screen === "accounts" && (text.includes("reconnect") || text.includes("not now"))) return navigate("home");
    if (screen === "accounts" && (text.includes("link another account") || text.includes("add account"))) return navigate("bank");
    if (screen === "home") {
      if (text.includes("add account")) return navigate("bank");
      if (names.includes("settings")) return navigate("settings");
      if (names.includes("receipt-text") || names.includes("bell")) return navigate("notifications");
      if (names.includes("review-banner") || names.includes("txn-") || names.includes("see-more-txn") || names.includes("transactions-header")) return navigate("transactions");
      if (names.includes("budget-food") || names.includes("budget-transportation") || names.includes("budget-cat-")) return navigate("budget");
      if (names.includes("budget-header")) return navigate("budgets");
      if (names.includes("bill-") || names.includes("bills-header") || names.includes("tool-1") || names.includes("tool-card-1")) return navigate("bills");
      if (names.includes("trends-header")) return navigate("trendscore");
      if (names.includes("trend-card")) return navigate("trends");
      if (names.includes("tool-2") || names.includes("tool-card-2")) return navigate("savings");
      if (names.includes("tool-3") || names.includes("tool-card-3")) return navigate("cashflow");
      if (names.includes("spending-card") || names.includes("spend-card")) return navigate("spending");
      if (names.includes("account-") || names.includes("acct-row") || names.includes("accounts-card")) return navigate("accounts");
    }
    if (screen === "transactions" && (names.includes("transaction card") || names.includes("list item") || names.includes("tx-"))) return navigate("transaction");
    if (screen === "transaction" && text.includes("food")) return navigate("budget");
    if (screen === "budgets" && (names.includes("budget category") || names.includes("cat-"))) return navigate("budget");
    if (screen === "budget" && names.includes("transaction")) return navigate("transaction");
    if ((screen === "spending" || screen === "trends") && names.includes("spending category")) return navigate("transactions");
    if (screen === "bills" && text.includes("recurring")) return navigate("recurring");
    if (screen === "recurring" && text.includes("upcoming")) return navigate("bills");
    if (screen === "notifications") {
      if (names.includes("x-circle") || names.includes("close-btn")) return back();
      if (text.includes("view bill")) return navigate("bills");
      if (text.includes("transportation")) return navigate("budget");
      if (text.includes("food")) return navigate("budget");
    }
    if (screen === "settings") {
      if (names.includes("x-circle") || names.includes("close-btn")) return back();
      if (names.includes("row-connected")) return navigate("accounts");
      if (names.includes("row-budget-cat")) return navigate("budgets");
      if (names.includes("row-signout")) return navigate("signin", true);
    }
    if (screen === "trendscore") {
      if (names.includes("card-food")) return navigate("transactions");
      if (names.includes("card-ride")) return navigate("transactions");
      if (names.includes("card-income")) return navigate("transactions");
      if (names.includes("card-subs")) return navigate("recurring");
    }
    if (text.includes("add account")) return navigate("bank");
    if (text.includes("view transactions") || text.includes("see more")) return navigate("transactions");
    if (text.includes("see budget")) return navigate("budgets");
    if (text.includes("see all bills")) return navigate("bills");
    if (text.includes("see all trends")) return navigate("trendscore");
  };
  const ScreenView = (isTablet ? tabletScreens : screens)[screen] || SignIn;
  return <div className={`prototype ${isTablet ? "tablet-canvas" : "mobile-canvas"}`} onClick={activate}><ScreenView /></div>;
}
