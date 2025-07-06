import React, { useState, useEffect } from "react";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [quests, setQuests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [newQuest, setNewQuest] = useState({
    title: "",
    description: "",
    duration: 2,
  });
  const [submissionText, setSubmissionText] = useState("");
  const [username, setUsername] = useState("");
  const [adminSecretInput, setAdminSecretInput] = useState("");
  const [adminList] = useState(["Yasir"]); // fixed admin list - no setter needed
  const [creatorPoints, setCreatorPoints] = useState({});
  const [founderPoints, setFounderPoints] = useState({});
  const [timer, setTimer] = useState({});

  // Timer effect to update countdowns
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

  // Format ms to hh:mm:ss
  const formatTime = (ms) => {
    if (ms <= 0) return "⏰ Expired";
    const seconds = Math.floor(ms / 1000);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  // Handle login and role selection
  const handleLogin = (selectedRole) => {
    if (!username) return alert("Please enter your username");
    if (selectedRole === "admin") {
      if (
        adminSecretInput !== "flowpower2025" &&
        !adminList.includes(username)
      ) {
        alert("❌ Invalid admin code or not authorized");
        return;
      }
    }
    setRole(selectedRole);
    setLoggedIn(true);
  };

  // Create a new quest
  const handleCreateQuest = () => {
    if (!newQuest.title || !newQuest.description || !newQuest.duration) {
      alert("Please fill in all quest fields");
      return;
    }
    const expiresAt =
      new Date().getTime() + newQuest.duration * 24 * 60 * 60 * 1000;
    setQuests([...quests, { ...newQuest, expiresAt, creator: username }]);
    setNewQuest({ title: "", description: "", duration: 2 });
    setFounderPoints({
      ...founderPoints,
      [username]: (founderPoints[username] || 0) + 20,
    });
  };

  // Submit for a quest
  const handleSubmit = (index) => {
    if (!submissionText) return alert("Please enter your submission");
    const alreadySubmitted = submissions.find(
      (s) => s.questIndex === index && s.creator === username
    );
    if (alreadySubmitted)
      return alert("You have already submitted for this quest.");
    const newSubmission = {
      questIndex: index,
      content: submissionText,
      creator: username,
    };
    setSubmissions([...submissions, newSubmission]);
    setCreatorPoints({
      ...creatorPoints,
      [username]: (creatorPoints[username] || 0) + 10,
    });
    setSubmissionText("");
  };

  // If not logged in, show welcome screen with "Get Started" button
  if (!loggedIn) {
    return (
      <div
        style={{
          background: "linear-gradient(to right, #8e44ad, #3498db)",
          height: "100vh",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <h1>🌟 Welcome to FlowGuild</h1>
        <p style={{ fontSize: "18px", maxWidth: "400px" }}>
          Create and join quests, build on Flow, earn points, and showcase your
          work to win grants!
        </p>
        <button
          className="btn"
          onClick={() => {
            setRole("select");
            setLoggedIn(true);
          }}
        >
          🚀 Get Started
        </button>
      </div>
    );
  }

  // Role selection screen
  if (loggedIn && role === "select") {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h2>Select your role</h2>
        <input
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginBottom: "10px", padding: "8px", width: "200px" }}
        />
        <br />
        <input
          placeholder="Admin code (if any)"
          value={adminSecretInput}
          onChange={(e) => setAdminSecretInput(e.target.value)}
          style={{ marginBottom: "20px", padding: "8px", width: "200px" }}
        />
        <br />
        <button
          onClick={() => handleLogin("creator")}
          style={{ marginRight: "10px" }}
        >
          🎨 Creator
        </button>
        <button
          onClick={() => handleLogin("founder")}
          style={{ marginRight: "10px" }}
        >
          🧠 Founder
        </button>
        <button onClick={() => handleLogin("admin")}>🛠 Admin</button>
      </div>
    );
  }

  // Main logged-in UI
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>
        Welcome, {username} ({role})
      </h2>

      {role === "founder" && (
        <div style={{ marginBottom: "30px" }}>
          <h3>Create a New Quest</h3>
          <input
            placeholder="Title"
            value={newQuest.title}
            onChange={(e) =>
              setNewQuest({ ...newQuest, title: e.target.value })
            }
            style={{
              display: "block",
              marginBottom: "10px",
              padding: "8px",
              width: "300px",
            }}
          />
          <input
            placeholder="Description"
            value={newQuest.description}
            onChange={(e) =>
              setNewQuest({ ...newQuest, description: e.target.value })
            }
            style={{
              display: "block",
              marginBottom: "10px",
              padding: "8px",
              width: "300px",
            }}
          />
          <input
            type="number"
            placeholder="Duration (days)"
            value={newQuest.duration}
            onChange={(e) =>
              setNewQuest({ ...newQuest, duration: Number(e.target.value) })
            }
            style={{
              display: "block",
              marginBottom: "10px",
              padding: "8px",
              width: "100px",
            }}
            min={1}
          />
          <button onClick={handleCreateQuest}>➕ Post Quest</button>
        </div>
      )}

      <h3>Available Quests</h3>
      {quests.length === 0 && <p>No quests available yet.</p>}

      {quests.map((q, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "5px",
          }}
        >
          <h4>{q.title}</h4>
          <p>{q.description}</p>
          <p>⏳ {formatTime(timer[index])}</p>
          <p>👤 Founder: {q.creator}</p>

          {role === "creator" && timer[index] > 0 && (
            <div>
              <textarea
                placeholder="Your submission"
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "60px",
                  marginBottom: "10px",
                }}
              ></textarea>
              <button onClick={() => handleSubmit(index)}>✅ Submit</button>
            </div>
          )}

          {(role === "founder" || role === "admin") &&
            (role === "founder" ? q.creator === username : true) && (
              <div>
                <h5>Submissions:</h5>
                {submissions.filter((s) => s.questIndex === index).length ===
                  0 && <p>No submissions yet.</p>}
                {submissions
                  .filter((s) => s.questIndex === index)
                  .map((s, i) => (
                    <p key={i}>
                      📩 <strong>{s.creator}</strong>: {s.content}
                    </p>
                  ))}
              </div>
            )}
        </div>
      ))}

      <div>
        <h4>🏆 Points</h4>
        <p>Creators: {creatorPoints[username] || 0}</p>
        <p>Founders: {founderPoints[username] || 0}</p>
      </div>
    </div>
  );
};

export default App;