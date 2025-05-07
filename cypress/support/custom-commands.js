Cypress.Commands.add('checkA11y', (context, options) => {
    const defaultOptions = {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      },
      rules: {
        'color-contrast': { enabled: false },
        'aria-allowed-attr': { enabled: false },
        'region': { enabled: false }
      }
    };
  
    return cy.checkA11y(
      context,
      { ...defaultOptions, ...options },
      null
    );
  });