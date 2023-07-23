import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

interface IStatus {
  name: string;
  _id: any; //mongoose Ojectid
  transitions: Array<any>;
  initStatus: boolean;
  orphan: boolean;
}

interface ITransition {
  _id: any; //mongoose Ojectid
  name: string;
  sourceId: any; //mongoose Ojectid
  targetId: any; //mongoose Ojectid
}

function App() {
  // still theres a delay in the loading text showing up
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statuses, setStatuses] = useState<IStatus[]>([]);
  const [transitions, setTransitions] = useState<ITransition[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<IStatus>();

  const fetchStatusesAndTransitions = async () => {
    setIsLoading(true);
    try {
      const fetchedStatuses = (await axios.get(`${API_URL}/api/status`))?.data;
      const fetchedTransitions = (await axios.get(`${API_URL}/api/transition`))
        ?.data;

      console.log(
        "fetchedStatuses",
        fetchedStatuses,
        "fetchedTransitions",
        fetchedTransitions
      );

      setStatuses(fetchedStatuses);
      setTransitions(fetchedTransitions);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const handleAddStatus = async (name: string) => {};

  const handleAddTransition = async (
    name: string,
    sourceId: any,
    targetId: any
  ) => {};

  const handleDeleteStatus = async (id: any) => {
    setIsLoading(true);
    try {
      await axios.delete(`${API_URL}/api/status/${id}`);
      fetchStatusesAndTransitions();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteTransition = async (id: any) => {};

  const handleEditInitStatus = async (id: any) => {
    setSelectedStatus(id);
  };

  const handleTest = async () => {
    try {
      setIsLoading(true);
      const res = await axios.post(`${API_URL}/api/status/reset`);
      fetchStatusesAndTransitions();
      // setIsLoading(false);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const handleReset = async () => {
    try {
      setIsLoading(true);
      const res = await axios.delete(`${API_URL}/api/status/reset`);
      fetchStatusesAndTransitions();
      // setIsLoading(false);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    try {
      fetchStatusesAndTransitions();
      // setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <>
      <h1>Build Your Workflow</h1>
      <main className="container">
        <h3>Add status </h3>
        <input type="text" />
        <button>Add</button>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          statuses.length > 0 &&
          statuses.map((status) => (
            <div key={status._id}>
              <label>
                <input
                  type="radio"
                  name="status"
                  value={status._id}
                  // checked={selectedStatus === status._id}
                  checked={selectedStatus === status._id}
                  onChange={() => handleEditInitStatus(status._id)}
                />
                {status.name}
                <button onClick={() => handleDeleteStatus(status._id)}>
                  Remove
                </button>
                {status.initStatus && <span>{"[Initial Status]"}</span>}
                {status.orphan && <span>{"[Orphan]"}</span>}
              </label>
            </div>
          ))
        )}
        {/* ------------------------------------------- */}
        <h3>Add transition </h3>
        <input type="text" />
        From:
        <select name="source" id="source">
          {statuses.length > 0 && ( // if statuses is not empty
            <>
              <option value="">Select source</option>
              {statuses.map((status) => (
                <option key={status._id} value={status._id}>
                  {status.name}
                </option>
              ))}
            </>
          )}
        </select>
        To:
        <select name="target" id="target">
          {statuses.length > 0 && ( // if statuses is not empty
            <>
              <option value="">Select target</option>
              {statuses.map((status) => (
                <option key={status._id} value={status._id}>
                  {status.name}
                </option>
              ))}
            </>
          )}
        </select>
        <button>Add</button>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          transitions.length > 0 &&
          transitions.map((transition) => (
            <div key={transition._id}>
              <ul>
                <li>{transition.name}</li>
                {"->"}
                <li>{transition.name}</li>
                <button onClick={() => handleDeleteTransition(transition._id)}>
                  Remove
                </button>
              </ul>
            </div>
          ))
        )}
      </main>
      <div className="reset-btn-container">
        <button className="reset-btn" onClick={handleReset}>
          Reset
        </button>
      </div>
      <div className="test-btn-container">
        <button onClick={handleTest}>Test</button>
      </div>
    </>
  );
}

export default App;
