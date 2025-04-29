import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import axios from "axios";
import "../styles/AddExpense.css";
import { useLanguage } from "../context/LanguageContext";
import ScaleLoader from "react-spinners/ScaleLoader";

const AddExpense = () => {
  const { lang } = useLanguage();
  const [tab, setTab] = useState("manual");
  const [image, setImage] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [ocrSubmitted, setOcrSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [receiptData, setReceiptData] = useState({
    amount: "",
    category: "Other",
    vendor: "",
    datetime: "",
  });

  const [manual, setManual] = useState({
    amount: "",
    category: "Food & Dining",
    vendor: "",
    datetime: "",
  });

  const categoryMap = {
    "Food & Dining": 1,
    Transport: 3,
    Shopping: 2,
    Bills: 4,
    Other: 5
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewURL(URL.createObjectURL(file));
      setOcrSubmitted(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const db = JSON.parse(localStorage.getItem("appData"));

    const newExpense = {
      id: Date.now(),
      user_id: currentUser.id,
      amount: parseFloat(manual.amount),
      category_id: categoryMap[manual.category] || 5,
      description: manual.vendor || "Manual Entry",
      vendor: manual.vendor || "",
      date: manual.datetime,
      source: "manual",
      receipt_img: "",
      ocr_text: "",
      created_at: new Date().toISOString(),
    };

    db.expenses.push(newExpense);
    localStorage.setItem("appData", JSON.stringify(db));

    setManual({
      amount: "",
      category: "Food & Dining",
      vendor: "",
      datetime: "",
    });
  };

  const parseResponse = (apiResponse) => {
    const amount = apiResponse.expense_data.total;
    const category = apiResponse.expense_data.category;
    const vendor = apiResponse.expense_data.vendor;
    const date = apiResponse.expense_data.date;
    const time = apiResponse.expense_data.time;

    setReceiptData({
      amount: amount,
      category: category,
      vendor: vendor,
      datetime: `${date}T${time.slice(0, 10)}`,
    });
  };

  const handleImageSubmit = async () => {
    setIsLoading(true);
    setOcrSubmitted(true);

    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await axios.post(
        "http://localhost:8000/receipt/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.status_code !== 200) {
        // TODO: Display error in frontend
        alert("Error: " + response.data.message);
      } else {
        parseResponse(response.data);
      }
    } catch (error) {
      // TODO: Display error in frontend
      alert("Error uploading file: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="add-expense-container">
        <h1>{lang.addExpense.title}</h1>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={tab === "manual" ? "tab active" : "tab"}
            onClick={() => setTab("manual")}
          >
            {lang.addExpense.manualTab}
          </button>
          <button
            className={tab === "scan" ? "tab active" : "tab"}
            onClick={() => setTab("scan")}
          >
            {lang.addExpense.scanTab}
          </button>
        </div>

        {tab === "manual" && (
          <form className="expense-form" onSubmit={handleManualSubmit}>
            <label>
              {lang.addExpense.amount}
              <input
                type="number"
                placeholder="0.00"
                value={manual.amount}
                onChange={(e) =>
                  setManual({ ...manual, amount: e.target.value })
                }
                required
              />
            </label>

            <label>
              {lang.addExpense.category}
              <select
                value={manual.category}
                onChange={(e) =>
                  setManual({ ...manual, category: e.target.value })
                }
              >
                <option>Food & Dining</option>
                <option>Transport</option>
                <option>Shopping</option>
                <option>Bills</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              {lang.addExpense.vendor}
              <input
                type="text"
                placeholder="Enter vendor name"
                value={manual.vendor}
                onChange={(e) =>
                  setManual({ ...manual, vendor: e.target.value })
                }
              />
            </label>

            <label>
              {lang.addExpense.dateTime}
              <input
                type="datetime-local"
                value={manual.datetime}
                onChange={(e) =>
                  setManual({ ...manual, datetime: e.target.value })
                }
              />
            </label>

            <button type="submit" className="submit-btn">
              {lang.addExpense.submit}
            </button>
          </form>
        )}

        {tab === "scan" && (
          <div className="scan-row">
            <div className="scan-section">
              {!previewURL ? (
                <label htmlFor="receipt-upload" className="upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    id="receipt-upload"
                    onChange={handleImageUpload}
                  />
                  <div className="upload-content">
                    <span>📁 {lang.addExpense.uploadReceipt}</span>
                  </div>
                </label>
              ) : (
                <>
                  <div className="preview-container">
                    <img
                      src={previewURL}
                      alt="Receipt Preview"
                      className="receipt-preview"
                    />
                  </div>
                  {!ocrSubmitted && (
                    <button
                      className="btn-submit-api"
                      onClick={() => handleImageSubmit()}
                    >
                      {lang.addExpense.submitToApi}
                    </button>
                  )}
                </>
              )}
            </div>

            {!previewURL && (
              <div className="or-text">
                <span>{lang.addExpense.or}</span>
              </div>
            )}

            {!previewURL && (
              <div className="qrcode-placeholder">
                <p>{lang.addExpense.qrcodePlaceholder}</p>
                <div className="qrcode-box">[ qrcode placeholder ]</div>
              </div>
            )}

            {ocrSubmitted && previewURL && (
              <div className="ocr-results-container">
                {isLoading ? (
                  <div className="loader">
                    <ScaleLoader
                      color="#2563eb"
                      loading={isLoading}
                      height="3rem"
                      width="0.25rem"
                    />
                  </div>
                ) : (
                  <div className="ocr-details">
                    <h2>{lang.addExpense.previewTitle}</h2>
                    <label>
                      {lang.addExpense.amount}
                      <input
                        type="number"
                        placeholder="0.00"
                        step="0.10"
                        value={receiptData.amount}
                        onChange={(e) =>
                          setReceiptData({
                            ...receiptData,
                            amount: e.target.value
                          })
                        }
                      />
                    </label>

                    <label>
                      {lang.addExpense.category}
                      <select
                        value={receiptData.category}
                        onChange={(e) =>
                          setReceiptData({
                            ...receiptData,
                            category: e.target.value,
                          })
                        }
                      >
                        <option>Other</option>
                        <option>Food & Dining</option>
                        <option>Transport</option>
                        <option>Shopping</option>
                        <option>Bills</option>
                      </select>
                    </label>

                    <label>
                      {lang.addExpense.vendor}
                      <input
                        type="text"
                        value={receiptData.vendor}
                        onChange={(e) =>
                          setReceiptData({
                            ...receiptData,
                            vendor: e.target.value,
                          })
                        }
                      />
                    </label>

                    <label>
                      {lang.addExpense.dateTime}
                      <input
                        type="datetime-local"
                        value={receiptData.datetime}
                        onChange={(e) =>
                          setReceiptData({
                            ...receiptData,
                            datetime: e.target.value,
                          })
                        }
                      />
                    </label>

                    <button
                      className="btn-primary"
                      onClick={() => {
                        console.log("Scanned Expense:", receiptData);
                      }}
                    >
                      {lang.addExpense.add}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AddExpense;
