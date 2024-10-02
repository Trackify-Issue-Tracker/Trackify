# Trackify
Trackify is an Issue Tracker app that was built using containers. The PostgreSQL database, Python API, and Angular app hosted on NgInx are in seperate containers. The API and the database are connected to an internal network and cannot be accessed from outside.

## Overview
Database (Online, 3rd-Party)  <-> API (Hosted with website) <-> API Interface <-> Frontend

## API
The API will be built in python and will have functions to operate on data in the database

How it works:

### API Endpoints

- `/` - Root endpoint of the API
- `/projects` - GET all project data stored in the database
- `/projects` - POST (create) project
- `/projects/{id}` - GET project data by ID
- `/projects/{id}` - PUT (update) project data by ID
- `/projects/{id}` - DELETE project data by ID
- `/projects/{id}/issues` - GET all issues by project ID
- `/projects/{id}/issues` - POST (create) issues by project ID
- `/projects/{id}/issues/{id}` - GET issue by issue ID
- `/projects/{id}/issues/{id}` - PUT (update) issue by issue ID
- `/projects/{id}/issues/{id}` - DELETE issue by issue ID
- `/issues` - GET all issues' data stored in the database


### API Interface
The API Interface will be built in Angular and contain the necessary functions to call the api

## Storage
The database for storage will be PostgreSQL


