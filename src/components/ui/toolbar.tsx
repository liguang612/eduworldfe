'use client';

import * as React from 'react';
import * as ToolbarPrimitive from '@radix-ui/react-toolbar';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { type VariantProps, cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';

import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export const Toolbar = React.forwardRef<
  React.ElementRef<typeof ToolbarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <ToolbarPrimitive.Root
      ref={ref}
      className={cn('relative flex items-center select-none', className)}
      {...props}
    />
  );
});
Toolbar.displayName = 'Toolbar';

export function ToolbarToggleGroup({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.ToolbarToggleGroup>) {
  return (
    <ToolbarPrimitive.ToolbarToggleGroup
      className={cn('flex items-center', className)}
      {...props}
    />
  );
}

export function ToolbarLink({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Link>) {
  return (
    <ToolbarPrimitive.Link
      className={cn('font-medium underline underline-offset-4', className)}
      {...props}
    />
  );
}

export function ToolbarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Separator>) {
  return (
    <ToolbarPrimitive.Separator
      className={cn('mx-2 my-1 w-px shrink-0 bg-border', className)}
      {...props}
    />
  );
}

const toolbarButtonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none hover:bg-muted hover:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-checked:bg-accent aria-checked:text-accent-foreground aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-9 min-w-9 px-2',
        lg: 'h-10 min-w-10 px-2.5',
        sm: 'h-8 min-w-8 px-1.5',
      },
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground',
      },
    },
  }
);

const dropdownArrowVariants = cva(
  cn(
    'inline-flex items-center justify-center rounded-r-md text-sm font-medium text-foreground transition-colors disabled:pointer-events-none disabled:opacity-50'
  ),
  {
    defaultVariants: {
      size: 'sm',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-9 w-6',
        lg: 'h-10 w-8',
        sm: 'h-8 w-4',
      },
      variant: {
        default:
          'bg-transparent hover:bg-muted hover:text-muted-foreground aria-checked:bg-accent aria-checked:text-accent-foreground',
        outline:
          'border border-l-0 border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
      },
    },
  }
);

type InnerToolbarButtonProps = {
  isDropdown?: boolean;
  pressed?: boolean;
} & Omit<
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.ToggleItem>,
  'asChild' | 'value'
> &
  VariantProps<typeof toolbarButtonVariants>;

const InnerToolbarButton = React.forwardRef<
  HTMLButtonElement,
  InnerToolbarButtonProps
>(({ children, className, isDropdown, pressed, size = 'sm', variant, ...props }, ref) => {
  const commonButtonProps = {
    className: cn(
      toolbarButtonVariants({
        size,
        variant,
      }),
      isDropdown && (typeof pressed === 'boolean' ? 'justify-between gap-1 pr-1' : 'pr-1'),
      className
    ),
    ...props,
  };

  if (typeof pressed === 'boolean') {
    return (
      <ToolbarToggleGroup disabled={props.disabled} type="single" value={pressed ? 'single' : ''}>
        <ToolbarPrimitive.ToggleItem ref={ref} value="single" {...commonButtonProps}>
          {isDropdown ? (
            <>
              <div className="flex flex-1 items-center gap-2 whitespace-nowrap">
                {children}
              </div>
              <div>
                <ChevronDown
                  className="size-3.5 text-muted-foreground"
                  data-icon
                />
              </div>
            </>
          ) : (
            children
          )}
        </ToolbarPrimitive.ToggleItem>
      </ToolbarToggleGroup>
    );
  }

  return (
    <ToolbarPrimitive.Button ref={ref} {...commonButtonProps}>
      {children}
      {isDropdown && (
        <ChevronDown
          className="ml-1 size-3.5 text-muted-foreground opacity-50"
          data-icon
        />
      )}
    </ToolbarPrimitive.Button>
  );
});
InnerToolbarButton.displayName = 'InnerToolbarButton';

type TooltipHOCProps<T> = T extends React.ForwardRefExoticComponent<infer P & React.RefAttributes<infer R>>
  ? Omit<P, 'tooltip' | 'tooltipContentProps' | 'tooltipProps' | 'tooltipTriggerProps'> & {
    tooltip?: React.ReactNode;
    tooltipContentProps?: Omit<
      React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
      'children'
    >;
    tooltipProps?: Omit<
      React.ComponentPropsWithoutRef<typeof Tooltip>,
      'children'
    >;
    tooltipTriggerProps?: React.ComponentPropsWithoutRef<typeof TooltipTrigger>;
    ref?: React.Ref<R>;
  }
  : never;


function withTooltip<
  RefType,
  WrappedComponentProps extends React.RefAttributes<RefType> & { children?: React.ReactNode }
>(
  Component: React.ForwardRefExoticComponent<WrappedComponentProps>
) {
  const ExtendComponent = React.forwardRef<RefType, TooltipHOCProps<typeof Component>>(
    (props, ref) => {
      const {
        tooltip,
        tooltipContentProps,
        tooltipProps,
        tooltipTriggerProps,
        ...componentSpecificProps
      } = props;

      const [mounted, setMounted] = React.useState(false);
      React.useEffect(() => {
        setMounted(true);
      }, []);

      const actualButtonComponent = (
        // @ts-ignore
        <Component {...componentSpecificProps} ref={ref} />
      );

      if (tooltip && mounted) {
        return (
          <Tooltip {...tooltipProps}>
            <TooltipTrigger asChild {...tooltipTriggerProps}>
              {actualButtonComponent}
            </TooltipTrigger>
            <TooltipContent {...tooltipContentProps}>{tooltip}</TooltipContent>
          </Tooltip>
        );
      }
      return actualButtonComponent;
    }
  );

  const componentName = Component.displayName || Component.name || 'Component';
  ExtendComponent.displayName = `WithTooltip(${componentName})`;
  return ExtendComponent;
}

export const ToolbarButton = withTooltip(InnerToolbarButton);

export function ToolbarSplitButton({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToolbarButton>) {
  return (
    <ToolbarButton
      className={cn('group flex gap-0 px-0 hover:bg-transparent', className)}
      {...props}
    />
  );
}

type ToolbarSplitButtonPrimaryProps = Omit<
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.ToggleItem>,
  'value'
> &
  VariantProps<typeof toolbarButtonVariants>;

export function ToolbarSplitButtonPrimary({
  children,
  className,
  size = 'sm',
  variant,
  ...props
}: ToolbarSplitButtonPrimaryProps) {
  return (
    <span
      className={cn(
        toolbarButtonVariants({
          size,
          variant,
        }),
        'rounded-r-none',
        'group-data-[pressed=true]:bg-accent group-data-[pressed=true]:text-accent-foreground',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export const ToolbarSplitButtonSecondary = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<'span'> & VariantProps<typeof dropdownArrowVariants>
>(({ className, size, variant, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        dropdownArrowVariants({
          size,
          variant,
        }),
        'group-data-[pressed=true]:bg-accent group-data-[pressed=true]:text-accent-foreground',
        className
      )}
      onClick={(e) => e.stopPropagation()}
      role="button"
      tabIndex={0}
      {...props}
    >
      <ChevronDown className="size-3.5 text-muted-foreground" data-icon />
    </span>
  );
});
ToolbarSplitButtonSecondary.displayName = 'ToolbarSplitButtonSecondary';

export function ToolbarToggleItem({
  className,
  size = 'sm',
  variant,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.ToggleItem> &
  VariantProps<typeof toolbarButtonVariants>) {
  return (
    <ToolbarPrimitive.ToggleItem
      className={cn(toolbarButtonVariants({ size, variant }), className)}
      {...props}
    />
  );
}

export function ToolbarGroup({
  children,
  className,
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'group/toolbar-group',
        'relative hidden has-[button]:flex',
        className
      )}
    >
      <div className="flex items-center">{children}</div>

      <div className="mx-1.5 py-0.5 group-last/toolbar-group:hidden!">
        <Separator orientation="vertical" />
      </div>
    </div>
  );
}

function TooltipContent({
  children,
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        className={cn(
          'z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md bg-primary px-3 py-1.5 text-xs text-balance text-primary-foreground',
          className
        )}
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export function ToolbarMenuGroup({
  children,
  className,
  label,
  ...props
}: React.ComponentProps<typeof DropdownMenuRadioGroup> & { label?: string }) {
  return (
    <>
      <DropdownMenuSeparator
        className={cn(
          'hidden',
          'mb-0 shrink-0 peer-has-[[role=menuitem]]/menu-group:block peer-has-[[role=menuitemradio]]/menu-group:block peer-has-[[role=option]]/menu-group:block'
        )}
      />

      <DropdownMenuRadioGroup
        {...props}
        className={cn(
          'hidden',
          'peer/menu-group group/menu-group my-1.5 has-[[role=menuitem]]:block has-[[role=menuitemradio]]:block has-[[role=option]]:block',
          className
        )}
      >
        {label && (
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground select-none">
            {label}
          </DropdownMenuLabel>
        )}
        {children}
      </DropdownMenuRadioGroup>
    </>
  );
}