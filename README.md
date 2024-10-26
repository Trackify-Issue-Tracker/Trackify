# Trackify: An Issue Tracker

## Overview

Trackify utilizes separate containers for its `PostgreSQL` database, `Python` API made using `Flask`, and `Angular` frontend hosted on `NgInx`. These components are interconnected via an internal network, ensuring the API and database are shielded from external access. For data persistence, the application communicates with the API over this internal network, which then interfaces with the database to securely store and retrieve data.

### Architecture

Trackify is designed with containerization in mind, with each component running in its own Docker container, managed using Docker and Docker Compose. The app employs a microservices architecture, where each component communicates with others via RESTful APIs. Additionally, it follows a service-oriented architecture, with each component providing specific services to the others.

![Arcchitecture Diagram](https://raw.githubusercontent.com/Trackify-Issue-Tracker/Trackify/main/architecture.png)

The Docker Compose file, `docker-compose.yml`, is responsible for orchestrating the deployment of these containers. It defines the services, networks, and volumes required for the application to run. The frontend service builds the Angular frontend, the backend service builds the Python Flask API, and the postgres service sets up the PostgreSQL database.

The Dockerfile, `Dockerfile`, is used to build the Docker images for the frontend and backend services. The frontend Dockerfile uses Alpine Linux to keep the image size small, and it installs the necessary dependencies for building and running the Angular application. The backend Dockerfile sets up a Python virtual environment, installs the required packages, and copies the application code into the container.

By using Docker and Docker Compose, Trackify can be easily deployed on any system that supports Docker, ensuring consistent and reproducible deployments across different environments.

### Database

Trackify uses a PostgreSQL database to store project and issue data. The database is scalable and capable of handling large volumes of data. Its schema supports multiple projects and issues, with dedicated tables for each. The database is hosted in a separate container and is inaccessible from outside the Trackify network.

### API

The Python API, built using the Flask framework, offers a RESTful interface for database interactions. It provides endpoints for creating, reading, updating, and deleting projects and issues, as well as for user authentication and authorization. The API is designed with security in mind, using SSL/TLS encryption to protect data in transit, and is scalable to handle high volumes of requests.

The API has the following endpoints:

- `/` : Root endpoint of the API
- `/projects` : GET all project data stored in the database
- `/projects` : POST (create) project
- `/projects/{id}` : GET project data by ID
- `/projects/{id}` : PUT (update) project data by ID
- `/projects/{id}` : DELETE project data by ID
- `/projects/{id}/issues` : GET all issues by project ID
- `/projects/{id}/issues` : POST (create) issues by project ID
- `/issues/{id}` : GET issue by issue ID
- `/issues/{id}` : PUT (update) issue by issue ID
- `/issues/{id}` : DELETE issue by issue ID
- `/issues` : GET all issues' data stored in the database

### Angular App

The Angular app, built using the Angular framework, provides a user-friendly interface for interacting with the API. It features a dashboard for viewing projects and issues, and forms for creating and editing them. The app is responsive, suitable for use on desktops, laptops, and mobile devices. It is served through Nginx and uses a proxy to communicate with the API. The Angular app is hosted on an external network for Nginx, while sharing the same internal network as the API and database, ensuring secure data retrieval.

#### Components

- API Service: Responsible for using HTTP methods to work on data in the database through the Python API.

## Project Setup


### Prerequisites

- `Git`: Ensure [Git](https://git-scm.com/downloads) is installed and configured on your local machine.  You can check to see if the CLI is available by running the following command:

    ```bash
    git --version
    ```

- `Docker`: Ensure you have [Docker](https://www.docker.com/products/docker-desktop/) installed on your local machine. You can check to see if the CLI is available by running the following command:

    ```bash
    docker -v
    ```

### Setup

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

**That's it!** You have now set up and run the Trackify project.

## License

This project is licensed under the GNU General Public License v3.0. See the LICENSE file for more details.
