/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { PanelLayer, PanelLayerProps } from './panel-layer';

export type DockedPanelLayerProps = Omit<PanelLayerProps, 'mode'>;

export const DockedPanelLayer: React.FC<DockedPanelLayerProps> = (props) => (
  <PanelLayer mode="docked" {...props} />
);
