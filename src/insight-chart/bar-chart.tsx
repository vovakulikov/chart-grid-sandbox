import React, {ReactElement, useCallback, useMemo, useRef} from "react";
import {scaleBand, scaleLinear} from "@visx/scale";
import {AxisBottom, AxisLeft} from '@visx/axis'
import { localPoint, getXAndYFromEvent } from '@visx/event';
import {Group} from "@visx/group";
import {Bar} from "@visx/shape";
import {Grid} from "@visx/grid";
import {useTooltip, useTooltipInPortal, defaultStyles, TooltipWithBounds} from '@visx/tooltip';

const margin = { top: 20, right: 20, bottom: 20, left: 40 };
export const content = {
		chart: 'bar',
		data: [
				{ name: 'A', value: 183 },
				{ name: 'B', value: 145 },
				{ name: 'C', value: 94 },
				{ name: 'D', value: 134 },
				{ name: 'E', value: 123 },
		],
		series: [
				{
						dataKey: 'value',
						name: 'A metric',
						fill: 'wheat',
						linkURLs: [
								'#1st_data_point',
								'#2nd_data_point',
								'#3rd_data_point',
								'#4th_data_point',
								'#5th_data_point',
						],
				},
		],
		xAxis: {
				dataKey: 'name',
				type: 'category',
		},
};

// Tooltip
let tooltipTimeout: number;

const tooltipStyles = {
	...defaultStyles,
	minWidth: 60,
	backgroundColor: 'rgba(0,0,0,0.9)',
	color: 'white',
};

type TooltipData = {
	xLabel: string;
	value: number;
};

// helpers
const range = (n: number) => Array.from(new Array(n), (_, i) => i);

type Accessor<Datum> = (d: Datum) => number | string;

// Compose together the scale and accessor functions to get point functions
function compose<Datum>(scale: any, accessor: Accessor<Datum>) { return  (data: Datum) => scale(accessor(data));}


interface BarChartProps {
	width: number;
	height: number;
	content?: typeof content
}

export function BarChart(props: BarChartProps): ReactElement {
	
	const { width, height, content: { data, series } = content } = props;
	const { dataKey, name, fill, linkURLs } = series[0];
	
	const xMax = width - margin.left - margin.right;
	const yMax = height - margin.top - margin.bottom;
	
	const {
		tooltipOpen,
		tooltipLeft,
		tooltipTop,
		tooltipData,
		hideTooltip,
		showTooltip,
	} = useTooltip<TooltipData>();
	
	const { containerRef, TooltipInPortal, containerBounds } = useTooltipInPortal();
	
	// Accessors
	const yAccessor = useCallback(
		(data: any) => data[dataKey],
		[dataKey]
	);
	
	const xAccessor = useCallback(
		(data: any) => data['name'],
		[]
	);
	
	const formatXLabel = useCallback(
		(index) => data[index]['name'],
		[data]
	);
	
	// And then scale the graph by our data
	const xScale = useMemo(() =>
			scaleBand({
				range: [0, xMax],
				round: true,
				domain: range(data.length),
				padding: 0.2,
			}),
		[xMax, data]
	);
	
	const yScale = useMemo(() =>
			scaleLinear({
				range: [yMax, 0],
				round: true,
				nice: true,
				domain: [0, Math.max(...data.map(yAccessor))],
			}),
		[yMax]
	);
	
	const yPoint = useMemo(() => compose(yScale, yAccessor), [yScale, yAccessor]);
	
	return (
		<div style={{ position: "relative"}} >
			<svg ref={containerRef} width={width} height={height}>
				<Group left={margin.left} top={margin.top}>
					
					<Grid
						xScale={xScale}
						yScale={yScale}
						width={xMax}
						height={yMax}
						stroke="black"
						strokeOpacity={0.1}
						xOffset={xScale.bandwidth() / 2}
					/>
					
					{
						data.map((d, i) => {
							const barHeight = yMax - (yPoint(d) ?? 0);
							
							return (
								<Group key={`bar-${i}`}>
									<Bar
										x={xScale(i)}
										y={yMax - barHeight}
										height={barHeight}
										width={xScale.bandwidth()}
										fill={fill}
										onMouseLeave={() => {
											tooltipTimeout = window.setTimeout(() => {
												hideTooltip();
											}, 300);
										}}
										onMouseMove={event => {
											if (tooltipTimeout) clearTimeout(tooltipTimeout);
											
											const rect = localPoint(event);
											
											showTooltip({
												tooltipData: { xLabel: formatXLabel(i), value: yAccessor(d) },
												tooltipTop: rect?.y,
												tooltipLeft:  rect?.x,
											});
										}}
									/>
								</Group>
							);
						})
					}
					
					<AxisBottom
						top={yMax}
						scale={xScale}
						tickFormat={formatXLabel}
						stroke='black'
						tickStroke='black'
						tickLabelProps={() => ({
							fill: 'black',
							fontSize: 11,
							textAnchor: 'middle',
						})}
					/>
					
					<AxisLeft scale={yScale} />
				</Group>
			</svg>
			
			{tooltipOpen && tooltipData && (
				<TooltipWithBounds
					top={tooltipTop}
					left={tooltipLeft}
					style={tooltipStyles}
				>
					<div>
						<strong>{tooltipData.xLabel}</strong>
					</div>
					<div>{tooltipData.value}</div>
				</TooltipWithBounds>
			)}
		</div>
	);
}