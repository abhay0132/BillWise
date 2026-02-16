import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Upload.css";
import { uploadBill } from "../api/bills";
import { useAuth } from "../Context/AuthContext";

export default function Upload() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        setMsg("Please select a valid file (PNG, JPG, or PDF)");
        setFile(null);
        return;
      }
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setMsg("File size must be less than 10MB");
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setMsg("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMsg("Please select a receipt first.");
      return;
    }

    try {
      setLoading(true);
      setMsg("");
      setResult(null);

      const data = await uploadBill(file);
      setResult(data);
      setMsg("Receipt extracted and saved successfully");
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById("file-input");
      if (fileInput) {
        fileInput.value = "";
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
      setMsg(err.response?.data?.message || "Upload failed. Please try again.");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="upload-page">
      <div className="upload-container">
        <div className="upload-header">
          <h1>Upload Receipt</h1>
          <p>Upload your bill or receipt to extract details automatically</p>
        </div>

        <div className="upload-box">
          <div className="upload-dropzone">
            <input
              id="file-input"
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="file-input" className="file-label">
              <svg className="upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="upload-text">
                {file ? file.name : "Choose a file or drag it here"}
              </span>
              <span className="upload-hint">PNG, JPG, or PDF (max 10MB)</span>
            </label>
          </div>

          {msg && (
            <p className={`upload-message ${result ? 'success' : 'error'}`}>
              {msg}
            </p>
          )}

          <button 
            onClick={handleUpload} 
            disabled={loading || !file}
            className="upload-button"
          >
            {loading ? "Processing..." : "Upload & Extract"}
          </button>
        </div>

        {result?.bill && (
          <div className="result-card">
            <h2 className="result-title">Extracted Details</h2>
            <div className="result-grid">
              <div className="result-item">
                <span className="result-label">Place</span>
                <span className="result-value">{result.bill.place || "N/A"}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Date</span>
                <span className="result-value">
                  {result.bill.date ? new Date(result.bill.date).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="result-item">
                <span className="result-label">Amount</span>
                <span className="result-value">₹{result.bill.price || 0}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Payment Mode</span>
                <span className="result-value">{result.bill.mode || "N/A"}</span>
              </div>
            </div>
            <button 
              onClick={() => navigate("/dashboard")} 
              className="view-dashboard-btn"
            >
              View in Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}