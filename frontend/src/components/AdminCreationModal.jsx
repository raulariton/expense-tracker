import { createPortal } from "react-dom";
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext.jsx";

const AdminCreationForm = ({ form, onChange, onSubmit }) => {
  const { lang } = useLanguage();

  return (
    <motion.div
      initial={{ x: 0 }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ type: "tween", duration: 0.3 }}
    >
      <h2 className="text-xl font-semibold mb-2">{lang.adminManagement.adminCreationForm.header}</h2>
      <p className="mb-0.5 text-gray-600">{lang.adminManagement.adminCreationForm.instructions}</p>
      <form onSubmit={onSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1" htmlFor="email">{lang.adminManagement.adminCreationForm.emailLabel}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder={lang.adminManagement.adminCreationForm.emailPlaceholder}
            disabled={form.loading}
            required
            className={`w-full px-3 py-2 border ${form.error ? "border-danger border-2" : "border-gray-300"} rounded-md bg-white focus:border-0 focus:outline-2 focus:outline-gray-500`}
          />
          {form.adminExistsError && (<p className="text-sm ml-1 text-danger">{lang.adminManagement.adminCreationForm.emailError}</p>)}
        </div>
        <button
          type="submit"
          disabled={form.loading || form.error}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-md w-full"

        >
          {form.loading ? lang.adminManagement.adminCreationForm.creatingButton : lang.adminManagement.adminCreationForm.createButton}
        </button>
      </form>
    </motion.div>
  );
};

const AdminCreationSuccess = ({ onModalClose }) => {
  const { lang } = useLanguage();

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "tween", duration: 0.3 }}
    >
      <div className="text-center py-4">
        <FaCheckCircle className="mx-auto text-5xl text-green-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">{lang.adminManagement.adminCreationForm.successMessage}</h2>
        <p className="text-gray-600 mb-6">{lang.adminManagement.adminCreationForm.successDescription}</p>
        <button
          onClick={onModalClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-md w-full"
        >
          {lang.adminManagement.adminCreationForm.closeButton}
        </button>
      </div>
    </motion.div>
  );
};

const AdminCreationModal = ({ isOpen, closeModal, onSubmit, onChange, adminCreationRequest }) => {
  const modalContentRef = useRef(null);

  const handleBackdropClick = (e) => {
    // if the click is outside the modal content, close the modal
    if (modalContentRef.current && !modalContentRef.current.contains(e.target)) {
      closeModal(); // function to close the modal, updates state in the parent component
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="bg-gray-900/75 fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            ref={modalContentRef}
            className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className={`relative w-full ${adminCreationRequest.success ? "overflow-hidden" : ""}`}>
              <AnimatePresence initial={false} mode="wait">
                {adminCreationRequest.success ?
                  <AdminCreationSuccess
                    key="success"
                    onModalClose={closeModal} />
                  :
                  <AdminCreationForm
                    key="form"
                    form={adminCreationRequest}
                    onChange={onChange}
                    onSubmit={onSubmit}
                  />}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.getElementById("modal-root")
  );
};

export default AdminCreationModal;