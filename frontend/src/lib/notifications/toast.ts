import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconInfoCircle, IconAlertTriangle } from '@tabler/icons-react';
import { createElement } from 'react';

export const toast = {
  success: (title: string, message?: string) => {
    notifications.show({
      title,
      message,
      color: 'green',
      icon: createElement(IconCheck, { size: 18 }),
    });
  },

  error: (title: string, message?: string) => {
    notifications.show({
      title,
      message,
      color: 'red',
      icon: createElement(IconX, { size: 18 }),
    });
  },

  warning: (title: string, message?: string) => {
    notifications.show({
      title,
      message,
      color: 'yellow',
      icon: createElement(IconAlertTriangle, { size: 18 }),
    });
  },

  info: (title: string, message?: string) => {
    notifications.show({
      title,
      message,
      color: 'blue',
      icon: createElement(IconInfoCircle, { size: 18 }),
    });
  },
};
