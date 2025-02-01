import React, { useState, useRef, useCallback } from 'react';
import { diffWords } from "diff";
import debounce from 'lodash.debounce';
import './FileUpload.css'; // External CSS for better styling

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
const MAX_RETRIES = 3;

const FileUpload = () => {
    const [text1, setText1] = useState('');
    const [text2, setText2] = useState('');
    const [loading1, setLoading1] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [progress1, setProgress1] = useState(0);
    const [progress2, setProgress2] = useState(0);
    const [highlightedText1, setHighlightedText1] = useState("");
    const [highlightedText2, setHighlightedText2] = useState("");
    const [darkMode, setDarkMode] = useState(false);
    const abortController = useRef(null);

    const debouncedSetText1 = useCallback(debounce(setText1, 300), []);
    const debouncedSetText2 = useCallback(debounce(setText2, 300), []);

    const readFileInChunks = async (file, setText, setLoading, setProgress) => {
        setLoading(true);
        setProgress(0);

        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        let content = '';

        for (let chunk = 0; chunk < totalChunks; chunk++) {
            const start = chunk * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const blob = file.slice(start, end);

            let retries = 0;
            while (retries < MAX_RETRIES) {
                try {
                    const text = await readChunk(blob);
                    content += text;
                    setText(prevText => prevText + text); // Incrementally update the textarea
                    break; // Exit retry loop on success
                } catch (error) {
                    retries++;
                    if (retries === MAX_RETRIES) {
                        console.error('Error reading chunk:', error);
                        setLoading(false);
                        return;
                    }
                }
            }

            const progress = Math.round((chunk + 1) / totalChunks * 100);
            setProgress(progress);
        }

        setLoading(false);
    };

    const readChunk = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(blob);
        });
    };

    const handleFileUpload = async (e, setText, setLoading, setProgress) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            await readFileInChunks(file, setText, setLoading, setProgress);
        } catch (error) {
            console.error('Error reading file:', error);
            setLoading(false);
        }
    };

    const compareText = () => {
        if (!text1 || !text2) return;

        const diff1 = diffWords(text1, text2);
        const diff2 = diffWords(text2, text1);

        const formatDiff = (diffArray) => {
            return diffArray.map((part, index) => {
                let backgroundColor = part.added ? 'lightgreen' : part.removed ? 'lightcoral' : 'transparent';
                return `<span key=${index} style="background-color: ${backgroundColor}; padding: 2px; border-radius: 3px;">${part.value}</span>`;
            }).join("");
        };

        setHighlightedText1(formatDiff(diff1));
        setHighlightedText2(formatDiff(diff2));
    };

    return (
        <div className={`container ${darkMode ? "dark-mode" : ""}`}>
            <h2>📄 File Comparison Tool</h2>

            {/* Dark Mode Toggle */}
            <button className="toggle-mode" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>

            <div className="file-inputs">
                <div>
                    <input type="file" onChange={(e) => handleFileUpload(e, debouncedSetText1, setLoading1, setProgress1)} />
                    {loading1 && <div className="loader"></div>}
                </div>
                <div>
                    <input type="file" onChange={(e) => handleFileUpload(e, debouncedSetText2, setLoading2, setProgress2)} />
                    {loading2 && <div className="loader"></div>}
                </div>
            </div>

            <div className="textareas">
                <div>
                    <h3>📄 File 1 / Text 1</h3>
                    <textarea
                        value={text1}
                        onChange={(e) => setText1(e.target.value)}
                        placeholder="Paste or upload text"
                    />
                    <div dangerouslySetInnerHTML={{ __html: highlightedText1 }} className="highlighted-text" />
                </div>

                <div>
                    <h3>📄 File 2 / Text 2</h3>
                    <textarea
                        value={text2}
                        onChange={(e) => setText2(e.target.value)}
                        placeholder="Paste or upload text"
                    />
                    <div dangerouslySetInnerHTML={{ __html: highlightedText2 }} className="highlighted-text" />
                </div>
            </div>

            <button className="compare-btn" onClick={compareText}>🔍 Compare Files</button>
        </div>
    );
};

export default FileUpload;
