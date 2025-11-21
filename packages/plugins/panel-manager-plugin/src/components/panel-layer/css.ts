/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

export const globalCSS = `
  .gedit-flow-panel-layer-wrap * {
    box-sizing: border-box;
  }
  .gedit-flow-panel-layer-wrap {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .gedit-flow-panel-layer-wrap-docked {

  }
  .gedit-flow-panel-layer-wrap-floating {
    column-gap: 4px;
    padding: 4px;
    pointer-events: none;
  }

  .gedit-flow-panel-left-area {
    width: 100%;
    min-width: 0;
    flex-grow: 0;
    flex-shrink: 1;
    display: flex;
    flex-direction: column;
  }
  .gedit-flow-panel-layer-wrap-floating .gedit-flow-panel-left-area {
    row-gap: 4px;
  }
  .gedit-flow-panel-right-area {
    height: 100%;
    flex-grow: 1;
    flex-shrink: 0;
    min-width: 0;
    display: flex;
    column-gap: 4px;
  }
  
  .gedit-flow-panel-main-area {
    position: relative;
    overflow: hidden;
    flex-grow: 0;
    flex-shrink: 1;
    width: 100%;
    height: 100%;
  }
  .gedit-flow-panel-bottom-area {
    flex-grow: 1;
    flex-shrink: 0;
    width: 100%;
    min-height: 0;
  }
`;

export const floatPanelWrap: React.CSSProperties = {
  pointerEvents: 'auto',
  height: '100%',
  width: '100%',
  overflow: 'auto',
};
