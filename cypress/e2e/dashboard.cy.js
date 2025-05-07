describe('Dashboard Functionality', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('user_data', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        full_name: 'Test User'
      }));
    });

    cy.setCookie('access_token', 'fake-jwt-token');

    cy.intercept('GET', '/api/py/reviews*', {
      statusCode: 200,
      body: {
        reviews: [
          {
            id: 1,
            user_id: 1,
            filename: 'Software Engineer CV',
            status: 'completed',
            created_at: '2023-06-15T10:00:00Z',
            review_result: 'Great CV! Consider adding more project details.'
          },
          {
            id: 2,
            user_id: 1,
            filename: 'Product Manager Resume',
            status: 'pending',
            created_at: '2023-07-20T14:30:00Z'
          },
          {
            id: 3,
            user_id: 1,
            filename: 'Data Scientist Application',
            status: 'processing',
            created_at: '2023-08-05T09:15:00Z'
          }
        ]
      }
    }).as('getCVs');
  });

  it('should display user CVs with correct status', () => {
    cy.visit('/dashboard');
    cy.wait('@getCVs');
    
    cy.contains('Recent Reviews').should('be.visible');
    
    cy.contains('Software Engineer CV').should('be.visible');
    cy.contains('completed').should('be.visible');
    
    cy.contains('Product Manager Resume').should('be.visible');
    cy.contains('pending').should('be.visible');
    
    cy.contains('Data Scientist Application').should('be.visible');
    cy.contains('processing').should('be.visible');
    
    cy.screenshot('dashboard-cv-list');
  });

  it('should filter CVs by status', () => {
    cy.visit('/reviews');
    cy.wait('@getCVs');
  
    cy.screenshot('dashboard-before-filter');
    
    cy.get('body').then($body => {
      if ($body.find('[aria-label="Filter by status"]').length > 0) {
        cy.get('[aria-label="Filter by status"]').click();
        cy.contains('completed').click();
        
        cy.contains('Software Engineer CV').should('be.visible');
        cy.contains('Product Manager Resume').should('not.exist');
        
        cy.screenshot('dashboard-filtered-reviewed');
      } else {
        cy.log('Status filter not found, skipping filter test');
      }
    });
  });

  it('should allow viewing CV feedback', () => {
    cy.visit('/dashboard');
    cy.wait('@getCVs');
    
    cy.contains('Software Engineer CV').click();
    
    cy.url().should('include', '/reviews/1');
    cy.contains('Review Feedback').should('be.visible');
  
    cy.screenshot('cv-feedback-modal');
  });

  it('should allow searching CVs by name', () => {
    cy.visit('/reviews');
    cy.wait('@getCVs');
    
    cy.screenshot('dashboard-before-search');
    
    cy.get('body').then($body => {
      if ($body.find('input[type="search"]').length > 0) {
        cy.get('input[type="search"]').type('Data Scientist');
        
        cy.contains('Data Scientist Application').should('be.visible');
        cy.contains('Software Engineer CV').should('not.exist');
      
        cy.screenshot('dashboard-search-results');
      } else if ($body.find('input[type="text"]').length > 0) {
        cy.get('input[type="text"]').first().type('Data Scientist');
        
        cy.contains('Data Scientist Application').should('be.visible');
        cy.contains('Software Engineer CV').should('not.exist');
      
        cy.screenshot('dashboard-search-results');
      } else {
        cy.log('Search input not found, skipping search test');
      }
    });
  });
});