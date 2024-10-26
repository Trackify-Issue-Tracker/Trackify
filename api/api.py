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

# TODO: add status, priority, and type field validation
# TODO: check if project_id and issue_id are valid
import os
import psycopg2
from flask import Flask, jsonify, request
from datetime import datetime as dt


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
            # format the rows so that they in the form of a dict
            formatted_rows = [
                {
                    "id": row[0],
                    "name": row[1],
                    "description": row[2],
                    "status": row[3],
                    "priority": row[4],
                    "date_created": row[5],
                    "date_started": row[6],
                    "date_closed": row[7],
                    "labels": row[8],
                }
                for row in rows
            ]
            return jsonify({"message": formatted_rows}), 200
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

        # Validate the data provided
        if "name" not in request_json or "status" not in request_json:
            return (
                jsonify(
                    {
                        "message": "Invalid request. Please fill out required fields of name and status"
                    }
                ),
                400,
            )

        # Initialize variables
        data = {
            "name": request_json["name"],
            "status": request_json["status"],
            "description": request_json.get("description"),
            "priority": request_json.get("priority"),
            "date_created": str(dt.now()),
            "date_started": request_json.get("date_started"),
            "date_closed": request_json.get("date_closed"),
            "labels": request_json.get("labels"),
        }

        # Attempt operation
        try:
            # add method to see if project already exists
            cur.execute(
                "INSERT INTO projects (name, status, description, priority, date_created, date_started, date_closed, labels) \
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING *",
                list(data.values()),
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
                        "message": f"An issue occurred when trying to add the project: {str(e)}"
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
                formatted_row = {
                    "id": row[0],
                    "name": row[1],
                    "description": row[2],
                    "status": row[3],
                    "priority": row[4],
                    "date_created": row[5],
                    "date_started": row[6],
                    "date_closed": row[7],
                    "labels": row[8],
                }
                return jsonify({"message": formatted_row}), 200
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
        data = {
            "name": request_json.get("name"),
            "description": request_json.get("description"),
            "status": request_json.get("status"),
            "priority": request_json.get("priority"),
            "date_started": request_json.get("date_started"),
            "date_closed": request_json.get("date_closed"),
            "labels": request_json.get("labels"),
        }

        # Attempt operation
        try:
            # Update specified parts
            updates = []
            args = []
            for field, value in data.items():
                if value is not None:
                    updates.append(f"{field} = %s")
                    args.append(value)
            args.append(project_id)
            if updates:
                query = f"UPDATE projects SET {', '.join(updates)} WHERE id = %s"
                cur.execute(query, args)
            conn.commit()
            row_delta = cur.rowcount
            cur.close()
            conn.close()

            # Validate if the operation was successful
            if row_delta == 1:
                return jsonify({"message": "Data updated successfully"}), 200
            elif row_delta > 1:
                return jsonify({"message": "Multiple rows updated unexpectedly"}), 500
            elif row_delta == 0:
                return jsonify({"message": "Nothing was updated/ Not Found"}), 404
            else:
                return jsonify({"message": "Data was not updated successfully"}), 500
        except psycopg2.Error as e:
            return (
                jsonify(
                    {
                        "message": f"An issue occurred when trying to update the project: {str(e)}"
                    }
                ),
                500,
            )

    # If database has connection or other error
    except psycopg2.Error as e:
        return jsonify({"message": str(e)}), 500


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
            formatted_rows = [
                {
                    "id": row[0],
                    "project_id": row[1],
                    "title": row[2],
                    "type": row[3],
                    "description": row[4],
                    "status": row[5],
                    "priority": row[6],
                    "date_created": row[7],
                    "date_started": row[8],
                    "date_due": row[9],
                    "date_closed": row[10],
                    "labels": row[11],
                }
                for row in rows
            ]
            return jsonify({"message": formatted_rows}), 200
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

    Returns a JSON response with a status code of 201 if the operation is successful,
    or a status code of 400 with an error message if the request is invalid,
    or a status code of 500 with an error message if the operation fails.

    :param project_id: ID of the project to be queried
    :param value: value of the issue to be created
    :return: JSON response with a message
    """
    try:
        # Attempt to connect to the database
        conn = psycopg2.connect(POSTGRES_URL)
        cur = conn.cursor()

        # Get the issue data
        request_json = request.get_json(silent=True)
        if request_json is None:
            return (
                jsonify({"message": f"Could not parse json data: {request.data}"}),
                415,
            )

        # Validate the data provided
        if (
            "title" not in request_json
            or "type" not in request_json
            or "status" not in request_json
        ):
            return (
                jsonify(
                    {
                        "message": "Invalid request. Please fill out required fields of title, type, and status"
                    }
                ),
                400,
            )

        # Initialize variables
        data = {
            "title": request_json["title"],
            "description": request_json.get("description"),
            "type": request_json["type"],
            "status": request_json["status"],
            "priority": request_json.get("priority"),
            "date_created": str(dt.now()),
            "date_started": request_json.get("date_started"),
            "date_due": request_json.get("date_due"),
            "date_closed": request_json.get("date_closed"),
            "labels": request_json.get("labels"),
            "project_id": project_id,
        }

        # Attempt operation
        try:
            # add method to see if issue already exists
            cur.execute(
                "INSERT INTO issues (title, description, type, status, priority, date_created, date_started, date_due, date_closed, labels, project_id) \
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *",
                list(data.values()),
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
                        "message": f"An issue occurred when trying to add the issue: {str(e)}"
                    }
                ),
                500,
            )

    # If database has connection or other error
    except psycopg2.Error as e:
        return jsonify({"message": str(e)}), 500


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
                formatted_row = {
                    "id": row[0],
                    "project_id": row[1],
                    "title": row[2],
                    "type": row[3],
                    "description": row[4],
                    "status": row[5],
                    "priority": row[6],
                    "date_created": row[7],
                    "date_started": row[8],
                    "date_due": row[9],
                    "date_closed": row[10],
                    "labels": row[11],
                }
                return jsonify({"message": formatted_row}), 200
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
    or a status code of 400 with an error message if the request is invalid,
    or a status code of 500 with an error message if the operation fails.

    :param issue_id: ID of the issue to be updated
    :param value: value of the issue to be updated
    :return: JSON response with a message
    """
    try:
        # Attempt to connect to the database
        conn = psycopg2.connect(POSTGRES_URL)
        cur = conn.cursor()

        # Get the issue data
        request_json = request.get_json(silent=True)
        if request_json is None:
            return (
                jsonify({"message": f"Could not parse json data: {request.data}"}),
                415,
            )

        # Initialize variables
        data = {
            "title": request_json.get("title"),
            "description": request_json.get("description"),
            "type": request_json.get("type"),
            "status": request_json.get("status"),
            "priority": request_json.get("priority"),
            "date_started": request_json.get("date_started"),
            "date_due": request_json.get("date_due"),
            "date_closed": request_json.get("date_closed"),
            "labels": request_json.get("labels"),
            "project_id": request_json.get("project_id"),
        }

        # Attempt operation
        try:
            # Update specified parts
            updates = []
            args = []
            for field, value in data.items():
                if value is not None:
                    updates.append(f"{field} = %s")
                    args.append(value)
            args.append(issue_id)
            if updates:
                cur.execute(
                    f"UPDATE issues SET {', '.join(updates)} WHERE id = %s",
                    args,
                )
            conn.commit()
            row_delta = cur.rowcount
            cur.close()
            conn.close()

            # Validate if the operation was successful
            if row_delta == 1:
                return jsonify({"message": "Data updated successfully"}), 200
            elif row_delta > 1:
                return jsonify({"message": "Multiple rows updated unexpectedly"}), 500
            elif row_delta == 0:
                return jsonify({"message": "Nothing was updated/ Not Found"}), 404
            else:
                return jsonify({"message": "Data was not updated successfully"}), 500
        except psycopg2.Error as e:
            return (
                jsonify(
                    {
                        "message": f"An issue occurred when trying to update the issue: {str(e)}"
                    }
                ),
                500,
            )

    # If database has connection or other error
    except psycopg2.Error as e:
        return jsonify({"message": str(e)}), 500


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
            formatted_rows = [
                {
                    "id": row[0],
                    "project_id": row[1],
                    "title": row[2],
                    "type": row[3],
                    "description": row[4],
                    "status": row[5],
                    "priority": row[6],
                    "date_created": row[7],
                    "date_started": row[8],
                    "date_due": row[9],
                    "date_closed": row[10],
                    "labels": row[11],
                }
                for row in rows
            ]
            return jsonify({"message": formatted_rows}), 200
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
