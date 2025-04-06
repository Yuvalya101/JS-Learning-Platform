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

  const normalizeCode = (code) => {
    return code.replace(/\s+/g, " ").trim();
  };

  useEffect(() => {
    // Connect to local server
    socketRef.current = io("http://localhost:5000");

    socketRef.current.emit("join-room", id);

    socketRef.current.on("role", (userRole) => {
      setRole(userRole);
    });

    socketRef.current.on("code-update", (updatedCode) => {
      setCode(updatedCode);
    });

    socketRef.current.on("solution-solved", () => {
      setShowSuccess(true);
    });

    socketRef.current.on("students-count", (count) => {
      setStudents(count);
    });

    socketRef.current.on("mentor-left", () => {
      alert("The mentor has left the room");
      navigate("/");
    });

    fetch(`http://localhost:5000/api/codeblocks/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBlock(data);
        setCode(data.initialCode);
      })
      .catch((err) => console.error("Failed to fetch block:", err));

    return () => {
      socketRef.current.disconnect();
    };
  }, [id, navigate]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socketRef.current.emit("code-change", newCode);

    const normalizedCode = normalizeCode(newCode);
    const normalizedSolution = block ? normalizeCode(block.solution) : "";

    if (block && normalizedCode === normalizedSolution) {
      setShowSuccess(true);
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
