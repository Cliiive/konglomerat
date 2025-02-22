import { useEffect, useState } from "react";

export default function useCSV() {
  const [data, setData] = useState([]);

  function decodeHTMLEntities(str) {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  }

  useEffect(() => {
    fetch("/konglomerat/emojis.csv") // Adjust path if needed
      .then((response) => response.text())
      .then((text) => {
        const lines = text.split("\n").slice(1); // drop header
        const parsed = lines.map((line, index) => {
          const [rawEmoji] = line.split(";");
          return {
            id: index,
            Emoji: decodeHTMLEntities(rawEmoji.trim()),
          };
        });
        setData(parsed);
      })
      .catch((error) => console.error(error));
  }, []);

  return data;
}
