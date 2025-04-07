import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Lobby.css";

export default function Lobby() {
  const [blocks, setBlocks] = useState([]);
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    console.log("VITE_API_URL:", backendUrl); // ✅ בדיקת כתובת

    fetch(`${backendUrl}/api/codeblocks`)
      .then((res) => {
        console.log("Response status:", res.status); // ✅ בדיקת סטטוס
        return res.json();
      })
      .then((data) => {
        console.log("Fetched data:", data); // ✅ בדיקת מה הגיע מהשרת
        setBlocks(data);
      })
      .catch((err) => console.error("Failed to fetch code blocks:", err));
  }, [backendUrl]);

  return (
    <div className="lobby-container">
      <h1 className="lobby-title">JS Coding Playground</h1>
      <ul className="code-blocks-list">
        {blocks.map((block) => (
          <li key={block._id} className="code-block-item">
            <button
              className="code-block-button"
              onClick={() => navigate(`/codeblock/${block._id}`)}
            >
              {block.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
