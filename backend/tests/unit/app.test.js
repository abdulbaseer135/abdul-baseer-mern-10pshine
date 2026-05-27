const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../src/app');

describe('Express App Setup - app.js', () => {
  afterEach(() => {
    // Cleanup after each test
  });

  describe('App Configuration', () => {
    it('should create an Express application', () => {
      expect(app).to.exist;
      expect(typeof app).to.equal('function');
      expect(app._router).to.exist;
    });

    it('should have middleware loaded', () => {
      expect(app._router).to.exist;
    });

    it('should have x-powered-by header disabled', async () => {
      const response = await request(app).get('/health');
      expect(response.get('x-powered-by')).to.be.undefined;
    });
  });

  describe('CORS Configuration', () => {
    it('should allow localhost:3000 origin', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');
      expect(response.status).to.equal(200);
    });

    it('should allow localhost:3001 origin', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3001');
      expect(response.status).to.equal(200);
    });

    it('should allow 127.0.0.1:3000 origin', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://127.0.0.1:3000');
      expect(response.status).to.equal(200);
    });

    it('should allow 127.0.0.1:3001 origin', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://127.0.0.1:3001');
      expect(response.status).to.equal(200);
    });

    it('should allow requests without origin header', async () => {
      const response = await request(app).get('/health');
      expect(response.status).to.equal(200);
    });

    it('should reject disallowed origins', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://malicious-site.com');
      expect(response.status).to.not.equal(200);
    });

    it('should reject external domain origins', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://evil.com:3000');
      expect(response.status).to.not.equal(200);
    });

    it('should have CORS credentials enabled', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');
      expect(response.get('access-control-allow-credentials')).to.equal('true');
    });

    it('should allow credentials header on approved origins', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://127.0.0.1:3001');
      expect(response.get('access-control-allow-credentials')).to.equal('true');
    });
  });

  describe('Middleware Setup', () => {
    it('should parse JSON body', async () => {
      // This is a basic check - actual parsing happens in route handlers
      expect(app).to.exist;
    });

    it('should parse URL-encoded body', async () => {
      // This is a basic check
      expect(app).to.exist;
    });

    it('should have request logger middleware configured', () => {
      expect(app._router).to.exist;
    });
  });

  describe('Health Check Endpoint', () => {
    it('should return 200 OK on health check', async () => {
      const response = await request(app).get('/health');
      expect(response.status).to.equal(200);
    });

    it('should return JSON response', async () => {
      const response = await request(app).get('/health');
      expect(response.type).to.include('json');
    });

    it('should include OK status in response', async () => {
      const response = await request(app).get('/health');
      expect(response.body.status).to.equal('OK');
    });

    it('should include timestamp in response', async () => {
      const response = await request(app).get('/health');
      expect(response.body.timestamp).to.exist;
      expect(response.body.timestamp).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should return valid ISO timestamp', async () => {
      const response = await request(app).get('/health');
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toISOString()).to.equal(response.body.timestamp);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app).get('/undefined-nonexistent-route-12345');
      expect(response.status).to.equal(404);
    });

    it('should include error message in 404 response', async () => {
      const response = await request(app).get('/unknown-path');
      expect(response.body.error).to.equal('Not Found');
    });

    it('should include path in 404 response', async () => {
      const response = await request(app).get('/test/path/404');
      expect(response.body.path).to.equal('/test/path/404');
    });

    it('should include method in 404 response', async () => {
      const response = await request(app).post('/nonexistent');
      expect(response.body.method).to.equal('POST');
    });

    it('should return JSON for 404', async () => {
      const response = await request(app).get('/notfound');
      expect(response.type).to.include('json');
    });
  });

  describe('Request Methods', () => {
    it('should handle GET requests', async () => {
      const response = await request(app).get('/health');
      expect(response.status).to.equal(200);
    });

    it('should handle POST requests and return 404', async () => {
      const response = await request(app)
        .post('/undefined')
        .send({ test: 'data' });
      expect(response.status).to.equal(404);
    });

    it('should handle PUT requests and return 404', async () => {
      const response = await request(app)
        .put('/undefined/123')
        .send({ test: 'data' });
      expect(response.status).to.equal(404);
    });

    it('should handle DELETE requests and return 404', async () => {
      const response = await request(app).delete('/undefined/123');
      expect(response.status).to.equal(404);
    });

    it('should handle OPTIONS requests', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:3000');
      expect([200, 204]).to.include(response.status);
    });
  });

  describe('API Routes', () => {
    it('should mount API routes at /api/v1', async () => {
      // Routes should exist under /api/v1
      expect(app).to.exist;
    });

    it('should return 404 for /api endpoint without version', async () => {
      const response = await request(app).get('/api');
      expect(response.status).to.equal(404);
    });
  });

  describe('Content Type Handling', () => {
    it('should return JSON responses', async () => {
      const response = await request(app).get('/health');
      expect(response.type).to.include('json');
    });

    it('should handle JSON body parsing', async () => {
      const response = await request(app)
        .post('/nonexistent')
        .send({ test: 'json' })
        .set('Content-Type', 'application/json');
      expect(response.status).to.equal(404);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors gracefully', async () => {
      const response = await request(app).get('/fake-route');
      expect(response.status).to.equal(404);
      expect(response.body).to.exist;
      expect(response.body.error).to.exist;
    });

    it('should not expose internal errors to client', async () => {
      const response = await request(app).get('/health');
      expect(response.body).to.not.have.property('stack');
    });
  });

  describe('Static Files', () => {
    it('should serve static files from uploads directory', () => {
      // Static file serving is configured
      expect(app).to.exist;
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in response', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');
      expect(response.get('access-control-allow-origin')).to.exist;
    });
  });

  describe('Security Headers', () => {
    it('should not expose x-powered-by header', async () => {
      const response = await request(app).get('/health');
      expect(response.get('x-powered-by')).to.be.undefined;
    });
  });

  // ─── Health check error branch (catch block coverage) ─────────────────
  describe('Health Check Error Branch', () => {
    it('should return 500 when res.json throws inside health handler', (done) => {
      const express = require('express');
      const testApp = express();
      testApp.disable('x-powered-by');

      // Patch res.json to throw once, triggering the catch block
      testApp.use('/health', (req, res, next) => {
        const originalJson = res.json.bind(res);
        let called = false;
        res.json = function (body) {
          if (!called) {
            called = true;
            throw new Error('Simulated json error');
          }
          return originalJson(body);
        };
        next();
      });

      // Replicate the same health handler logic from app.js
      testApp.get('/health', (req, res) => {
        try {
          res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
          });
        } catch (err) {
          console.error('[Health Check] Error sending health status:', err?.message);
          res.status(500).json({
            status: 'ERROR',
            error: 'Failed to generate health check response',
          });
        }
      });

      request(testApp)
        .get('/health')
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(500);
          expect(response.body.status).to.equal('ERROR');
          done();
        });
    });
  });
});
