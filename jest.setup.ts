import '@testing-library/jest-dom';
import { config } from 'dotenv';

config({ path: '.env.test' });

jest.mock('@/server/services/ticketService');
