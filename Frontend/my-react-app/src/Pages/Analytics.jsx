import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Analytics.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getMonthlySpend, getCurrentMonthSummary } from "../api/analytics";
import { useAuth } from "../Context/AuthContext";

export default function Analytics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const [monthData, summaryData] = await Promise.all([
        getMonthlySpend(),
        getCurrentMonthSummary()
      ]);

      setMonthlyData(Array.isArray(monthData.data) ? monthData.data : []);
      setSummary(summaryData);

      setLoading(false);
    } catch (err) {
      console.error("Analytics error:", err?.response?.data || err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-container">
          <div className="loading-state">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-container">
        <div className="analytics-header">
          <h1>Analytics</h1>
          <p>Track your spending patterns and insights</p>
        </div>

        {/* Summary Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Bills This Month</div>
            <div className="stat-value">{summary?.billsCount ?? 0}</div>
            <div className="stat-period">{summary?.month}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Total Spend</div>
            <div className="stat-value">₹{summary?.totalSpend ?? 0}</div>
            <div className="stat-period">{summary?.month}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Average per Bill</div>
            <div className="stat-value">
              ₹{summary?.billsCount > 0 
                ? Math.round(summary.totalSpend / summary.billsCount) 
                : 0}
            </div>
            <div className="stat-period">This month</div>
          </div>
        </div>

        {/* Chart */}
        <div className="chart-card">
          <h2 className="chart-title">Monthly Spending Trend</h2>

          {monthlyData.length === 0 ? (
            <div className="empty-chart">
              <p>No spending data available yet. Upload some bills to see your trends.</p>
            </div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#666666"
                    style={{ fontSize: '0.875rem' }}
                  />
                  <YAxis 
                    stroke="#666666"
                    style={{ fontSize: '0.875rem' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e5e5',
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalSpend"
                    stroke="#1a1a1a"
                    strokeWidth={2}
                    dot={{ fill: '#1a1a1a', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}