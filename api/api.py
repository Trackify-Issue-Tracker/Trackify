"""
api.py

Contains the API logic for the Issue Tracker. Runs on its own (python) container.
Angular app must make a http call to this API to use it. This API will then connect to the
database on the postgres container and return the requested data.

These functions take in JSON data and return JSON data.

API Endpoints:
/ - Root endpoint of the API
/projects - GET all project data stored in the database
/projects - POST (create) project
/projects/{id} - GET project data by ID
/projects/{id} - PUT (update) project data by ID
/projects/{id} - DELETE project data by ID
/projects/{id}/issues - GET all issues by project ID
/projects/{id}/issues - POST (create) issues by project ID
/issues - GET all issues' data stored in the database
/issues/{id} - GET issue by issue ID
/issues/{id} - PUT (update) issue by issue ID
/issues/{id} - DELETE issue by issue ID
/reset - DELETE all data in the database
"""

import os
import psycopg2
from flask import Flask, jsonify, request


POSTGRES_URL = os.environ["POSTGRES_URL"]
app = Flask(__name__)


@app.route("/")
def root():
    """
    Root endpoint of the API.

    Returns a message with a generic "Hello World" string.

    :return: JSON response with a message
    """
    return jsonify({"message": "Trackify API says hello!"}), 200


@app.route("/reset", methods=["DELETE"])
async def delete_everything():
    """
    DELETE all data in the database.

    Returns a JSON response with a message. If the operation is successful, the status code is 204.
    If the operation fails, the status code is 500 with an error message.

    :return: JSON response with a message
    """
    try:
        # Attempt to connect to the database
        conn = psycopg2.connect(POSTGRES_URL)
        cur = conn.cursor()
        # Attempt operation
        try:
            cur.execute("DELETE FROM issues")
            conn.commit()
            cur.execute("DELETE FROM projects")
            conn.commit()
            cur.close()
            conn.close()
            return jsonify({"message": "Data deleted successfully"}), 204
        except psycopg2.Error as e:
            return (
                jsonify(
                    {
                        "message": f"An error occurred while trying to delete the data: {str(e)}"
                    }
                ),
                500,
            )

    # If database has connection or other error
    except psycopg2.Error as e:
        return (
            jsonify({"message": f"A connection or other issue occured: {str(e)}"}),
            500,
        )


@app.route("/projects", methods=["GET"])
async def get_all_projects():
    """
    GET all projects from the database.

    Returns a JSON response with a status code of 200 if the operation is successful,
    or a status code of 500 with an error message if the operation fails.

    :return: JSON response with a list of projects
    """
    try:
        # Attempt to connect to the database
        conn = psycopg2.connect(POSTGRES_URL)
        cur = conn.cursor()
        # Attempt operation
        try:
            cur.execute("SELECT * FROM projects")
            rows = cur.fetchall()
            cur.close()
            conn.close()
            return jsonify({"message": rows}), 200
        except psycopg2.Error as e:
            return (
                jsonify(
                    {
                        "message": f"An issue occured when trying to get all projects: {str(e)}"
                    }
                ),
                500,
            )

    # If database has connection or other error
    except psycopg2.Error as e:
        return (
            jsonify({"message": f"A connection or other issue occured: {str(e)}"}),
            500,
        )


@app.route("/projects", methods=["POST"])
async def create_project():
    """
    POST a new project to the database.

    Returns a JSON response with a status code of 201 if the operation is successful,
    or a status code of 400 with an error message if the request is invalid,
    or a status code of 500 with an error message if the operation fails.

    :param name: The name of the project to be added
    :param description: The description of the project to be added
    :return: JSON response with a message
    """
    try:
        # Attempt to connect to the database
        conn = psycopg2.connect(POSTGRES_URL)
        cur = conn.cursor()

        # Get the project data
        request_json = request.get_json(silent=True)
        if request_json is None:
            return (
                jsonify({"message": f"Could not parse json data: {request.data}"}),
                415,
            )

        # Initialize variables
        name = None
        description = None

        # Validate the data provided
        # Name field is required, throw error if not provided
        if "name" in request_json:
            name = request_json["name"]
        else:
            return (
                jsonify(
                    {
                        "message": "Invalid request, no name provided. This is a required field"
                    }
                ),
                400,
            )
        # Description field is optional, get if available
        if "description" in request_json:
            description = request_json["description"]
        else:
            description = ""

        # Attempt operation
        try:
            cur.execute(
                "INSERT INTO projects (name, description) VALUES (%s, %s)",
                (name, description),
            )
            conn.commit()
            row_delta = cur.rowcount
            cur.close()
            conn.close()

            # Validate if the operation was successful
            if row_delta == 1:
                return jsonify({"message": "Data added successfully"}), 201
            elif row_delta > 1:
                return jsonify({"message": "Multiple rows added unexpectedly"}), 500
            else:
                return jsonify({"message": "Data was not added successfully"}), 500
        except psycopg2.Error as e:
            return (
                jsonify(
                    {
                        "message": f"An issue occured when trying to add the project: {str(e)}"
                    }
                ),
                500,
            )

    # If database has connection or other error
    except psycopg2.Error as e:
        return jsonify({"message": str(e)}), 500


@app.route("/projects/<project_id>", methods=["GET"])
async def get_project_by_id(project_id):
    """
    GET a project from the database by ID.

    Returns a JSON response with a status code of 200 if the project is found,
    or a status code of 404 with an error message if the project is not found,
    or a status code of 500 with an error message if the operation fails.

    :param id: ID of the project to be retrieved
    :return: JSON response with a project
    """
    try:
        # Attempt to connect to the database
        conn = psycopg2.connect(POSTGRES_URL)
        cur = conn.cursor()

        # Attempt operation
        try:
            cur.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
            row = cur.fetchone()
            cur.close()
            conn.close()
            if row:
                return jsonify({"message": row}), 200
            else:
                return jsonify({"message": "Project not found"}), 404
        except psycopg2.Error as e:
            return (
                jsonify(
                    {
                        "message": f"An issue occured when trying to get the project: {str(e)}"
                    }
                ),
                500,
            )
    except psycopg2.Error as e:
        return (
            jsonify({"message": f"A connection or other issue occured: {str(e)}"}),
            500,
        )


@app.route("/projects/<project_id>", methods=["PUT"])
async def update_project_by_id(project_id):
    """
    Update a project in the database.

    Returns a JSON response with a status code of 200 if the project is updated successfully,
    or a status code of 500 with an error message if the operation fails.

    :param id: ID of the project to be updated
    :param value: new value of the project
    :return: JSON response with a message
    """
    try:
        # Attempt to connect to the database
        conn = psycopg2.connect(POSTGRES_URL)
        cur = conn.cursor()

        # Get the updated project
        request_json = request.get_json(silent=True)
        if request_json is None:
            return (
                jsonify({"message": f"Could not parse json data: {request.data}"}),
                415,
            )

        # Initialize variables
        name = None
        description = None

        # Get the data provided
        if "name" in request_json:
            name = request_json["name"]
        if "description" in request_json:
            description = request_json["description"]

        # Attempt operation
        try:
            # Update specified parts
            if name:
                cur.execute(
                    "UPDATE projects SET name = %s WHERE id = %s", (name, project_id)
                )
            if description:
                cur.execute(
                    "UPDATE projects SET description = %s WHERE id = %s",
                    (description, project_id),
                )
            conn.commit()
            cur.close()
            conn.close()
            return jsonify({"message": "Data updated successfully"}), 200
        except psycopg2.Error as e:
            return (
                jsonify(
                    {
                        "message": f"An issue occured when trying to get the project: {str(e)}"
                    }
                ),
                500,
            )

    # If database has connection or other error
    except psycopg2.Error as e:
        return (
            jsonify({"message": f"A connection or other issue occured: {str(e)}"}),
            500,
        )


@app.route("/projects/<project_id>", methods=["DELETE"])
async def delete_project_by_id(project_id):
    """
    Delete a project from the database.

    Returns a JSON response with a status code of 200 if the project is deleted successfully,
    or a status code of 500 with an error message if the operation fails.

    :param id: ID of the project to be deleted
    :return: JSON response with a message
    """
    try:
        # Attempt to connect to the database
        conn = psycopg2.connect(POSTGRES_URL)
        cur = conn.cursor()
        # Attempt operation
        try:
            cur.execute("DELETE FROM issues WHERE project_id = %s", (project_id,))
            conn.commit()
            cur.execute("DELETE FROM projects WHERE id = %s", (project_id,))
            conn.commit()
            cur.close()
            conn.close()
            return jsonify({"message": "Data deleted successfully"}), 204
        except psycopg2.Error as e:
            return (
                jsonify(
                    {
                        "message": f"An error occurred while trying to delete the data: {str(e)}"
                    }
                ),
                500,
            )

    # If database has connection or other error
    except psycopg2.Error as e:
        return (
            jsonify({"message": f"A connection or other issue occured: {str(e)}"}),
            500,
        )


@app.route("/projects/<project_id>/issues", methods=["GET"])
async def get_issues_by_project_id(project_id):
    """
    GET all issues by project ID.

    Returns a JSON response with a status code of 200 if the operation is successful,
    or a status code of 500 with an error message if the operation fails.

    :param id: ID of the project to be queried
    :return: JSON response with a list of issues
    """
    try:
        # Attempt to connect to the database
        conn = psycopg2.connect(POSTGRES_URL)
        cur = conn.cursor()

        # Attempt operation
        try:
            cur.execute("SELECT * FROM issues WHERE project_id = %s", (project_id,))
            rows = cur.fetchall()
            cur.close()
            conn.close()
            return jsonify({"message": rows}), 200
        except psycopg2.Error as e:
            return (
                jsonify(
                    {
                        "message": f"An error occurred while trying to get all issues: {str(e)}"
                    }
                ),
                500,
            )

    # If database has connection or other error
    except psycopg2.Error as e:
        return (
            jsonify({"message": f"A connection or other issue occured: {str(e)}"}),
            500,
        )


@app.route("/projects/<project_id>/issues", methods=["POST"])
async def create_issue_by_project_id(project_id):
    """
    POST a new issue to the database by project ID.

    Returns a JSON response with a status code of 200 if the operation is successful,
    or a status code of 500 with an error message if the operation fails.

    :param id: ID of the project to be queried
    :param value: value of the issue to be created
    :return: JSON response with a message
    """
    try:
        conn = psycopg2.connect(POSTGRES_URL)
        cur = conn.cursor()

        # Get issue data
        request_json = request.get_json(silent=True)
        if request_json is None:
            return (
                jsonify({"message": f"Could not parse json data: {request.data}"}),
                415,
            )

        # Initialize variables
        title = None
        description = None

        # Validate the data provided
        # Title field is required, throw error if not provided
        if "title" in request_json:
            title = request_json["title"]
        else:
            return (
                jsonify(
                    {
                        "message": "Invalid request, no title provided. This is a required field"
                    }
                ),
                400,
            )
        # Description field is optional, get if available
        if "description" in request_json:
            description = request_json["description"]
        else:
            description = ""

        # Attempt operation
        try:
            cur.execute(
                "INSERT INTO issues (project_id, title, description) VALUES (%s, %s, %s)",
                (project_id, title, description),
            )
            conn.commit()
            row_delta = cur.rowcount
            cur.close()
            conn.close()

            # Validate if the operation was successful
            if row_delta == 1:
                return jsonify({"message": "Data added successfully"}), 201
            elif row_delta > 1:
                return jsonify({"message": "Multiple rows added unexpectedly"}), 500
            else:
                return jsonify({"message": "Data was not added successfully"}), 500
        except psycopg2.Error as e:
            return (
                jsonify(
                    {
                        "message": f"An error occurred while trying to create an issue: {str(e)}"
                    }
                ),
                500,
            )

    except psycopg2.Error as e:
        return (
            jsonify({"message": f"A connection or other issue occured: {str(e)}"}),
            500,
        )


@app.route("/issues/<issue_id>", methods=["GET"])
async def get_issue_by_id(issue_id):
    """
    GET an issue from the database by ID.

    Returns a JSON response with a status code of 200 if the issue is found,
    or a status code of 404 with an error message if the issue is not found,
    or a status code of 500 with an error message if the operation fails.

    :param id: ID of the project to be queried
    :param issue_id: ID of the issue to be retrieved
    :return: JSON response with a issue
    """
    try:
        # Attempt to connect to the database
        conn = psycopg2.connect(POSTGRES_URL)
        cur = conn.cursor()

        # Attempt operation
        try:
            cur.execute(
                "SELECT * FROM issues WHERE id = %s", (issue_id,)
            )  # AND project_id = %s
            row = cur.fetchone()
            cur.close()
            conn.close()
            if row:
                return jsonify({"message": row}), 200
            else:
                return jsonify({"message": "Issue not found"}), 404
        except psycopg2.Error as e:
            return (
                jsonify(
                    {
                        "message": f"An error occurred while trying to get the issue: {str(e)}"
                    }
                ),
                500,
            )

    # If database has connection or other error
    except psycopg2.Error as e:
        return (
            jsonify({"message": f"A connection or other issue occured: {str(e)}"}),
            500,
        )


@app.route("/issues/<issue_id>", methods=["PUT"])
async def update_issue_by_id(issue_id):
    """
    PUT an issue to the database by ID.

    Returns a JSON response with a status code of 200 if the operation is successful,
    or a status code of 500 with an error message if the operation fails.

    :param id: ID of the project to be queried
    :param issue_id: ID of the issue to be updated
    :param value: value of the issue to be updated
    :return: JSON response with a message
    """
    try:
        # Attempt to connect to the database
        conn = psycopg2.connect(POSTGRES_URL)
        cur = conn.cursor()

        # Get issue data
        request_json = request.get_json(silent=True)
        if request_json is None:
            return (
                jsonify({"message": f"Could not parse json data: {request.data}"}),
                415,
            )

        # Initialize variables
        title = None
        description = None
        project_id = None

        # Get the data provided
        # Title field is required, throw error if not provided
        if "project_id" in request_json:
            project_id = request_json["project_id"]
        if "title" in request_json:
            title = request_json["title"]
        if "description" in request_json:
            description = request_json["description"]

        # Attempt operation
        try:
            # Update specified parts
            if project_id:
                cur.execute(
                    "UPDATE issues SET project_id = %s WHERE id = %s",
                    (project_id, issue_id),
                )
            if title:
                cur.execute(
                    "UPDATE issues SET title = %s WHERE id = %s", (title, issue_id)
                )
            if description:
                cur.execute(
                    "UPDATE issues SET description = %s WHERE id = %s",
                    (description, issue_id),
                )

            conn.commit()
            cur.close()
            conn.close()
            return jsonify({"message": "Data updated successfully"}), 200
        except psycopg2.Error as e:
            return (
                jsonify(
                    {
                        "message": f"An issue occured when trying to update the issue: {str(e)}"
                    }
                ),
                500,
            )

    # If database has connection or other error
    except psycopg2.Error as e:
        return (
            jsonify({"message": f"A connection or other issue occured: {str(e)}"}),
            500,
        )


@app.route("/issues/<issue_id>", methods=["DELETE"])
async def delete_issue_by_id(issue_id):
    """
    DELETE an issue from the database by ID.

    Returns a JSON response with a status code of 200 if the issue is deleted successfully,
    or a status code of 500 with an error message if the operation fails.

    :param id: ID of the project to be queried
    :param issue_id: ID of the issue to be deleted
    :return: JSON response with a message
    """
    try:
        # Attempt to connect to the database
        conn = psycopg2.connect(POSTGRES_URL)
        cur = conn.cursor()

        # Attempt operation
        try:
            cur.execute("DELETE FROM issues WHERE id = %s", (issue_id,))
            conn.commit()
            cur.close()
            conn.close()
            return jsonify({"message": "Data deleted successfully"}), 204
        except psycopg2.Error as e:
            return (
                jsonify(
                    {
                        "message": f"An error occurred while trying to delete the data: {str(e)}"
                    }
                ),
                500,
            )

    # If database has connection or other error
    except psycopg2.Error as e:
        return (
            jsonify({"message": f"A connection or other issue occured: {str(e)}"}),
            500,
        )


@app.route("/issues", methods=["GET"])
async def get_all_issues():
    """
    GET all issues from the database.

    Returns a JSON response with a status code of 200 if the operation is successful,
    or a status code of 500 with an error message if the operation fails.

    :return: JSON response with a list of issues
    """
    try:
        # Attempt to connect to the database
        conn = psycopg2.connect(POSTGRES_URL)
        cur = conn.cursor()

        # Attempt operation
        try:
            cur.execute("SELECT * FROM issues")
            rows = cur.fetchall()
            cur.close()
            conn.close()
            return jsonify({"message": rows}), 200
        except psycopg2.Error as e:
            return (
                jsonify(
                    {
                        "message": f"An issue occured when trying to get all projects: {str(e)}"
                    }
                ),
                500,
            )

    # If database has connection or other error
    except psycopg2.Error as e:
        return (
            jsonify({"message": f"A connection or other issue occured: {str(e)}"}),
            500,
        )


# Run the FastAPI application
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
