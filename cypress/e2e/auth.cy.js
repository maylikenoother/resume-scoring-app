describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/py/auth/login', {
      statusCode: 200,
      body: {
        access_token: 'fake-jwt-token',
        user_id: 1,
        email: 'test@example.com',
        full_name: 'Test User'
      }
    }).as('loginRequest');

    cy.intercept('POST', '/api/py/auth/register', {
      statusCode: 201,
      body: { 
        id: 1,
        email: 'test@example.com',
        full_name: 'Test User'
      }
    }).as('registerRequest');
  });

  it('should allow a user to register', () => {
    cy.visit('/register');
    cy.get('form').should('be.visible');

    cy.get('input[name="fullName"]').type('Test User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmPassword"]').type('Password123!');
    
    cy.screenshot('register-form-filled');

    cy.get('button[type="submit"]').click();
    cy.wait('@registerRequest');

    cy.url().should('include', '/login');
    cy.get('div[role="alert"]').should('be.visible');

    cy.screenshot('register-success');
  });

  it('should allow a user to login', () => {
    cy.visit('/login');
    cy.get('form').should('be.visible');
    
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password123!');

    cy.screenshot('login-form-filled');
    
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');

    cy.url().should('include', '/dashboard');

    cy.screenshot('dashboard-after-login');
  });

  it('should display error messages for invalid login', () => {
    cy.intercept('POST', '/api/py/auth/login', {
      statusCode: 401,
      body: { detail: 'Invalid email or password' }
    }).as('failedLoginRequest');

    cy.visit('/login');

    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('WrongPassword');
    
    cy.get('button[type="submit"]').click();
    cy.wait('@failedLoginRequest');
    
    cy.get('div[role="alert"]').should('be.visible');
    cy.get('div[role="alert"]').should('contain', 'Invalid email or password');

    cy.screenshot('login-error-state');
  });
});