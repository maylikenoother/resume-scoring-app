describe('Dashboard Functionality', () => {
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
            createdAt: '2023-06-15T10:00:00Z',
            feedback: 'Great CV! Consider adding more project details.'
          },
          {
            id: 'cv2',
            name: 'Product Manager Resume',
            status: 'pending',
            createdAt: '2023-07-20T14:30:00Z'
          },
          {
            id: 'cv3',
            name: 'Data Scientist Application',
            status: 'in_review',
            createdAt: '2023-08-05T09:15:00Z'
          }
        ]
      }).as('getCVs');
    });
  
    it('should display user CVs with correct status', () => {
      cy.visit('/dashboard');
      cy.wait('@getCVs');
      
      cy.get('[data-testid="cv-list"]').should('exist');
      cy.get('[data-testid="cv-item"]').should('have.length', 3);
      
      cy.get('[data-testid="cv-item"]').eq(0).find('[data-testid="cv-status-badge"]')
        .should('contain', 'reviewed')
        .and('have.class', 'status-reviewed');
      
      cy.get('[data-testid="cv-item"]').eq(1).find('[data-testid="cv-status-badge"]')
        .should('contain', 'pending')
        .and('have.class', 'status-pending');
      
      cy.get('[data-testid="cv-item"]').eq(2).find('[data-testid="cv-status-badge"]')
        .should('contain', 'in review')
        .and('have.class', 'status-in-review');
      
      cy.screenshot('dashboard-cv-list');
    });
  
    it('should filter CVs by status', () => {
      cy.visit('/dashboard');
      cy.wait('@getCVs');
  
      cy.screenshot('dashboard-before-filter');
      
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="filter-option-reviewed"]').click();
      
      cy.get('[data-testid="cv-item"]').should('have.length', 1);
      cy.get('[data-testid="cv-item"]').eq(0).should('contain', 'Software Engineer CV');
      
      cy.screenshot('dashboard-filtered-reviewed');
      
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="filter-option-pending"]').click();
      
      cy.get('[data-testid="cv-item"]').should('have.length', 1);
      cy.get('[data-testid="cv-item"]').eq(0).should('contain', 'Product Manager Resume');
      
      cy.screenshot('dashboard-filtered-pending');
    });
  
    it('should allow viewing CV feedback', () => {
      cy.visit('/dashboard');
      cy.wait('@getCVs');
      
      cy.get('[data-testid="cv-item"]').eq(0).find('[data-testid="view-feedback-button"]').click();
  
      cy.get('[data-testid="feedback-modal"]').should('be.visible');
      cy.get('[data-testid="feedback-content"]').should('contain', 'Great CV! Consider adding more project details.');
  
      cy.screenshot('cv-feedback-modal');
    });
  
    it('should allow searching CVs by name', () => {
      cy.visit('/dashboard');
      cy.wait('@getCVs');
      
      cy.screenshot('dashboard-before-search');
      
      cy.get('[data-testid="cv-search-input"]').type('Data Scientist');
      
      cy.get('[data-testid="cv-item"]').should('have.length', 1);
      cy.get('[data-testid="cv-item"]').eq(0).should('contain', 'Data Scientist Application');
  
      cy.screenshot('dashboard-search-results');
    });
  });