# Screenshots and videos
![image](https://github.com/NoamRivlin/statuses_transitions/assets/88899637/7d916c24-956c-4aae-b59c-fff8f1e0708a)

https://github.com/NoamRivlin/statuses_transitions/assets/88899637/e7548c5b-1f94-4c73-a667-dd0d7d02f735

## [Link to the deployed site](https://statuses-transitions-client.onrender.com)

**Brief description of the project**
A workflow visualization and management tool built with TypeScript and MongoDB.
This project enables users to define, edit, and visualize status transitions for any process or system, with a shared database backend.
Multiple users can interact with the workflow in real-time, although unexpected behavior may occur if multiple users edit simultaneously.


## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Endpoints](#endpoints)
4. [Usage](#usage)
5. [Contributing](#contributing)
6. [License](#license)

## Introduction

A web application designed for representing and managing workflow states and transitions, showcasing the BFS algorithm in a real use case.
It provides a visual and interactive way to organize, track, and update the progression of items through various statuses—such as tasks in a project, tickets in a support system, or steps in a business process.

The backend is built with TypeScript and MongoDB, offering a REST API for managing statuses and transitions.
The shared MongoDB means all users interact with the same data, making it easy to collaborate and experiment, but potentially leading to race conditions if multiple users edit at the same time. The project is ideal for demonstrating workflow logic, experimenting with process design, and serving as a foundation for custom workflow-based applications.

## Installation

To run this project locally, follow these steps:

1. Clone the repository:

```bash
git clone <repository-url>
cd <project-directory>
```

2. Install the dependencies:

```bash
npm install
```

3. Create a `.env` file in the server root directory and set the required environment variables:

```bash
PORT=<port-number>
MONGO_URI=<mongodb-connection-string>
```

4. Start the server:

```bash
npm start
```

## Endpoints

The API provides the following endpoints:

### 1. `POST /api/status`

- Description: Adds a new status.
- Parameters:
  - `name`: Name of the status (string).
- Response:
  - `201`: If the status is successfully created.
  - `400`: If the status name already exists.
  - `500`: If there's an internal server error.

### 2. `GET /api/statuses`

- Description: Retrieves all statuses.
- Response:
  - `200`: If the statuses are successfully retrieved.
  - `400`: If there are no statuses to be found.
  - `500`: If there's an internal server error.

### 3. `DELETE /api/statuses`

- Description: Deletes a status.
- Parameters:
  - `id`: Id of the status to be deleted (string).
- Response:
  - `204`: If the status is successfully deleted.
  - `400`: If the status does not exist.
  - `500`: If there's an internal server error.

### 4. `PATCH /api/statuses`

- Description: Edits the initial status and updates related statuses.
- Parameters:
  - `id`: Id of the new initial status (string).
- Response:
  - `200`: If the initial status is successfully updated along with related statuses.
  - `400`: If the status does not exist or is already the initial status.
  - `500`: If there's an internal server error.

### 5. `DELETE /api/statuses/reset`

- Description: Resets the statuses and transitions (for testing purposes).
- Response:
  - `204`: If the reset is successful.
  - `500`: If there's an internal server error.

### 6. `POST /api/statuses/reset`

- Description: Adds default statuses and transitions (for testing purposes).
- Response:
  - `201`: If the default statuses and transitions are successfully created.
  - `400`: If the statuses array is empty.
  - `500`: If there's an internal server error.

### 7. `POST /api/transition`

- Description: Adds a new transition.
- Parameters:
  - `name`: Name of the transition (string).
  - `sourceId`: Id of the source status .
  - `targetId`: Id of the target status .
- Response:
  - `201`: If the transition is successfully created.
  - `400`: If the transition name already exists.
  - `500`: If there's an internal server error.

### 8. `GET /api/transitions`

- Description: Retrieves all transitions.
- Response:
  - `200`: If the transitions are successfully retrieved.
  - `500`: If there's an internal server error.

### 9. `DELETE /api/transitions`

- Description: Deletes a transition.
- Parameters:
  - `id`: Id of the transition to be deleted.
- Response:
  - `204`: If the transition is successfully deleted.
  - `400`: If the transition does not exist.
  - `500`: If there's an internal server error.

## Usage

Explain how to use the endpoints with examples if necessary.

## Contributing

If you want to contribute to this project, follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make the changes and commit them.
4. Push the changes to your forked repository.
5. Open a pull request to the main repository.

## License

[MIT](https://choosealicense.com/licenses/mit/)

