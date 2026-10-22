const { expect } = require('chai');
const { configurationError, startupDiagnostic } = require('../../src/utils/startupDiagnostics');

describe('Safe startup diagnostics', () => {
  it('reports only variable names and validation reasons', () => {
    const error = configurationError('private value', ['JWT_SECRET'], 'weak_secret');
    error.configuration[0].value = 'private value';
    const diagnostic = startupDiagnostic('environment_validation', error);
    expect(diagnostic.configuration).to.deep.equal([{ variable: 'JWT_SECRET', reason: 'weak_secret' }]);
    expect(JSON.stringify(diagnostic)).not.to.include('private value');
  });
  it('classifies failures without exposing error messages or stacks', () => {
    const cases = [
      [{ code: 'EADDRINUSE' }, 'port_in_use'],
      [{ code: 18 }, 'database_authorization'],
      [{ code: 'ENOTFOUND' }, 'dns'],
      [{ name: 'MongoParseError' }, 'database_uri_format'],
      [{ name: 'MongoServerSelectionError' }, 'database_server_selection'],
      [{ code: 'ECONNREFUSED' }, 'network'],
      [{ name: 'private value', code: 'private value' }, 'unexpected_error'],
    ];
    for (const [properties, category] of cases) {
      const error = Object.assign(new Error('private value'), properties);
      const diagnostic = startupDiagnostic('database_connection', error);
      expect(diagnostic.category).to.equal(category);
      expect(JSON.stringify(diagnostic)).not.to.include('private value');
    }
  });
  it('recognizes Atlas authentication failures without logging their messages', () => {
    const error = Object.assign(new Error('bad auth : authentication failed; private credential'), { name: 'MongoServerError', code: 8000 });
    const diagnostic = startupDiagnostic('database_connection', error);
    expect(diagnostic.category).to.equal('database_authorization');
    expect(JSON.stringify(diagnostic)).not.to.include('private credential');
    error.message = 'a different Atlas error';
    expect(startupDiagnostic('database_connection', error).category).to.equal('unexpected_error');
  });
});
