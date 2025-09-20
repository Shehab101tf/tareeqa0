// Security Configuration for Tareeqa POS - Electron 21.4.4
// Enhanced security measures to mitigate known vulnerabilities

module.exports = {
  // Electron Security Best Practices for 21.4.4
  electronSecurity: {
    // Context Isolation (already enabled in main.js)
    contextIsolation: true,
    
    // Disable Node Integration in Renderer
    nodeIntegration: false,
    
    // Enable Sandbox Mode
    sandbox: true,
    
    // Disable Remote Module
    enableRemoteModule: false,
    
    // Content Security Policy
    contentSecurityPolicy: {
      "default-src": "'self'",
      "script-src": "'self' 'unsafe-inline'",
      "style-src": "'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src": "'self' https://fonts.gstatic.com",
      "img-src": "'self' data: https:",
      "connect-src": "'self' https://api.tareeqa.com",
      "object-src": "'none'",
      "base-uri": "'self'",
      "form-action": "'self'"
    }
  },

  // ASAR Integrity Protection
  asarIntegrity: {
    enabled: true,
    algorithm: 'sha256',
    validateOnStartup: true
  },

  // File System Access Restrictions
  fileSystemSecurity: {
    // Restrict file access to application directory only
    allowedPaths: [
      process.cwd(),
      require('os').tmpdir(),
      require('path').join(require('os').homedir(), 'Tareeqa')
    ],
    
    // Blocked file extensions
    blockedExtensions: ['.exe', '.bat', '.cmd', '.scr', '.com', '.pif'],
    
    // Maximum file size (10MB)
    maxFileSize: 10 * 1024 * 1024
  },

  // Network Security
  networkSecurity: {
    // Allowed domains for external requests
    allowedDomains: [
      'api.tareeqa.com',
      'fonts.googleapis.com',
      'fonts.gstatic.com'
    ],
    
    // Block local network access
    blockLocalNetwork: true,
    
    // HTTPS only
    httpsOnly: true
  },

  // Input Validation Rules
  inputValidation: {
    // Maximum input lengths
    maxStringLength: 1000,
    maxNumberValue: 999999999,
    
    // Sanitization rules
    sanitizeHtml: true,
    stripScripts: true,
    
    // SQL Injection Prevention
    sqlInjectionPatterns: [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /(--|\/\*|\*\/|;|'|"|`)/,
      /(\bOR\b|\bAND\b).*?[=<>]/i
    ]
  },

  // Logging and Monitoring
  security: {
    logLevel: 'info',
    auditTrail: true,
    maxLogSize: '50MB',
    logRotation: true,
    
    // Security events to monitor
    monitorEvents: [
      'file-access',
      'network-request',
      'process-spawn',
      'registry-access',
      'privilege-escalation'
    ]
  }
};
