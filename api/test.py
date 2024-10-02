"""
test.py

This test suite covers the following endpoints:
    Root endpoint (/)
    Get all projects (/projects)
    Create project (/projects)
    Get project by ID (/projects/{id})
    Update project (/projects/{id})
    Delete project (/projects/{id})
    Get all issues (/issues)
    Create issue (/issues)
    Get issue by ID (/issues/{id})
    Update issue (/issues/{id})
    Delete issue (/issues/{id})
"""
import unittest
import json
from api import app


created_projects = set()


class TestAPI(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()

    def tearDown(self):
        for project in self.app.get('/projects').json['message']:
            created_projects.add(project[0])
        # Delete all projects
        for project_id in created_projects:
            response = self.app.delete(f'/projects/{project_id}')
            self.assertEqual(response.status_code, 204)

    def test_reset(self):
        # Call
        response =self.app.delete('/reset')
        # Test
        self.assertEqual(response.status_code, 204)
        self.assertEqual(self.app.get('/projects').json['message'], [])
        self.assertEqual(self.app.get('/issues').json['message'], [])

    def test_root_endpoint(self):
        # Call
        response = self.app.get('/')
        # Test
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {'message': 'Trackify API says hello!'})

    def test_create_project(self):
        # Create a project
        project_data = {'name': 'Test Project', 'description': 'This is a test project'}
        response = self.app.post('/projects', data=json.dumps(project_data), content_type='application/json')
        # Test
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json['message'], "Data added successfully")

    def test_get_projects(self):
        # Create a project
        project_data = {'name': 'Test Project', 'description': 'This is a test project'}
        self.app.post('/projects', data=json.dumps(project_data), content_type='application/json')
        # Call
        response = self.app.get('/projects')
        # Test
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json['message'], list)
        
    def test_get_project_by_id(self):
        # Create a project
        project_data = {'name': 'Test Project', 'description': 'This is a test project'}
        self.app.post('/projects', data=json.dumps(project_data), content_type='application/json')
        # Get a project id to use
        id = self.app.get('/projects').json['message'][0][0]
        # Call
        response = self.app.get(f'/projects/{id}')
        # Test
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json['message'], list)
        self.assertEqual(response.json['message'][0], id)

    def test_update_project(self):
        # Create a project
        project_data = {'name': 'Test Project', 'description': 'This is a test project'}
        self.app.post('/projects', data=json.dumps(project_data), content_type='application/json')
        # Get a project id to use
        id = self.app.get('/projects').json['message'][0][0]
        # Call
        project_data = {'name': 'Updated Test Project', 'description': 'This is an updated test project'}
        response = self.app.put(f'/projects/{id}', data=json.dumps(project_data), content_type='application/json')
        # Get the updated project
        response_updated = self.app.get(f'/projects/{id}')
        # Test
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['message'], "Data updated successfully")
        self.assertEqual(response_updated.json['message'][1], 'Updated Test Project')

    def test_delete_project(self):
        # Create a project
        project_data = {'name': 'Test Project', 'description': 'This is a test project'}
        self.app.post('/projects', data=json.dumps(project_data), content_type='application/json')
        # Get a project id to use
        id = self.app.get('/projects').json['message'][0][0]
        # Create an issue in the project
        issue_data = {'title': 'Test Issue', 'description': 'This is an test issue'}
        response = self.app.post(f'/projects/{id}/issues', data=json.dumps(issue_data), content_type='application/json')
        # Get issue id
        issue_id = self.app.get(f'/projects/{id}/issues').json['message'][0][0]
        # Call
        response = self.app.delete(f'/projects/{id}')
        # Ensure deletion of project
        response_del = self.app.get(f'/projects/{id}')
        # # Ensure deletion of issue
        response_issue_del = self.app.get(f'/issues/{issue_id}')
        # Test
        self.assertEqual(response.status_code, 204)
        self.assertEqual(response_del.status_code, 404)
        self.assertEqual(response_issue_del.status_code, 404)

    def test_create_issue(self):
        # Create a project
        project_data = {'name': 'Test Project', 'description': 'This is a test project'}
        response = self.app.post('/projects', data=json.dumps(project_data), content_type='application/json')
        # Get a project id to use
        id = self.app.get('/projects').json['message'][0][0]
        # Call
        issue_data = {'title': 'Test Issue', 'description': 'This is a test issue'}
        response = self.app.post(f'/projects/{id}/issues', data=json.dumps(issue_data), content_type='application/json')
        # Test
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json['message'], "Data added successfully")

    def test_get_issues_by_project(self):
        # Create a project
        project_data = {'name': 'Test Project', 'description': 'This is a test project'}
        response = self.app.post('/projects', data=json.dumps(project_data), content_type='application/json')
        # Get a project id to use
        id = self.app.get('/projects').json['message'][0][0]
        # Create an issue in the project
        issue_data = {'title': 'Test Issue', 'description': 'This is a test issue'}
        response = self.app.post(f'/projects/{id}/issues', data=json.dumps(issue_data), content_type='application/json')
        # Call
        response = self.app.get(f'/projects/{id}/issues')
        # Test
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json['message'], list)
        self.assertEqual(response.json['message'][0][1], id)

    def test_get_issues(self):
        # Create a project
        project_data = {'name': 'Test Project', 'description': 'This is a test project'}
        response = self.app.post('/projects', data=json.dumps(project_data), content_type='application/json')
        # Get a project id to use
        id = self.app.get('/projects').json['message'][0][0]
        # Create an issue in the project
        issue_data = {'title': 'Test Issue', 'description': 'This is a test issue'}
        response = self.app.post(f'/projects/{id}/issues', data=json.dumps(issue_data), content_type='application/json')
        # Call
        response = self.app.get('/issues')
        # Test
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json['message'], list)

    def test_get_issue_by_id(self):
        # Create a project
        project_data = {'name': 'Test Project', 'description': 'This is a test project'}
        response = self.app.post('/projects', data=json.dumps(project_data), content_type='application/json')
        # Get a project id to use
        id = self.app.get('/projects').json['message'][0][0]
        # Create an issue in the project
        issue_data = {'title': 'Test Issue', 'description': 'This is a test issue'}
        response = self.app.post(f'/projects/{id}/issues', data=json.dumps(issue_data), content_type='application/json')
        # Get issue id
        issue_id = self.app.get('/issues').json['message'][0][0]
        # Call
        response = self.app.get(f'/issues/{issue_id}')
        # Test
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json['message'], list)
        self.assertEqual(response.json['message'][0], issue_id)

    def test_update_issue(self):
        # Create a project
        project_data = {'name': 'Test Project', 'description': 'This is a test project'}
        response = self.app.post('/projects', data=json.dumps(project_data), content_type='application/json')
        # Get a project id to use
        id = self.app.get('/projects').json['message'][0][0]
        # Create an issue in the project
        issue_data = {'title': 'Test Issue', 'description': 'This is a test issue'}
        response = self.app.post(f'/projects/{id}/issues', data=json.dumps(issue_data), content_type='application/json')
        # Get issue id
        issue_id = self.app.get('/issues').json['message'][0][0]
        # Call
        issue_data = {'title': 'Updated Test Issue', 'description': 'This is an updated test issue'}
        response = self.app.put(f'/issues/{issue_id}', data=json.dumps(issue_data), content_type='application/json')
        # Get updated issue
        response_updated = self.app.get(f'/issues/{issue_id}')
        # Test
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['message'], "Data updated successfully")
        self.assertEqual(response_updated.json['message'][2], 'Updated Test Issue')

    def test_delete_issue(self):
        # Create a project
        project_data = {'name': 'Test Project', 'description': 'This is a test project'}
        response = self.app.post('/projects', data=json.dumps(project_data), content_type='application/json')
        # Get a project id to use
        id = self.app.get('/projects').json['message'][0][0]
        # Create an issue in the project
        issue_data = {'title': 'Test Issue', 'description': 'This is a test issue'}
        response = self.app.post(f'/projects/{id}/issues', data=json.dumps(issue_data), content_type='application/json')
        # Get issue id
        issue_id = self.app.get('/issues').json['message'][0][0]
        # Call
        response = self.app.delete(f'/issues/{issue_id}')
        # # Ensure deletion of issue
        response_issue_del = self.app.get(f'/issues/{issue_id}')
        # Test
        self.assertEqual(response.status_code, 204)
        self.assertEqual(response_issue_del.status_code, 404)

    # # Invalid data tests
    def test_invalid_project_id(self):
        response = self.app.get('/projects/6000')
        self.assertEqual(response.status_code, 404)

    def test_invalid_issue_id(self):
        response = self.app.get('/issues/6000')
        self.assertEqual(response.status_code, 404)

    def test_empty_project_data(self):
        response = self.app.post('/projects', data=json.dumps({}), content_type='application/json')
        self.assertEqual(response.status_code, 400)

    def test_empty_issue_data(self):
        # Create a project
        project_data = {'name': 'Test Project', 'description': 'This is a test project'}
        response = self.app.post('/projects', data=json.dumps(project_data), content_type='application/json')
        # Get a project id to use
        id = self.app.get('/projects').json['message'][0][0]
        # Call
        response = self.app.post(f'/projects/{id}/issues', data=json.dumps({}), content_type='application/json')
        # Test
        self.assertEqual(response.status_code, 400)

    def test_invalid_project_data(self):
        project_data = {'invalid-key': 'Invalid value'}
        response = self.app.post('/projects', data=json.dumps(project_data), content_type='application/json')
        self.assertEqual(response.status_code, 400)

    def test_invalid_issue_data(self):
        # Create a project
        project_data = {'name': 'Test Project', 'description': 'This is a test project'}
        response = self.app.post('/projects', data=json.dumps(project_data), content_type='application/json')
        # Get a project id to use
        id = self.app.get('/projects').json['message'][0][0]
        # Call
        issue_data = {'invalid-key': 'Invalid value'}
        response = self.app.post(f'/projects/{id}/issues', data=json.dumps(issue_data), content_type='application/json')
        # Test
        self.assertEqual(response.status_code, 400)


if __name__ == '__main__':
    print('WARNING: All data in the database will be deleted')
    input_val = 'none'
    while input_val not in ['y', 'n']:
        input_val = input('Are you sure you want to continue? (Y/n) ')
        input_val = input_val.lower()
        if input_val == 'y':
            print('Running tests...')
            unittest.main()
            break
        elif input_val == 'n':
            print('Exiting...')
            break