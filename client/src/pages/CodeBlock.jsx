import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import "./CodeBlock.css";

function CodeBlock() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [block, setBlock] = useState(null);
  const [role, setRole] = useState(null);
  const [code, setCode] = useState("");
  const [students, setStudents] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const socketRef = useRef(null);

  // Add normalization function to make the solution check more flexible
  const normalizeCode = (code) => {
    return code.replace(/\s+/g, " ").trim();
  };

  useEffect(() => {
    // Connect to server
    socketRef.current = io("http://localhost:5000");

    // Send room identification
    socketRef.current.emit("join-room", id);

    // Get role
    socketRef.current.on("role", (userRole) => {
      console.log("My role is:", userRole);
      setRole(userRole);
    });

    // Listen for code updates
    socketRef.current.on("code-update", (updatedCode) => {
      setCode(updatedCode);
    });

    // Listen for solution solved
    socketRef.current.on("solution-solved", () => {
      console.log("Solution solved event received");
      setShowSuccess(true);
    });

    // Listen for student count
    socketRef.current.on("students-count", (count) => {
      console.log("Students in room:", count);
      setStudents(count);
    });

    // Listen for mentor leaving
    socketRef.current.on("mentor-left", () => {
      alert("The mentor has left the room");
      navigate("/"); // Back to lobby
    });

    // Fetch data from server
    fetch(`http://localhost:5000/api/codeblocks/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBlock(data);
        setCode(data.initialCode);
      })
      .catch((err) => console.error("Failed to fetch block:", err));

    // Clean up socket connection when leaving the page
    return () => {
      socketRef.current.disconnect();
    };
  }, [id, navigate]);

  // Function to handle code changes with improved solution check
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socketRef.current.emit("code-change", newCode);

    const normalizedCode = normalizeCode(newCode);
    const normalizedSolution = block ? normalizeCode(block.solution) : "";

    // Check if code matches solution (with normalization)
    if (block && normalizedCode === normalizedSolution) {
      console.log("SUCCESS! Showing smiley");
      setShowSuccess(true);
      // Emit solution solved event to all clients in the room
      socketRef.current.emit("solution-solved");
    }
  };

  if (!block) return <div>Loading...</div>;

  return (
    <div className="code-block-container">
      <h1 className="code-block-title">{block.title}</h1>
      <div className="code-block-info">
        <p>Your role: {role || "Loading..."}</p>
        <p>Students in room: {students}</p>
      </div>

      <div className="code-editor">
        <Editor
          height="100%"
          language="javascript"
          theme="vs-dark"
          value={code}
          onChange={handleCodeChange}
          options={{
            readOnly: role === "mentor",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            automaticLayout: true,
          }}
        />
      </div>

      <div className="solution-section">
        {showSuccess && role === "student" ? (
          <>
            <div className="success-emoji">😀</div>
            <p className="success-text">
              Great job! Your code matches the solution!
            </p>
          </>
        ) : (
          <p className="success-text">
            Solution will appear here when solved correctly
          </p>
        )}
      </div>
    </div>
  );
}

export default CodeBlock;
