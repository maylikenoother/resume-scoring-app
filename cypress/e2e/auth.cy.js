describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-jwt-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User'
        }
      }
    }).as('loginRequest');

    cy.intercept('POST', '/api/auth/register', {
      statusCode: 201,
      body: { message: 'User registered successfully' }
    }).as('registerRequest');
  });

  it('should allow a user to register', () => {
    cy.visit('/register');
    cy.get('[data-testid="register-form"]').should('be.visible');

    cy.get('input[name="name"]').type('Test User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmPassword"]').type('Password123!');
    
    cy.screenshot('register-form-filled');

    cy.get('button[type="submit"]').click();
    cy.wait('@registerRequest');

    cy.url().should('include', '/login');
    cy.get('[data-testid="success-alert"]').should('contain', 'Registration successful');

    cy.screenshot('register-success');
  });

  it('should allow a user to login', () => {
    cy.visit('/login');
    cy.get('[data-testid="login-form"]').should('be.visible');
    
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password123!');

    cy.screenshot('login-form-filled');
    
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    
    cy.url().should('include', '/dashboard');

    cy.screenshot('dashboard-after-login');
  });

  it('should display error messages for invalid login', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid email or password' }
    }).as('failedLoginRequest');

    cy.visit('/login');

    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('WrongPassword');
    
    cy.get('button[type="submit"]').click();
    cy.wait('@failedLoginRequest');
    
    cy.get('[data-testid="error-alert"]').should('be.visible');
    cy.get('[data-testid="error-alert"]').should('contain', 'Invalid email or password');

    cy.screenshot('login-error-state');
  });
});