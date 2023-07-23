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
// remember to remove test button and
// and bring onStart function
function App() {
  // still theres a delay in the loading text showing up
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
      console.log(error);
    } finally {
    }
  };

  const handleAddStatus = async (name: string) => {
    try {
      if (name === statuses.find((status) => status.name === name)?.name) {
        return;
      }
      setIsLoading(true);
      const res = await axios.post(`${API_URL}/api/status/`, { name });
      console.log("res.data", res.data);

      setStatuses([...statuses, res.data]);
      setStatusName("");
      setIsLoading(false);
    } catch (error) {
      console.log(error);
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
      // setIsLoading(true);
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

      setTransitions([...transitions, res.data]);
      setTransitionName("");
      setFromStatus("");
      setToStatus("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteStatus = async (id: string) => {
    setIsLoading(true);
    try {
      // add to the request body the id of the status to be deleted
      const res = await axios.delete(`${API_URL}/api/status/`, {
        data: { id },
      });
      // fetchStatusesAndTransitions();
      setStatuses(statuses.filter((status) => status._id !== id));
      setTransitions(
        transitions.filter(
          (transition) =>
            transition.sourceId !== id || transition.targetId !== id
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteTransition = async (id: string) => {};

  const handleEditInitStatus = async (id: string) => {
    setInitStatus(statuses.find((status) => status._id === id));
    try {
      await axios.patch(`${API_URL}/api/status/`, {
        data: { id },
      });
      fetchStatusesAndTransitions();
    } catch (error) {
      console.log(error);
    }
  };

  const handleTest = async () => {
    try {
      setIsLoading(true);
      const res = await axios.post(`${API_URL}/api/status/reset`);
      fetchStatusesAndTransitions();
      console.log(res);
    } catch (error) {
      console.log(error);
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
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const onStart = async () => {
    await handleReset();
    resetLocalState();
    await handleTest();
  };

  useEffect(() => {
    try {
      // onStart();
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
              <div key={status._id}>
                <label>
                  <input
                    type="radio"
                    name="status"
                    className="status"
                    value={status._id}
                    checked={initStatus === status._id}
                    onChange={() => {
                      handleEditInitStatus(status._id);
                    }}
                  />
                  {status.name}
                  <button
                    onClick={() => {
                      console.log("status", status.name);
                      handleDeleteStatus(status._id);
                    }}
                  >
                    Remove
                  </button>
                  {status.initStatus && <span>{"[Initial Status]"}</span>}
                  {status.orphan && <span>{"[Orphan]"}</span>}
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
              console.log(
                "e.target.value",
                e.target.value,
                "fromStatus",
                fromStatus
              );

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
              console.log(
                "e.target.value",
                e.target.value,
                "toStatus",
                toStatus
              );
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
