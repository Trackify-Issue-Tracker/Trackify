# Trackify
Trackify is an Issue Tracker app that was built using containers. The PostgreSQL database, Python API, and Angular app hosted on Nginx are in separate containers. The API and the database are connected to an internal network and cannot be accessed from outside.

## Overview
The Trackify app consists of three main components:

1. Database: The app uses a PostgreSQL database to store project and issue data. The database is hosted in a separate container and cannot be accessed from outside the Trackify network.
2. API: The API is built using Python and contains functions to operate on data in the database. The API is hosted on the same network as the database and the Angular app. The API has the following endpoints:
    - `/` - Root endpoint of the API
    - `/projects` - GET all project data stored in the database
    - `/projects` - POST (create) project
    - `/projects/{id}` - GET project data by ID
    - `/projects/{id}` - PUT (update) project data by ID
    - `/projects/{id}` - DELETE project data by ID
    - `/projects/{id}/issues` - GET all issues by project ID
    - `/projects/{id}/issues` - POST (create) issues by project ID
    - `/issues/{id}` - GET issue by issue ID
    - `/issues/{id}` - PUT (update) issue by issue ID
    - `/issues/{id}` - DELETE issue by issue ID
    - `/issues` - GET all issues' data stored in the database
3. Angular App: The Angular app is hosted on the same network as the API and the database. The app communicates with the API to retrieve and update project and issue data.

## Project Setup
To set up the Trackify project, follow these steps:

1. Clone the repository: Clone the Trackify repository to your local machine using the following command:

    ```bash
    git clone https://github.com/Trackify-Issue-Tracker/Trackify.git
    ```

2. Build the Docker containers: Navigate to the project directory and build the Docker containers using the following command:

    ```bash
    docker-compose build
    ```

3. Start the Docker containers: Start the Docker containers using the following command:

    ```bash
    docker-compose up
    ```
    This will start the PostgreSQL database, Python API, and Angular app containers.

4. Access the app: Open your web browser and navigate to http://localhost:5000 to access the Trackify app.

5. Create a project: Use the app to create a new project by entering a name and description for the project.

6. Create an issue: Use the app to create a new issue by selecting a project and entering a title and description for the issue.

7. View projects and issues: Use the app to view all projects and issues stored in the database.
That's it! You have now set up and run the Trackify project.

## License
This project is licensed under the GNU General Public License v3.0. See the LICENSE file for more details.






























## other


Trackify is an Issue Tracker app that was built using containers. The PostgreSQL database, Python API, and Angular app hosted on Nginx are in separate containers. The API and the database are connected to an internal network and cannot be accessed from outside.

Overview
The Trackify app is designed to help teams manage and track issues across multiple projects. The app consists of three main components: a PostgreSQL database, a Python API, and an Angular app.

Database
The PostgreSQL database is used to store project and issue data.
The database is designed to be scalable and can handle a large volume of data.
The database schema is designed to support multiple projects and issues, with tables for projects, issues, and users.
API
The Python API is built using the Flask framework and provides a RESTful interface for interacting with the database.
The API provides endpoints for creating, reading, updating, and deleting projects and issues.
The API also provides endpoints for authenticating and authorizing users.
The API is designed to be secure and uses SSL/TLS encryption to protect data in transit.
The API is also designed to be scalable and can handle a large volume of requests.
Angular App
The Angular app is built using the Angular framework and provides a user-friendly interface for interacting with the API.
The app provides a dashboard for viewing projects and issues, as well as forms for creating and editing projects and issues.
The app also provides a user management system, allowing administrators to create and manage user accounts.
The app is designed to be responsive and can be used on a variety of devices, including desktops, laptops, and mobile devices.
Architecture
The app is designed to be containerized, with each component running in its own container.
The containers are managed using Docker and Docker Compose.
The app uses a microservices architecture, with each component communicating with the others using RESTful APIs.
The app also uses a service-oriented architecture, with each component providing a specific service to the others.
Components
Project Service: responsible for managing projects, including creating, reading, updating, and deleting projects.
Issue Service: responsible for managing issues, including creating, reading, updating, and deleting issues.
User Service: responsible for managing users, including creating, reading, updating, and deleting user accounts.
Authentication Service: responsible for authenticating and authorizing users.
Database Service: responsible for interacting with the database.