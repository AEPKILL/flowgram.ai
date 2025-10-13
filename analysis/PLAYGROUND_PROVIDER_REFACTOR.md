# PlaygroundReactProvider 重构建议

## 🚨 当前问题

当前的 `PlaygroundReactProvider` 在 `useMemo` 中执行了大量副作用操作，违反了 React Hook 的最佳实践。

### 问题代码

```typescript
const playground = useMemo(() => {
  const playground = container.get(Playground);
  let ctx: PluginContext;

  // ❌ 副作用：修改容器状态
  if (customPluginContext) {
    ctx = customPluginContext(container);
    container.rebind(PluginContext).toConstantValue(ctx);
  } else {
    ctx = container.get<PluginContext>(PluginContext);
  }

  // ❌ 副作用：加载插件
  if (plugins) {
    loadPlugins(plugins(ctx), container);
  }

  // ❌ 副作用：初始化实例
  playground.init();
  return playground;
}, []);
```

## ✅ 重构方案

### 方案 1：使用 useEffect 分离副作用

```typescript
export const PlaygroundReactProvider = forwardRef<
  PlaygroundContext | any,
  PlaygroundReactProviderProps
>(function PlaygroundReactProvider(props, ref) {
  const {
    containerModules,
    playgroundContext,
    parentContainer: fromContainer,
    playgroundContainer,
    plugins,
    customPluginContext,
    ...others
  } = props;

  // ✅ 纯计算：只创建容器，不执行副作用
  const container = useMemo(() => {
    let flowContainer: interfaces.Container;
    if (playgroundContainer) {
      flowContainer = playgroundContainer;
    } else {
      flowContainer = createPlaygroundContainer(
        {
          autoFocus: true,
          autoResize: true,
          zoomEnable: true,
          ...others,
        },
        fromContainer
      );
      if (playgroundContext) {
        flowContainer
          .rebind(PlaygroundContext)
          .toConstantValue(playgroundContext);
      }
      if (containerModules) {
        containerModules.forEach((module) => flowContainer.load(module));
      }
    }
    return flowContainer;
  }, []);

  // ✅ 纯计算：只获取实例，不初始化
  const playground = useMemo(() => {
    return container.get(Playground);
  }, [container]);

  // ✅ 状态管理：跟踪初始化状态
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);

  // ✅ 副作用：在 useEffect 中执行初始化
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    let ctx: PluginContext;
    if (customPluginContext) {
      ctx = customPluginContext(container);
      container.rebind(PluginContext).toConstantValue(ctx);
    } else {
      ctx = container.get<PluginContext>(PluginContext);
    }

    if (plugins) {
      loadPlugins(plugins(ctx), container);
    }

    playground.init();
    setIsInitialized(true);

    // 清理函数
    return () => {
      playground.dispose();
    };
  }, [container, playground, plugins, customPluginContext]);

  const effectSignalRef = useRef<number>(0);

  useEffect(() => {
    effectSignalRef.current += 1;
    return () => {
      if (process.env.NODE_ENV === "development") {
        const FRAME = 16;
        setTimeout(() => {
          effectSignalRef.current -= 1;
          if (effectSignalRef.current === 0) {
            playground.dispose();
          }
        }, FRAME);
        return;
      }
      playground.dispose();
    };
  }, [playground]);

  useImperativeHandle(ref, () => container.get<PluginContext>(PluginContext), [
    container,
  ]);

  // ✅ 条件渲染：等待初始化完成
  if (!isInitialized) {
    return <div>Loading...</div>; // 或者自定义加载组件
  }

  return (
    <PlaygroundReactContainerContext.Provider value={container}>
      <PlaygroundReactRefContext.Provider value={playground}>
        <PlaygroundReactContext.Provider value={playgroundContext}>
          {props.children}
        </PlaygroundReactContext.Provider>
      </PlaygroundReactRefContext.Provider>
    </PlaygroundReactContainerContext.Provider>
  );
});
```

### 方案 2：使用自定义 Hook 封装初始化逻辑

```typescript
// 自定义Hook：封装playground初始化逻辑
function usePlaygroundInitialization(
  container: interfaces.Container,
  plugins?: PluginsProvider<any>,
  customPluginContext?: (container: interfaces.Container) => any
) {
  const [playground, setPlayground] = useState<Playground | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const playgroundInstance = container.get(Playground);

    let ctx: PluginContext;
    if (customPluginContext) {
      ctx = customPluginContext(container);
      container.rebind(PluginContext).toConstantValue(ctx);
    } else {
      ctx = container.get<PluginContext>(PluginContext);
    }

    if (plugins) {
      loadPlugins(plugins(ctx), container);
    }

    playgroundInstance.init();
    setPlayground(playgroundInstance);
    setIsInitialized(true);

    return () => {
      playgroundInstance.dispose();
    };
  }, [container, plugins, customPluginContext]);

  return { playground, isInitialized };
}

// 简化的Provider组件
export const PlaygroundReactProvider = forwardRef<
  PlaygroundContext | any,
  PlaygroundReactProviderProps
>(function PlaygroundReactProvider(props, ref) {
  const {
    containerModules,
    playgroundContext,
    parentContainer: fromContainer,
    playgroundContainer,
    plugins,
    customPluginContext,
    ...others
  } = props;

  const container = useMemo(() => {
    // ... 容器创建逻辑（纯计算）
  }, []);

  const { playground, isInitialized } = usePlaygroundInitialization(
    container,
    plugins,
    customPluginContext
  );

  useImperativeHandle(ref, () => container.get<PluginContext>(PluginContext), [
    container,
  ]);

  if (!isInitialized || !playground) {
    return <div>Loading...</div>;
  }

  return (
    <PlaygroundReactContainerContext.Provider value={container}>
      <PlaygroundReactRefContext.Provider value={playground}>
        <PlaygroundReactContext.Provider value={playgroundContext}>
          {props.children}
        </PlaygroundReactContext.Provider>
      </PlaygroundReactRefContext.Provider>
    </PlaygroundReactContainerContext.Provider>
  );
});
```

### 方案 3：懒初始化模式

```typescript
export const PlaygroundReactProvider = forwardRef<
  PlaygroundContext | any,
  PlaygroundReactProviderProps
>(function PlaygroundReactProvider(props, ref) {
  const {
    containerModules,
    playgroundContext,
    parentContainer: fromContainer,
    playgroundContainer,
    plugins,
    customPluginContext,
    ...others
  } = props;

  // ✅ 容器创建（纯计算）
  const container = useMemo(() => {
    // ... 容器创建逻辑
  }, []);

  // ✅ 懒初始化：使用 useState 的函数形式
  const [playground] = useState(() => {
    // 这个函数只会在组件首次渲染时执行一次
    const playgroundInstance = container.get(Playground);

    let ctx: PluginContext;
    if (customPluginContext) {
      ctx = customPluginContext(container);
      container.rebind(PluginContext).toConstantValue(ctx);
    } else {
      ctx = container.get<PluginContext>(PluginContext);
    }

    if (plugins) {
      loadPlugins(plugins(ctx), container);
    }

    playgroundInstance.init();
    return playgroundInstance;
  });

  // ✅ 清理副作用
  useEffect(() => {
    return () => {
      playground.dispose();
    };
  }, [playground]);

  useImperativeHandle(ref, () => container.get<PluginContext>(PluginContext), [
    container,
  ]);

  return (
    <PlaygroundReactContainerContext.Provider value={container}>
      <PlaygroundReactRefContext.Provider value={playground}>
        <PlaygroundReactContext.Provider value={playgroundContext}>
          {props.children}
        </PlaygroundReactContext.Provider>
      </PlaygroundReactRefContext.Provider>
    </PlaygroundReactContainerContext.Provider>
  );
});
```

## 🎯 推荐方案

**推荐使用方案 3（懒初始化模式）**，原因：

1. **符合 React 最佳实践**：使用 `useState` 的函数形式进行懒初始化
2. **性能优秀**：初始化逻辑只执行一次
3. **代码简洁**：不需要额外的状态管理
4. **类型安全**：playground 不会是 null

## 📚 相关文档

- [React useMemo 文档](https://react.dev/reference/react/useMemo#caveats)
- [React useState 懒初始化](https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state)
- [React 最佳实践：副作用处理](https://react.dev/learn/you-might-not-need-an-effect)

## 🔍 为什么当前代码能工作？

虽然当前代码违反了最佳实践，但在大多数情况下仍能正常工作，因为：

1. **依赖数组为空**：`useMemo(fn, [])` 确保函数只执行一次
2. **组件生命周期稳定**：在生产环境中，组件通常不会频繁重新挂载
3. **副作用相对安全**：初始化操作是幂等的

但这不意味着代码是正确的，在以下情况下可能出现问题：

- React 严格模式下的开发环境
- 组件频繁挂载/卸载的场景
- 单元测试环境
- 未来的 React 版本可能改变行为

## 🚀 重构收益

重构后的代码将获得：

1. **更好的可维护性**：清晰分离计算和副作用
2. **更强的稳定性**：符合 React Hook 规则
3. **更容易测试**：副作用可以独立测试
4. **更好的开发体验**：在严格模式下正常工作
5. **未来兼容性**：适应 React 未来版本的变化
