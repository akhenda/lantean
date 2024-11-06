import { ErrorMonitoring, breadcrumbsCategory, breadcrumbType } from '@lantean/monitoring';
import type { ErrorType, NetworkErrorType, UserMessageType } from './types';

import { Toaster } from '../../design/__uiName__/components/toaster';

function dev(...data: unknown[]) {
  // eslint-disable-next-line no-console
  console.log(...data);
}

function showToast(userMessage?: UserMessageType) {
  if (userMessage && Boolean(userMessage.title) && Boolean(userMessage.message)) {
    Toaster.show({ type: 'error', text1: userMessage.title, text2: userMessage.message });
  }
}

function networkError({ description, requestData, userMessage }: NetworkErrorType) {
  ErrorMonitoring.breadcrumbs({
    type: breadcrumbType.http,
    category: breadcrumbsCategory.network,
    message: description,
    level: 'error',
    timestamp: Date.now(),
    data: {
      url: requestData.request,
      method: requestData.method,
      status_code: requestData.statusCode,
      reason: requestData.reason,
    },
  });

  showToast(userMessage);
}

function error({ error, message, userMessage, level = 'error', transactionName }: ErrorType) {
  ErrorMonitoring.scope((scope) => {
    scope.setLevel(level);
    scope.setContext('error', { error });

    if (transactionName) scope.setTransactionName(transactionName);

    ErrorMonitoring.message(message);
  });

  dev(message);
  showToast(userMessage);
}

export const logger = { showToast, networkError, error, dev };
