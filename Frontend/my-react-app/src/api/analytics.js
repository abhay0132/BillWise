import api from "../api";

export const getMonthlySpend = async () => {
  const res = await api.get("/analytics/monthly-spend");
  return res.data;
};

export const getCurrentMonthSummary = async () => {
  const res = await api.get("/analytics/current-month");
  return res.data;
};
