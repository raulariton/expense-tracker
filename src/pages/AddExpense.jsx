import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import axios from "axios";
import "../styles/AddExpense.css";

const AddExpense = () => {
  const [tab, setTab] = useState("manual");
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    // called when a file is selected

    const validTypes = ["image/png", "image/jpeg"];

    if (!validTypes.includes(event.target.files[0].type)) {
      alert("Please select a valid image file (PNG or JPEG)");
      setFile(null);
      return;
    }

    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:8000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.status === 200) {
        alert("File uploaded successfully");

        // print json response
        const jsonResponse = response.data;
        console.log("Response:", jsonResponse);
      } else {
        alert("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <MainLayout>
      <div className="add-expense-container">
        <h1>Add Expense</h1>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={tab === "manual" ? "tab active" : "tab"}
            onClick={() => setTab("manual")}
          >
            Manual Entry
          </button>
          <button
            className={tab === "scan" ? "tab active" : "tab"}
            onClick={() => setTab("scan")}
          >
            Scan Receipt
          </button>
        </div>

        {tab === "manual" && (
          <form className="expense-form">
            <label>
              Amount (required)
              <input type="number" placeholder=" 0.00" required />
            </label>

            <label>
              Category
              <select>
                <option>Food & Dining</option>
                <option>Transport</option>
                <option>Shopping</option>
                <option>Bills</option>
              </select>
            </label>

            <label>
              Vendor (optional)
              <input type="text" placeholder="Enter vendor name" />
            </label>

            <label>
              Date/Time
              <input type="datetime-local" />
            </label>

            <button type="submit" className="submit-btn">
              Submit Expense
            </button>
          </form>
        )}

        {tab === "scan" && (
          <div className="scan-placeholder">
            <input
              type="file"
              name="receipt-photo"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
            />
            {file && <button onClick={handleFileUpload}>Submit</button>}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
export default AddExpense;
