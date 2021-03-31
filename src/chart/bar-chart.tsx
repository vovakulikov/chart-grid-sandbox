import React, { useMemo } from 'react';
import { letterFrequency } from '@visx/mock-data';
import { AxisBottom } from '@visx/axis';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleLinear, scaleBand } from '@visx/scale';

export interface LetterFrequency {
  letter: string;
  frequency: number;
}

// We'll use some mock data from `@visx/mock-data` for this.
const data = letterFrequency;

// @ts-ignore
window.data = data;

// Define the graph dimensions and margins
const margin = { top: 0, bottom: 0, left: 0, right: 0 };

// We'll make some helpers to get at the data we want

type Accessor = (d: LetterFrequency) => number | string;

const x = (d: LetterFrequency) => d.letter;
const y = (d: LetterFrequency) => +d.frequency * 100;

// Compose together the scale and accessor functions to get point functions
const compose = (scale: any, accessor: Accessor) => (data: LetterFrequency) => scale(accessor(data));

export interface Props {
  width: number;
  height: number;
}

// Finally we'll embed it all in an SVG
export function BarGraph(props: Props) {
  const { width, height } = props;
  // Then we'll create some bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;
  
  // And then scale the graph by our data
  const xScale = useMemo(() =>
    scaleBand({
      range: [0, xMax],
      round: true,
      domain: data.map(x),
      padding: 0.4,
    }),
    [xMax]
  );
  
  const yScale = useMemo(() =>
    scaleLinear({
      range: [yMax, 0],
      round: true,
      domain: [0, Math.max(...data.map(y))],
    }),
    [yMax]
  );
  
  const xPoint = useMemo(() => compose(xScale, x), [xScale]);
  const yPoint = useMemo(() => compose(yScale, y), [yScale]);
  
  return (
    <svg width={width} height={height}>
      {data.map((d, i) => {
        const barHeight = yMax - (yPoint(d) ?? 0);
        
        return (
          <Group key={`bar-${i}`}>
            <Bar
              x={xPoint(d)}
              y={yMax - barHeight}
              height={barHeight}
              width={xScale.bandwidth()}
              fill="#fc2e1c"
            />
          </Group>
        );
      })}
    </svg>
  );
}
