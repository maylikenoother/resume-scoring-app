describe('CV Preview Functionality', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'fake-jwt-token');
        win.localStorage.setItem('user', JSON.stringify({
          id: '1',
          email: 'test@example.com',
          name: 'Test User'
        }));
      });
  
      cy.intercept('GET', '/api/cvs/cv1', {
        statusCode: 200,
        body: {
          id: 'cv1',
          name: 'Software Engineer CV',
          status: 'reviewed',
          createdAt: '2023-06-15T10:00:00Z',
          fileUrl: 'https://example.com/cv1.pdf',
          feedback: 'Great CV! Consider adding more project details.'
        }
      }).as('getCVDetails');
  
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
  
    it('should allow viewing CV preview', () => {
      cy.visit('/dashboard');
      cy.wait('@getCVs');
      
      cy.get('[data-testid="cv-item"]').eq(0).find('[data-testid="view-cv-button"]').click();
      cy.wait('@getCVDetails');
  
      cy.url().should('include', '/cv/cv1');
      cy.get('[data-testid="cv-preview-container"]').should('be.visible');
      cy.get('[data-testid="cv-name"]').should('contain', 'Software Engineer CV');
      
      cy.screenshot('cv-preview-page');
      
      cy.get('[data-testid="feedback-section"]').should('be.visible');
      cy.get('[data-testid="feedback-content"]').should('contain', 'Great CV! Consider adding more project details.');
  
      cy.screenshot('cv-preview-feedback');
    });
  });