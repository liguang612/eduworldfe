import { type SlateElementProps, SlateElement } from '@udecode/plate';

export function ColumnGroupElementStatic(props: SlateElementProps) {
  return (
    <SlateElement className="mb-2" {...props}>
      <div className="flex size-full rounded">{props.children}</div>
    </SlateElement>
  );
}
