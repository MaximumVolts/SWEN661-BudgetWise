const A = "/assets";

export function SignIn() {
  return <main className="auth-screen" data-name="01 · Sign In">
    <div className="brand"><span className="brand-mark"><img src={`${A}/18e9b.svg`} alt="" /></span><b>Pace</b></div>
    <section className="auth-copy"><h1>Your money, at your pace.</h1><p>Connect your accounts once, and Pace automatically keeps track of your spending, budgets, and bills.</p></section>
    <section className="auth-form">
      <label><span>Email</span><input aria-label="Email" defaultValue="von.lycaon@email.com" /></label>
      <label><span>Password</span><div className="password"><input aria-label="Password" type="password" defaultValue="pacesecure12"/><button type="button" aria-label="Show password" data-name="show-password"><img src={`${A}/fd533.svg`} alt="" /></button></div></label>
      <button className="text-action">Forgot password?</button>
      <button className="primary">Sign in</button>
      <div className="or"><i/>or<i/></div>
      <button className="outline">Continue with Google</button>
      <button className="outline">Continue with Apple</button>
    </section>
    <div className="account-prompt"><span>New to Pace?</span><button>Create account</button></div>
  </main>
}

export function ConnectBank() {
  return <main className="bank-screen" data-name="03 · Connect Bank">
    <header className="screen-header"><button data-name="arrow-left" aria-label="Back">←</button><b>Connect your bank</b></header>
    <section className="bank-content">
      <div><h1>Bring your accounts together</h1><p>Securely connect your bank to see spending, bills, budgets and cash flow in one place.</p></div>
      <div className="security-card">
        {[['7ff21.svg','Pace never sees your bank login','You sign in through Plaid. Pace never stores your username or password.'],['d3457.svg','Read-only access',"Pace sees balances and transactions. It can't move your money."],['0ee99.svg','Encrypted in transit and at rest',"Your financial data is protected wherever it's sent or stored."]].map(([icon,title,copy])=><div className="security-row" key={title}><span><img src={`${A}/${icon}`} alt=""/></span><div><b>{title}</b><p>{copy}</p></div></div>)}
      </div>
      <div className="bank-actions"><button className="primary"><img src={`${A}/a5708.svg`} alt=""/>Connect with Plaid</button><button>Not now</button></div>
    </section>
  </main>
}
