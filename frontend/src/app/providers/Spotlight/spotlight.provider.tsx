import { Spotlight } from '@mantine/spotlight';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { createSpotlightActions } from './spotlight-actions';

import '@mantine/spotlight/styles.css';

export function SpotlightProvider() {
  const navigate = useNavigate();

  const actions = useMemo(() => createSpotlightActions(navigate), [navigate]);

  return (
    <Spotlight
      actions={actions}
      shortcut="mod+k"
      searchProps={{
        placeholder: 'Buscar páginas, módulos, acciones...',
      }}
      nothingFound="No se encontraron resultados"
      highlightQuery
      limit={8}
      scrollable
      maxHeight={400}
    />
  );
}