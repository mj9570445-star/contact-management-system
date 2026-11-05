
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");
  const [selectedContact, setSelectedContact] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Contacts
  const fetchContacts = async () => {
    const response = await fetch("/api/contacts");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch contacts");
    }

    return data;
  };

  useEffect(() => {
    let isActive = true;

    fetchContacts()
      .then((data) => {
        if (isActive) {
          setContacts(data);
        }
      })
      .catch((error) => {
        if (isActive) {
          console.error("Error fetching contacts:", error);
          setApiError("Cannot connect to the server. Start the backend and try again.");
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  // Phone Validation
  const validatePhone = (phoneNumber) => {
    return /^[6-9]\d{9}$/.test(phoneNumber);
  };

  // Add Contact
  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanAddress = address.trim();

    if (!cleanName || !cleanEmail) {
      alert("Name and Email are required!");
      return;
    }

    if (!validatePhone(cleanPhone)) {
      alert("Enter a valid 10-digit Indian mobile number!");
      return;
    }

    setIsSubmitting(true);
    setApiError("");

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          address: cleanAddress
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Contact save failed");
      }

      setContacts((previousContacts) => [data, ...previousContacts]);
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setActivePage("All Contacts");
    } catch (error) {
      setApiError(error.message || "Could not add contact. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Contact Form
  const openEditForm = (contact) => {
    setEditingContact(contact);

    setName(contact.name || "");
    setEmail(contact.email || "");
    setPhone(contact.phone || "");
    setAddress(contact.address || "");

    setActivePage("Edit Contact");
  };

  // Update Contact
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingContact) return;

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanAddress = address.trim();

    if (!cleanName || !cleanEmail) {
      alert("Name and Email are required!");
      return;
    }

    if (!validatePhone(cleanPhone)) {
      alert("Enter a valid 10-digit Indian mobile number!");
      return;
    }

    try {
      const response = await fetch(
        `/api/contacts/${editingContact._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            address: cleanAddress
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Update failed");
      }

      alert("Contact Updated Successfully!");

      const updatedContact = {
        ...editingContact,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        address: cleanAddress
      };

      setSelectedContact((previous) =>
        previous?._id === editingContact._id
          ? updatedContact
          : previous
      );

      setEditingContact(null);

      setName("");
      setEmail("");
      setPhone("");
      setAddress("");

      setContacts(await fetchContacts());
      setActivePage("All Contacts");
    } catch (error) {
      alert(error.message);
    }
  };

  // Cancel Edit
  const cancelEdit = () => {
    setEditingContact(null);

    setName("");
    setEmail("");
    setPhone("");
    setAddress("");

    setActivePage("All Contacts");
  };

  // Delete Contact
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this contact?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `/api/contacts/${id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      alert("Contact Deleted Successfully!");

      if (selectedContact?._id === id) {
        setSelectedContact(null);
      }

      setContacts(await fetchContacts());
    } catch (error) {
      alert(error.message);
    }
  };

  // Search Contacts
  const filteredContacts = contacts.filter((contact) => {
    const searchText = search.toLowerCase().trim();

    return (
      (contact.name || "").toLowerCase().includes(searchText) ||
      (contact.email || "").toLowerCase().includes(searchText) ||
      (contact.phone || "").includes(searchText)
    );
  });

  // Dashboard Statistics
  const totalContacts = contacts.length;
  const searchResults = filteredContacts.length;

  // Recent Contacts - Latest 5
  const recentContacts = [...contacts]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )
    .slice(0, 5);

  return (
    <div className="app-layout">

      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="brand">ContactHub</h2>

        <p className="menu-heading">MAIN MENU</p>

        <button
          className={activePage === "Dashboard" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActivePage("Dashboard")}
        >
          <span>▦</span> Dashboard
        </button>

        <button
          className={activePage === "All Contacts" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActivePage("All Contacts")}
        >
          <span>♙</span> All Contacts
        </button>

        <button
          className={activePage === "Add Contact" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActivePage("Add Contact")}
        >
          <span>＋</span> Add Contact
        </button>

        <button
          className={activePage === "Settings" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActivePage("Settings")}
        >
          <span>⚙</span> Settings
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">

        {/* Top Navbar */}
        <header className="top-navbar">
          <div>
            <h2>{activePage}</h2>
            <p>Welcome to your Contact Management System</p>
          </div>

          <div className="profile">
            <div className="profile-avatar">A</div>
            <span>Admin</span>
          </div>
        </header>

        <div className="page-content">

          {/* Dashboard */}
          {activePage === "Dashboard" && (
            <>
              <h1>Dashboard Overview</h1>

              <p className="page-description">
                Here is your contact management summary.
              </p>

              <div className="dashboard-stats">

                <div className="stat-card">
                  <p>Total Contacts</p>
                  <h2>{totalContacts}</h2>
                </div>

                <div className="stat-card">
                  <p>Search Results</p>
                  <h2>{searchResults}</h2>
                </div>

                <div className="stat-card">
                  <p>Project Status</p>
                  <h2>Active</h2>
                </div>

              </div>

              {/* Recent Contacts */}
              <div className="recent-contacts">

                <div className="recent-header">
                  <div>
                    <h2>Recent Contacts</h2>
                    <p>Recently added contacts</p>
                  </div>

                  <button
                    className="view-all-btn"
                    onClick={() => setActivePage("All Contacts")}
                  >
                    View All
                  </button>
                </div>

                <div className="recent-list">

                  {recentContacts.length === 0 ? (
                    <p className="no-recent">
                      No contacts added yet.
                    </p>
                  ) : (
                    recentContacts.map((contact) => (
                      <div className="recent-item" key={contact._id}>

                        <div className="recent-avatar">
                          {(contact.name || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="recent-info">
                          <h4>{contact.name}</h4>
                          <p>{contact.email}</p>
                        </div>

                        <span className="recent-phone">
                          {contact.phone}
                        </span>

                      </div>
                    ))
                  )}

                </div>
              </div>
            </>
          )}

          {/* Add Contact */}
          {activePage === "Add Contact" && (
            <form className="contact-form" onSubmit={handleSubmit}>
              <h2>Add New Contact</h2>

              {apiError && <p className="form-error" role="alert">{apiError}</p>}

              <input
                type="text"
                placeholder="Enter Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="tel"
                placeholder="Enter 10-digit Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                required
              />

              <input
                type="text"
                placeholder="Enter Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding Contact..." : "Add Contact"}
              </button>
            </form>
          )}

          {/* Professional Edit Contact Form */}
          {activePage === "Edit Contact" && editingContact && (
            <form className="edit-contact-form" onSubmit={handleUpdate}>

              <div className="edit-form-header">
                <div>
                  <h2>Edit Contact</h2>
                  <p>Update your contact information below.</p>
                </div>

                <span className="edit-badge">Editing</span>
              </div>

              <div className="edit-form-fields">

                <div className="edit-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="edit-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="edit-field">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={10}
                    required
                  />
                </div>

                <div className="edit-field">
                  <label>Address</label>
                  <input
                    type="text"
                    placeholder="Enter address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

              </div>

              <div className="edit-form-actions">
                <button type="submit" className="save-changes-btn">
                  Save Changes
                </button>

                <button
                  type="button"
                  className="cancel-edit-btn"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              </div>

            </form>
          )}

          {/* All Contacts */}
          {activePage === "All Contacts" && (
            <div className="contacts-list">

              <div className="table-header">
                <div>
                  <h2>All Contacts ({totalContacts})</h2>
                  <p>Manage all your saved contacts here.</p>
                </div>

                <button
                  className="add-table-btn"
                  onClick={() => setActivePage("Add Contact")}
                >
                  + Add Contact
                </button>
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {/* Contacts Table */}
              <div className="table-wrapper">
                <table className="contacts-table">

                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredContacts.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="empty-message">
                          No Contacts Found
                        </td>
                      </tr>
                    ) : (
                      filteredContacts.map((contact) => (
                        <tr key={contact._id}>
                          <td className="contact-name">
                            {contact.name}
                          </td>

                          <td>{contact.email}</td>
                          <td>{contact.phone}</td>
                          <td>{contact.address || "-"}</td>

                          <td className="action-buttons">

                            <button
                              className="view-btn"
                              onClick={() => {
                                setSelectedContact(contact);
                                setActivePage("Contact Details");
                              }}
                            >
                              View
                            </button>

                            <button
                              className="edit-btn"
                              onClick={() => openEditForm(contact)}
                            >
                              Edit
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() => handleDelete(contact._id)}
                            >
                              Delete
                            </button>

                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>

                </table>
              </div>
            </div>
          )}

          {/* Contact Details Page */}
          {activePage === "Contact Details" && selectedContact && (
            <div className="details-card">

              <div className="details-header">
                <div>
                  <h2>Contact Details</h2>
                  <p>Complete information about this contact</p>
                </div>

                <button
                  className="back-btn"
                  onClick={() => setActivePage("All Contacts")}
                >
                  ← Back to Contacts
                </button>
              </div>

              <div className="details-profile">
                <div className="details-avatar">
                  {(selectedContact.name || "?").charAt(0).toUpperCase()}
                </div>

                <h2>{selectedContact.name}</h2>
                <p>{selectedContact.email}</p>
              </div>

              <div className="details-information">

                <div className="detail-item">
                  <span>Full Name</span>
                  <h3>{selectedContact.name}</h3>
                </div>

                <div className="detail-item">
                  <span>Email Address</span>
                  <h3>{selectedContact.email}</h3>
                </div>

                <div className="detail-item">
                  <span>Phone Number</span>
                  <h3>{selectedContact.phone}</h3>
                </div>

                <div className="detail-item">
                  <span>Address</span>
                  <h3>{selectedContact.address || "Not Available"}</h3>
                </div>

                <div className="detail-item">
                  <span>Contact ID</span>
                  <h3>{selectedContact._id}</h3>
                </div>

                <div className="detail-item">
                  <span>Created Date</span>
                  <h3>
                    {selectedContact.createdAt
                      ? new Date(selectedContact.createdAt).toLocaleDateString()
                      : "Not Available"}
                  </h3>
                </div>

              </div>
            </div>
          )}

          {/* Settings */}
          {activePage === "Settings" && (
            <div className="settings-card">
              <h2>Settings</h2>
              <p>Welcome to ContactHub Settings.</p>
              <p>More settings will be added soon.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;
