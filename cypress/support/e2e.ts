/// <reference types="cypress" />
import './commands';
import 'cypress-file-upload';
import 'cypress-axe';


before(() => {
  cy.writeFile('cypress/fixtures/example-cv.pdf', 'This is an example CV file', 'utf8')
    .then(() => {
      cy.log('Created example CV fixture file');
    });
});

export {};