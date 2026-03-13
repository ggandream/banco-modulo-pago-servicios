import {
  Anchor,
  Breadcrumbs,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <Stack gap="xs" mb="lg">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<IconChevronRight size={14} />}
          separatorMargin={4}
        >
          {breadcrumbs.map((item, index) =>
            item.path ? (
              <Anchor
                component={Link}
                to={item.path}
                key={index}
                size="sm"
                c="dimmed"
              >
                {item.label}
              </Anchor>
            ) : (
              <Text size="sm" c="dimmed" key={index}>
                {item.label}
              </Text>
            ),
          )}
        </Breadcrumbs>
      )}
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>{title}</Title>
          {subtitle && (
            <Text c="dimmed" size="sm" mt={4}>
              {subtitle}
            </Text>
          )}
        </div>
        {actions && <Group gap="sm">{actions}</Group>}
      </Group>
    </Stack>
  );
}
