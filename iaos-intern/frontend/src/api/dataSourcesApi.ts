import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/modules/data_analytics_caat",
});

export const getDataSources = async () => {
  try {
    const res = await api.get("/data-sources");

    console.log("API SUCCESS", res.data);

    return res.data;

  } catch (err) {

    console.error("API ERROR", err);

    throw err;

  }
};

export const createDataSource = async (data: any) => {
  const res = await api.post("/data-sources", data);
  return res.data;
};

export const updateDataSource = async (id: number, data: any) => {
  const res = await api.put(`/data-sources/${id}`, data);
  return res.data;
};

export const deleteDataSource = async (id: number) => {
  await api.delete(`/data-sources/${id}`);
};