import { useEffect, useMemo, useRef, useState } from "react"

type Page = "Home" | "Transactions" | "Spending" | "Budgets" | "Bills" | "Monthly Comparison" | "Savings goals" | "Cash flow" | "Trends" | "Notifications" | "Settings" | "Account"

type IconName = "home" | "transactions" | "spending" | "budgets" | "bills" | "compare" | "goals" | "cash" | "trends" | "settings" | "notifications"

const icons: Record<IconName, string> = {
  home: "home",
  transactions: "receipt_long",
  spending: "donut_small",
  budgets: "account_balance_wallet",
  bills: "credit_card",
  compare: "compare_arrows",
  goals: "savings",
  cash: "trending_up",
  trends: "monitoring",
  settings: "settings",
  notifications: "notifications",
}

const primaryNav: Array<[Page, IconName]> = [
  ["Home", "home"],
  ["Transactions", "transactions"],
  ["Spending", "spending"],
  ["Budgets", "budgets"],
  ["Bills", "bills"],
]

const toolsNav: Array<[Page, IconName]> = [
  ["Monthly Comparison", "compare"],
  ["Savings goals", "goals"],
  ["Cash flow", "cash"],
  ["Trends", "trends"],
]

const transactions = [
  [
    "Today · Oct 18",
    "Juniper Coffee",
    "Food",
    "Everyday Checking",
    "Pending",
    "−$6.45",
  ],
  [
    "Oct 17",
    "Fresh Fields Grocery",
    "Food",
    "Platypus Credit Card",
    "Posted",
    "−$84.12",
  ],
  [
    "Oct 17",
    "CityRide",
    "Transportation",
    "Platypus Credit Card",
    "Posted",
    "−$23.80",
  ],
  [
    "Oct 16",
    "Ardent Systems payroll",
    "Income",
    "Everyday Checking",
    "Posted",
    "+$2,145.00",
  ],
  [
    "Oct 15",
    "Northline Transit",
    "Transportation",
    "Everyday Checking",
    "Posted",
    "−$40.00",
  ],
  [
    "Oct 14",
    "StreamBox",
    "Subscriptions",
    "Platypus Credit Card",
    "Posted",
    "−$15.99",
  ],
  [
    "Oct 12",
    "Harbor Electric",
    "Utilities",
    "Everyday Checking",
    "Posted",
    "−$84.30",
  ],
  ["Oct 12", "Taco Lab", "Food", "Platypus Credit Card", "Posted", "−$18.75"],
  [
    "Oct 10",
    "Transfer to Rainy Day Savings",
    "Savings",
    "Everyday Checking",
    "Posted",
    "−$300.00",
  ],
]

const monthData: Record<string, Record<string, number>> = {
  "August 2026": {
    Housing: 1500,
    "Food & Dining": 510,
    Transportation: 205,
    Shopping: 260,
    Utilities: 190,
  },
  "September 2026": {
    Housing: 1500,
    "Food & Dining": 450,
    Transportation: 220,
    Shopping: 300,
    Utilities: 180,
  },
  "October 2026": {
    Housing: 1500,
    "Food & Dining": 580,
    Transportation: 180,
    Shopping: 420,
    Utilities: 200,
  },
  "November 2026": {
    Housing: 1500,
    "Food & Dining": 495,
    Transportation: 230,
    Shopping: 350,
    Utilities: 215,
  },
}

const categoryDetails: Record<string, Array<[string, number, number]>> = {
  "Food & Dining": [
    ["Greenmarket Grocery", 210, 262.4],
    ["Harbor Cafe", 96, 128.5],
    ["Market Hall", 144, 189.1],
  ],
  Transportation: [
    ["CityRide", 80, 65],
    ["Northline Transit", 140, 115],
  ],
}

function Icon({ name }: { name: IconName }) {
  return <MaterialIcon name={icons[name]} />
}

function MaterialIcon({
  name,
  size = "medium",
}: {
  name: string
  size?: "small" | "medium"
}) {
  return (
    <span
      className={`material-symbols-outlined material-icon ${size}`}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}

function Button({
  children,
  onClick,
  kind = "outline",
  disabled,
  className = "",
  title,
}: {
  children: React.ReactNode
  onClick?: () => void
  kind?: "outline" | "primary" | "accent" | "quiet"
  disabled?: boolean
  className?: string
  title?: string
}) {
  return (
    <button
      className={`button ${kind} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  )
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return <section className={`card ${className}`}>{children}</section>
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      className={`switch ${checked ? "on" : ""}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
    >
      <span />
    </button>
  )
}

function PageHeading({
  title,
  action,
  subtitle,
}: {
  title: string
  action?: React.ReactNode
  subtitle?: string
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

function Modal({
  title,
  children,
  onClose,
  primary = "Save changes",
  onPrimary,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
  primary?: string
  onPrimary?: () => void
}) {
  return (
    <div
      className="scrim"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-title">
          <h2 id="modal-title">{title}</h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <MaterialIcon name="close" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          <Button kind="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button kind="primary" onClick={onPrimary ?? onClose}>
            {primary}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Dashboard({
  navigate,
  openBank,
}: {
  navigate: (page: Page) => void
  openBank: () => void
}) {
  return (
    <>
      <PageHeading
        title="Home"
        action={<span className="muted">Sun, Oct 18</span>}
      />
      <button
        className="review-banner"
        onClick={() => navigate("Transactions")}
      >
        <span>
          <strong>Review transactions</strong>
          <small>7 new since Friday · see where your money’s going</small>
        </span>
        <span className="button-label">
          <MaterialIcon name="arrow_forward" size="small" /> Review transactions
        </span>
      </button>
      <div className="dashboard-grid">
        <Card className="spend-card">
          <h3>Current spend this month</h3>
          <div className="display">$2,462</div>
          <small>$143.65 above Sep 1–18</small>
          <div className="chart">
            <img
              src="/assets/203cd.svg"
              alt="October spending rose through the month"
            />
            <img className="line" src="/assets/065ba.svg" alt="" />
          </div>
          <small>October &nbsp;&nbsp;&nbsp;&nbsp; September</small>
          <strong>Payday in 12 days</strong>
        </Card>
        <Card>
          <h3>Accounts</h3>
          {[
            ["Checking", "$3,248.60", ""],
            ["Card balance", "$412.37", "Needs attention"],
            ["Available balance", "$2,739.05", "After bills due before payday"],
            ["Savings", "$6,120.00", ""],
          ].map(([label, value, note]) => (
            <div className="activity-row" key={label}>
              <span>
                <strong>{label}</strong>
                {note && <small>{note}</small>}
              </span>
              <strong>{value}</strong>
            </div>
          ))}
          <small>5 minutes ago · Sync now</small>
          <Button onClick={openBank}>Add account</Button>
        </Card>
        <Card>
          <h3>Your budget · October</h3>
          <small>$2,462.05 of $3,200</small>
          <div className="display small">$737.95 left to spend</div>
          <div className="progress">
            <span style={{ width: "77%" }} />
          </div>
          <small>Under budget · 77% used</small>
          <div className="budget-mini">
            <span>Transportation</span>
            <strong>$28.60 over</strong>
          </div>
          <div className="progress danger">
            <span style={{ width: "100%" }} />
          </div>
          <div className="budget-mini">
            <span>Food</span>
            <strong>$87.82 left</strong>
          </div>
          <div className="progress warning">
            <span style={{ width: "82%" }} />
          </div>
          <Button kind="quiet" onClick={() => navigate("Budgets")}>
            See budget
          </Button>
        </Card>
        <Card>
          <h3>Recent transactions</h3>
          {transactions.slice(0, 4).map((row) => (
            <button
              className="activity-row clickable"
              onClick={() => navigate("Transactions")}
              key={row[1]}
            >
              <span>
                <strong>{row[1]}</strong>
                <small>
                  {row[0]}
                  {row[4] === "Pending" ? " · Pending" : ""}
                </small>
              </span>
              <strong>{row[5]}</strong>
            </button>
          ))}
          <Button kind="quiet" onClick={() => navigate("Transactions")}>
            See more
          </Button>
        </Card>
        <Card>
          <h3>Upcoming bills</h3>
          {[
            ["City Water & Sewer", "$32.18", "Overdue · was due Oct 16"],
            ["Brightwave Internet", "$65.00", "Scheduled · Oct 22"],
            ["Platypus Credit Card", "$412.37", "Pending · Oct 25"],
          ].map(([label, value, note]) => (
            <div className="activity-row" key={label}>
              <span>
                <strong>{label}</strong>
                <small>{note}</small>
              </span>
              <strong>{value}</strong>
            </div>
          ))}
          <Button kind="quiet" onClick={() => navigate("Bills")}>
            See all bills
          </Button>
        </Card>
        <Card>
          <h3>Trends for you</h3>
          <span className="pill">Rising</span>
          <h3>Food spending is going up</h3>
          <p className="body">
            At this pace you’ll spend about $620 on food in October, more than
            your $450 budget.
          </p>
          <Button onClick={() => navigate("Transactions")}>
            View transactions
          </Button>
          <small>From Plaid TrendScore</small>
        </Card>
      </div>
      <h3 className="section-label">More tools</h3>
      <div className="tool-cards">
        {[
          [
            "Recurring & Subscriptions",
            "$359.64 a year in subscriptions",
            "Bills",
          ],
          ["Savings Goals", "Emergency fund is 61%", "Savings goals"],
          [
            "Cash Flow Projection",
            "$4,034.08 projected by Nov 17",
            "Cash flow",
          ],
        ].map(([title, note, page]) => (
          <button
            className="card tool-card"
            onClick={() => navigate(page as Page)}
            key={title}
          >
            <strong>{title}</strong>
            <small>{note}</small>
            <span className="button-label">
              <MaterialIcon name="arrow_forward" size="small" /> View details
            </span>
          </button>
        ))}
      </div>
    </>
  )
}

function TransactionsPage({ toast }: { toast: (message: string) => void }) {
  const [query, setQuery] = useState("")
  const [context, setContext] = useState<{
    x: number
    y: number
    merchant: string
  } | null>(null)
  const filtered = transactions.filter((row) =>
    row.join(" ").toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <>
      <PageHeading
        title="Transactions"
        action={
          <Button onClick={() => toast("Transaction report exported")}>
            <MaterialIcon name="download" size="small" /> Export
          </Button>
        }
      />
      <label className="field wide">
        <span>Search transactions</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Merchant, amount, date or category"
        />
      </label>
      <div className="filters">
        <Button>
          <MaterialIcon name="check" size="small" /> Oct 1–18{" "}
          <MaterialIcon name="arrow_drop_down" size="small" />
        </Button>
        <Button>
          Account <MaterialIcon name="arrow_drop_down" size="small" />
        </Button>
        <Button>
          Category <MaterialIcon name="arrow_drop_down" size="small" />
        </Button>
        <Button>
          Amount <MaterialIcon name="arrow_drop_down" size="small" />
        </Button>
        <Button kind="quiet">
          <MaterialIcon name="filter_alt" size="small" /> Save filter
        </Button>
      </div>
      <small className="muted">
        {filtered.length} transactions · $2,462.05 spent
      </small>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {[
                "Date",
                "Merchant",
                "Category",
                "Account",
                "Status",
                "Amount",
              ].map((item) => (
                <th key={item}>{item}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                tabIndex={0}
                key={row[1]}
                onContextMenu={(e) => {
                  e.preventDefault()
                  setContext({ x: e.clientX, y: e.clientY, merchant: row[1] })
                }}
              >
                {row.map((cell, i) => (
                  <td
                    key={cell}
                    className={
                      i === 5 && cell.startsWith("+") ? "positive" : ""
                    }
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>Daily totals: Oct 17 −$107.92 · Oct 12 −$103.05</span>
        <span>Showing latest activity · Oct 1–18</span>
      </div>
      {context && (
        <div
          className="context-menu"
          style={{ left: context.x, top: context.y }}
          role="menu"
        >
          <strong>{context.merchant}</strong>
          <button onClick={() => setContext(null)}>View details</button>
          <button onClick={() => setContext(null)}>Edit category</button>
        </div>
      )}
    </>
  )
}

function BudgetsPage({ openEdit }: { openEdit: () => void }) {
  const categories = [
    ["Transportation", "$28.60 over", "$148.60 of $120", "danger", 100],
    ["Food", "$87.82 left", "$362.18 of $450", "warning", 82],
    ["Bills", "$465.00 left", "$1,535.00 of $2,000", "", 77],
    ["Savings", "$100.00 left", "$300.00 of $400", "", 75],
    ["Utilities", "$65.70 left", "$84.30 of $150", "", 56],
    ["Subscriptions", "$48.03 left", "$31.97 of $80", "", 40],
  ]
  return (
    <>
      <PageHeading
        title="Budgets"
        action={
          <Button kind="accent" onClick={openEdit}>
            <MaterialIcon name="add" size="small" /> Add budget
          </Button>
        }
      />
      <div className="budget-controls">
        <Button>
          <MaterialIcon name="chevron_left" size="small" /> October 2026
          <MaterialIcon name="chevron_right" size="small" />
        </Button>
        <span />
        <Button>Weekly</Button>
        <Button>
          <MaterialIcon name="check" size="small" /> Monthly
        </Button>
      </div>
      <div className="budget-layout">
        <div>
          <Card>
            <h3>Remaining this month</h3>
            <div className="display">$737.95</div>
            <div className="progress">
              <span style={{ width: "77%" }} />
            </div>
            <div className="key-values">
              <span>Total budget</span>
              <strong>$3,200.00</strong>
              <span>Spent</span>
              <strong>$2,462.05</strong>
              <span>Used</span>
              <strong>77%</strong>
            </div>
            <p>
              <span className="pill danger-text">1 over budget</span>
            </p>
            <p>
              <span className="pill">1 near limit</span>
            </p>
            <p>
              <span className="pill">4 under budget</span>
            </p>
          </Card>
          <Card>
            <h3>Chart legend</h3>
            <p>━ &nbsp; Solid: under</p>
            <p>━ &nbsp; Striped: near limit</p>
            <p>⋯ &nbsp; Hatched: over</p>
          </Card>
        </div>
        <div className="category-list">
          <h3>Categories</h3>
          {categories.map(([name, left, total, tone, width]) => (
            <button className="category-card" key={name} onClick={openEdit}>
              <div>
                <strong>{name}</strong>
                <span
                  className={tone === "danger" ? "danger-text" : "positive"}
                >
                  {left}
                </span>
              </div>
              <div className={`progress ${tone}`}>
                <span style={{ width: `${width}%` }} />
              </div>
              <small>
                {tone === "danger"
                  ? "Over budget"
                  : tone === "warning"
                    ? "Near limit"
                    : "Under budget"}{" "}
                <span>{total}</span>
              </small>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

function BillsPage({ toast }: { toast: (message: string) => void }) {
  const [tab, setTab] = useState<"Upcoming" | "Recurring">("Upcoming")
  return (
    <>
      <PageHeading
        title="Bills"
        action={
          <Button kind="accent" onClick={() => toast("Add bill dialog opened")}>
            <MaterialIcon name="add" size="small" /> Add bill
          </Button>
        }
      />
      <div className="tabs" role="tablist">
        {(["Upcoming", "Recurring"] as const).map((item) => (
          <button
            role="tab"
            aria-selected={tab === item}
            className={tab === item ? "selected" : ""}
            onClick={() => setTab(item)}
            key={item}
          >
            {tab === item && <MaterialIcon name="check" size="small" />}
            {item}
          </button>
        ))}
      </div>
      <div className="bills-layout">
        <div>
          <h3>{tab === "Upcoming" ? "This week" : "Subscriptions"}</h3>
          <div className="table-wrap compact">
            <table>
              <thead>
                <tr>
                  <th>Bill</th>
                  <th>Due date</th>
                  <th>Payment</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(tab === "Upcoming"
                  ? [
                      ["Oak Street Rent", "Oct 20", "Autopay", "$560.00"],
                      ["Metro Electric", "Oct 22", "Scheduled", "$84.30"],
                    ]
                  : [
                      ["StreamBox", "Nov 14", "Autopay", "$15.99"],
                      ["Pulse Fitness", "—", "Paused", "$39.00"],
                    ]
                ).map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell) => (
                      <td key={cell}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3>Later</h3>
          <div className="table-wrap compact">
            <table>
              <thead>
                <tr>
                  <th>Bill</th>
                  <th>Due date</th>
                  <th>Payment</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["CloudVault Storage", "Oct 29", "Autopay", "$2.99"],
                  ["StreamBox", "Nov 14", "Scheduled", "$15.99"],
                  ["Pulse Fitness", "—", "Paused", "$39.00"],
                ].map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell) => (
                      <td key={cell}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <aside>
          <Card>
            <small>Due in the next 30 days</small>
            <div className="display">$734.29</div>
            <small>6 bills scheduled</small>
          </Card>
          <Card className="tinted">
            <h3>October at a glance</h3>
            <div className="activity-row">
              <strong>Oak Street Rent</strong>
              <small>Due Oct 20 · Autopay</small>
            </div>
            <div className="activity-row">
              <strong>Metro Electric</strong>
              <small>Due Oct 22</small>
            </div>
            <small>
              Upcoming and recurring bills are kept together so you can plan
              ahead.
            </small>
          </Card>
          <Button onClick={() => setTab("Recurring")}>
            Manage recurring bills
          </Button>
        </aside>
      </div>
    </>
  )
}

function ComparisonPage({ toast }: { toast: (message: string) => void }) {
  const months = Object.keys(monthData)
  const [monthA, setMonthA] = useState("September 2026")
  const [monthB, setMonthB] = useState("October 2026")
  const [applied, setApplied] = useState({ a: monthA, b: monthB })
  const [expanded, setExpanded] = useState(new Set(["Food & Dining"]))
  const [drawer, setDrawer] = useState<"Data" | "Visual" | null>(null)
  const [draft, setDraft] = useState({
    dollars: true,
    percent: true,
    title: true,
    period: true,
    summary: true,
    compact: false,
    decimals: false,
    activeOnly: false,
  })
  const [settings, setSettings] = useState(draft)
  const dataA = monthData[applied.a]
  const dataB = monthData[applied.b]
  const totalA = Object.values(dataA).reduce((a, b) => a + b, 0)
  const totalB = Object.values(dataB).reduce((a, b) => a + b, 0)
  const fmt = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: settings.decimals ? 2 : 0,
      maximumFractionDigits: settings.decimals ? 2 : 0,
    })
  const toggleExpanded = (category: string) =>
    setExpanded((current) => {
      const next = new Set(current)
      next.has(category) ? next.delete(category) : next.add(category)
      return next
    })
  return (
    <>
      {settings.title && (
        <PageHeading
          title="Monthly Comparison"
          subtitle="Compare your spending across different months."
          action={
            <Button
              kind="primary"
              onClick={() => {
                setDraft(settings)
                setDrawer("Data")
              }}
            >
              <MaterialIcon name="tune" size="small" /> Customize
            </Button>
          }
        />
      )}
      <div className="compare-controls">
        <label className="select-field">
          <span>Period A</span>
          <select value={monthA} onChange={(e) => setMonthA(e.target.value)}>
            {months.map((month) => (
              <option key={month}>{month}</option>
            ))}
          </select>
        </label>
        <span className="swap">
          <MaterialIcon name="swap_horiz" />
        </span>
        <label className="select-field">
          <span>Period B</span>
          <select value={monthB} onChange={(e) => setMonthB(e.target.value)}>
            {months.map((month) => (
              <option key={month}>{month}</option>
            ))}
          </select>
        </label>
        <label className="select-field">
          <span>Categories</span>
          <select>
            <option>All categories (5)</option>
            <option>Active categories</option>
          </select>
        </label>
        <Button
          kind="accent"
          disabled={monthA === monthB}
          onClick={() => {
            setApplied({ a: monthA, b: monthB })
            toast("Comparison report updated")
          }}
        >
          <MaterialIcon name="compare_arrows" size="small" /> Compare
        </Button>
      </div>
      {monthA === monthB && (
        <p className="validation">Select two different months to compare.</p>
      )}
      {settings.summary && (
        <div className="summary-cards">
          <Card>
            <small>Total spending · {applied.a.replace(" 20", " ")}</small>
            <div className="display small">{fmt(totalA)}</div>
          </Card>
          <Card>
            <small>Total spending · {applied.b.replace(" 20", " ")}</small>
            <div className="display small">{fmt(totalB)}</div>
          </Card>
          <Card className={totalB > totalA ? "change-card" : ""}>
            <small>Change</small>
            <div className="display small">
              {totalB - totalA >= 0 ? "+" : "−"}
              {fmt(Math.abs(totalB - totalA))}{" "}
              <span className={totalB > totalA ? "danger-text" : "positive"}>
                {totalB > totalA ? "↑ Up" : "↓ Down"}{" "}
                {Math.abs(((totalB - totalA) / totalA) * 100).toFixed(1)}%
              </span>
            </div>
          </Card>
        </div>
      )}
      <div className={`comparison-table ${settings.compact ? "dense" : ""}`}>
        <div className="comparison-toolbar">
          <small className="button-label">
            <MaterialIcon name="density_medium" size="small" />
            {settings.compact ? "Compact" : "Comfortable"}
          </small>
          <div>
            <h2>Spending by Category</h2>
            {settings.period && (
              <small>
                {applied.a} vs {applied.b}
              </small>
            )}
          </div>
          <span className="table-actions">
            <button className="icon-button" aria-label="Print report">
              <MaterialIcon name="print" size="small" />
            </button>
            <button className="icon-button" aria-label="Download report">
              <MaterialIcon name="download" size="small" />
            </button>
          </span>
        </div>
        <div className="comparison-scroll">
          <table>
            <thead>
              <tr>
                <th>SPENDING CATEGORY</th>
                <th>{applied.a.toUpperCase()}</th>
                <th>{applied.b.toUpperCase()}</th>
                {settings.dollars && <th>$ CHANGE</th>}
                {settings.percent && <th>% CHANGE</th>}
              </tr>
            </thead>
            <tbody>
              {Object.keys(dataA).map((category) => {
                const a = dataA[category],
                  b = dataB[category],
                  diff = b - a,
                  percent = a ? (diff / a) * 100 : 0,
                  isExpanded = expanded.has(category)
                return [
                  <tr
                    className="category-row"
                    tabIndex={0}
                    key={category}
                    onClick={() => toggleExpanded(category)}
                    onContextMenu={(event) => {
                      event.preventDefault()
                      toggleExpanded(category)
                    }}
                  >
                    <td>
                      <span className="chevron">
                        <MaterialIcon
                          name={isExpanded ? "expand_more" : "chevron_right"}
                          size="small"
                        />
                      </span>
                      <strong>{category}</strong>
                    </td>
                    <td>{fmt(a)}</td>
                    <td>{fmt(b)}</td>
                    {settings.dollars && (
                      <td>
                        {diff >= 0 ? "+" : "−"}
                        {fmt(Math.abs(diff))}
                      </td>
                    )}
                    {settings.percent && (
                      <td>
                        <span
                          className={`change-pill ${
                            diff > 0 ? "up" : diff < 0 ? "down" : ""
                          }`}
                        >
                          {diff > 0
                            ? "↑ Up "
                            : diff < 0
                              ? "↓ Down "
                              : "− No change"}
                          {diff !== 0 && `${Math.abs(percent).toFixed(1)}%`}
                        </span>
                      </td>
                    )}
                  </tr>,
                  ...(isExpanded && categoryDetails[category]
                    ? categoryDetails[category].map(
                        ([name, detailA, detailB]) => {
                          const detailDiff = detailB - detailA
                          return (
                            <tr
                              className="detail-row"
                              key={`${category}-${name}`}
                            >
                              <td>{name}</td>
                              <td>{fmt(detailA)}</td>
                              <td>{fmt(detailB)}</td>
                              {settings.dollars && <td>+{fmt(detailDiff)}</td>}
                              {settings.percent && (
                                <td>
                                  <span className="change-pill up">
                                    ↑ Up{" "}
                                    {Math.abs(
                                      (detailDiff / detailA) * 100,
                                    ).toFixed(1)}
                                    %
                                  </span>
                                </td>
                              )}
                            </tr>
                          )
                        },
                      )
                    : []),
                ]
              })}
            </tbody>
            <tfoot>
              <tr>
                <th>Total spending</th>
                <th>{fmt(totalA)}</th>
                <th>{fmt(totalB)}</th>
                {settings.dollars && <th>+{fmt(totalB - totalA)}</th>}
                {settings.percent && (
                  <th>
                    <span className="change-pill up">
                      ↑ Up {(((totalB - totalA) / totalA) * 100).toFixed(1)}%
                    </span>
                  </th>
                )}
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="comparison-footer">
          <span>
            ↑ Up = spent more &nbsp; | &nbsp; ↓ Down = spent less &nbsp; |
            &nbsp; − No change
          </span>
          <span>Expand a category to see the transactions behind it</span>
        </div>
      </div>
      {drawer && (
        <div
          className="drawer-scrim"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setDrawer(null)
          }
        >
          <aside
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Customize comparison report"
          >
            <div className="drawer-title">
              <h2>Customize</h2>
              <button
                className="icon-button"
                onClick={() => setDrawer(null)}
                aria-label="Close customization panel"
              >
                <MaterialIcon name="close" />
              </button>
            </div>
            <div className="drawer-tabs">
              {(["Data", "Visual"] as const).map((tab) => (
                <button
                  className={drawer === tab ? "active" : ""}
                  onClick={() => setDrawer(tab)}
                  key={tab}
                >
                  <MaterialIcon
                    name={tab === "Data" ? "table_chart" : "palette"}
                    size="small"
                  />{" "}
                  {tab}
                </button>
              ))}
            </div>
            <div className="drawer-content">
              {drawer === "Data" ? (
                <>
                  <h3>
                    Categories{" "}
                    <button className="text-action">Select all</button>
                  </h3>
                  <div className="chips">
                    {Object.keys(dataA).map((category) => (
                      <button className="chip selected" key={category}>
                        <MaterialIcon name="check" size="small" /> {category}
                      </button>
                    ))}
                    <button className="chip">
                      <MaterialIcon name="add" size="small" /> Subscriptions
                    </button>
                  </div>
                  <hr />
                  <h3>Show categories</h3>
                  <label>
                    <input
                      type="radio"
                      checked={!draft.activeOnly}
                      onChange={() => setDraft({ ...draft, activeOnly: false })}
                    />{" "}
                    All categories
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={draft.activeOnly}
                      onChange={() => setDraft({ ...draft, activeOnly: true })}
                    />{" "}
                    Only categories with spending
                  </label>
                  <hr />
                  <h3>Columns</h3>
                  <Check
                    label="$ Change"
                    checked={draft.dollars}
                    onChange={() =>
                      setDraft({ ...draft, dollars: !draft.dollars })
                    }
                  />
                  <Check
                    label="% Change"
                    checked={draft.percent}
                    onChange={() =>
                      setDraft({ ...draft, percent: !draft.percent })
                    }
                  />
                  <Check
                    label="Transactions in expanded rows"
                    checked
                    onChange={() => undefined}
                  />
                  <hr />
                  <h3>Number format</h3>
                  <div className="segments">
                    <button
                      className={!draft.decimals ? "selected" : ""}
                      onClick={() => setDraft({ ...draft, decimals: false })}
                    >
                      <MaterialIcon name="check" size="small" /> $1,500
                    </button>
                    <button
                      className={draft.decimals ? "selected" : ""}
                      onClick={() => setDraft({ ...draft, decimals: true })}
                    >
                      $1,500.00
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3>Header</h3>
                  <Check
                    label="Report title"
                    checked={draft.title}
                    onChange={() => setDraft({ ...draft, title: !draft.title })}
                  />
                  <Check
                    label="Reporting period"
                    checked={draft.period}
                    onChange={() =>
                      setDraft({ ...draft, period: !draft.period })
                    }
                  />
                  <Check
                    label="Summary cards"
                    checked={draft.summary}
                    onChange={() =>
                      setDraft({ ...draft, summary: !draft.summary })
                    }
                  />
                  <hr />
                  <h3>Table density</h3>
                  <div className="segments">
                    <button
                      className={!draft.compact ? "selected" : ""}
                      onClick={() => setDraft({ ...draft, compact: false })}
                    >
                      <MaterialIcon name="check" size="small" /> Comfortable
                    </button>
                    <button
                      className={draft.compact ? "selected" : ""}
                      onClick={() => setDraft({ ...draft, compact: true })}
                    >
                      Compact
                    </button>
                  </div>
                  <hr />
                  <h3>Change indicators</h3>
                  <small>
                    Changes always show a sign and a label, so they work without
                    color.
                  </small>
                  <Check
                    label="Arrow icons"
                    checked
                    onChange={() => undefined}
                  />
                  <Check
                    label="Text labels (Up / Down)"
                    checked
                    onChange={() => undefined}
                  />
                  <Check
                    label="Status colors"
                    checked
                    onChange={() => undefined}
                  />
                  <Check
                    label="Patterns in summary cards"
                    checked={false}
                    onChange={() => undefined}
                  />
                  <hr />
                  <h3>Highlight changes over</h3>
                  <select className="drawer-select">
                    <option>10%</option>
                    <option>20%</option>
                  </select>
                </>
              )}
            </div>
            <div className="drawer-actions">
              <Button
                kind="quiet"
                onClick={() => {
                  setDraft(settings)
                  setDrawer(null)
                }}
              >
                Cancel
              </Button>
              <Button
                kind="primary"
                onClick={() => {
                  setSettings(draft)
                  setDrawer(null)
                  toast("Customization applied")
                }}
              >
                Apply changes
              </Button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={onChange} /> {label}
    </label>
  )
}

function SettingsPage({
  openAccount,
  openBank,
}: {
  openAccount: () => void
  openBank: () => void
}) {
  const [contrast, setContrast] = useState(false)
  const [patterns, setPatterns] = useState(true)
  const [values, setValues] = useState(true)
  const [alerts, setAlerts] = useState(true)
  return (
    <>
      <PageHeading title="Settings" />
      <Card className="profile-card">
        <div className="avatar">VL</div>
        <span>
          <strong>Von Lycaon</strong>
          <small>von.lycaon@email.com</small>
        </span>
        <Button onClick={openAccount}>Edit profile</Button>
      </Card>
      <div className="settings-grid">
        <div>
          <Card>
            <h3>Accounts & data</h3>
            <button className="settings-row" onClick={openBank}>
              <span>
                Connected accounts<small>1 needs attention</small>
              </span>
              <span>3</span>
            </button>
            <button className="settings-row">
              <span>Budget categories</span>
            </button>
            <button className="settings-row">
              <span>
                Statement export<small>PDF or CSV</small>
              </span>
            </button>
          </Card>
          <Card>
            <h3>Account</h3>
            {[
              "Password & security",
              "Terms of Use",
              "Privacy Policy",
              "Sign out",
            ].map((item) => (
              <button className="settings-row" key={item}>
                {item}
              </button>
            ))}
            <button className="danger-link">Delete account</button>
          </Card>
        </div>
        <div>
          <Card>
            <h3>Accessibility & display</h3>
            <div className="settings-row">
              <span>Theme</span>
              <span>Light</span>
            </div>
            <div className="settings-row">
              <span>High contrast</span>
              <Switch
                label="High contrast"
                checked={contrast}
                onChange={() => setContrast(!contrast)}
              />
            </div>
            <div className="settings-row">
              <span>
                Chart patterns and icons
                <small>Show status without relying on color</small>
              </span>
              <Switch
                label="Chart patterns and icons"
                checked={patterns}
                onChange={() => setPatterns(!patterns)}
              />
            </div>
            <div className="settings-row">
              <span>Show values on charts</span>
              <Switch
                label="Show values on charts"
                checked={values}
                onChange={() => setValues(!values)}
              />
            </div>
          </Card>
          <Card>
            <h3>Notifications</h3>
            <div className="settings-row">
              <span>Bill reminders</span>
              <span>3 days before</span>
            </div>
            <div className="settings-row">
              <span>Budget alerts</span>
              <Switch
                label="Budget alerts"
                checked={alerts}
                onChange={() => setAlerts(!alerts)}
              />
            </div>
          </Card>
        </div>
      </div>
      <div className="pace-footer">
        <span className="brand-mark">
          <img src="/assets/a19fc.svg" alt="" />
        </span>
        <strong>Pace</strong>
        <small>PROTOTYPE · PLAID SANDBOX</small>
      </div>
    </>
  )
}

function SimpleFeature({
  page,
  navigate,
}: {
  page: Page
  navigate: (page: Page) => void
}) {
  const copy: Partial<Record<Page, [string, string]>> = {
    Spending: [
      "Spending",
      "Your October spending is concentrated in housing and food.",
    ],
    "Savings goals": ["Savings goals", "Your emergency fund is 61% complete."],
    "Cash flow": [
      "Cash flow",
      "You are projected to have $4,034.08 available by Nov 17.",
    ],
    Trends: [
      "Trends",
      "Food spending is rising while transportation spending is down.",
    ],
    Notifications: ["Notifications", "You have 3 updates that need attention."],
  }
  const [title, note] = copy[page] ?? [page, ""]
  return (
    <>
      <PageHeading title={title} />
      <Card className="feature-hero">
        <span className="pill">October overview</span>
        <div className="display">
          {page === "Savings goals"
            ? "$6,120"
            : page === "Cash flow"
              ? "$4,034.08"
              : "$2,462"}
        </div>
        <p className="body">{note}</p>
        <div className="feature-chart">
          {[48, 65, 42, 78, 58, 88, 72, 94].map((height, index) => (
            <span key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
        <Button
          onClick={() =>
            navigate(page === "Savings goals" ? "Settings" : "Transactions")
          }
        >
          {page === "Savings goals" ? "Manage goal" : "View transactions"}
        </Button>
      </Card>
    </>
  )
}

function AppShell() {
  const [page, setPage] = useState<Page>("Home")
  const [history, setHistory] = useState<Page[]>([])
  const [collapsed, setCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState<"bank" | "budget" | "account" | null>(null)
  const [toastMessage, setToastMessage] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)
  const toast = (message: string) => {
    setToastMessage(message)
    window.setTimeout(() => setToastMessage(""), 2600)
  }
  const navigate = (next: Page) => {
    if (next !== page) setHistory((items) => [...items.slice(-8), page])
    setPage(next)
    setSearchOpen(false)
  }
  const back = () => {
    const previous = history.at(-1)
    if (previous) {
      setPage(previous)
      setHistory((items) => items.slice(0, -1))
    }
  }
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey
      if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setSearchOpen(true)
        requestAnimationFrame(() => searchRef.current?.focus())
      }
      if (mod && event.key.toLowerCase() === "s") {
        event.preventDefault()
        toast("Changes saved")
      }
      if (event.key === "Escape") {
        setModal(null)
        setSearchOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [page])
  const searchResults = useMemo(
    () =>
      [
        "Transactions",
        "Budgets",
        "Bills",
        "Monthly Comparison",
        "Settings",
      ].filter((item) => item.toLowerCase().includes(search.toLowerCase())),
    [search],
  )
  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <img src="/assets/a19fc.svg" alt="" />
          </span>
          <strong>Pace</strong>
        </div>
        <nav aria-label="Primary">
          {primaryNav.map(([label, icon]) => (
            <button
              className={page === label ? "active" : ""}
              onClick={() => navigate(label)}
              key={label}
            >
              <Icon name={icon} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <small className="nav-label">TOOLS</small>
        <nav aria-label="Tools">
          {toolsNav.map(([label, icon]) => (
            <button
              className={page === label ? "active" : ""}
              onClick={() => navigate(label)}
              key={label}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {label === "Monthly Comparison" && <b className="new">New</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <nav aria-label="Account">
          <button
            className={page === "Notifications" ? "active" : ""}
            onClick={() => navigate("Notifications")}
          >
            <Icon name="notifications" />
            <span>Notifications</span>
            <b className="unread">3</b>
          </button>
          <button
            className={page === "Settings" ? "active" : ""}
            onClick={() => navigate("Settings")}
          >
            <Icon name="settings" />
            <span>Settings</span>
          </button>
        </nav>
        <button className="profile" onClick={() => navigate("Account")}>
          <span className="avatar">VL</span>
          <span>
            <strong>Von Lycaon</strong>
            <small>von.lycaon@email.com</small>
          </span>
        </button>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="collapse-button"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <MaterialIcon name="menu" />
            </button>
            {history.length > 0 && (
              <button className="back-button" onClick={back}>
                <MaterialIcon name="arrow_back" size="small" /> Back
              </button>
            )}
            <span>
              {toolsNav.some(([item]) => item === page) ? "Tools" : "Overview"}
            </span>
            <MaterialIcon name="chevron_right" size="small" />
            <strong>{page}</strong>
          </div>
          <div className="header-actions">
            <button
              className="global-search"
              onClick={() => setSearchOpen(true)}
            >
              <MaterialIcon name="search" size="small" />
              Search transactions, bills, budgets <kbd>Ctrl K</kbd>
            </button>
            <button
              className="icon-button"
              onClick={() => navigate("Notifications")}
              aria-label="Notifications"
            >
              <MaterialIcon name="notifications" />
            </button>
          </div>
        </header>
        <div className="page-content">
          {page === "Home" && (
            <Dashboard navigate={navigate} openBank={() => setModal("bank")} />
          )}
          {page === "Transactions" && <TransactionsPage toast={toast} />}
          {page === "Budgets" && (
            <BudgetsPage openEdit={() => setModal("budget")} />
          )}
          {page === "Bills" && <BillsPage toast={toast} />}
          {page === "Monthly Comparison" && <ComparisonPage toast={toast} />}
          {page === "Settings" && (
            <SettingsPage
              openAccount={() => setModal("account")}
              openBank={() => setModal("bank")}
            />
          )}
          {[
            "Spending",
            "Savings goals",
            "Cash flow",
            "Trends",
            "Notifications",
          ].includes(page) && <SimpleFeature page={page} navigate={navigate} />}
          {page === "Account" && (
            <SettingsPage
              openAccount={() => setModal("account")}
              openBank={() => setModal("bank")}
            />
          )}
        </div>
        <footer className="statusbar">
          <span>Ready</span>
          <span>Last updated 5 minutes ago</span>
          <span>● Accounts connected</span>
          <span>Sync complete</span>
        </footer>
      </main>
      {searchOpen && (
        <div
          className="search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Global search"
        >
          <div className="search-panel">
            <label>
              <MaterialIcon name="search" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search PACE"
              />
              <kbd>Esc</kbd>
            </label>
            <small>Quick destinations</small>
            {searchResults.map((result) => (
              <button onClick={() => navigate(result as Page)} key={result}>
                <span>{result}</span>
                <kbd>Enter</kbd>
              </button>
            ))}
          </div>
        </div>
      )}
      {modal === "bank" && (
        <Modal
          title="Connect a bank account"
          primary="Continue securely"
          onClose={() => setModal(null)}
          onPrimary={() => {
            setModal(null)
            toast("Bank connection simulated")
          }}
        >
          <p>
            PACE uses a secure connection to read balances and transactions.
            This course prototype uses consistent sample data and does not
            connect to a live bank.
          </p>
          <label className="field">
            <span>Institution</span>
            <select defaultValue="">
              <option value="" disabled>
                Select your bank
              </option>
              <option>Northstar Bank</option>
              <option>Community Credit Union</option>
            </select>
          </label>
        </Modal>
      )}
      {modal === "budget" && (
        <Modal
          title="Edit budget information"
          onClose={() => setModal(null)}
          onPrimary={() => {
            setModal(null)
            toast("Budget changes saved")
          }}
        >
          <label className="field">
            <span>Category</span>
            <select>
              <option>Food</option>
              <option>Transportation</option>
              <option>Utilities</option>
            </select>
          </label>
          <label className="field">
            <span>Monthly limit</span>
            <input defaultValue="$450.00" />
          </label>
        </Modal>
      )}
      {modal === "account" && (
        <Modal
          title="Edit profile"
          onClose={() => setModal(null)}
          onPrimary={() => {
            setModal(null)
            toast("Profile updated")
          }}
        >
          <label className="field">
            <span>Full name</span>
            <input defaultValue="Von Lycaon" />
          </label>
          <label className="field">
            <span>Email</span>
            <input defaultValue="von.lycaon@email.com" />
          </label>
        </Modal>
      )}
      <div
        className={`toast ${toastMessage ? "show" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toastMessage}
      </div>
    </div>
  )
}

export default function App() {
  return <AppShell />
}
