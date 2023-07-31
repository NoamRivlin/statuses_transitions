import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

interface IStatus {
  name: string;
  _id: string;
  transitions: Array<any>;
  initStatus: boolean;
  orphan: boolean;
}

interface ITransition {
  _id: string;
  name: string;
  sourceId: string;
  targetId: string;
}

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statuses, setStatuses] = useState<IStatus[]>([]);
  const [transitions, setTransitions] = useState<ITransition[]>([]);
  const [initStatus, setInitStatus] = useState<IStatus>();
  const [fromStatus, setFromStatus] = useState<string>("");
  const [toStatus, setToStatus] = useState<string>("");
  const [statusName, setStatusName] = useState<string>("");
  const [transitionName, setTransitionName] = useState<string>("");

  const fetchStatusesAndTransitions = async () => {
    setIsLoading(true);
    try {
      // do a single request to get both statuses and transitions
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
      console.error(error);
    } finally {
    }
  };

  const handleAddStatus = async (name: string) => {
    try {
      if (name === statuses.find((status) => status.name === name)?.name) {
        return;
      }
      const res = await axios.post(`${API_URL}/api/status/`, { name });

      setStatuses([...statuses, res.data]);
      setStatusName("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddTransition = async ({
    name,
    sourceId,
    targetId,
  }: {
    name: string;
    sourceId: string;
    targetId: string;
  }) => {
    try {
      if (
        name ===
        transitions.find((transition) => transition.name === name)?.name
      ) {
        return;
      }

      const res = await axios.post(`${API_URL}/api/transition/`, {
        name,
        sourceId,
        targetId,
      });
      const updatedStatuses = await axios.get(`${API_URL}/api/status/`);
      console.log("updatedStatuses", updatedStatuses.data);
      
      setTransitions([...transitions, res.data]);
      setTransitionName("");
      setFromStatus("");
      setToStatus("");
      setStatuses(updatedStatuses.data)
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteStatus = async (id: string) => {
    setIsLoading(true);
    try {
      // add to the request body the id of the status to be deleted
      const res = await axios.delete(`${API_URL}/api/status/`, {
        data: { id },
      });

      setStatuses(res.data);
      setTransitions(
        transitions.filter(
          (transition) =>
            transition.sourceId !== id && transition.targetId !== id
        )
      );

      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTransition = async (id: string) => {
  
    try {
      // add to the request body the id of the status to be deleted
      const res = await axios.delete(`${API_URL}/api/transition/`, {
        data: { id },
      });

      setTransitions(res.data);
      const updatedStatuses = await axios.get(`${API_URL}/api/status/`);
      setStatuses(updatedStatuses.data)
    } catch (error) {
      console.error(error);
    }
  
  };

  const handleEditInitStatus = async (id: string) => {
    setInitStatus(statuses.find((status) => status._id === id));
    try {
      const res = await axios.patch(`${API_URL}/api/status/`, {
        id,
      });
      setStatuses(res.data.updatedStatuses);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTest = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/api/status/reset`);

      setStatuses(res?.data?.statuses);
      setTransitions(res?.data?.transitions);
      setInitStatus(
        res?.data?.statuses.find((status: any) => status.initStatus)
      );
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };
  const resetLocalState = () => {
    setStatuses([]);
    setTransitions([]);
    setFromStatus("");
    setToStatus("");
    setInitStatus(undefined);
    setStatusName("");
    setTransitionName("");
  };

  const handleReset = async () => {
    try {
      setIsLoading(true);
      const res = await axios.delete(`${API_URL}/api/status/reset`);
      resetLocalState();
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const onStart = async () => {
    await handleReset();
    await handleTest();
  };

  useEffect(() => {
    try {
      onStart();
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <>
      <h1>Build Your Workflow</h1>
      <main className="container">
        <div className="status-container">
          <h3>Statuses </h3>
          <input
            type="text"
            value={statusName}
            onChange={(e) => setStatusName(e.target.value)}
          />
          <button
            className="add-btn"
            onClick={() => handleAddStatus(statusName)}
          >
            Add
          </button>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            statuses.length > 0 &&
            statuses.map((status) => (
              <div key={status._id} className="status">
                <label>
                  <input
                    type="radio"
                    name="status"
                    value={status._id}
                    checked={initStatus?._id === status._id}
                    onChange={() => {
                      handleEditInitStatus(status._id);
                    }}
                  />
                  {status.name}
                  <button
                    onClick={() => {
                      handleDeleteStatus(status._id);
                    }}
                  >
                    Remove
                  </button>
                  {status.initStatus && <span>{"[Initial Status]"}</span>}
                  {status.orphan && <span>{"[Orphan]"}</span>}
                  {status.transitions.length < 1 && <span>{"[Final]"}</span>}
                </label>
              </div>
            ))
          )}
        </div>
        {/* ---------------------------------------------------------- */}
        <div className="transition-container">
          <h3>Transitions </h3>
          <input
            type="text"
            value={transitionName}
            onChange={(e) => setTransitionName(e.target.value)}
          />
          From:
          <select
            name="source"
            className="source"
            value={fromStatus}
            onChange={(e) => {
              setFromStatus(e.target.value);
              setToStatus("");
            }}
          >
            {statuses.length > 0 && (
              <>
                <option value="">Select from</option>
                {statuses.map((status) => (
                  <option key={status._id} value={status._id}>
                    {status.name}
                  </option>
                ))}
              </>
            )}
          </select>
          To:
          <select
            name="target"
            id="target"
            value={toStatus}
            onChange={(e) => {
              setToStatus(e.target.value);
            }}
            disabled={!fromStatus}
          >
            {statuses.length > 0 && (
              <>
                <option value="">Select to</option>
                {statuses
                  .filter((status) => status._id !== fromStatus)
                  .map((status) => (
                    <option key={status._id} value={status._id}>
                      {status.name}
                    </option>
                  ))}
              </>
            )}
          </select>
          <button
            className="add-btn"
            onClick={() =>
              handleAddTransition({
                name: transitionName,
                sourceId: fromStatus,
                targetId: toStatus,
              })
            }
          >
            Add
          </button>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            transitions.length > 0 &&
            transitions.map((transition) => (
              <ul key={transition._id} className="transition">
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
        {/* <div className="test-btn">
          <button onClick={()=>handleTest()}>Test</button>
        </div> */}
      </div>
    </>
  );
}

export default App;
