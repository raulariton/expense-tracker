import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import "../styles/AddExpense.css";
import { useLanguage } from "../context/LanguageContext";
import ScaleLoader from "react-spinners/ScaleLoader";
import toast from "react-hot-toast";
import useAxiosPrivate from "../hooks/useAxiosPrivate.js";

const AddExpense = () => {
  const { lang } = useLanguage();
  const axiosPrivate = useAxiosPrivate();
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewURL(URL.createObjectURL(file));
      setOcrSubmitted(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();

    // submit request with token and expense data
    try {
      const response = await axiosPrivate.post(
        "/receipt/submit",
        receiptData
      );

      if (response.status === 200) {
        toast.success("Expense added successfully!");

        // reset expense form data
        setReceiptData({
          amount: "",
          category: "Other",
          vendor: "",
          datetime: "",
        });
      }
    } catch (error) {
      toast.error("Error occured: " + error.message);
    }
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
      datetime: date ? `${date}T${time || "00:00"}` : "",
    });
  };

  const handleImageSubmit = async () => {
    setIsLoading(true);
    setOcrSubmitted(true);

    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await axiosPrivate.post(
        "/receipt/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status_code !== 200) {
        // TODO: handle other errors, most likely Network Error
        toast.error("Error occured: " + error.message);
      } else {
        parseResponse(response.data);
      }
    } catch (error) {
      // TODO: handle other errors, most likely Network Error
      toast.error("Error while uploading file: " + error.message);
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
          <form className="expense-form" onSubmit={handleExpenseSubmit}>
            <label>
              {lang.addExpense.amount}
              <input
                type="number"
                placeholder="0.00"
                step="0.10"
                value={receiptData.amount}
                onChange={(e) =>
                  setReceiptData({ ...receiptData, amount: e.target.value })
                }
                required
              />
            </label>

            <label>
              {lang.addExpense.category}
              <select
                value={receiptData.category}
                onChange={(e) =>
                  setReceiptData({ ...receiptData, category: e.target.value })
                }
              >
                <option>{lang.expense_categories.food_and_dining}</option>
                <option>{lang.expense_categories.transport}</option>
                <option>{lang.expense_categories.shopping}</option>
                <option>{lang.expense_categories.bills}</option>
                <option>{lang.expense_categories.other}</option>
              </select>
            </label>

            <label>
              {lang.addExpense.vendor}
              <input
                type="text"
                placeholder="ex. Profi"
                value={receiptData.vendor}
                onChange={(e) =>
                  setReceiptData({ ...receiptData, vendor: e.target.value })
                }
              />
            </label>

            <label>
              {lang.addExpense.dateTime}
              <input
                type="datetime-local"
                value={receiptData.datetime}
                onChange={(e) =>
                  setReceiptData({ ...receiptData, datetime: e.target.value })
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
            <div className="upload-area-and-results">
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
                      {!isLoading && (
                        <button
                          className="delete-image-btn"
                          onClick={() => {
                            setImage(null);
                            setPreviewURL(null);
                            setOcrSubmitted(false);
                          }}
                        >
                          ✖
                        </button>
                      )}
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

              {/*{!previewURL && (*/}
              {/*  <div className="or-text">*/}
              {/*    <span>{lang.addExpense.or}</span>*/}
              {/*  </div>*/}
              {/*)}*/}
              {/* TODO: uncomment and use for QR code scan feature (when implemented) */}
              {/*{!previewURL && (*/}
              {/*  <div className="qrcode-placeholder">*/}
              {/*    <p>{lang.addExpense.qrcodePlaceholder}</p>*/}
              {/*    <div className="qrcode-box">[ qrcode placeholder ]</div>*/}
              {/*  </div>*/}
              {/*)}*/}

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
                              category: e.target.value
                            })
                          }
                        >
                          <option>{lang.expense_categories.food_and_dining}</option>
                          <option>{lang.expense_categories.transport}</option>
                          <option>{lang.expense_categories.shopping}</option>
                          <option>{lang.expense_categories.bills}</option>
                          <option>{lang.expense_categories.other}</option>
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
                              vendor: e.target.value
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
                              datetime: e.target.value
                            })
                          }
                        />
                      </label>

                      <button
                        className="btn-primary"
                        onClick={handleExpenseSubmit}
                      >
                        {lang.addExpense.add}
                      </button>
                    </div>
                  )}
                </div>
              )}</div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AddExpense;
