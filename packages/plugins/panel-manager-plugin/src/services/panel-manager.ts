/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { injectable, inject } from 'inversify';
import { Playground } from '@flowgram.ai/core';

import { PanelManagerConfig } from './panel-config';
import type { Area, PanelFactory } from '../types';
import { FloatPanel } from './float-panel';

@injectable()
export class PanelManager {
  @inject(Playground) readonly playground: Playground;

  @inject(PanelManagerConfig) readonly config: PanelManagerConfig;

  readonly panelRegistry = new Map<string, PanelFactory<any>>();

  right: FloatPanel;

  bottom: FloatPanel;

  dockedRight: FloatPanel;

  dockedBottom: FloatPanel;

  init() {
    this.config.factories.forEach((factory) => this.register(factory));
    this.right = new FloatPanel(this.config.right);
    this.bottom = new FloatPanel(this.config.bottom);
    this.dockedRight = new FloatPanel(this.config.dockedRight);
    this.dockedBottom = new FloatPanel(this.config.dockedBottom);
  }

  register<T extends any>(factory: PanelFactory<T>) {
    this.panelRegistry.set(factory.key, factory);
  }

  open(key: string, area: Area = 'right', options?: any) {
    const factory = this.panelRegistry.get(key);
    if (!factory) {
      return;
    }
    const panel = this.getPanel(area);
    panel.open(factory, options);
  }

  close(key?: string) {
    this.right.close(key);
    this.bottom.close(key);
    this.dockedRight.close(key);
    this.dockedBottom.close(key);
  }

  getPanel(area: Area) {
    switch (area) {
      case 'docked-bottom':
        return this.dockedBottom;
      case 'docked-right':
        return this.dockedRight;
      case 'bottom':
        return this.bottom;
      case 'right':
      default:
        return this.right;
    }
  }

  dispose() {
    this.right.dispose();
    this.bottom.dispose();
    this.dockedBottom.dispose();
    this.dockedRight.dispose();
  }
}
