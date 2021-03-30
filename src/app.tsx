import React, { ComponentType } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout'

import { BarGraph } from './chart/bar-chart';
import { Theshold } from './chart/threshold';
import { ParentSizeModern as ParentSize } from '@visx/responsive';
import { BarStack } from './chart/bar-stack';
import { PieExample } from './insight-chart/pie-chart'
import { XYChartExample } from "./chart/xychart";

import { breakpoints, columns, viewsToReactGridLayouts } from './grid/helpers'

import styles from './index.scss';


// TODO use a method to get width that also triggers when file explorer is closed
// (WidthProvider only listens to window resize events)
const ResponsiveGridLayout = WidthProvider(Responsive)


const VIEWS = [
  { id: 'First bar chart', type: 'bar' },
  { id: 'Second chart - threshold', type: 'threshold' },
  { id: 'Fourth chart - bar stack with tooltip', type: 'bar-stack' },
  { id: 'Fifth chart - xy chart with tooltip', type: 'xy-chart' },
  { id: 'Sixth chart - simple pie chart', type: 'pie' },
];

export function App3() {
  
  return (
    <div className={styles.element}>
      <XYChartExample width={550} height={350}/>
    </div>
  )
}


export function App2() {
  return (
    <div className={styles.element}>
  
      <div className={styles.chartWrapper}>
        
        <div className={styles.chart}>
  
          <ParentSize>

            { (parent) => <BarStack width={parent.width} height={parent.height} />}
          </ParentSize>
        </div>
      </div>
    </div>
  );
}

type ChartCommonProps = {
  width: number;
  height: number;
}

function getChart(type: string): ComponentType<ChartCommonProps> {
  switch (type) {
    case 'bar': return BarGraph;
    case 'threshold': return Theshold;
    case 'bar-stack': return BarStack;
    case 'xy-chart': return XYChartExample
    case 'pie': return PieExample
  }
  
  return BarGraph;
}

export function SizeRender(props: {width: number; height: number}) {
  return (
    <div>
      width: { props.width }
      height: { props.height }
    </div>
  );
}

export function App () {
  
  return (
    <div className={styles.element}>

      <div className={styles.grid}>
  
        <ResponsiveGridLayout
          breakpoints={breakpoints}
          layouts={viewsToReactGridLayouts(VIEWS)}
          cols={columns}
          autoSize={true}
          rowHeight={6 * 16}
          containerPadding={[0, 0]}
          margin={[12, 12]}>
          
          {
            VIEWS.map(({ id, type}) => {
              const Chart = getChart(type);

              return (
                <div
                  key={id}
                  className={styles.grid__item}>
  
                    <h3 className={styles['grid__item-title']}>{id}</h3>
                  
                    <div className={styles['grid__item-chart']}>
                      
                      <div className={styles['grid__item-inner-wrapper-chart']}>

                        <ParentSize>
                          { (parent) => <Chart width={parent.width} height={parent.height} />}
                        </ParentSize>
                      </div>
                    </div>
                   
                </div>
              );
            })
          }
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
