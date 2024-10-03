"""
test.py

This test suite covers the following endpoints:
    Root endpoint (/)
    Reset endpoint (/reset)
    Get all projects (/projects)
    Create project (/projects)
    Get project by ID (/projects/{id})
    Update project (/projects/{id})
    Delete project (/projects/{id})
    Get issues by project (/projects/{id}/issues)
    Get all issues (/issues)
    Create issue (/issues)
    Get issue by ID (/issues/{id})
    Update issue (/issues/{id})
    Delete issue (/issues/{id})
"""

# pylint: disable = line-too-long, too-many-lines, no-name-in-module, multiple-imports, pointless-string-statement, wrong-import-order, trailing-whitespace, invalid-name, too-many-public-methods, no-else-return, no-else-break

import sys
import unittest
import json
import psycopg2
from api import app, POSTGRES_URL


created_projects = set()


class TestAPI(unittest.TestCase):
    """
    Test suite for API endpoints
    """

    def setUp(self):
        self.app = app.test_client()
        create_test_data()

    def tearDown(self):
        """
        Clean up the database after each test
        """
        # DELETE ALL DATA CREATED BY THE TESTS
        # This actually deletes all data in the database, since the reset test already is deleting all data
        try:
            # Attempt to connect to the database
            conn = psycopg2.connect(POSTGRES_URL)
            # Create a cursor
            cur = conn.cursor()
            # Delete all data in the database
            cur.execute("DELETE FROM issues")
            cur.execute("DELETE FROM projects")
            # Commit the changes
            conn.commit()
            cur.close()
            conn.close()
        # If database has connection or other error
        except psycopg2.Error as e:
            print(e)
            sys.exit(-1)

    def test_reset_endpoint(self):
        """
        Test that the reset endpoint deletes all data in the database
        and returns a 204 status code.
        """
        # Call
        response = self.app.delete("/reset")
        # Test
        self.assertEqual(response.status_code, 204)
        self.assertEqual(self.app.get("/projects").json["message"], [])
        self.assertEqual(self.app.get("/issues").json["message"], [])
        # If reset passes, recreate the data needed for other tests
        create_test_data()

    def test_root_endpoint(self):
        """
        Test that the root endpoint returns a 200 status code and a JSON response
        with a friendly message.
        """
        # Call
        response = self.app.get("/")
        # Test
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json, {"message": "Trackify API says hello!"}, response.json
        )

    def test_create_project(self):
        """
        Test that the create project endpoint returns a 201 status code and a JSON response
        with a message indicating that the data was added successfully when given valid data.
        """
        # Create a project
        project_data = {"name": "Test Project", "description": "This is a test project"}
        response = self.app.post(
            "/projects", data=json.dumps(project_data), content_type="application/json"
        )
        # Test
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json["message"], "Data added successfully")

    def test_get_projects(self):
        """
        Test that the get projects endpoint returns a 200 status code and a JSON response
        with a list of all projects in the database when given valid data.
        """
        # Call
        response = self.app.get("/projects")
        # Test
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json["message"], list)

    def test_get_project_by_id(self):
        """
        Test that the get project by ID endpoint returns a 200 status code and a JSON response
        with the project's data when given a valid ID.
        """
        # Call
        response = self.app.get("/projects/1")
        # Test
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json["message"], list)
        self.assertEqual(response.json["message"][0], 1)

    def test_update_project(self):
        """
        Test that the update project endpoint returns a 200 status code and a JSON response
        with a message indicating that the data was updated successfully when given valid data.
        """
        # Call
        project_data = {
            "name": "Updated Test Project 1",
            "description": "This is an updated test Project 1",
        }
        response = self.app.put(
            "/projects/1",
            data=json.dumps(project_data),
            content_type="application/json",
        )
        # Get the updated project
        response_updated = self.app.get("/projects/1")
        # Test
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["message"], "Data updated successfully")
        self.assertEqual(response_updated.json["message"][1], "Updated Test Project 1")

    def test_delete_project(self):
        """
        Test that the delete project endpoint returns a 204 status code and deletes the
        project and all its associated issues from the database when given a valid ID.
        """
        # Call
        response = self.app.delete("/projects/2")
        # Ensure deletion of project
        response_del = self.app.get("/projects/2")
        # # Ensure deletion of issue
        response_issue_del = self.app.get("/issues/2")
        # Test
        self.assertEqual(response.status_code, 204)
        self.assertEqual(response_del.status_code, 404)
        self.assertEqual(response_issue_del.status_code, 404)

    def test_create_issue(self):
        """
        Test that the create issue endpoint returns a 201 status code and a JSON response
        with a message indicating that the data was added successfully when given valid data.
        """
        # Call
        issue_data = {"title": "Test Issue", "description": "This is a test issue"}
        response = self.app.post(
            "/projects/1/issues",
            data=json.dumps(issue_data),
            content_type="application/json",
        )
        # Test
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json["message"], "Data added successfully")

    def test_get_issues_by_project(self):
        """
        Test that the get issues by project endpoint returns a 200 status code and a JSON response
        with a list of all issues in the project when given valid data.
        """
        # Call
        response = self.app.get("/projects/1/issues")
        # Test
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json["message"], list)
        self.assertEqual(response.json["message"][0][1], 1)

    def test_get_issues(self):
        """
        Test that the get issues endpoint returns a 200 status code and a JSON response
        with a list of all issues in the database when given valid data.
        """
        # Call
        response = self.app.get("/issues")
        # Test
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json["message"], list)

    def test_get_issue_by_id(self):
        """
        Test that the get issue by ID endpoint returns a 200 status code and a JSON response
        with the issue's data when given a valid ID.
        """
        # Call
        response = self.app.get("/issues/1")
        # Test
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json["message"], list)
        self.assertEqual(response.json["message"][0], 1)

    def test_update_issue(self):
        """
        Test that the update issue endpoint returns a 200 status code and a JSON response
        with a message indicating that the data was updated successfully when given valid data.
        """
        # Call
        issue_data = {
            "title": "Updated Test Issue 1 for Project 1",
            "description": "This is an updated test issue 1 for project 1",
        }
        response = self.app.put(
            "/issues/1",
            data=json.dumps(issue_data),
            content_type="application/json",
        )
        # Get updated issue
        response_updated = self.app.get("/issues/1")
        # Test
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["message"], "Data updated successfully")
        self.assertEqual(
            response_updated.json["message"][2], "Updated Test Issue 1 for Project 1"
        )

    def test_delete_issue(self):
        """
        Test that the delete issue endpoint returns a 204 status code and deletes the
        issue from the database when given a valid ID.
        """
        # Call
        response = self.app.delete("/issues/3")
        # # Ensure deletion of issue
        response_issue_del = self.app.get("/issues/3")
        # Test
        self.assertEqual(response.status_code, 204)
        self.assertEqual(response_issue_del.status_code, 404)

    # # Invalid data tests
    def test_invalid_project_id(self):
        """
        Test that the get project endpoint returns a 404 status code and an error
        message when given an invalid project ID.
        """
        response = self.app.get("/projects/6000")
        self.assertEqual(response.status_code, 404)

    def test_invalid_issue_id(self):
        """
        Test that the get issue endpoint returns a 404 status code and an error
        message when given an invalid issue ID.
        """
        response = self.app.get("/issues/6000")
        self.assertEqual(response.status_code, 404)

    def test_empty_project_data(self):
        """
        Test that the create project endpoint returns a 400 status code and an error
        message when given empty data.
        """
        response = self.app.post(
            "/projects", data=json.dumps({}), content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)

    def test_empty_issue_data(self):
        """
        Test that the create issue endpoint returns a 400 status code and an error
        message when given empty data.
        """
        # Call
        response = self.app.post(
            "/projects/1/issues",
            data=json.dumps({}),
            content_type="application/json",
        )
        # Test
        self.assertEqual(response.status_code, 400)

    def test_invalid_project_data(self):
        """
        Test that the create project endpoint returns a 400 status code and an error
        message when given invalid data.
        """
        project_data = {"invalid-key": "Invalid value"}
        response = self.app.post(
            "/projects", data=json.dumps(project_data), content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)

    def test_invalid_issue_data(self):
        """
        Test that the create issue endpoint returns a 400 status code and an error
        message when given invalid data.
        """
        # Call
        issue_data = {"invalid-key": "Invalid value"}
        response = self.app.post(
            "/projects/1/issues",
            data=json.dumps(issue_data),
            content_type="application/json",
        )
        # Test
        self.assertEqual(response.status_code, 400)


def create_test_data():
    """
    Creates database items to be used by the tests.

    This function creates three projects (ids 1, 2, and 3) and three issues (ids 1:1, 2:2, and 3:3)
    for each project to be used by the tests.

    If the database has a connection or other error, prints the error and exits the program with a status code of -1.

    Project 1 is used for:
      - Get all projects
      - Create project
      - Get project by ID
      - Update project
      - Get all issues
      - Get issues by project
      - Create issue
      - Update issue
      - Invalid issue data
      - Empty issue data
      - Invalid project data
      - Empty project data
    Project 2 is used for:
      - Delete project
    Project 3 is used for:
      - Delete issue
    """
    try:
        # Attempt to connect to the database
        conn = psycopg2.connect(POSTGRES_URL)
        # Create a cursor
        cur = conn.cursor()

        # Create three projects (ids 1 ,2, and 3)
        cur.execute(
            """
            INSERT INTO projects (id, name, description)
            VALUES
                (1, 'Test Project 1', 'This is test project 1'),
                (2, 'Test Project 2', 'This is test project 2'),
                (3, 'Test Project 3', 'This is test project 3')
            ON CONFLICT (id) DO NOTHING
        """
        )

        # Create three issues, one for each project (ids 1:1, 2:2, 3:3)
        cur.execute(
            """
            INSERT INTO issues (id, project_id, title, description)
            VALUES
                (1, 1, 'Test Issue 1 for Project 1', 'This is test issue 1 for project 1'),
                (2, 2, 'Test Issue 2 for Project 2', 'This is test issue 2 for project 2'),
                (3, 3, 'Test Issue 3 for Project 3', 'This is test issue 3 for project 3')
            ON CONFLICT (id) DO NOTHING
        """
        )

        # Commit the changes and close the connection
        conn.commit()
        cur.close()
        conn.close()

    # If database has connection or other error
    except psycopg2.Error as e:
        print(e)
        sys.exit(-1)


if __name__ == "__main__":
    print("WARNING: All data in the database will be deleted")
    input_val = ""
    while input_val not in ["y", "n"]:
        input_val = input("Are you sure you want to continue? (Y/n) ")
        input_val = input_val.lower()
        if input_val == "y":
            print("Running tests...")
            unittest.main()
            break
        elif input_val == "n":
            print("Exiting...")
            break
