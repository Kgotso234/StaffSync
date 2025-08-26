# StaffSync - A Basic Leave Management System

## Project Overview

StaffSync is a basic, yet functional, leave management system designed to streamline the process of applying for and tracking employee leave. This system allows employees to easily submit leave requests, view their leave history, and monitor their remaining leave days.

### Key Features

- **Leave Application:** Employees can submit new leave requests with details such as leave type, dates, and reason.
- **Leave Tracking:** Users can view the status of their leave requests (pending, approved, rejected).
- **History Log:** A comprehensive log of all past leave applications and their outcomes.
- **Leave Entitlement:** Employees can see their total allocated leave days and the remaining balance.

## Tech Stack

The project is built using the following technologies:

- **Frontend:**

  - HTML5
  - CSS3
  - **Tailwind CSS**: A utility-first CSS framework for rapid UI development.

- **Backend:**

  - **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
  - **Express.js**: A fast, unopinionated, minimalist web framework for Node.js.

- **Database:**
  - **MongoDB**: A NoSQL, document-oriented database.

## Getting Started

Follow these steps to get a copy of the project up and running on your local machine.

### Prerequisites

You need to have the following software installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (which includes npm)
- [MongoDB](https://www.mongodb.com/try/download/community)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone git@github.com:your_username/StaffSync.git
    cd StaffSync
    ```

2.  **Install backend dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    - Create a `.env` file in the root directory.
    - Add your MongoDB connection string to this file. Replace `<db_user>`, `<db_password>`, and `<db_cluster>` with your actual MongoDB Atlas or local connection details.
    ```env
    MONGODB_URI=mongodb+srv://<db_user>:<db_password>@<db_cluster>.mongodb.net/staffsync?retryWrites=true&w=majority
    PORT=3000
    ```

### Running the Project

1.  **Start the MongoDB database:**

    - If you are running a local instance, ensure it is running.

2.  **Start the server:**

    ```bash
    npm start
    ```

    The server will start on the port defined in your `.env` file (e.g., `http://localhost:5000`).

3.  **Access the application:**
    - Open your web browser and navigate to the local host URL to view the application.

## Author

- **Kgotso Mpsane** - Initial work - [Your GitHub Profile](https://github.com/kgotso234)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
