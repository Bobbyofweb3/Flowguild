import React, { useState, useEffect } from "react";
import "./styles.css";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("loggedIn") === "true"
  );
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [adminSecretInput, setAdminSecretInput] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [questForm, setQuestForm] = useState({ title: "", description: "", expiresIn: 2 });
  const [quests, setQuests] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [adminList, setAdminList] = useState(["bobby"]);
  const [timer, setTimer] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const updates = {};
      quests.forEach((quest, index) => {
        const timeLeft = quest.expiresAt - now;
        updates[index] = timeLeft > 0 ? timeLeft : 0;
      });
      setTimer(updates);
    }, 1000);
    return () => clearInterval(interval);
  }, [quests]);

  const formatTime = (ms) => {
    if (ms <= 0) return "⏰ Expired";
    const seconds = Math.floor(ms / 1000);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const handleLogin = (selectedRole) => {
    if (!username) return alert("Please enter your username");
    if (selectedRole === "admin") {
      if (adminSecretInput !== "flowpower2025" && !adminList.includes(username)) {
        alert("❌ Invalid admin code or not authorized");
        return;
      }
    }
    setRole(selectedRole);
    setLoggedIn(true);
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("role", selectedRole);
    localStorage.setItem("username", username);
  };

  const createQuest = () => {
    const now = new Date().getTime();
    const expiresAt = now + questForm.expiresIn * 24 * 60 * 60 * 1000;
    setQuests([...quests, { ...questForm, expiresAt, createdBy: username }]);
    setQuestForm({ title: "", description: "", expiresIn: 2 });
  };

  const submitQuest = (index, response) => {
    if (submissions[`${username}_${index}`]) return alert("You already submitted!");
    setSubmissions({ ...submissions, [`${username}_${index}`]: response });
  };

  const getSubmissionsForQuest = (index) => {
    return Object.entries(submissions).filter(([key]) => key.endsWith(`_${index}`));
  };

  if (!loggedIn && !showLogin) {
    return (
      <div className="landing">
        <h1>🌟 Welcome to FlowGuild</h1>
        <p>Quests. Points. Prizes. Built for Web3 Creators.</p>
        <button onClick={() => setShowLogin(true)}>🚀 Get Started</button>
      </div>
    );
  }

  return (
    <div className="app">
      {!loggedIn && showLogin && (
        <div className="login-box">
          <h2>Login to FlowGuild</h2>
          <input
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="role-buttons">
            <button onClick={() => handleLogin("creator")}>Login as Creator</button>
            <button onClick={() => handleLogin("founder")}>Login as Founder</button>
            <div className="admin-section">
              <input
                type="password"
                placeholder="Admin Code (if admin)"
                value={adminSecretInput}
                onChange={(e) => setAdminSecretInput(e.target.value)}
              />
              <button onClick={() => handleLogin("admin")}>Login as Admin</button>
            </div>
          </div>
        </div>
      )}

      {loggedIn && (
        <div>
          <h2>Hello {username} 👋</h2>
          <p className="role-tag">Role: {role.toUpperCase()}</p>

          {role === "founder" && (
            <div className="founder-box">
              <h3>Create a Quest</h3>
              <input
                placeholder="Title"
                value={questForm.title}
                onChange={(e) => setQuestForm({ ...questForm, title: e.target.value })}
              />
              <textarea
                placeholder="Description"
                value={questForm.description}
                onChange={(e) => setQuestForm({ ...questForm, description: e.target.value })}
              />
              <input
                type="number"
                placeholder="Expires in (days)"
                value={questForm.expiresIn}
                onChange={(e) => setQuestForm({ ...questForm, expiresIn: e.target.value })}
              />
              <button onClick={createQuest}>✅ Publish Quest</button>
            </div>
          )}

          <div>
            <h3>Available Quests</h3>
            {quests.map((quest, index) => (
              <div key={index} className="quest-card">
                <h4>{quest.title}</h4>
                <p>{quest.description}</p>
                <p>⏳ Time left: {formatTime(timer[index])}</p>
                <p>🏆 Founder: {quest.createdBy}</p>

                {role === "creator" && (
                  !submissions[`${username}_${index}`] ? (
                    <div>
                      <textarea
                        placeholder="Your submission"
                        onChange={(e) =>
                          setSubmissions({
                            ...submissions,
                            [`${username}_${index}`]: e.target.value
                          })}
                      />
                      <button onClick={() =>
                        submitQuest(index, submissions[`${username}_${index}`])
                      }>
                        Submit ✍️
                      </button>
                    </div>
                  ) : (
                    <p>✅ Submission received</p>
                  )
                )}

                {role === "founder" && quest.createdBy === username && (
                  <div>
                    <h5>Submissions:</h5>
                    <ul>
                      {getSubmissionsForQuest(index).map(([key, response]) => (
                        <li key={key}>
                          {key.split("_")[0]}: {response}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {role === "admin" && (
                  <div>
                    <h5>All Submissions:</h5>
                    <ul>
                      {getSubmissionsForQuest(index).map(([key, response]) => (
                        <li key={key}>
                          {key.split("_")[0]}: {response}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;