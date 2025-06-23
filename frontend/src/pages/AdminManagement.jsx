import MainLayout from "../layouts/MainLayout";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext.jsx";
import "../styles/CreateAdmin.css";
import toast from "react-hot-toast";
import { FaPlus, FaFilter } from "react-icons/fa";
import AdminCreationModal from "../components/AdminCreationModal.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import {
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaSortNumericDown,
  FaSortNumericUp,
  FaSort,
  FaCheck
} from "react-icons/fa";
import { useDebounce } from "use-debounce";

const SortOptionsDropdownMenu = ({ selectedSortingOption, setSelectedSortingOption }) => {
  const { lang } = useLanguage();
  const sortOptions = [
    {
      value: "email-asc",
      label: lang.adminManagement.sortOptions.emailAsc,
      icon: <FaSortAlphaUp />
    },
    {
      value: "email-desc",
      label: lang.adminManagement.sortOptions.emailDesc,
      icon: <FaSortAlphaDown />
    },
    {
      value: "newest",
      label: lang.adminManagement.sortOptions.dateDesc,
      icon: <FaSortNumericUp />
    },
    {
      value: "oldest",
      label: lang.adminManagement.sortOptions.dateAsc,
      icon: <FaSortNumericDown />
    },
    {
      value: "default",
      label: lang.adminManagement.sortOptions.default,
      icon: null
    }
  ]

  const onValueChange = (value) => {
    setSelectedSortingOption({
      value: value,
      label: sortOptions.find(option => option.value === value).label
    });
  }

  const SortOptionItem = ({ value, label, iconComponent }) => {
    return (
      <DropdownMenuRadioItem
        value={value}
        className={`flex items-center justify-between ${selectedSortingOption === value ? "bg-accent" : ""}`}>
            <div className="flex items-center gap-2">
              {iconComponent}
              {label}
            </div>
            {selectedSortingOption === value && (
              <FaCheck/>
            )}
          </DropdownMenuRadioItem>
    )
  }

  return (
    <DropdownMenuContent className="w-68" align="start">
        <DropdownMenuRadioGroup value={selectedSortingOption} onValueChange={onValueChange}>
          {sortOptions.slice(0, 2).map(option => (
            <SortOptionItem
              key={option.value}
              value={option.value}
              label={option.label}
              iconComponent={option.icon} />
          ))}
          <DropdownMenuSeparator/>
          {sortOptions.slice(2, 4).map(option => (
            <SortOptionItem
              key={option.value}
              value={option.value}
              label={option.label}
              iconComponent={option.icon} />
          ))}
          <DropdownMenuSeparator />
            <SortOptionItem
              key={sortOptions[4].value}
              value={sortOptions[4].value}
              label={sortOptions[4].label}
              iconComponent={sortOptions[4].icon} />
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
  )
}

const AdminManagement = () => {
  const { lang, currentLangCode } = useLanguage();
  const [admins, setAdmins] = useState([]);
  const [adminCreationRequest, setAdminCreationRequest] = useState({
    email: "",
    loading: false,
    success: false,
    adminExistsError: false,
    modalOpen: false
  });
  const [selectedSortingOption, setSelectedSortingOption] = useState({
    value: "default",
    label: lang.adminManagement.sortOptions.default,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounce(searchQuery, 500);

  useEffect(() => {
    const controller = new AbortController();

    // fetch admins using search query
    fetchAdmins({ abortController: controller });

    // cleanup function to abort the request if the component unmounts or if the search query changes
    return () => {
      controller.abort();
    }
  }, [debouncedQuery]);

  // set to true display fake statuses for admins
  const fakeData = false;

  // defined outside of useEffect to call after admin creation
  const fetchAdmins = async ( abortController ) => {
    const token = localStorage.getItem("access_token");

    try {
      const response = await axios.get("http://localhost:8000/admin/admin_table", {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          sort_by: selectedSortingOption.value,
          search_query: searchQuery
        },
        signal: abortController?.signal || null // pass the abort signal if available
      });

      // TESTING PURPOSES: add status attribute to each admin
      if (fakeData) {
        const adminsWithTestStatus = response.data.map(admin => ({
          ...admin,
          status: ["active", "inactive", "pending"][Math.floor(Math.random() * 3)]
        }));

        setAdmins(adminsWithTestStatus);
      } else {
        setAdmins(response.data);
      }

    } catch (error) {
      if (axios.isCancel(error)) {
        toast.error("Fetch cancelled");
      } else {
        toast.error("Error occurred: " + error.message);
      }
    }
  };

  useEffect(() => {
    // fetch admin users
    fetchAdmins();
  }, [selectedSortingOption]);

  useEffect(() => {
    // fetch admins on initial render
    fetchAdmins();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    // set email input value, and clear any error states
    setAdminCreationRequest((prev) => ({
      ...prev,
      [name]: value,
      adminExistsError: false,
      error: false
    }));
  };


  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    // reset form states
    setAdminCreationRequest({
      ...adminCreationRequest,
      loading: true,
      adminExistsError: false,
      error: false,
      success: false
    });

    const formData = new FormData();
    formData.append("email", adminCreationRequest.email);

    try {
      await axios.post(
        "http://127.0.0.1:8000/admin/create_admin",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      // update form state
      setAdminCreationRequest({
        ...adminCreationRequest,
        email: "",
        loading: false,
        adminExistsError: false,
        success: true
      });

      // fetch updated admin list
      fetchAdmins();

    } catch (error) {
      if (error.response && error.response.status === 400) {
        // enable specific error message for admin already exists
        setAdminCreationRequest({
          ...adminCreationRequest,
          loading: false,
          adminExistsError: true,
          error: true
        });
      } else {
        setAdminCreationRequest({
          ...adminCreationRequest,
          loading: false,
          error: true
        });
        toast.error("Error occurred: " + error.message);
      }
    }
  };

  useEffect(() => {
    // handle modal close
    if (!adminCreationRequest.modalOpen) {
      // reset form state when modal is closed
      setAdminCreationRequest({
        ...adminCreationRequest,
        email: "",
        loading: false,
        adminExistsError: false,
        success: false
      });
    }

  }, [adminCreationRequest.modalOpen]);

  /**
   * Formats an ISO format date string into a more readable format,
   * depending on the user's set language.
   * @param ISODateString
   * @returns {string}
   */
  const formatDate = (ISODateString) => {
    const date = new Date(ISODateString);

    const defaultOptions = {
      year: "numeric",
      month: "long",
      day: "numeric"
    };

    const langCodeMapping = {
      en: "en-US",
      ro: "ro-RO"
    };

    return new Intl.DateTimeFormat(langCodeMapping[currentLangCode], defaultOptions)
      .format(date);
  };

  const StatusBadge = ({ status }) => {
    switch (status) {
      case "active":
        return <div
          className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full text-center">active</div>;
      case "inactive":
        return <div
          className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full text-center">inactive</div>;
      case "pending":
        return <div
          className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full text-center">invitation
          sent</div>;
      default:
        return <div
          className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full text-center">unknown</div>;
    }
  };

  // admin card component
  const AdminCard = ({ adminInstance }) => {
    return (
      <div className="flex flex-row justify-between items-center hover:bg-gray-50 transition-colors duration-200">
        {/* profile icon, email, username (if applicable) and creation date */}
        <div className="flex flex-row p-4 gap-4 items-center">
          <div
            className="user-icon rounded-full w-10 h-10"
            style={{ backgroundColor: generateColorBasedOnEmail(adminInstance.email) }}>
            <span className="text-white text-lg font-semibold flex items-center justify-center h-full select-none">
              {adminInstance.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col justify-center">
            <div className="inline">
              <a className="text-base" href={`mailto:${adminInstance.email}`}>{adminInstance.email}</a>
              {adminInstance.username !== "-" && (
                <span className="text-sm text-gray-600 font-medium">{` (${adminInstance.username})`}</span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Created on: {formatDate(adminInstance.creation_date)}
            </div>
          </div>
        </div>

        {/* status */}
        {adminInstance.status && (
          <div className="flex flex-row items-center gap-1 px-2 w-65 justify-between">
            <div className="flex flex-col items-end justify-between p-4">
              <p className="text-sm font-light">Last login</p>
              <p className="font-semibold">2 hours ago</p>
            </div>
            <div className="justify-center"><StatusBadge status={adminInstance.status} /></div>
          </div>
        )}
      </div>
    );
  };

  const generateColorBasedOnEmail = (email) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 65%, 55%)`;
  };

  // TODO: take into account user languages
  return (
    <MainLayout>
      {/* header: page title and description */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold mb-2">
          {lang.adminManagement.header}
        </h1>
        <p>
          {lang.adminManagement.description}
        </p>
      </div>

      {/* search bar, filtering and add admin button*/}
      <div className="flex flex-row justify-between items-center mt-4">
        <div className="flex flex-row items-stretch gap-2">
          <input
            type="text"
            placeholder={lang.adminManagement.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-2 pr-5 border border-gray-300 rounded-md bg-white focus:outline-1.75 focus:outline-gray-500" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="bg-primary whitespace-nowrap text-white rounded-md hover:bg-blue-600 transition-colors duration-200 px-4 py-2 gap-2 flex items-center shadow-md justify-start min-h-10">
                <FaSort className="inline" />
                <span className="text-white text-sm">Sort by: {selectedSortingOption.label}</span>
              </button>
            </DropdownMenuTrigger>
            <SortOptionsDropdownMenu
              selectedSortingOption={selectedSortingOption}
              setSelectedSortingOption={setSelectedSortingOption}
            />
          </DropdownMenu>
        </div>

        <div className="flex flex-row items-stretch gap-2">
          <button
            className="bg-primary text-white rounded-md hover:bg-blue-600 transition-colors duration-200 px-4 py-2 gap-2 flex items-center shadow-md justify-center min-h-10"
            onClick={() => setAdminCreationRequest({ ...adminCreationRequest, modalOpen: true })}
          >
            <FaPlus className="text-base" />
            <span className="font-medium hidden md:inline">{lang.adminManagement.createAdmin}</span>
          </button>
        </div>
      </div>

      <AdminCreationModal
        isOpen={adminCreationRequest.modalOpen}
        closeModal={() => setAdminCreationRequest({ ...adminCreationRequest, modalOpen: false })}
        onSubmit={handleCreateAdmin}
        onChange={handleFormChange}
        adminCreationRequest={adminCreationRequest}
      />

      <div
        className="bg-white divide-y divide-gray-200 mt-4 shadow-md rounded-md p-4 max-h-[50vh] min-h-[50vh] scroll-smooth overflow-y-auto">
        {admins.length > 0 ? admins.map(
          (admin) => (
            <AdminCard key={admin.id} adminInstance={admin} />
          )
        ) : (
          <div className="text-center items-center justify-center text-gray-500">
            {lang.adminManagement.noAdministratorsFound}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminManagement;