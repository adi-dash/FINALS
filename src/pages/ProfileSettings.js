import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Card, Col, Row, Alert } from 'react-bootstrap';

const ProfileSettings = () => {
  const [user, setUser] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the user details
    fetch('http://localhost:4000/users/details', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.code === "USER-FOUND") {
          setUser(data.result);
        }
      })
      .catch(error => {
        setMessage('Failed to fetch user data.');
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    // Send the updated password to the backend
    fetch('http://localhost:4000/users/update-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ oldPassword, newPassword, confirmNewPassword })
    })
      .then(response => response.json())
      .then(data => {
        setMessage(data.message);
      })
      .catch(error => {
        setMessage('Error updating password.');
      });
  };

  return (
    <div className="profile-settings container mt-5">
      <Card className="shadow-lg p-4 border-0">
        <Card.Body>
          <h2 className="text-center mb-4 text-primary">Profile Settings</h2>
          
          {user ? (
            <div>
              <h3 className="text-center mb-4 text-secondary">Welcome, {user.firstName} {user.lastName}</h3>
              
              <Row>
                <Col md={6} className="mx-auto">
                  <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="oldPassword" className="mb-4">
                      <Form.Label>Old Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter old password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="form-control-lg"
                      />
                    </Form.Group>

                    <Form.Group controlId="newPassword" className="mb-4">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="form-control-lg"
                      />
                    </Form.Group>

                    <Form.Group controlId="confirmNewPassword" className="mb-4">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="form-control-lg"
                      />
                    </Form.Group>

                    <Button variant="primary" type="submit" block size="lg">
                      Update Password
                    </Button>
                  </Form>

                  {message && (
                    <Alert variant={message.includes('Error') ? 'danger' : 'success'} className="mt-4">
                      {message}
                    </Alert>
                  )}
                </Col>
              </Row>
            </div>
          ) : (
            <div className="text-center">
              <p>Loading...</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProfileSettings;
