describe('Profile Settings', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'fake-jwt-token');
        win.localStorage.setItem('user', JSON.stringify({
          id: '1',
          email: 'test@example.com',
          name: 'Test User'
        }));
      });
  
      cy.intercept('GET', '/api/user/profile', {
        statusCode: 200,
        body: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          jobTitle: 'Software Developer',
          biography: 'Experienced developer with 5 years in web technologies.'
        }
      }).as('getUserProfile');
  
      cy.intercept('PUT', '/api/user/profile', {
        statusCode: 200,
        body: {
          message: 'Profile updated successfully'
        }
      }).as('updateProfile');
    });
  
    it('should display user profile information', () => {
      cy.visit('/profile');
      cy.wait('@getUserProfile');
  
      cy.get('[data-testid="profile-form"]').should('be.visible');
      cy.get('input[name="name"]').should('have.value', 'Test User');
      cy.get('input[name="email"]').should('have.value', 'test@example.com');
      cy.get('input[name="jobTitle"]').should('have.value', 'Software Developer');
      cy.get('textarea[name="biography"]').should('have.value', 'Experienced developer with 5 years in web technologies.');
      
      cy.screenshot('profile-page');
    });
  
    it('should allow updating profile information', () => {
      cy.visit('/profile');
      cy.wait('@getUserProfile');
      
      cy.get('input[name="name"]').clear().type('Updated Name');
      cy.get('input[name="jobTitle"]').clear().type('Senior Developer');
      cy.get('textarea[name="biography"]').clear().type('Updated biography with new information.');
      
      cy.screenshot('profile-form-updated');
      
      cy.get('[data-testid="save-profile-button"]').click();
      cy.wait('@updateProfile');
      
      cy.get('[data-testid="success-alert"]').should('be.visible');
      cy.get('[data-testid="success-alert"]').should('contain', 'Profile updated successfully');
  
      cy.screenshot('profile-update-success');
    });
  });