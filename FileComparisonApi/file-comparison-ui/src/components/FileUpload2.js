import React, { useState } from 'react';
import axios from 'axios';

function FileUpload2() {
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [fileData1, setFileData1] = useState(""); // For paste data of File 1
    const [fileData2, setFileData2] = useState(""); // For paste data of File 2
    const [differences, setDifferences] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Handles file selection, reads its content, and populates the textarea.
     * @param {Event} e - The file input change event
     * @param {Function} setFileData - State setter function for textarea data
     * @param {Function} setFile - State setter function for file object
     */

     // Function to handle file upload and populate the textarea
     const handleFileChange = (e, setFileData, setFile) =>
     {
        const file = e.target.files[0];
        setFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setFileData(reader.result);
        };
        reader.readAsText(file);
     }


    const handleUpload = async () => {
        if ((file1 && file2) || (fileData1 && fileData2)) {
            setLoading(true);
            setError(null);
            setDifferences([]); // Reset before new comparison

            const formData = new FormData();
            if (file1 && file2) {
                formData.append("file1", file1);
                formData.append("file2", file2);
            } else {
                formData.append("file1", new Blob([fileData1], { type: 'text/plain' }));
                formData.append("file2", new Blob([fileData2], { type: 'text/plain' }));
            }

            try {
                const response = await axios.post("http://localhost:5016/api/file/compare", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });

                console.log("API Response:", response.data);

                if (response.data && Array.isArray(response.data.differences)) {
                    setDifferences(response.data.differences);
                } else {
                    console.error("Unexpected response format:", response.data);
                    setDifferences([]); // Default to empty array if response format is incorrect
                }
            } catch (err) {
                console.error("Error comparing files:", err);
                setError("Error comparing files. Please try again.");
            } finally {
                setLoading(false);
            }
        } else {
            setError("Please select or paste both files.");
        }
    };

    return (
        <div>
            <h2>File Comparison Tool</h2>
            
            {/* File Upload Section */}
            <div>
                <h3>Upload Files</h3>
                <input type="file" onChange={(e) => handleFileChange(e, setFileData1, setFile1)} />
                <input type="file" onChange={(e) => handleFileChange(e, setFileData2, setFile2)} />
            </div>

            {/* Paste File Data Section */}
            <div>
                <h3>Or Paste File Data</h3>
                <textarea 
                    rows="10" 
                    cols="50" 
                    placeholder="Paste content of File 1" 
                    value={fileData1} 
                    onChange={(e) => setFileData1(e.target.value)} 
                />
                <textarea 
                    rows="10" 
                    cols="50" 
                    placeholder="Paste content of File 2" 
                    value={fileData2} 
                    onChange={(e) => setFileData2(e.target.value)} 
                />
            </div>

            {/* Compare Button */}
            <button onClick={handleUpload} disabled={loading}>
                {loading ? "Comparing files..." : "Compare Files"}
            </button>

            {/* Show errors or results */}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {Array.isArray(differences) && differences.length > 0 ? (
                <div>
                    <h3>Differences Found:</h3>
                    <ul>
                        {differences.map((diff, index) => (
                            <li key={index}>{diff}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>No differences found or comparison has not yet been made.</p>
            )}
        </div>
    );
}

export default FileUpload2;
