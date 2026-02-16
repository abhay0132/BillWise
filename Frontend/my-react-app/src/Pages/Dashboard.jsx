import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Dashboard.css";
import { getBills, updateBill } from "../api/bills";
import { useAuth } from "../Context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchBills = async () => {
    try {
      setLoading(true);
      const data = await getBills(page, 10);
      setBills(data.bills || []);
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch bills:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, user, navigate]);

  const startEdit = (bill) => {
    setEditingId(bill._id);
    setEditForm({
      place: bill.place,
      mode: bill.mode,
      date: bill.date?.split("T")[0] || "",
      price: bill.price
    });
  };

  const saveEdit = async () => {
    try {
      await updateBill(editingId, editForm);
      setEditingId(null);
      fetchBills();
    } catch (err) {
      console.error("Failed to update bill:", err);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="loading-state">Loading your bills...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Manage and track all your expenses</p>
        </div>

        {bills.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3>No bills yet</h3>
            <p>Upload your first receipt to get started</p>
            <button onClick={() => navigate("/upload")} className="empty-cta">
              Upload Receipt
            </button>
          </div>
        ) : (
          <>
            <div className="bills-table-container">
              <table className="bills-table">
                <thead>
                  <tr>
                    <th>Place</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill._id}>
                      <td>
                        {editingId === bill._id ? (
                          <input
                            type="text"
                            value={editForm.place}
                            onChange={(e) =>
                              setEditForm((p) => ({ ...p, place: e.target.value }))
                            }
                            className="edit-input"
                          />
                        ) : (
                          bill.place
                        )}
                      </td>

                      <td>
                        {editingId === bill._id ? (
                          <select
                            value={editForm.mode}
                            onChange={(e) =>
                              setEditForm((p) => ({ ...p, mode: e.target.value }))
                            }
                            className="edit-select"
                          >
                            <option value="UPI">UPI</option>
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                          </select>
                        ) : (
                          <span className="payment-badge">{bill.mode}</span>
                        )}
                      </td>

                      <td>
                        {editingId === bill._id ? (
                          <input
                            type="date"
                            value={editForm.date}
                            onChange={(e) =>
                              setEditForm((p) => ({ ...p, date: e.target.value }))
                            }
                            className="edit-input"
                          />
                        ) : (
                          new Date(bill.date).toLocaleDateString()
                        )}
                      </td>

                      <td className="amount-cell">
                        {editingId === bill._id ? (
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) =>
                              setEditForm((p) => ({ ...p, price: e.target.value }))
                            }
                            className="edit-input"
                          />
                        ) : (
                          `₹${bill.price}`
                        )}
                      </td>

                      <td>
                        {editingId === bill._id ? (
                          <div className="edit-actions">
                            <button onClick={saveEdit} className="save-btn">
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="cancel-btn"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(bill)} className="edit-btn">
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}