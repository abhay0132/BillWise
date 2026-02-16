import api from "../api";

export const uploadBill = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/bills/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return res.data;
};

export const getBills = async (page = 1, limit = 10) => {
  const res = await api.get(`/bills?page=${page}&limit=${limit}`);
  return res.data;
};

export const updateBill = async (id, updatedData) => {
  const res = await api.put(`/bills/${id}`, updatedData);
  return res.data;
};
