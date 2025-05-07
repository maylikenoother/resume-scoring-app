describe('Accessibility Tests', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'fake-jwt-token');
        win.localStorage.setItem('user', JSON.stringify({
          id: '1',
          email: 'test@example.com',
          name: 'Test User'
        }));
      });
  
      cy.intercept('GET', '/api/cvs', {
        statusCode: 200,
        body: [
          {
            id: 'cv1',
            name: 'Software Engineer CV',
            status: 'reviewed',
            createdAt: '2023-06-15T10:00:00Z'
          }
        ]
      }).as('getCVs');
    });
  
    it('should have no accessibility violations on the login page', () => {
      cy.visit('/login');
      cy.injectAxe();
  
      cy.screenshot('login-page-for-a11y');
      
      cy.checkA11y();
      
      cy.checkA11y(null, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa']
        }
      });
      cy.screenshot('login-a11y-test-complete');
    });
  
    it('should have no accessibility violations on the dashboard', () => {
      cy.visit('/dashboard');
      cy.wait('@getCVs');
      cy.injectAxe();
      cy.screenshot('dashboard-for-a11y');
  
      cy.checkA11y();
  
      cy.screenshot('dashboard-a11y-test-complete');
    });
  });
  