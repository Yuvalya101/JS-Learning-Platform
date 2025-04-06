import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Lobby.css";

export default function Lobby() {
  const [blocks, setBlocks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/codeblocks")
      .then((res) => res.json())
      .then((data) => setBlocks(data))
      .catch((err) => console.error("Failed to fetch code blocks:", err));
  }, []);

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
