import '@testing-library/jest-dom';
import { config } from 'dotenv';

// 테스트 환경 변수 로드
config({ path: '.env.test' });

// Next.js 15 App Router 호환: fetch polyfill
global.fetch = jest.fn();

// TextEncoder/TextDecoder polyfill (Node.js 환경에서 필요)
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// 서버 사이드 모듈 mock
// Note: 통합 테스트에서는 실제 서비스를 사용하므로 여기서 mock하지 않음
// 필요한 경우 개별 테스트 파일에서 jest.mock() 사용

// console 출력 제어 (선택사항)
global.console = {
  ...console,
  error: jest.fn(), // 테스트 중 에러 로그 숨김
  warn: jest.fn(),  // 테스트 중 경고 로그 숨김
};
