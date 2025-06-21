import { useState, useEffect, useMemo } from "react";
import "../../style/Search.css";
import { FiMic } from 'react-icons/fi';
import { useRef } from "react";

const Search = ({
  data,
  setFilteredData,
  searchFields = [],
  placeholder = "search...",
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const recognitionRef = useRef(null);

  const memoizedSearchFields = useMemo(
    () => searchFields,
    [JSON.stringify(searchFields)]
  );

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return data;
    }

    return data.filter((item) => {
      return memoizedSearchFields.some((field) => {
        const value = item[field];
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
    });
  }, [searchTerm, data, memoizedSearchFields]);

  useEffect(() => {
    setFilteredData(filteredData);
  }, [filteredData, setFilteredData]);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Your browser does not support speech recognition");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  return (
    <div className={`search-container ${className}`}>
      <div className="search-input-wrapper">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />
        <button className="mic-button" onClick={startListening}>
          <FiMic />
        </button>
      </div>
    </div>
  );
};

export default Search;
