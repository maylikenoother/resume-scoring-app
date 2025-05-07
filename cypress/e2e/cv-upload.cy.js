describe('CV Upload Flow', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('user_data', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        full_name: 'Test User'
      }));
    });

    cy.setCookie('access_token', 'fake-jwt-token');

    cy.intercept('GET', '/api/py/credits/balance', {
      statusCode: 200,
      body: {
        id: 1,
        user_id: 1,
        balance: 10
      }
    }).as('getCredits');

    cy.intercept('POST', '/api/py/reviews/upload', {
      statusCode: 201,
      body: {
        id: 1,
        user_id: 1,
        filename: 'My New CV',
        status: 'pending',
        created_at: new Date().toISOString()
      }
    }).as('uploadRequest');
  });

  it('should allow a user to upload a CV', () => {
    cy.visit('/upload');
    cy.wait('@getCredits');
     
    cy.contains('Upload Your CV for Review').should('be.visible');
    
    cy.screenshot('cv-upload-modal');

    cy.get('input[type="file"]').attachFile('example-cv.pdf', { force: true });
    
    cy.screenshot('cv-upload-form-filled');

    cy.contains('Upload & Analyze').click();
    cy.wait('@uploadRequest');
    
    cy.url().should('include', '/reviews/1');
    
    cy.screenshot('cv-list-after-upload');
  });

  it('should validate the upload form', () => {
    cy.visit('/upload');
    cy.wait('@getCredits');

    cy.contains('Upload & Analyze').click();
    
    cy.contains('Please select a file').should('be.visible');
    
    cy.screenshot('cv-upload-validation-errors');
  });
});