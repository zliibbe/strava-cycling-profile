export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.module\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        moduleResolution: 'node',
        typeRoots: ['node_modules/@types', 'src/types'],
        types: ['jest', '@testing-library/jest-dom', 'node'],
        skipLibCheck: true,
        isolatedModules: true
      }
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(identity-obj-proxy)/)'
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.(test|spec).{ts,tsx}'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};