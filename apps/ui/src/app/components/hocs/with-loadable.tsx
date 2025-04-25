import React, { Component } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { convertRemToPixels } from '../../common/utils';
import { BlockUI } from 'primereact/blockui';

export interface LoadableProps {
  isLoading?: boolean;
  isFetching?: boolean;
}

export interface SharedProps {
  className?: string;
}

export interface LoadableHookProps<T extends SharedProps = SharedProps> {
  skeleton?: React.FC<T>;
}

export const withLoadable =
  <P extends SharedProps>(
    Component: React.ComponentType<P>,
    hookProps: LoadableHookProps
  ) =>
  ({ isLoading, isFetching, ...props }: P & LoadableProps) => {
    const ref = React.useRef<HTMLElement>();
    const [style, setStyle] = React.useState<React.CSSProperties>({});

    React.useEffect(() => {
      let observer: MutationObserver | undefined;
      let resizeObserver: ResizeObserver | undefined;
      if (isFetching && ref.current) {
        const update = () => {
          const refStyle = ref.current
            ? getComputedStyle(ref.current)
            : ({} as CSSStyleDeclaration);
          setStyle({
            left: ref.current?.offsetLeft,
            top: ref.current?.offsetTop,
            width: ref.current?.clientWidth + 'px',
            height: ref.current?.clientHeight + 'px',
            backgroundColor: 'rgba(0,0,0,0.2)',
            padding: refStyle.padding,
            borderRadius: refStyle.borderRadius,
            zIndex: 9,
          });
        };
        update();

        observer = new MutationObserver(update);
        observer.observe(ref.current, {
          attributes: true,
          childList: true,
          subtree: true,
        });
        resizeObserver = new ResizeObserver(update);
        resizeObserver.observe(ref.current);
      }

      return () => {
        if (observer) {
          observer.disconnect();
        }
        if (resizeObserver && ref.current) {
          resizeObserver.unobserve(ref.current);
        }
      };
    }, [isFetching, ref.current]);

    if (isLoading && hookProps.skeleton) {
      return <hookProps.skeleton className={props.className} />;
    }

    const spinnerSize = convertRemToPixels(4);
    const left =
      (ref.current?.offsetLeft ?? 0) +
      (ref.current?.clientWidth ?? 0) / 2 -
      spinnerSize / 2 +
      'px';
    const top =
      (ref.current?.offsetTop ?? 0) +
      (ref.current?.clientHeight ?? 0) / 2 -
      spinnerSize / 2 +
      'px';

    return (
      <>
        {isFetching && (
          <>
            <div className="absolute" style={style}></div>
            <ProgressSpinner
              className="absolute"
              style={{
                left,
                top,
                width: spinnerSize + 'px',
                height: spinnerSize + 'px',
                padding: 0,
                zIndex: 10,
              }}
            />
          </>
        )}
        <Component {...(props as any)} ref={ref} />
      </>
    );
  };
