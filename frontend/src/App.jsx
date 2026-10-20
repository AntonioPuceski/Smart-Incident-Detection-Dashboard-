import { useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const API_URL = "http://127.0.0.1:8000/predict";

export default function App() {
  const [form, setForm] = useState({
    "Flow Duration": 1000,
    "Tot Fwd Pkts": 20,
    "Tot Bwd Pkts": 10,
    "TotLen Fwd Pkts": 500,
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: Number(e.target.value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(API_URL, { data: form });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error contacting API");
    }
  };

  const COLORS = ["#4ade80", "#f87171"]; // green = benign, red = attack
  const chartData = result?.probability
    ? result.probability.map((value, index) => ({
        name: result.classes?.[index] === 0 ? "Benign (0)" : result.classes?.[index] === 1 ? "Attack (1)" : `Class ${index}`,
        value,
        classId: result.classes?.[index],
      }))
    : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">🚨 Smart Incident Dashboard</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-6 space-y-4 w-full max-w-md"
      >
        {Object.entries(form).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1">{key}</label>
            <input
              type="number"
              name={key}
              value={value}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
        ))}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
        >
          Predict
        </button>
      </form>

      {result && (
        <div className="mt-8 bg-white shadow rounded-lg p-6 w-full max-w-lg">
          <h2 className="text-xl font-bold mb-4">Result</h2>
          <p>
            Prediction:{" "}
            <span
              className={`font-bold ${
                result.prediction === 1 ? "text-red-600" : "text-green-600"
              }`}
            >
              {result.prediction === 1 ? "Attack" : "Benign"}
            </span>
          </p>

          {result.classes?.length === 1 && (
            <p className="mt-3 text-sm text-amber-800">
              This saved model contains only one class. Retraining with both benign and attack examples is required for binary detection.
            </p>
          )}
          {result.probability && (
            <PieChart width={400} height={300}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[entry.classId === 0 ? 0 : 1]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </div>
      )}
    </div>
  );
}
