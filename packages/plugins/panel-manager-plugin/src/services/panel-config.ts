/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { PluginContext } from '@flowgram.ai/core';

import type { PanelFactory, PanelConfig } from '../types';
import { ResizeBar } from '../components/resize-bar';
import type { PanelLayerProps } from '../components/panel-layer';

export interface PanelManagerConfig {
  factories: PanelFactory<any>[];
  right: PanelConfig;
  bottom: PanelConfig;
  dockedRight: PanelConfig;
  dockedBottom: PanelConfig;
  autoResize: boolean;
  layerProps: PanelLayerProps;
  resizeBarRender: ({
    size,
  }: {
    size: number;
    direction?: 'vertical' | 'horizontal';
    onResize: (size: number) => void;
  }) => React.ReactNode;
  getPopupContainer: (ctx: PluginContext) => HTMLElement; // default playground.node.parentElement
}

export const PanelManagerConfig = Symbol('PanelManagerConfig');

export const defineConfig = (config: Partial<PanelManagerConfig>) => {
  const defaultConfig: PanelManagerConfig = {
    right: {
      max: 1,
    },
    bottom: {
      max: 1,
    },
    dockedRight: {
      max: 1,
    },
    dockedBottom: {
      max: 1,
    },
    factories: [],
    autoResize: true,
    layerProps: {},
    resizeBarRender: ResizeBar,
    getPopupContainer: (ctx: PluginContext) => ctx.playground.node.parentNode as HTMLElement,
  };
  return {
    ...defaultConfig,
    ...config,
  };
};
