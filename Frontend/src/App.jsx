import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("income");

  const [summary, setSummary] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.status !== 200) {
        setMessage(data);
        return;
      }

      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
      setMessage("Login successful");
    } catch (err) {
      setMessage("Login failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setMessage("Logged out");
  };

  const handleAddEntry = async () => {
    const token = localStorage.getItem("token");

    if (!amount || !category) {
      setMessage("Fill all fields");
      return;
    }

    await fetch("http://localhost:5000/entry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        type,
        amount: Number(amount),
        category
      })
    });

    setMessage("Entry added");
    setAmount("");
    setCategory("");
  };

  const getSummary = async (range) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/summary?range=${range}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    setSummary(data);
  };

  return (
    <div className="container">
      <h1>💰 Expense Tracker</h1>

      {message && <p className="message">{message}</p>}

      {!isLoggedIn ? (
        <div className="card">
          <h2>Login</h2>

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <button className="logout" onClick={handleLogout}>
            Logout
          </button>

          <div className="card">
            <h2>Add Entry</h2>

            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <input
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <input
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />

            <button onClick={handleAddEntry}>Add Entry</button>
          </div>

          <div className="card">
            <h2>Summary</h2>

            <div className="btn-group">
              <button onClick={() => getSummary("today")}>Today</button>
              <button onClick={() => getSummary("week")}>Week</button>
              <button onClick={() => getSummary("month")}>Month</button>
            </div>

            {summary && (
              <div className="summary">
                <p>Income: ₹{summary.income}</p>
                <p>Expense: ₹{summary.expense}</p>
                <p className="profit">Profit: ₹{summary.profit}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;