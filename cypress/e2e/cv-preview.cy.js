describe('CV Preview Functionality', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('user_data', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        full_name: 'Test User'
      }));
    });

    cy.setCookie('access_token', 'fake-jwt-token');
  
    cy.intercept('GET', '/api/py/reviews', {
      statusCode: 200,
      body: {
        reviews: [
          {
            id: 1,
            user_id: 1,
            filename: 'Software Engineer CV',
            status: 'completed',
            created_at: '2023-06-15T10:00:00Z',
            review_result: 'Great CV! Consider adding more project details.',
            score: 8.5
          }
        ]
      }
    }).as('getCVs');
  
    cy.intercept('GET', '/api/py/reviews/1', {
      statusCode: 200,
      body: {
        id: 1,
        user_id: 1,
        filename: 'Software Engineer CV',
        status: 'completed',
        created_at: '2023-06-15T10:00:00Z',
        review_result: 'Great CV! Consider adding more project details.',
        score: 8.5
      }
    }).as('getCVDetails');
  });

  it('should allow viewing CV preview', () => {
    cy.visit('/dashboard');
    cy.wait('@getCVs');
    
    cy.contains('Software Engineer CV').click();
    cy.wait('@getCVDetails');

    cy.url().should('include', '/reviews/1');
    
    cy.contains('Review Details').should('be.visible');
    cy.contains('Software Engineer CV').should('be.visible');
    
    cy.screenshot('cv-preview-page');
    
    cy.contains('Review Feedback').should('be.visible');
    
    cy.screenshot('cv-preview-feedback');
  });
});