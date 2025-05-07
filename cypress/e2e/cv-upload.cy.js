describe('CV Upload Flow', () => {
    beforeEach(() => {
  
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'fake-jwt-token');
        win.localStorage.setItem('user', JSON.stringify({
          id: '1',
          email: 'test@example.com',
          name: 'Test User'
        }));
      });
  
      cy.intercept('POST', '/api/cvs', {
        statusCode: 201,
        body: {
          id: 'new-cv-id',
          name: 'My New CV',
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      }).as('uploadRequest');
    });
  
    it('should allow a user to upload a CV', () => {
      cy.visit('/dashboard');
      
      cy.get('[data-testid="upload-cv-button"]').click();
      cy.get('[data-testid="upload-cv-modal"]').should('be.visible');
      
      cy.screenshot('cv-upload-modal');
      
      cy.get('input[name="cvName"]').type('My New CV');
  
      cy.get('input[type="file"]').attachFile('example-cv.pdf');
      
      cy.screenshot('cv-upload-form-filled');
      
      cy.get('[data-testid="submit-upload"]').click();
      cy.wait('@uploadRequest');
      
      cy.get('[data-testid="cv-list"]').should('contain', 'My New CV');
      cy.get('[data-testid="cv-status-badge"]').should('contain', 'pending');
      
      cy.screenshot('cv-list-after-upload');
    });
  
    it('should validate the upload form', () => {
      cy.visit('/dashboard');
      
      cy.get('[data-testid="upload-cv-button"]').click();
      
      cy.get('[data-testid="submit-upload"]').click();
      
      cy.get('[data-testid="name-error"]').should('be.visible');
      cy.get('[data-testid="file-error"]').should('be.visible');
      
      cy.screenshot('cv-upload-validation-errors');
    });
  });