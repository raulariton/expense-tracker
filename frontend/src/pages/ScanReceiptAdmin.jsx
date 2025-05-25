import MainLayout from "../layouts/MainLayout.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import React, { useState } from "react";
import ScaleLoader from "react-spinners/ScaleLoader.js";
import toast from "react-hot-toast";
import axios from "axios";
import ExampleImage from "../components/ExampleImage.jsx";
import "../styles/ScanReceiptAdmin.css";
import JSONCodeBlock from "../components/JSONCodeBlock.jsx";

import whiteBackground from "../assets/images/example_receipts/white_background.jpg";
import bon1 from "../assets/images/example_receipts/bon1.jpg";
import bon4 from "../assets/images/example_receipts/bon4.png";
import bonOther from "../assets/images/example_receipts/bon_other.jpeg";
import bon_1 from "../assets/images/example_receipts/bon11.jpg";
import bonYumm from "../assets/images/example_receipts/bon_yumm.jpeg";


const ScanReceiptAdmin = () => {
  const { lang } = useLanguage();
  const [imageUploaded, setImageUploaded] = useState(false);
  const [imageSubmitted, setImageSubmitted] = useState(false);
  const [image, setImage] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [receiptData, setReceiptData] = useState({
    amount: "",
    category: "Other",
    vendor: "",
    datetime: ""
  });
  const [tab, setTab] = useState("results");

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
      datetime: date ? `${date}T${time || "00:00"}` : ""
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      setImage(file);
      setPreviewURL(URL.createObjectURL(file));
    }

    setImageUploaded(true);
  };

  const handleExampleImagePick = async (url) => {

    // an image can only be picked if one is not already uploaded
    if (imageUploaded) {
      toast.error("Please delete the current image before picking an example.");
      return;
    }

    // get image from URL
    const response = await fetch(url);
    const filename = url.split("/").pop();

    // create Blob (binary large object) from response
    const blob = await response.blob();

    // create a File object from the Blob
    const file = new File(
      [blob],
      filename,
      { type: blob.type });

    // set states appropriately
    setImage(file);
    // create URL object from file
    setPreviewURL(URL.createObjectURL(file));
    setImageUploaded(true);
  };

  const handleImageSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setImageSubmitted(true);

    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await axios.post(
        "http://localhost:8000/receipt/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.status !== 200) {
        toast.error("Error occured: " + error.message);
      } else {
        parseResponse(response.data);
      }
    } catch (error) {
      toast.error("Error while uploading file: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const images = [
    whiteBackground,
    bon1,
    bon4,
    bonOther,
    bon_1,
    bonYumm
  ];

  return (
    <MainLayout>
      <div className="add-expense-container">
        <h1>Scan Receipt</h1>

        <div className="scan-row">
          <div className="upload-area-and-results">
            <div className="scan-section">
              {!imageUploaded ? (
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
                          setImageUploaded(false);
                          setImageSubmitted(false);
                        }}
                      >
                        ✖
                      </button>)}
                  </div>
                  {!imageSubmitted && (
                    <button
                      className="btn-submit-api"
                      onClick={handleImageSubmit}
                    >
                      Submit
                    </button>
                  )}
                </>
              )}
            </div>

            {imageSubmitted && image && (
              <div className="ocr-results-container">
                {/* TODO: JSON tab */}
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
                  <>
                    {/* Tabs */}
                    <div className="tabs">
                      <button
                        className={tab === "results" ? "tab active" : "tab"}
                        onClick={() => setTab("results")}
                      >
                        Results
                      </button>
                      <button
                        className={tab === "json" ? "tab active" : "tab"}
                        onClick={() => setTab("json")}
                      >
                        JSON Code
                      </button>
                    </div>

                    {tab === "results" && (
                      <div className="ocr-details">
                        <label>
                          {lang.addExpense.amount}
                          <input
                            type="number"
                            placeholder="0.00"
                            step="0.10"
                            value={receiptData.amount}
                            readOnly={true}
                          />
                        </label>

                        <label>
                          {lang.addExpense.category}
                          <select
                            value={receiptData.category}
                            disabled={true}
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
                            readOnly={true}
                          />
                        </label>

                        <label>
                          {lang.addExpense.dateTime}
                          <input
                            type="datetime-local"
                            value={receiptData.datetime}
                            readOnly={true}
                          />
                        </label>
                      </div>
                    )}
                    {tab === "json" && (
                      <div className="json-results">
                        <JSONCodeBlock jsonData={receiptData} />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Example images */}
          <div className="example-images-section">
            <h2>Example Receipts</h2>
            <div className="example-images-container">
              {images.map((src, index) => (
                <ExampleImage
                  key={index}
                  src={src}
                  onClick={() => {
                    handleExampleImagePick(src);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ScanReceiptAdmin;