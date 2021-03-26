import { Layout as ReactGridLayout, Layouts as ReactGridLayouts, } from 'react-grid-layout'

const breakpointNames = ['xs', 'sm', 'md', 'lg'] as const
type BreakpointName = typeof breakpointNames[number]

/** Minimum size in px after which a breakpoint is active. */
export const breakpoints: Record<BreakpointName, number> = { xs: 0, sm: 576, md: 768, lg: 992 } // no xl because TreePage's max-width is the xl breakpoint.
export const columns: Record<BreakpointName, number> = { xs: 1, sm: 6, md: 8, lg: 12 }
export const defaultItemsPerRow: Record<BreakpointName, number> = { xs: 1, sm: 2, md: 2, lg: 3 }
export const minWidths: Record<BreakpointName, number> = { xs: 1, sm: 2, md: 3, lg: 3 }
export const defaultHeight = 3

export type ViewInsightProviderResult = {
  id: string;
}

export const viewsToReactGridLayouts = (views: ViewInsightProviderResult[]): ReactGridLayouts => {
  const reactGridLayouts = Object.fromEntries(
    breakpointNames.map(
      breakpointName =>
        [
          breakpointName,
          views.map(
            ({ id }, index): ReactGridLayout => {
              const width = columns[breakpointName] / defaultItemsPerRow[breakpointName]
              return {
                i: id,
                h: defaultHeight,
                w: width,
                x: (index * width) % columns[breakpointName],
                y: Math.floor((index * width) / columns[breakpointName]),
                minW: minWidths[breakpointName],
                minH: 2,
              }
            }
          ),
        ] as const
    )
  )
  return reactGridLayouts
}
