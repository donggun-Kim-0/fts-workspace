import { ApiError } from '@/lib/api/client';

const KNOWN_MESSAGES: Record<string, string> = {
  'Internal server error': '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  'Network Error': '네트워크 연결을 확인해 주세요.',
};

export function translateApiError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 0) {
      return err.message;
    }
    if (err.status === 400) {
      return err.message.includes('MasterConfig')
        ? '선택한 코드 값이 유효하지 않습니다. 드롭다운 옵션을 확인해 주세요.'
        : `입력값 오류: ${err.message}`;
    }
    if (err.status === 409) {
      return err.message.includes('가맹점') || err.message.includes('코드')
        ? err.message
        : '지점코드 또는 사업자등록번호가 이미 사용 중입니다.';
    }
    if (err.status === 404) {
      return '요청한 가맹점을 찾을 수 없습니다.';
    }
    if (err.status >= 500) {
      return '서버 오류가 발생했습니다. 관리자에게 문의해 주세요.';
    }
    return KNOWN_MESSAGES[err.message] ?? err.message;
  }

  if (err instanceof Error) {
    return KNOWN_MESSAGES[err.message] ?? err.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
}
