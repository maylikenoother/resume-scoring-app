describe('Profile Settings', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('user_data', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        full_name: 'Test User'
      }));
    });

    cy.setCookie('access_token', 'fake-jwt-token');

    cy.intercept('GET', '/api/py/auth/me', {
      statusCode: 200,
      body: {
        id: 1,
        email: 'test@example.com',
        full_name: 'Test User',
        is_active: true,
        role: 'user',
        created_at: '2023-01-01T00:00:00Z',
      }
    }).as('getUserProfile');

    cy.intercept('PATCH', '/api/py/auth/me', {
      statusCode: 200,
      body: {
        id: 1,
        email: 'test@example.com',
        full_name: 'Updated Name',
        is_active: true,
        role: 'user',
        created_at: '2023-01-01T00:00:00Z',
      }
    }).as('updateProfile');
  });

  it('should display user profile information', () => {
    cy.visit('/dashboard');
    cy.contains('Profile').click();
    
    cy.wait('@getUserProfile');

    cy.contains('Edit Profile').should('be.visible');
    cy.get('input[name="fullName"]').should('have.value', 'Test User');
    cy.get('input[name="email"]').should('have.value', 'test@example.com');
    
    cy.screenshot('profile-page');
  });

  it('should allow updating profile information', () => {
    cy.visit('/dashboard');
    cy.contains('Profile').click();
    
    cy.wait('@getUserProfile');
    
    cy.get('input[name="fullName"]').clear().type('Updated Name');
    
    cy.screenshot('profile-form-updated');

    cy.contains('Save Changes').click();
    cy.wait('@updateProfile');
    
    cy.contains('Profile updated successfully').should('be.visible');
  
    cy.screenshot('profile-update-success');
  });
});