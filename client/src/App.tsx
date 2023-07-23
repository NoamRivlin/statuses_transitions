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
  const [initStatus, setInitStatus] = useState<IStatus>();

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
    setInitStatus(id);
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
        <div className="status-container">
          <h3>Statuses </h3>
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
                    className="status"
                    value={status._id}
                    // checked={initStatus === status._id}
                    checked={initStatus === status._id}
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
        </div>
        {/* ------------------------------------------- */}
        <div className="transition-container">
          <h3>Transitions </h3>
          <input type="text" />
          From:
          <select name="source" className="source">
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
            // add text of transition list

            transitions.length > 0 &&
            transitions.map((transition) => (
              <div key={transition._id} className="transition">
                <ul>
                  <li>
                    {transition.name}:{" "}
                    {
                      statuses.find(
                        (status) => status._id === transition.sourceId
                      )?.name
                    }
                    {"-> "}
                    {
                      statuses.find(
                        (status) => status._id === transition.targetId
                      )?.name
                    }
                    <button
                      onClick={() => handleDeleteTransition(transition._id)}
                    >
                      Remove
                    </button>
                  </li>
                </ul>
              </div>
            ))
          )}
        </div>
      </main>
      <div className="reset-btns-container">
        <div className="reset-btn">
          <button className="reset-btn" onClick={handleReset}>
            Reset
          </button>
        </div>
        <div className="test-btn">
          <button onClick={handleTest}>Test</button>
        </div>
      </div>
    </>
  );
}

export default App;
