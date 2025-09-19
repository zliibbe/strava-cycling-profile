import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Add global polyfills for jsdom
Object.assign(global, { TextEncoder, TextDecoder });